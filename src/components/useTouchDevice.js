import { useEffect, useState } from 'react';

// True on phones and tablets (touch is the primary pointer). Touchscreen laptops keep mouse + keyboard controls.
const QUERY = '(pointer: coarse)';

export default function useTouchDevice() {
  const [touch, setTouch] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = matchMedia(QUERY), on = () => setTouch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return touch;
}
