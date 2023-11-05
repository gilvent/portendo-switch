import styles from './BlibliReviewProjectInteractiveBlock.module.scss';
import latestCaptureImg from 'assets/img/blibli/pair-of-shoes-min.png';
import resetIcon from 'assets/icons/ic-reset.webp';
import cameraScreenImg from 'assets/img/blibli/shoe-in-a-box-min.png';
import projectScreenshot from 'assets/img/blibli/write-review.png';
import { MouseEvent, useEffect, useRef } from 'react';
import useInteractiveAnimation from './useInteractiveAnimation';

function BlibliReviewProjectInteractiveBlock() {
  const cameraRef = useRef<HTMLDivElement>(null);
  const captureImgRef = useRef<HTMLImageElement>(null);
  const flashlightRef = useRef<HTMLDivElement>(null);
  const monitorRef = useRef<HTMLDivElement>(null);
  const { swapToCamera, swapToMonitor, cameraStateActive } =
    useInteractiveAnimation({
      monitorRef,
      cameraRef,
      captureImgRef,
      flashlightRef
    });

  function onCaptureClick(e: MouseEvent) {
    if (!cameraStateActive.current) return;
    e.stopPropagation();
    swapToMonitor.current.play(0);
  }

  function onCameraClick() {
    if (cameraStateActive.current) return;
    swapToCamera.current.play(0);
  }

  return (
    <div className={styles.block}>
      <h2 className={styles.heading}>Product Review Revamp</h2>
      <div className={styles.flashlight} ref={flashlightRef}></div>
      <div className={styles['interactive-area']}>
        <div className={styles.camera} ref={cameraRef} onClick={onCameraClick}>
          <div className={styles.screen}>
            <img
              ref={captureImgRef}
              className={styles['capture-img']}
              src={cameraScreenImg}
            />
            <div className={styles['grid-overlay']}>
              <div className={styles['grid-section']}></div>
              <div className={styles['grid-section']}></div>
              <div className={styles['grid-section']}></div>
              <div className={styles['grid-section']}></div>
              <div className={styles['grid-section']}></div>
              <div className={styles['grid-section']}></div>
              <div className={styles['grid-section']}></div>
              <div className={styles['grid-section']}></div>
              <div className={styles['grid-section']}></div>
            </div>
          </div>

          <div className={styles.bottom}>
            <div className={styles.modes}>
              <div className={`${styles['btn-option']} text-xs`}>Fun</div>
              <div className={`${styles['btn-option']} text-xs`}>Portrait</div>
              <div className={`${styles['btn-option']} ${styles.active}`}>
                Photo
              </div>
              <div className={`${styles['btn-option']} text-xs`}>Video</div>
              <div className={`${styles['btn-option']} text-xs`}>More</div>
            </div>
            <div className={styles.controls}>
              <div className={styles['btn-last-capture']}>
                <img src={latestCaptureImg} alt="" />
              </div>
              <button
                className={styles['btn-capture']}
                onClick={onCaptureClick}
              ></button>
              <button className={styles['btn-reset-capture']}>
                <img src={resetIcon} alt="" />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.monitor} ref={monitorRef}>
          <div className={styles.screen}>
            <img
              className={styles['project-screenshot']}
              src={projectScreenshot}
            />
          </div>
          <div className={styles.stand}></div>
          <div className={styles.plane}></div>
        </div>
      </div>
    </div>
  );
}

export default BlibliReviewProjectInteractiveBlock;
