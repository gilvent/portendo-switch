function BlibliReviewProjectStoryBlock() {
  return (
    <div className="story-block">
      <h3>Redesign the journey</h3>
      <p className={`overview`}>
        I took part in a series of projects to improve product review journey,
        both as a <strong>reviewer</strong> and{' '}
        <strong>potential customers</strong> browsing products. Starting from
        adding basic features such as review filter and photo upload, to adding
        review photo gallery.
      </p>
      <ul className="key-points text-lg">
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
      <ul className="key-points text-lg">
        <strong>Some of what I learnt...</strong>
        <li>
          Try our best to test on real device :). This time is my first
          encounter with an issue that uploaded image is rotated when uploaded
          using mobile web's camera capture (caused by EXIF orientation that
          needs to be handled).
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
