import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleChange = (state: NetInfoState) => {
      // isInternetReachable flickers during active HTTP requests (e.g. Supabase
      // upsert) and toggles queries on/off, leaving the UI in a stuck state.
      const online = Boolean(state.isConnected);
      setIsOnline(online);
      setIsReady(true);
    };

    const unsubscribe = NetInfo.addEventListener(handleChange);
    NetInfo.fetch().then(handleChange);

    return unsubscribe;
  }, []);

  return { isOnline, isReady };
};
