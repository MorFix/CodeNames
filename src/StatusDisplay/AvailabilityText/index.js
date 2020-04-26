// TODO: WORK HERE

import React from 'react';
import {View, Text} from 'react-native';

import AVAILABILITY from '../../constants/Availability.const';
import globalStyles from '../global-styles';

export const AvailabilityText = ({availabilityData, isRefreshing}) => {
  if (isRefreshing) {
    return (
      <View>
        <Text style={styles.highlight}>בטעינה...</Text>
      </View>
    );
  }

  switch (availabilityData.availability) {
    case AVAILABILITY.Available:
      return (
        <View>
          <Text style={globalStyles.title}>
            מופעים והצגות באתר חבר <Text style={styles.success}>זמינים</Text>{' '}
            כעת
          </Text>
          <Text>{availabilityData.pageContent}</Text>
        </View>
      );
    case AVAILABILITY.NotAvailable:
      return (
        <View>
          <Text style={globalStyles.title}>
            מופעים והצגות באתר חבר{' '}
            <Text style={styles.error}>לא זמינים לרכישה</Text> כרגע
          </Text>
          <Text>{availabilityData.pageContent}</Text>
        </View>
      );
    case AVAILABILITY.Error:
      return (
        <View>
          <Text style={globalStyles.title}>
            לא ניתן לקבוע את סטטוס המופעים באתר חבר בעקבות השגיאה הבאה:
          </Text>
          <Text style={[styles.error, styles.highlight]}>{availabilityData.error.message}</Text>
        </View>
      );
    default:
      return <Text />;
  }
};

const styles = {
  highlight: {
    fontWeight: '700',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
};
