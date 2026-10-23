type LongAnimationFrameScript = {
  invoker: string;
  sourceURL: string;
  sourceFunctionName: string;
  duration: number;
};

type LongAnimationFrameEntry = PerformanceEntry & {
  blockingDuration: number;
  scripts: LongAnimationFrameScript[];
};

type FrameSample = { time: number; delta: number };

type TransitionRun = { name: string; overlapped: boolean };

export type LongFrameStats = {
  count: number;
  worstDuration: number;
  totalBlockingDuration: number;
  topScript: string | null;
};

export type TransitionReport = {
  name: string;
  duration: number;
  frames: number;
  droppedFrames: number;
  averageFps: number;
  longFrames: LongFrameStats | 'unsupported';
  overlapped: boolean;
};

type ReportListener = (report: TransitionReport) => void;

const isDev = process.env.NODE_ENV === 'development';
const supportsLongAnimationFrames =
  isDev &&
  PerformanceObserver.supportedEntryTypes.includes('long-animation-frame');

const activeRuns = new Map<string, TransitionRun>();
const listeners = new Set<ReportListener>();
let runCount = 0;
let frames: FrameSample[] = [];
let longFrameEntries: LongAnimationFrameEntry[] = [];
let frameInterval = Infinity;
let lastFrameTime: number | null = null;
let rafId: number | null = null;

const longFrameObserver = supportsLongAnimationFrames
  ? new PerformanceObserver(list => {
      collectLongFrames(list.getEntries());
    })
  : null;
longFrameObserver?.observe({ type: 'long-animation-frame', buffered: false });

function collectLongFrames(entries: PerformanceEntry[]) {
  if (activeRuns.size === 0) return;
  longFrameEntries.push(...(entries as LongAnimationFrameEntry[]));
}

function sampleFrame(time: number) {
  if (lastFrameTime !== null) {
    const delta = time - lastFrameTime;
    frames.push({ time, delta });
    frameInterval = Math.min(frameInterval, delta);
  }
  lastFrameTime = time;
  rafId = requestAnimationFrame(sampleFrame);
}

function startSampling() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(sampleFrame);
}

function stopSampling() {
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
  lastFrameTime = null;
  frames = [];
  longFrameEntries = [];
}

function scriptLabel(script: LongAnimationFrameScript) {
  const fileName = script.sourceURL.split('/').pop() || script.sourceURL;
  const fnName = script.sourceFunctionName || script.invoker;
  if (!fileName || fnName === script.sourceURL) return fnName || fileName;
  return `${fnName} (${fileName})`;
}

function summarizeLongFrames(
  entries: LongAnimationFrameEntry[]
): LongFrameStats {
  const durationByScript = new Map<string, number>();
  entries
    .flatMap(entry => entry.scripts)
    .forEach(script => {
      const label = scriptLabel(script);
      durationByScript.set(
        label,
        (durationByScript.get(label) ?? 0) + script.duration
      );
    });
  const [topScript] = Array.from(durationByScript.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return {
    count: entries.length,
    worstDuration: Math.max(0, ...entries.map(entry => entry.duration)),
    totalBlockingDuration: entries.reduce(
      (total, entry) => total + entry.blockingDuration,
      0
    ),
    topScript: topScript?.[0] ?? null
  };
}

function createReport(
  run: TransitionRun,
  measure: PerformanceMeasure
): TransitionReport {
  const start = measure.startTime;
  const end = start + measure.duration;
  const framesInWindow = frames.filter(f => f.time >= start && f.time <= end);
  const droppedFrames = framesInWindow.reduce(
    (total, f) => total + Math.max(0, Math.round(f.delta / frameInterval) - 1),
    0
  );
  const longFramesInWindow = longFrameEntries.filter(
    entry => entry.startTime < end && entry.startTime + entry.duration > start
  );

  return {
    name: run.name,
    duration: measure.duration,
    frames: framesInWindow.length,
    droppedFrames,
    averageFps: framesInWindow.length / (measure.duration / 1000),
    longFrames: supportsLongAnimationFrames
      ? summarizeLongFrames(longFramesInWindow)
      : 'unsupported',
    overlapped: run.overlapped
  };
}

export function createTransitionMeasure(name: string) {
  const id = `transition:${name}#${++runCount}`;
  const startMark = `${id}:start`;

  function start() {
    if (!isDev) return;
    const run = { name, overlapped: false };
    activeRuns.forEach(other => {
      if (other.name !== name) return;
      other.overlapped = true;
      run.overlapped = true;
    });
    activeRuns.set(id, run);
    performance.mark(startMark);
    startSampling();
  }

  function end() {
    if (!isDev) return;
    const run = activeRuns.get(id);
    if (!run) {
      console.error(`[perf] transition "${name}" ended without being started`);
      return;
    }
    collectLongFrames(longFrameObserver?.takeRecords() ?? []);
    const measure = performance.measure(id, startMark);
    performance.clearMarks(startMark);
    const report = createReport(run, measure);
    activeRuns.delete(id);
    if (activeRuns.size === 0) stopSampling();
    listeners.forEach(listener => listener(report));
  }

  return { start, end };
}

export function subscribeTransitionReports(listener: ReportListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
