import React, {useState, useEffect} from 'react';
import {Button, TextInput, View} from 'react-native';

import styles from './styles';
import globalStyles from '../global-styles';
import StorageKeys from '../../constants/StorageKeys.const';
import {
  getCredentials,
  saveUserId,
  savePassword,
} from '../../services/credentials';

export const Credentials = ({onSave}) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const initCredentials = () =>
    getCredentials().then(credentials => {
      setUserId(credentials[StorageKeys.CREDENTIALS_USER_KEY]);
      setPassword(credentials[StorageKeys.CREDENTIALS_PASSWORD_KEY]);
    });

  const onCredentialsSend = () =>
    Promise.all([saveUserId(userId), savePassword(password)]).then(onSave);

  useEffect(() => {
    initCredentials();
  }, []);

  return (
    <View style={globalStyles.sectionContainer}>
      <TextInput
        placeholder="ת.ז לאתר חבר"
        style={styles.textInput}
        onChangeText={setUserId}
        defaultValue={userId}
      />
      <TextInput
        placeholder="סיסמא לאתר חבר"
        style={styles.textInput}
        onChangeText={setPassword}
        secureTextEntry={true}
        defaultValue={password}
      />
      <Button title="כניסה" onPress={onCredentialsSend} />
    </View>
  );
};
