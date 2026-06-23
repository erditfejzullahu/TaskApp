import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleChange = (state: NetInfoState) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
      setIsReady(true);
    };

    const unsubscribe = NetInfo.addEventListener(handleChange);
    NetInfo.fetch().then(handleChange);

    return unsubscribe;
  }, []);

  return { isOnline, isReady };
};
