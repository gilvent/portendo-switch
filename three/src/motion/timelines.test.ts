import { afterEach, describe, expect, it } from 'vitest';
import { edges, type ConsoleState, type Edge } from '../console/model';
import { poses } from '../rig/poses';
import { applyPose, createRig, fixtures, type ConsoleRig } from '../rig/rig';
import { edgeKey, edgeSeconds, timelines } from './timelines';

const allEdges = (Object.keys(edges) as ConsoleState[]).flatMap((from) =>
  Object.entries(edges[from]).map(([via, to]) => ({ from, via, to }) as Edge),
);

const built: gsap.core.Timeline[] = [];
afterEach(() => {
  for (const timeline of built.splice(0)) timeline.kill();
});

function rigAt(edge: Edge): ConsoleRig {
  const rig = createRig();
  applyPose(rig, edge.from);
  if (poses[edge.from].camera !== 'neutral') {
    Object.assign(rig.look.target, { yaw: 0.3, pitch: -0.1 });
    Object.assign(rig.look.current, { yaw: 0.3, pitch: -0.1 });
  }
  return rig;
}

function build(edge: Edge, rig: ConsoleRig): gsap.core.Timeline {
  const timeline = timelines[edgeKey(edge)](rig);
  built.push(timeline);
  return timeline;
}

type Reading = { labels: Record<string, string | undefined>; numbers: Record<string, number> };

function read(rig: ConsoleRig): Reading {
  const labels: Reading['labels'] = {};
  const numbers: Reading['numbers'] = {};
  const transform = (name: string, object: ConsoleRig['body']) => {
    labels[`${name}.parent`] = object.parent?.name;
    object.position.toArray().forEach((n, i) => (numbers[`${name}.position.${i}`] = n));
    object.rotation.toArray().slice(0, 3).forEach((n, i) => (numbers[`${name}.rotation.${i}`] = n as number));
    object.scale.toArray().forEach((n, i) => (numbers[`${name}.scale.${i}`] = n));
  };
  for (const part of ['console', 'leftJoycon', 'rightJoycon'] as const) transform(part, rig[part]);
  for (const fixture of fixtures) transform(fixture, rig[fixture]);
  numbers.screenPower = rig.screenPower.value;
  numbers.ledPower = rig.ledPower.value;
  numbers.tvMix = rig.tvInput.mix;
  for (const key of ['guide', 'bar', 'progress'] as const) numbers[`loading.${key}`] = rig.loading[key];
  numbers['look.target.yaw'] = rig.look.target.yaw;
  numbers['look.target.pitch'] = rig.look.target.pitch;
  return { labels, numbers };
}

function differences(actual: Reading, expected: Reading) {
  const labels = Object.keys(expected.labels).filter((key) => actual.labels[key] !== expected.labels[key]);
  const numbers = Object.keys(expected.numbers).filter((key) => !(Math.abs((actual.numbers[key] ?? NaN) - (expected.numbers[key] ?? NaN)) < 1e-4));
  return [...labels, ...numbers].map((key) => ({
    key,
    actual: actual.labels[key] ?? actual.numbers[key],
    expected: expected.labels[key] ?? expected.numbers[key],
  }));
}

describe('timelines', () => {
  it('has one timeline per edge of the console model', () => {
    expect(allEdges.map(edgeKey)).toEqual(['onDesk-pickUp', 'pickedUp-focus', 'pickedUp-dock', 'focused-unfocus', 'focused-dock', 'docked-undock']);
    expect(Object.keys(timelines).sort()).toEqual([...allEdges.map(edgeKey)].sort());
    for (const edge of allEdges) expect(build(edge, rigAt(edge)).duration()).toBeGreaterThan(0);
  });

  it('times each edge to the design table', () => {
    expect(edgeSeconds).toEqual({
      'onDesk-pickUp': 0.75,
      'pickedUp-focus': 0.6,
      'focused-unfocus': 0.5,
      'pickedUp-dock': 4.6,
      'focused-dock': 5.1,
      'docked-undock': 3.5,
    });
  });

  it.each([
    ['onDesk', 'pickUp', 0.75],
    ['pickedUp', 'focus', 0.6],
    ['focused', 'unfocus', 0.5],
    ['pickedUp', 'dock', 4.6],
    ['focused', 'dock', 5.1],
    ['docked', 'undock', 3.5],
  ] as const)('runs %s %s for %f seconds, within a tenth of a second', (from, via, seconds) => {
    const edge = allEdges.find((candidate) => candidate.from === from && candidate.via === via);
    if (edge === undefined) throw new Error(`no edge ${from} ${via}`);
    expect(Math.abs(build(edge, rigAt(edge)).duration() - seconds)).toBeLessThanOrEqual(0.1);
  });

  it.each(allEdges.map((edge) => [edgeKey(edge), edge] as const))('ends %s exactly where the destination snap puts every part, fixture, signal and loading value', (_, edge) => {
    const rig = rigAt(edge);
    build(edge, rig).progress(1);
    const ended = read(rig);
    applyPose(rig, edge.to);
    expect(differences(ended, read(rig))).toEqual([]);
  });

  it('builds paused, so the director decides when it plays', () => {
    for (const edge of allEdges) expect(build(edge, rigAt(edge)).paused()).toBe(true);
  });
});
