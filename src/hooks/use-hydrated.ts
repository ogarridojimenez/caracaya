import { useState, useEffect } from 'react';

export function useHydrated() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}