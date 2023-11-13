import BlibliPDPScrollableWindow from '@/components/BlibliPDPScrollableWindow';
import styles from './BlibliPDPRevampViewBlock.module.scss';
import icDoc from 'assets/icons/ic-document.webp';
import icFork from 'assets/icons/ic-branch-fork.webp';
import icSearch from 'assets/icons/ic-search.webp';
import icMenu from 'assets/icons/ic-menu.webp';
import icVue from '@/assets/img/tech/vue.svg';

function BlibliPDPRevampViewBlock() {
  return (
    <div className={styles.block}>
      <div className={styles.title}>product-detail-revamp</div>
      <div className={styles.sidebar}>
        <div className={styles.nav}>
          <img src={icMenu} />
        </div>
        <div className={styles.nav}>
          <img src={icDoc} />
        </div>
        <div className={styles.nav}>
          <img src={icSearch} />
        </div>
        <div className={styles.nav}>
          <img src={icFork} />
        </div>
      </div>
      <div className={styles.editor}>
        <div className={styles['file-panel-container']}>
          <div className={`${styles['file-panel']} ${styles.active}`}>
            <img className={styles['ext-logo']} src={icVue} />
            <span className={styles['file-name']}>ProductPage.vue</span>
            <span className={styles['btn-close']}>x</span>
          </div>
          <div className={`${styles['file-panel']}`}>
            <img className={styles['ext-logo']} src={icVue} />
            <span className={styles['file-name']}>MerchantCard.vue</span>
            <span className={styles['btn-close']}>x</span>
          </div>
        </div>
        <BlibliPDPScrollableWindow />
      </div>
    </div>
  );
}

export default BlibliPDPRevampViewBlock;
