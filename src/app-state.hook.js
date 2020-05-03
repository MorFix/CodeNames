import {useEffect} from 'react';
import {AppState} from 'react-native';

export const useAppState = callback => {
  const CHANGE_EVENT = 'change';

  useEffect(() => {
    AppState.addEventListener(CHANGE_EVENT, callback);

    return () => {
      AppState.removeEventListener(CHANGE_EVENT, callback);
    };
  }, [callback]);
};
