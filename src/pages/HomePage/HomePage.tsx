import { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import styles from './HomePage.module.scss';
import linkedin from 'assets/img/brand/linkedin.png';
import github from 'assets/img/brand/github.png';
import gmail from 'assets/img/brand/gmail.png';
import twitter from 'assets/img/brand/twitter.png';
import useMediaQuery from '@/hooks/useMediaQuery.hook';
import { MediaQueryScreen } from '@/utils/enums';

function HomePage() {
  const { setAction } = useContext(ControllerButtonContext);
  const navigate = useNavigate();
  const ref = useRef<any>(null);
  const isTablet = useMediaQuery(MediaQueryScreen.Tablet);

  useEffect(() => {
    setAction('onControlBClick', () => {
      navigate('/work/blibli');
    });
  }, []);

  function clouds() {
    if (isTablet) {
      return createClouds(6);
    }

    return createClouds(3);
  }

  function createClouds(num: number) {
    return [...new Array(num)].map((_, idx) => (
      <div
        data-anim-target="cloud"
        key={idx + 'cloud'}
        className={styles.cloud}
      ></div>
    ));
  }

  return (
    <div data-anim-target="home-page" ref={ref} className={styles.page}>
      <div data-anim-target="foreground" className={styles.foreground}>
        <h2 className={`invisible`}>Hey there!</h2>
        <h3 className={`invisible`}>I am Alvaro.</h3>
        <h3 className={`invisible`}>I develop Web Frontends.</h3>
        <a
          href="https://linkedin.com/in/alvaro-lukmanto"
          target="_blank"
          className={`${styles.contact} ${styles.linkedin} invisible`}
        >
          <img src={linkedin} />
        </a>
        <a
          href="https://github.com/gilvent"
          target="_blank"
          className={`${styles.contact} ${styles.github} invisible`}
        >
          <img src={github} />
        </a>
        <a
          href="https://twitter.com/alfonsiusalvaro"
          target="_blank"
          className={`${styles.contact} ${styles.twitter} invisible`}
        >
          <img src={twitter} />
        </a>
        <a
          href="mailto:alvarolukmanto@gmail.com"
          target="_blank"
          className={`${styles.contact} ${styles.gmail} invisible`}
        >
          <img src={gmail} />
        </a>
      </div>

      <div data-anim-target="clouds-light" className={styles['clouds-light']}>
        {clouds()}
      </div>

      <div data-anim-target="clouds-dark" className={styles['clouds-dark']}>
        {clouds()}
      </div>
    </div>
  );
}

export default HomePage;
