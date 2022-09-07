import styles from './BlibliProductDetailPreview.module.scss';
import pdpPageImg from 'assets/blibli-projects/pdp-full-page.png';

function BlibliProductDetailPreview() {
  return (
    <figure className={styles['preview']}>
      <img src={pdpPageImg} alt="Blibli product detail" />
      <div className={styles['frame']}>
        <div></div>
      </div>
    </figure>
  );
}

export default BlibliProductDetailPreview;
