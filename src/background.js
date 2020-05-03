import BackgroundTask from 'react-native-background-task';
import AsyncStorage from '@react-native-community/async-storage';
import {Notifications} from 'react-native-notifications';

import StorageKeys from './constants/StorageKeys.const';

import {getCredentials} from './services/credentials';
import {getEntertainmentStatus} from './services/get-hever-status';

const notifyNewStatus = (oldStatus, newStatus) => {
  if (oldStatus === newStatus) {
    return;
  }

  return Notifications.postLocalNotification({
    title: 'עדכון בסטטוס מופעים והצגות!',
    body: 'לחץ כאן לקבלת סטטוס עדכני',
  });
};

export default async () => {
  const credentials = await getCredentials();

  try {
    const oldStatus = await AsyncStorage.getItem(StorageKeys.LAST_RESPONSE_KEY);

    const {isAvailable} = await getEntertainmentStatus(
      credentials[StorageKeys.CREDENTIALS_USER_KEY],
      credentials[StorageKeys.CREDENTIALS_PASSWORD_KEY],
    );

    notifyNewStatus(oldStatus, isAvailable);
    await AsyncStorage.setItem(StorageKeys.LAST_RESPONSE_KEY, isAvailable);
  } catch (e) {}

  BackgroundTask.finish();
};
