import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import gsap from 'gsap';
import WorkCard from './components/WorkCard';

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline>();
  const [counter, setCounter] = useState(0);
  const [reversed, setReversed] = useState(false);
  const [isCardActive, setIsCardActive] = useState(false);
  const query = gsap.utils.selector(appRef);

  useEffect(() => {
    timeline.current = gsap.timeline()
      .to(query('.App-logo'), {
        rotation: 150
      });
  }, []);

  useEffect(() => {
    timeline.current?.reversed(reversed);
  }, [reversed]);

  function onClick() {
    setReversed(!reversed);
    setCounter(counter + 1);
  }

  function onCardClick () {
    setIsCardActive(!isCardActive);
  }

  return (
    <div className="App" ref={appRef}>
      <section className="works">
        <h2>Works</h2>
        <WorkCard onClick={onCardClick} active={isCardActive}/>
      </section>
    </div>
  );
}

export default App;
