import AsyncStorage from '@react-native-community/async-storage';
import StorageKeys from '../constants/StorageKeys.const';

export const getCredentials = async () => {
  const [user, password] = await Promise.all([
    AsyncStorage.getItem(StorageKeys.CREDENTIALS_USER_KEY),
    AsyncStorage.getItem(StorageKeys.CREDENTIALS_PASSWORD_KEY),
  ]);

  return {
    [StorageKeys.CREDENTIALS_USER_KEY]: user,
    [StorageKeys.CREDENTIALS_PASSWORD_KEY]: password,
  };
};

const saveField = (key, value) => {
  if (!value) {
    return Promise.resolve();
  }

  return AsyncStorage.setItem(key, value);
};

export const saveUserId = username => {
  return saveField(StorageKeys.CREDENTIALS_USER_KEY, username);
};

export const savePassword = password => {
  return saveField(StorageKeys.CREDENTIALS_PASSWORD_KEY, password);
};
