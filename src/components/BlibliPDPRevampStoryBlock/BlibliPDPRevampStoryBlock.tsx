function BlibliPDPRevampStoryBlock() {
  return (
    <article className="story-block">
      <h2>
        Project Highlight: <br /> Product Detail Revamp
      </h2>
      <p className="overview">
        This is a full page redesign project which is part of major theme update
        across Blibli. Besides theme revamp, this project also introduces user
        experience improvements such as secondary pages and sticky navigation
        for mobile web.
      </p>

      <ul className={`key-points text-lg`}>
        <strong>Key changes...</strong>
        <li>New and newer UI components</li>
        <li>Rewrite the codebase to accomodate new flow</li>
        <li>
          Performance improvement: New APIs that focuses on{' '}
          <strong>above the fold</strong>, lazy loaded many things!
        </li>
      </ul>

      <ul className={`key-points text-lg`}>
        <strong>Lessons I learnt while doing this project...</strong>
        <li>
          Software development principles. One that stick to mind is{' '}
          <strong>
            Incremental release &gt; <i>Big bang</i> release
          </strong>{' '}
          with feature flag
        </li>
        <li>
          Explore CSS techniques to building cool UI components: layouts,
          animation, expand / hide interaction and more
        </li>
        <li>
          Get work on more JS and browser APIs: Lazy load techniques, datalayer,
          service worker, intersection observer, etc...
        </li>
      </ul>
    </article>
  );
}

export default BlibliPDPRevampStoryBlock;
