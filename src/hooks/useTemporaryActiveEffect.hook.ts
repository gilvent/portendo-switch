import { useEffect, useState } from 'react';

const useTemporaryActiveEffect = (
  shouldActivate: boolean,
  duration: number
) => {
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    if (shouldActivate) {
      setIsActive(true);
      setTimeout(() => {
        setIsActive(false);
      }, duration);
    }
  }, [shouldActivate]);

  return {
    isActive
  };
};

export default useTemporaryActiveEffect;
