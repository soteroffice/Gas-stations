import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TextInput, Button, ScrollView, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from './src/screens/SignUpScreen';
import LogInScreen from './src/screens/LogInScreen';
import PriceTrendsChart from './src/components/PriceTrendsChart';

const Stack = createStackNavigator();

const HomeScreen = () => {
  const { user, logOut } = useAuth();
  const [region, setRegion] = useState(null);
  const [gasStations, setGasStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [priceTrends, setPriceTrends] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        fetchGasStations(position.coords.latitude, position.coords.longitude);
      },
      error => setError(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  const fetchGasStations = async (latitude, longitude) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.example.com/gas-prices?lat=${latitude}&lon=${longitude}`);
      setGasStations(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (stationId) => {
    try {
      const response = await axios.get(`http://localhost:3000/reviews/${stationId}`);
      setReviews(response.data);
      setSelectedStation(stationId);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchPriceTrends = async (stationId) => {
    try {
      const response = await axios.get(`https://api.example.com/gas-price-trends?stationId=${stationId}`);
      setPriceTrends(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  const submitReview = async () => {
    if (!user) {
      Alert.alert('You must be logged in to submit a review.');
      return;
    }
    try {
      await axios.post('http://localhost:3000/reviews', { ...newReview, stationId: selectedStation, userId: user.uid });
      fetchReviews(selectedStation);
      setNewReview({ rating: 0, comment: '' });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {region && (
            <MapView
              style={styles.map}
              initialRegion={region}
              showsUserLocation={true}
            >
              {gasStations.map(station => (
                <Marker
                  key={station.id}
                  coordinate={{
                    latitude: station.latitude,
                    longitude: station.longitude,
                  }}
                  title={station.name}
                  description={`Price: ${station.price}`}
                  onPress={() => {
                    fetchReviews(station.id);
                    fetchPriceTrends(station.id);
                  }}
                />
              ))}
            </MapView>
          )}
          {selectedStation && (
            <View style={styles.reviewContainer}>
              <FlatList
                data={reviews}
                keyExtractor={review => review._id}
                renderItem={({ item }) => (
                  <View style={styles.review}>
                    <Text>Rating: {item.rating}</Text>
                    <Text>Comment: {item.comment}</Text>
                  </View>
                )}
              />
              <TextInput
                style={styles.input}
                placeholder="Rating"
                keyboardType="numeric"
                value={newReview.rating.toString()}
                onChangeText={text => setNewReview({ ...newReview, rating: parseInt(text) })}
              />
              <TextInput
                style={styles.input}
                placeholder="Comment"
                value={newReview.comment}
                onChangeText={text => setNewReview({ ...newReview, comment: text })}
              />
              <Button title="Submit Review" onPress={submitReview} />
              <PriceTrendsChart data={priceTrends} />
            </View>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          {user ? (
            <Button title="Log Out" onPress={logOut} />
          ) : (
            <>
              <Button title="Log In" onPress={() => navigation.navigate('LogIn')} />
              <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
            </>
          )}
        </>
      )}
    </View>
  );
};

const App =
