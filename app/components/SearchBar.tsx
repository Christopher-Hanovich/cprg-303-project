import React from "react";
import { StyleSheet } from "react-native";
import { GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView from "react-native-maps";

export type SearchBarProps = {
  apiKey: string;
  hasApiKey: boolean;
  topInset: number;
  onPlaceSelected: (place: {
    latitude: number;
    longitude: number;
    title: string;
    address: string;
    placeId: string;
  }) => void;
  autocompleteRef?: React.RefObject<any>;
  instanceKey?: number;
  mapRef: React.RefObject<MapView>;
  setMarkerCoordinate: (coord: { latitude: number; longitude: number }) => void;
  setSearchKey: React.Dispatch<React.SetStateAction<number>>;
};

export default function SearchBar({ 
  apiKey, 
  hasApiKey, 
  topInset, 
  onPlaceSelected, 
  autocompleteRef, 
  instanceKey,
  mapRef,
  setMarkerCoordinate,
  setSearchKey
}: SearchBarProps) {
  
  const handlePlaceSelect = async (data: GooglePlaceData, detail: GooglePlaceDetail | null) => {
    console.log('Place selected:', data, detail);

    if (detail?.geometry?.location) {
      const placeData = {
        latitude: detail.geometry.location.lat,
        longitude: detail.geometry.location.lng,
        title: data.structured_formatting.main_text,
        address: data.structured_formatting.secondary_text,
        placeId: data.place_id,
      };
      
      onPlaceSelected(placeData);
      
      const { lat, lng } = detail.geometry.location;
      console.log('Updating map to:', lat, lng);
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      console.log('Animating to region:', newRegion);

      mapRef.current?.animateToRegion(newRegion, 1000);
      setMarkerCoordinate({ latitude: lat, longitude: lng });
      
      // Hide autocomplete dropdown after selection
      setTimeout(() => {
        autocompleteRef?.current?.setAddressText('');
        autocompleteRef?.current?.clear?.();
        autocompleteRef?.current?.blur?.();
        setSearchKey((k) => k + 1);
      }, 50);
      
    } else {
      console.warn('No geometry/location found in place details');
    }
  };
  
  return (
    <GooglePlacesAutocomplete
      key={instanceKey}
      ref={autocompleteRef}
      placeholder={hasApiKey ? "Search for a place" : "Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"}
      onPress={(data, details = null) => {
        handlePlaceSelect(data, details);
        autocompleteRef?.current.clear();
      }}
      query={{ key: apiKey, language: "en" }}
      fetchDetails
      enablePoweredByContainer={false}
      debounce={250}
      keepResultsAfterBlur={false}
      enableHighAccuracyLocation={false}
      onFail={(error) => console.warn("Places search failed", error)}
      styles={{
        container: [styles.container, { top: topInset }],
        textInputContainer: styles.textInputContainer,
        textInput: styles.textInput,
        listView: styles.listView,
      }}
      textInputProps={{ editable: hasApiKey }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "90%",
    alignSelf: "center",
    borderRadius: 8,
  },
  textInputContainer: {
    backgroundColor: "white",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRadius: 8,
  },
  textInput: {
    height: 44,
    color: "#5d5d5d",
    fontSize: 16,
  },
  listView: {
    backgroundColor: "white",
  },
  
});

