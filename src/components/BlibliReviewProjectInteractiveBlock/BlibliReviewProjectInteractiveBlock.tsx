import styles from './BlibliReviewProjectInteractiveBlock.module.scss';
import latestCaptureImg from 'assets/img/blibli/pair-of-shoes-min.png';
import resetIcon from 'assets/icons/ic-reset.webp';
import cameraScreenImg from 'assets/img/blibli/shoe-in-a-box-min.png';
// import projectScreenshot from 'assets/img/blibli/write-review.png';
import { useEffect, useRef } from 'react';
import useCameraInteraction from './useCameraInteraction.hook';

function BlibliReviewProjectInteractiveBlock() {
  const captureImgRef = useRef<HTMLImageElement>(null);
  const flashlightRef = useRef<HTMLDivElement>(null);
  const projectScreenshotRef = useRef<HTMLImageElement>(null);
  const { setupMovingImgAnimation, captureImage } = useCameraInteraction({
    captureImgRef,
    flashlightRef
  });

  useEffect(() => {
    const movingAnim = setupMovingImgAnimation();
    return () => {
      movingAnim.kill();
    };
  }, []);

  return (
    <div className={styles.block}>
      <h2 className={styles.heading}>Product Review Revamp</h2>
      <div className={styles.flashlight} ref={flashlightRef}></div>
      <div className={styles['camera-container']}>
        {/* <img
          className={styles['project-screenshot']}
          ref={projectScreenshotRef}
          src={projectScreenshot}
        /> */}
        <div className={styles.camera}>
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
                onClick={() => {
                  captureImage();
                }}
              ></button>
              <button className={styles['btn-reset-capture']}>
                <img src={resetIcon} alt="" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlibliReviewProjectInteractiveBlock;
