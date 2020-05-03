import React, {useEffect, useState, useCallback} from 'react';
import {StyleSheet, ScrollView, RefreshControl, View, Text} from 'react-native';

import globalStyles from './global-styles';

import AVAILABILITY from '../constants/Availability.const';
import StorageKeys from '../constants/StorageKeys.const';

import {getCredentials} from '../services/credentials';
import {getEntertainmentStatus} from '../services/get-hever-status';

import {AvailabilityText} from './AvailabilityText';
import {Credentials} from './Credentials';

export const StatusDisplay = () => {
  const [availabilityData, setAvailabilityData] = useState({
    availability: 0,
    pageContent: '',
    error: null,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

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
      getCredentials()
        .then(credentials =>
          getEntertainmentStatus(
            credentials[StorageKeys.CREDENTIALS_USER_KEY],
            credentials[StorageKeys.CREDENTIALS_PASSWORD_KEY],
          ),
        )
        .then(processStatusResponse)
        .catch(processStatusError),
    [],
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
        <Credentials onSave={refreshStatus} />
      </View>
    </ScrollView>
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
