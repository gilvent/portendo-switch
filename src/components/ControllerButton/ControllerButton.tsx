import { useContext } from 'react';
import styles from './ControllerButton.module.scss';
import ControllerButtonContext from '@/context/ControllerButtonContext';

function ControllerButton() {
  const { actions } = useContext(ControllerButtonContext);

  return (
    <div className={styles.controller}>
      <button
        className={styles['btn-up']}
        onClick={() => {
          actions?.current?.['onUpClick']();
        }}
      ></button>
      <button
        className={styles['btn-right']}
        onClick={() => {
          actions?.current?.['onRightClick']();
        }}
      ></button>
      <button
        className={styles['btn-left']}
        onClick={() => {
          actions?.current?.['onLeftClick']();
        }}
      ></button>
      <button
        className={styles['btn-down']}
        onClick={() => {
          actions?.current?.['onDownClick']();
        }}
      ></button>
    </div>
  );
}
export default ControllerButton;
