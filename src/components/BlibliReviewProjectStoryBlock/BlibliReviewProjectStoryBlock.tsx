import styles from './BlibliReviewProjectStoryBlock.module.scss';

function BlibliReviewProjectStoryBlock() {
  return (
    <div className={styles['story-block']}>
      <h3>Redesign the journey</h3>
      <p className={`${styles.background}`}>
        This project includes series of improvements to user journey, both as a{' '}
        <strong>reviewer</strong> and <strong>potential customers</strong>{' '}
        browsing products. Starting from adding basic features such as review
        filter and photo upload, to adding review photo gallery.
      </p>
      <ul className={`${styles.challenges} text-lg`}>
        <strong>Key changes...</strong>
        <li>
          UI redesign across product review features (adopting the upcoming
          major theme revamp in the company)
        </li>
        <li>Enable photo upload while submitting review</li>
        <li>Filter reviews by photo or rating</li>
        <li>
          Browse reviews by photo (gallery), which supports multiple views like
          grid and list
        </li>
      </ul>
      <ul className={`${styles.challenges} text-lg`}>
        <strong>Some of what I learnt...</strong>
        <li>
          My first encounter with rotated image issue when photo is uploaded
          using mobile web's camera capture (caused by EXIF orientation that
          needs to be handled). Now always be reminded to test the feature on
          real device :)
        </li>
        <li>
          User generated images vary in ratio. Consider all possibilities when
          developing the UI components displaying these images!
        </li>
      </ul>
    </div>
  );
}

export default BlibliReviewProjectStoryBlock;
