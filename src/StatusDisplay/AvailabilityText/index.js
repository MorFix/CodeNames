import React from 'react';
import {View, Text} from 'react-native';

import AVAILABILITY from '../../constants/Availability.const';
import globalStyles from '../global-styles';

import {entertainmentPageTitle} from '../../config';

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
            {entertainmentPageTitle} באתר חבר{'\n'}
            <Text style={styles.success}>זמינים לרכישה</Text> כעת
          </Text>
          <Text>{availabilityData.pageContent}</Text>
        </View>
      );
    case AVAILABILITY.NotAvailable:
      return (
        <View>
          <Text style={globalStyles.title}>
            {entertainmentPageTitle} באתר חבר{'\n'}
            <Text style={styles.error}>לא זמינים לרכישה</Text> כעת
          </Text>
          <Text>{availabilityData.pageContent}</Text>
        </View>
      );
    case AVAILABILITY.Error:
      return (
        <View>
          <Text style={globalStyles.title}>
            לא ניתן לקבוע את סטטוס {entertainmentPageTitle} באתר חבר בעקבות
            השגיאה הבאה:
          </Text>
          <Text style={[styles.error, styles.highlight]}>
            {availabilityData.error.message}
          </Text>
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
