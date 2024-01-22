import { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import styles from './HomePage.module.scss';
import linkedin from 'assets/img/brand/linkedin.png';
import github from 'assets/img/brand/github.png';
import gmail from 'assets/img/brand/gmail.png';
import twitter from 'assets/img/brand/twitter.png';

function HomePage() {
  const { setAction } = useContext(ControllerButtonContext);
  const navigate = useNavigate();
  const ref = useRef<any>(null);

  useEffect(() => {
    setAction('onControlBClick', () => {
      navigate('/work/blibli');
    });
  }, []);

  return (
    <div ref={ref} className={styles.page}>
      <div className={styles.foreground}>
        <h2>Hey there!</h2>
        <h3>I am Alvaro.</h3>
        <h3>I develop Web Frontends.</h3>
        <a
          href="www.linkedin.com/in/alvaro-lukmanto"
          className={`${styles.contact} ${styles.linkedin}`}
        >
          <img src={linkedin} />
        </a>
        <a
          href="https://github.com/gilvent"
          className={`${styles.contact} ${styles.github}`}
        >
          <img src={github} />
        </a>
        <a
          href="https://twitter.com/alfonsiusalvaro"
          className={`${styles.contact} ${styles.twitter}`}
        >
          <img src={twitter} />
        </a>
        <a
          href="mailto:alvarolukmanto@gmail.com"
          className={`${styles.contact} ${styles.gmail}`}
        >
          <img src={gmail} />
        </a>
      </div>

      <div className={styles['clouds-light']}>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
      </div>

      <div className={styles['clouds-dark']}>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
        <div className={styles.cloud}></div>
      </div>
    </div>
  );
}

export default HomePage;
