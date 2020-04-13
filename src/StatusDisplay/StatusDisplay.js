/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState, useCallback} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    RefreshControl,
    View,
    Text,
    TextInput,
    Button,
    ToastAndroid,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import Colors from 'react-native/Libraries/NewAppScreen/components/Colors';

import {getEntertainmentStatus} from '../services/hever/get-hever-status';

const AVAILABILITY = {
    Available: 1,
    NotAvailable: 2,
    Error: 3,
};

const CREDENTIALS_STORE_NAME = '@userCredentialsStore';
const CREDENTIALS_USER_KEY = `${CREDENTIALS_STORE_NAME}:userid`;
const CREDENTIALS_PASSWORD_KEY = `${CREDENTIALS_STORE_NAME}:password`;

const StatusDisplay: () => React$Node = () => {
    const [availability, setAvailability] = useState(0);
    const [pageContent, setPageContent] = useState('');
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const getSavedCredentials = () =>
        Promise.all([AsyncStorage.getItem(CREDENTIALS_USER_KEY), AsyncStorage.getItem(CREDENTIALS_PASSWORD_KEY)]);

    const processStatusResponse = ({isAvailable, content}) => {
        setError(null);
        setPageContent(content);
        setAvailability(isAvailable ? AVAILABILITY.Available : AVAILABILITY.NotAvailable);
    };

    const processStatusError = e => {
        setPageContent('');
        setError(e);
        setAvailability(AVAILABILITY.Error);
    };

    const respondToHeverStatus = useCallback(() =>
        getSavedCredentials()
            .then(([user, pass]) => getEntertainmentStatus(user, pass))
            .then(processStatusResponse)
            .catch(processStatusError),
    );

    const refreshStatus = () => {
        setIsRefreshing(true);

        respondToHeverStatus().then(() => {
            setIsRefreshing(false);
        });
    };

    const getAvailabilityText = () => {
        if (isRefreshing) {
            return <Text style={styles.highlight}>Loading...</Text>;
        }

        switch (availability) {
            case AVAILABILITY.Available:
                return (<View>
                    <Text style={styles.title}>
                        מופעים והצגות באתר חבר <Text style={styles.success}>זמינים</Text> כעת
                    </Text>
                    <Text>
                        {pageContent}
                    </Text>
                </View>);
            case AVAILABILITY.NotAvailable:
                return (<View>
                    <Text style={styles.title}>
                        מופעים והצגות באתר חבר <Text style={styles.error}>לא זמינים לרכישה</Text> כרגע
                    </Text>
                    <Text>
                        {pageContent}
                    </Text>
                </View>);
            case AVAILABILITY.Error:
                return (<View>
                    <Text style={styles.title}>
                        Cannot set Hever entertainment services status. The following error has occurred:
                    </Text>
                    <Text style={[styles.error, styles.highlight]}>
                        {error.message}
                    </Text>
                </View>);
            default:
                return <Text/>;
        }
    };

    const updateCredentials = () => {
        if (!userId || !password) {
            return Promise.resolve();
        }

        return Promise.all([AsyncStorage.setItem(CREDENTIALS_USER_KEY, userId), AsyncStorage.setItem(CREDENTIALS_PASSWORD_KEY, password)])
            .then(() => {
                ToastAndroid.show('עודכן בהצלחה!', ToastAndroid.SHORT);
            });
    };

    const onCredentialsSend = () => updateCredentials()
        .then(refreshStatus);

    const initCredentials = useCallback(() =>
        getSavedCredentials()
            .then(([user, pass]) => {
                setUserId(user);
                setPassword(pass);
            }),
    );

    useEffect(() => {
        respondToHeverStatus();
        initCredentials();
    }, []);

    const refreshControl = <RefreshControl refreshing={isRefreshing} onRefresh={refreshStatus}/>;

    return (
        <>
            <SafeAreaView>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={[styles.scrollView, styles.fullHeight, styles.main]}
                    refreshControl={refreshControl}>
                    <View style={styles.body}>
                        <View style={styles.sectionContainer}>
                            <View>
                                {getAvailabilityText()}
                            </View>

                            <Text/>

                            <Text style={styles.title}>Pull Down to refresh status</Text>
                        </View>
                        <View style={styles.sectionContainer}>
                            <TextInput placeholder="ת.ז לאתר חבר" style={styles.textInput} onChangeText={setUserId}
                                       defaultValue={userId}/>
                            <TextInput placeholder="סיסמא לאתר חבר" style={styles.textInput} onChangeText={setPassword}
                                       secureTextEntry={true} defaultValue={password}/>
                            <Button title="כניסה" onPress={onCredentialsSend}/>
                        </View>
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
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 21,
        fontWeight: '700',
        color: Colors.black,
        textAlign: 'center',
        marginBottom: 15,
    },
    highlight: {
        fontWeight: '700',
    },
    fullHeight: {
        height: '100%',
    },
    success: {
        color: 'green',
    },
    error: {
        color: 'red',
    },
    textInput: {
        borderColor: 'black',
        borderWidth: 1,
        paddingHorizontal: 5,
        margin: 5,
    },
});

export default StatusDisplay;
