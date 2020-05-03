import React, {useEffect, useCallback} from 'react';
import {SafeAreaView, Alert} from 'react-native';
import BackgroundTask from 'react-native-background-task';

import {useAppState} from './app-state.hook';
import {StatusDisplay} from './StatusDisplay';

import backgroundCode from './background';

BackgroundTask.define(backgroundCode);

const alertTasksStatus = async () => {
  const {available, unavailableReason} = await BackgroundTask.statusAsync();
  if (available) {
    return;
  }

  if (unavailableReason === BackgroundTask.UNAVAILABLE_DENIED) {
    Alert.alert('שגיאה', 'יש לאפשר במכשירך פעילות ברקע עבור האפליקציה');
  } else if (unavailableReason === BackgroundTask.UNAVAILABLE_RESTRICTED) {
    Alert.alert('שגיאה', 'פעילות ברקע איננה מאופשרת במכשירך');
  }
};

export const App = () => {
  useEffect(() => {
    alertTasksStatus();
  }, []);

  const scheduleBackgroundTask = useCallback(state => {
    if (state === 'active') {
      BackgroundTask.schedule();
    }
  }, []);

  useAppState(scheduleBackgroundTask);

  return (
    <SafeAreaView>
      <StatusDisplay />
    </SafeAreaView>
  );
};
