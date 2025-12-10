import React, { useEffect, useState } from 'react';
import { Platform, View, StyleSheet, Text, ActivityIndicator } from 'react-native';

interface MapViewProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showsUserLocation?: boolean;
  onRegionChangeComplete?: (region: any) => void;
  children?: React.ReactNode;
  ref?: any;
}

interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  onPress?: () => void;
  title?: string;
}

interface PolylineProps {
  coordinates: { latitude: number; longitude: number }[];
  strokeWidth?: number;
  strokeColor?: string;
}

// Mock components for web
const WebMapView = ({ style, children, initialRegion }: any) => (
  <View style={[styles.webContainer, style]}>
    <Text style={styles.webTitle}>🗺️ Interactive Map</Text>
    <Text style={styles.webSubtitle}>
      Latitude: {initialRegion?.latitude.toFixed(4) || '51.0641'}°
    </Text>
    <Text style={styles.webSubtitle}>
      Longitude: {initialRegion?.longitude.toFixed(4) || '-114.0885'}°
    </Text>
    {children}
  </View>
);

const WebMarker = ({ coordinate, title, onPress }: any) => (
  <View style={[styles.marker]}>
    <Text style={styles.markerPin}>📍</Text>
    {title && <Text style={styles.markerTitle}>{title}</Text>}
  </View>
);

const WebPolyline = () => null;

export default function PlatformMapView(props: MapViewProps) {
  const [MapComponent, setMapComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setMapComponent(() => WebMapView);
      setLoading(false);
    } else {
      import('react-native-maps').then(module => {
        setMapComponent(() => module.default);
        setLoading(false);
      }).catch(() => {
        setMapComponent(() => WebMapView);
        setLoading(false);
      });
    }
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, props.style]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!MapComponent) return null;
  
  return <MapComponent {...props} />;
}

export function PlatformMarker(props: MarkerProps) {
  const [MarkerComponent, setMarkerComponent] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setMarkerComponent(() => WebMarker);
    } else {
      import('react-native-maps').then(module => {
        setMarkerComponent(() => module.Marker);
      }).catch(() => {
        setMarkerComponent(() => WebMarker);
      });
    }
  }, []);

  if (!MarkerComponent) return null;
  return <MarkerComponent {...props} />;
}

export function PlatformPolyline(props: PolylineProps) {
  const [PolylineComponent, setPolylineComponent] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setPolylineComponent(() => WebPolyline);
    } else {
      import('react-native-maps').then(module => {
        setPolylineComponent(() => module.Polyline);
      }).catch(() => {
        setPolylineComponent(() => WebPolyline);
      });
    }
  }, []);

  if (!PolylineComponent) return null;
  return <PolylineComponent {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderRadius: 8,
  },
  webTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 10,
  },
  webSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  marker: {
    alignItems: 'center',
  },
  markerPin: {
    fontSize: 30,
  },
  markerTitle: {
    fontSize: 12,
    color: '#333',
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 4,
    marginTop: 4,
  },
});