import { useEffect, useRef } from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, View, Text } from 'react-native';

export default function CustomMapView({ events, businessLocation }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    const locations = events
      .filter(e => e.location)
      .map(e => ({
        latitude: e.location.lat,
        longitude: e.location.lng,
        eventId: e.id,
      }));

    if (businessLocation) {
      locations.unshift({
        latitude: businessLocation.lat,
        longitude: businessLocation.lng,
        isBusiness: true,
      });
    }

    if (locations.length > 0) {
      mapRef.current.fitToCoordinates(
        locations.map(loc => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
        })),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [events, businessLocation]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 32.0853,
          longitude: 34.7818,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {businessLocation && (
          <MapView.Marker
            coordinate={{
              latitude: businessLocation.lat,
              longitude: businessLocation.lng,
            }}
            pinColor="blue"
            title="מיקום העסק"
          />
        )}
        {events
          .filter(e => e.location)
          .map(event => (
            <MapView.Marker
              key={event.id}
              coordinate={{
                latitude: event.location.lat,
                longitude: event.location.lng,
              }}
              pinColor="red"
              title={event.summary}
            />
          ))}
      </MapView>
      <View style={styles.legend}>
        {businessLocation && (
          <View style={styles.legendItem}>
            <View style={[styles.pin, styles.businessPin]} />
            <Text>מיקום העסק</Text>
          </View>
        )}
        <View style={styles.legendItem}>
          <View style={[styles.pin, styles.clientPin]} />
          <Text>לקוח</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  businessPin: {
    backgroundColor: '#4285F4',
  },
  clientPin: {
    backgroundColor: '#EA4335',
  },
});
