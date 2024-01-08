import { useContext, useEffect, useRef } from 'react';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const { setAction } = useContext(ControllerButtonContext);
  const navigate = useNavigate();
  const ref = useRef<any>(null);

  useEffect(() => {
    setAction('onControlBClick', () => {
      navigate('/work/blibli');
    });
  }, []);

  return <div ref={ref}>Greetings traveler</div>;
}

export default HomePage;
