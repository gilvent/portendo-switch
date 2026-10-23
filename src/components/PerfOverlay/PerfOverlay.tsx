import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { subscribeTransitionReports, TransitionReport } from '@/utils/perf';
import styles from './PerfOverlay.module.scss';

const MAX_REPORTS = 8;

function formatLongFrames(longFrames: TransitionReport['longFrames']) {
  if (longFrames === 'unsupported') return 'LoAF unsupported in this browser';
  if (longFrames.count === 0) return '0 long frames';
  return `${longFrames.count} long frames · worst ${Math.round(
    longFrames.worstDuration
  )}ms · ${Math.round(longFrames.totalBlockingDuration)}ms blocking`;
}

function isJanky(report: TransitionReport) {
  return (
    report.droppedFrames > 0 ||
    (report.longFrames !== 'unsupported' && report.longFrames.count > 0)
  );
}

function PerfOverlay() {
  const [reports, setReports] = useState<TransitionReport[]>([]);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    return subscribeTransitionReports(report => {
      setReports(current => [report, ...current].slice(0, MAX_REPORTS));
    });
  }, []);

  return (
    <div className={styles.overlay}>
      <button
        className={styles.toggle}
        onClick={() => setCollapsed(!collapsed)}
      >
        perf · {reports.length} transitions {collapsed ? '▸' : '▾'}
      </button>
      {!collapsed && (
        <ul className={styles.reports}>
          {reports.map((report, index) => (
            <li
              key={`${report.name}-${reports.length - index}`}
              className={classNames(styles.report, {
                [styles.janky]: isJanky(report)
              })}
            >
              <div className={styles.name}>
                {report.name} · {Math.round(report.duration)}ms
              </div>
              <div>
                {Math.round(report.averageFps)} fps · {report.frames} frames ·{' '}
                {report.droppedFrames} dropped
              </div>
              <div>{formatLongFrames(report.longFrames)}</div>
              {report.overlapped && (
                <div className={styles.overlap}>
                  overlapped another run of this transition
                </div>
              )}
              {report.longFrames !== 'unsupported' &&
                report.longFrames.topScript && (
                  <div className={styles.script}>
                    top: {report.longFrames.topScript}
                  </div>
                )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PerfOverlay;
