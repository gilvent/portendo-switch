import styles from './BlibliReviewProjectInteractiveBlock.module.scss';
import latestCaptureImg from 'assets/img/blibli/pair-of-shoes-min.png';
import resetIcon from 'assets/icons/ic-reset.webp';
import cameraScreenImg from 'assets/img/blibli/shoe-in-a-box-min.png';

function BlibliReviewProjectInteractiveBlock() {
  return (
    <div className={styles.block}>
      <h2>Product Review Revamp</h2>
      <div className={styles['camera-container']}>
        <div className={styles.camera}>
          <div className={styles.screen}>
            <img
              className={styles['capture-img']}
              src={cameraScreenImg}
              alt=""
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
              <button className={styles['btn-capture']}></button>
              <div className={styles['btn-reset-capture']}>
                <img src={resetIcon} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlibliReviewProjectInteractiveBlock;
