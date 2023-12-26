import classNames from 'classnames';
import blibliGift from 'assets/img/blibli/blibli-gift-1.svg';
import blibliGift2 from 'assets/img/blibli/blibli-gift-2.svg';
import blibliGift3 from 'assets/img/blibli/blibli-gift-3.svg';
import styles from './GiftsImage.module.scss';
import useTemporaryActiveEffect from '@/hooks/useTemporaryActiveEffect.hook';

const GiftsImage = ({ active }: { active: boolean }) => {
  const { isActive: leaving } = useTemporaryActiveEffect(!active, 600);
  const gift1Class = classNames(styles['gift-1'], {
    [styles.active]: active
  });
  const gift2Class = classNames(styles['gift-2'], {
    [styles.active]: active
  });
  const gift3Class = classNames(styles['gift-3'], {
    [styles.active]: active
  });
  const containerClass = classNames(styles['gifts-container'], {
    [styles.leaving]: leaving
  });

  return (
    <div className={containerClass}>
      <img src={blibliGift} className={gift1Class} />
      <img src={blibliGift2} className={gift2Class} />
      <img src={blibliGift3} className={gift3Class} />
    </div>
  );
};

export default GiftsImage;
