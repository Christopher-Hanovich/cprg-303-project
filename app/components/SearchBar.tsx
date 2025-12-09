import React from "react";
import { StyleSheet } from "react-native";
import { GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export type SearchBarProps = {
  apiKey: string;
  hasApiKey: boolean;
  topInset: number;
  onPlaceSelect: (data: GooglePlaceData, detail: GooglePlaceDetail | null) => void;
  autocompleteRef?: React.RefObject<any>;
};

export default function SearchBar({ apiKey, hasApiKey, topInset, onPlaceSelect, autocompleteRef }: SearchBarProps) {
  return (
    <GooglePlacesAutocomplete
      ref={autocompleteRef}
      placeholder={hasApiKey ? "Search for a place" : "Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"}
      onPress={(data, details = null) => onPlaceSelect(data, details)}
      query={{ key: apiKey, language: "en" }}
      fetchDetails
      enablePoweredByContainer={false}
      debounce={250}
      onFail={(error) => console.warn("Places search failed", error)}
      styles={{
        container: [styles.container, { top: topInset }],
        textInputContainer: styles.textInputContainer,
        textInput: styles.textInput,
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
});

