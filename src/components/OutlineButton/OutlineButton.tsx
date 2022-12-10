import styles from './OutlineButton.module.scss';

export type OutlineButtonProps = {};

const OutlineButton = (props: React.PropsWithChildren<OutlineButtonProps>) => {
  return <button className={styles['btn-outline']}>{props.children}</button>;
};

export default OutlineButton;
