import React, {useEffect, useState, useMemo, useCallback} from 'react';
import AVAILABILITY from '../constants/Availability.const';
import StorageKeys from '../constants/StorageKeys.const';

import globalStyles from './global-styles';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  RefreshControl,
  View,
  Text,
} from 'react-native';

import {AvailabilityText} from './AvailabilityText';

import AsyncStorage from '@react-native-community/async-storage';

import {getEntertainmentStatus} from '../services/hever/get-hever-status';
import {UserContext} from './user.context';
import {Credentials} from './Credentials';

export const StatusDisplay = () => {
  const [availabilityData, setAvailabilityData] = useState({
    availability: 0,
    pageContent: '',
    error: null,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const setStorageField = useCallback((storageKey, newValue) => {
    if (!newValue) {
      return Promise.resolve();
    }

    return AsyncStorage.setItem(storageKey, newValue);
  }, []);

  const savePassword = useCallback(
    newPassword =>
      setStorageField(StorageKeys.CREDENTIALS_PASSWORD_KEY, newPassword),
    [setStorageField],
  );

  const saveUserId = useCallback(
    newUserId => setStorageField(StorageKeys.CREDENTIALS_USER_KEY, newUserId),
    [setStorageField],
  );

  const getSavedCredentials = useCallback(
    () =>
      Promise.all([
        AsyncStorage.getItem(StorageKeys.CREDENTIALS_USER_KEY),
        AsyncStorage.getItem(StorageKeys.CREDENTIALS_PASSWORD_KEY),
      ]).then(([user, pass]) => ({
        [StorageKeys.CREDENTIALS_USER_KEY]: user,
        [StorageKeys.CREDENTIALS_PASSWORD_KEY]: pass,
      })),
    [],
  );

  const userApi = useMemo(
    () => ({saveUserId, savePassword, getSavedCredentials}),
    [saveUserId, savePassword, getSavedCredentials],
  );

  const processStatusResponse = ({isAvailable, content}) => {
    setAvailabilityData({
      availability: isAvailable
        ? AVAILABILITY.Available
        : AVAILABILITY.NotAvailable,
      error: null,
      pageContent: content,
    });
  };

  const processStatusError = error => {
    setAvailabilityData({
      availability: AVAILABILITY.Error,
      error,
      pageContent: '',
    });
  };

  const respondToHeverStatus = useCallback(
    () =>
      getSavedCredentials()
        .then(credentials =>
          getEntertainmentStatus(
            credentials[StorageKeys.CREDENTIALS_USER_KEY],
            credentials[StorageKeys.CREDENTIALS_PASSWORD_KEY],
          ),
        )
        .then(processStatusResponse)
        .catch(processStatusError),
    [getSavedCredentials],
  );

  const refreshStatus = () => {
    setIsRefreshing(true);

    respondToHeverStatus().then(() => {
      setIsRefreshing(false);
    });
  };

  useEffect(() => {
    respondToHeverStatus();
  }, [respondToHeverStatus]);

  const refreshControl = (
    <RefreshControl refreshing={isRefreshing} onRefresh={refreshStatus} />
  );

  return (
    <>
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={[styles.fullHeight, styles.main]}
          refreshControl={refreshControl}>
          <View>
            <View style={globalStyles.sectionContainer}>
              <AvailabilityText
                availabilityData={availabilityData}
                isRefreshing={isRefreshing || !availabilityData.availability}
              />
              <Text />
            </View>
            <UserContext.Provider value={userApi}>
              <Credentials onSave={refreshStatus} />
            </UserContext.Provider>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#eeeeee',
  },
  fullHeight: {
    height: '100%',
  },
});
