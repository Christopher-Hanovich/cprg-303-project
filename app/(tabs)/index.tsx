import Polyline from '@mapbox/polyline';
import * as location from 'expo-location';
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Polyline as MapPolyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from "../components/BottomSheet";
import SearchBar from "../components/SearchBar";
import { useRoute } from "../contexts/RouteContext";
import { fetchCitiesAlongRoute } from "../utilities/placesAlongRoute";

// Use a public runtime env var. Define EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your env.
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const hasApiKey = Boolean(googleMapsApiKey);

// Default region (SAIT, Calgary, Canada) in case user does not allow location access

const defaultRegion = {
  latitude: 51.0641,
  longitude: -114.0885,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};



const App = () => {
  const insets = useSafeAreaInsets();
  const { setRouteCities, routeCities } = useRoute();
  //sets a reference to the map view
  const mapRef = React.useRef<MapView>(null);
  const autocompleteRef = React.useRef<any>(null);
  //state to hold region and marker coordinate
  const [region, setRegion] = useState(defaultRegion);
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchKey, setSearchKey] = useState(0);
  
  //request location permission and get user location on mount
  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let lastKnownLocation = await location.getLastKnownPositionAsync({});
      if (lastKnownLocation) {
        console.log('User location:', lastKnownLocation);
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

  //function to fetch route between two points
  const fetchRoute = async (start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }) => {
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
    <View
      style={styles.container}
    >
      <MapView
        ref={mapRef}
        style={styles.maps}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        onRegionChangeComplete={setRegion}
      >
        {markerCoordinate && (
          <Marker
            coordinate={markerCoordinate}
            onPress={() => setShowBottomSheet(true)}
          />
        )}
        {routeCoords.length > 0 && (
          <MapPolyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="#007AFF"
          />
        )}
        {routeCities.map((city, index) => (
          <Marker
            key={`city-${index}`}
            coordinate={{ latitude: city.latitude, longitude: city.longitude }}
            title={city.name}
          />
        ))}
      </MapView>
      <SearchBar
        instanceKey={searchKey}
        apiKey={googleMapsApiKey}
        hasApiKey={hasApiKey}
        topInset={insets.top}
        autocompleteRef={autocompleteRef}
        mapRef={mapRef as React.RefObject<MapView>}
        setMarkerCoordinate={setMarkerCoordinate}
        setSearchKey={setSearchKey}
        onPlaceSelected={setSelectedPlace}
      />
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



