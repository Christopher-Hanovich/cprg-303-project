import Polyline from '@mapbox/polyline';
import * as location from 'expo-location';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from "../components/BottomSheet";
import PlatformMapView, { PlatformMarker, PlatformPolyline } from "../components/PlatformMapView";
import SearchBar from "../components/SearchBar";
import { useRoute } from "../contexts/RouteContext";
import { fetchCitiesAlongRoute } from "../utilities/placesAlongRoute";
import { fetchWeatherForCities } from "../utilities/weatherService";

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const hasApiKey = Boolean(googleMapsApiKey);

const defaultRegion = {
  latitude: 51.0641,
  longitude: -114.0885,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const App = () => {
  const insets = useSafeAreaInsets();
  const { setRouteCities, routeCities, setWeatherData } = useRoute();
  
  const mapRef = React.useRef<any>(null);
  const autocompleteRef = React.useRef<any>(null);
  const [region, setRegion] = useState(defaultRegion);
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchKey, setSearchKey] = useState(0);
  const [loadingRoute, setLoadingRoute] = useState(false);
  
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const requestLocationPermission = async () => {
      let { status } = await location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let lastKnownLocation = await location.getLastKnownPositionAsync({});
      if (lastKnownLocation) {
        setRegion({
          latitude: lastKnownLocation.coords.latitude,
          longitude: lastKnownLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setUserLocation({
          latitude: lastKnownLocation.coords.latitude,
          longitude: lastKnownLocation.coords.longitude,
        });
      }
    };

    requestLocationPermission();
  }, []);

  const fetchRoute = async (start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }) => {
    if (Platform.OS === 'web') {
      return [
        { latitude: start.latitude, longitude: start.longitude },
        { latitude: end.latitude, longitude: end.longitude }
      ];
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${googleMapsApiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const points: { latitude: number; longitude: number }[] = Polyline.decode(data.routes[0].overview_polyline.points).map((point: [number, number]) => ({ latitude: point[0], longitude: point[1] }));
        setShowBottomSheet(false);
        return points;
      } else {
        console.warn('No routes found', data.status, data.error_message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      return [];
    }
  };

  const handleGetDirections = async () => {
    if (!markerCoordinate) return;
    const start = userLocation ?? region;
    
    setLoadingRoute(true);
    const points = await fetchRoute(start, markerCoordinate);
    setRouteCoords(points);
    
    if (points.length > 0) {
      try {
        // Fetch cities along route
        const cities = await fetchCitiesAlongRoute({ 
          points, 
          apiKey: googleMapsApiKey, 
          step: 200 
        });
        setRouteCities(cities);
        
        // Fetch weather for cities
        const weather = await fetchWeatherForCities(cities);
        setWeatherData(weather);
        
        // Fit map to route on native
        if (Platform.OS !== 'web' && mapRef.current?.fitToCoordinates) {
          mapRef.current?.fitToCoordinates(points, {
            edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
            animated: true,
          });
        }
      } catch (err) {
        console.warn('Failed to fetch data:', err);
      }
    }
    setLoadingRoute(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    maps: {
      width: "100%",
      height: "100%",
    },
  });

  return (
    <View style={styles.container}>
      {loadingRoute && (
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1000 }]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ color: 'white', marginTop: 10 }}>Calculating route...</Text>
        </View>
      )}
      
      <PlatformMapView
        ref={mapRef}
        style={styles.maps}
        initialRegion={region}
        showsUserLocation={Platform.OS !== 'web'}
        onRegionChangeComplete={Platform.OS !== 'web' ? setRegion : undefined}
      >
        {markerCoordinate && (
          <PlatformMarker
            coordinate={markerCoordinate}
            onPress={() => setShowBottomSheet(true)}
          />
        )}
        {routeCoords.length > 0 && (
          <PlatformPolyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="#007AFF"
          />
        )}
        {routeCities.map((city, index) => (
          <PlatformMarker
            key={`city-${index}`}
            coordinate={{ latitude: city.latitude, longitude: city.longitude }}
            title={city.name}
          />
        ))}
      </PlatformMapView>
      
      {Platform.OS !== 'web' && (
        <SearchBar
          instanceKey={searchKey}
          apiKey={googleMapsApiKey}
          hasApiKey={hasApiKey}
          topInset={insets.top}
          autocompleteRef={autocompleteRef}
          mapRef={mapRef}
          setMarkerCoordinate={setMarkerCoordinate}
          setSearchKey={setSearchKey}
          onPlaceSelected={setSelectedPlace}
        />
      )}
      
      <BottomSheet
        visible={showBottomSheet}
        title={selectedPlace?.title}
        address={selectedPlace?.address}
        bottomInset={insets.bottom}
        onClose={() => setShowBottomSheet(false)}
        onGetDirections={() => {
          if (!markerCoordinate) return;
          const start = userLocation ?? region;
          fetchRoute(start, markerCoordinate).then((points) => {
            setRouteCoords(points);
            if (points.length > 0) {
              fetchCitiesAlongRoute({ points, apiKey: googleMapsApiKey, step: 200 })
                .then(setRouteCities)
                .catch((err) => console.warn('Failed to fetch cities', err));

              mapRef.current?.fitToCoordinates(points, {
                edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
                animated: true,
              });
            }
          });
        }}
      />
    </View>
  );
}

export default App;