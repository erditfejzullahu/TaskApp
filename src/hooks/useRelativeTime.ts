import { useEffect, useState } from 'react';
import { formatRelativeTime } from '@/utils/date';

const REFRESH_MS = 60_000;

export const useRelativeTime = (iso: string): string => {
  const [label, setLabel] = useState(() => formatRelativeTime(iso));

  useEffect(() => {
    const update = () => setLabel(formatRelativeTime(iso));
    update();
    const interval = setInterval(update, REFRESH_MS);
    return () => clearInterval(interval);
  }, [iso]);

  return label;
};
