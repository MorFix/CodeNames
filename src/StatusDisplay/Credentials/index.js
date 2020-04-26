import React, {useState, useContext, useEffect, useCallback} from 'react';
import {Button, TextInput, View} from 'react-native';
import {UserContext} from '../user.context';

import styles from './styles';
import globalStyles from '../global-styles';
import StorageKeys from '../../constants/StorageKeys.const';

export const Credentials = ({onSave}) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const userCtx = useContext(UserContext);

  const initCredentials = useCallback(
    () =>
      userCtx.getSavedCredentials().then(credentials => {
        setUserId(credentials[StorageKeys.CREDENTIALS_USER_KEY]);
        setPassword(credentials[StorageKeys.CREDENTIALS_PASSWORD_KEY]);
      }),
    [userCtx],
  );

  const onCredentialsSend = () =>
    Promise.all([
      userCtx.saveUserId(userId),
      userCtx.savePassword(password),
    ]).then(onSave);

  useEffect(() => {
    initCredentials();
  }, [initCredentials]);

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
