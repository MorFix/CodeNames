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
    Text
} from 'react-native';

import Colors from 'react-native/Libraries/NewAppScreen/components/Colors';

import {getEntertainmentStatus} from './services/hever/get-hever-status';

const AVAILABILITY = {
    Available: 1,
    NotAvailable: 2,
    Error: 3,
};

const App: () => React$Node = () => {
    const [availability, setAvailability] = useState(0);
    const [pageContent, setPageContent] = useState('');
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const respondToStatus = useCallback(() =>
        getEntertainmentStatus()
            .then(({isAvailable, content}) => {
                setError(null);
                setPageContent(content);
                setAvailability(isAvailable ? AVAILABILITY.Available : AVAILABILITY.NotAvailable);
            })
            .catch(e => {
                setError(e);
                setAvailability(AVAILABILITY.Error);
            }));

    const onRefresh = () => {
        setIsRefreshing(true);

        respondToStatus().then(() => {
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
                        Hever entertainment services are <Text style={styles.success}>AVAILABLE</Text> right now
                    </Text>
                    <Text>
                        {pageContent}
                    </Text>
                </View>);
            case AVAILABILITY.NotAvailable:
                return (<View>
                    <Text style={styles.title}>
                        Hever entertainment services are <Text style={styles.error}>NOT AVAILABLE</Text> right now
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

    useEffect(() => {
        respondToStatus();
    }, []);


    const refreshControl = <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh}/>;

    return (
        <>
            <SafeAreaView>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={[styles.scrollView, styles.fullHeight]}
                    refreshControl={refreshControl}>
                    <View style={styles.body}>
                        <View style={styles.sectionContainer}>
                            <View>
                                {getAvailabilityText()}
                            </View>

                            <Text/>

                            <Text style={styles.title}>Pull Down to refresh status</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 21,
        fontWeight: '700',
        color: Colors.black,
        textAlign: 'center',
        marginBottom: 15
    },
    highlight: {
        fontWeight: '700',
    },
    fullHeight: {
        height: '100%',
    },
    success: {
        color: 'green'
    },
    error: {
        color: 'red'
    }
});

export default App;
