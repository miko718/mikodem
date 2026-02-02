import { StyleSheet, View, Text, ScrollView, Linking, TouchableOpacity } from 'react-native';

export default function CustomMapView({ events, businessLocation }) {
  const locations = events.filter(e => e.location);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mapContent}>
        <Text style={styles.title}>מיקומים</Text>
        
        {businessLocation && (
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View style={[styles.pin, styles.businessPin]} />
              <Text style={styles.locationTitle}>מיקום העסק</Text>
            </View>
            <Text style={styles.coordinates}>
              {businessLocation.lat.toFixed(6)}, {businessLocation.lng.toFixed(6)}
            </Text>
            <TouchableOpacity onPress={() => {
              const url = `https://www.google.com/maps?q=${businessLocation.lat},${businessLocation.lng}`;
              Linking.openURL(url);
            }}>
              <Text style={styles.link}>פתח ב-Google Maps</Text>
            </TouchableOpacity>
          </View>
        )}

        {locations.map(event => (
          <View key={event.id} style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View style={[styles.pin, styles.clientPin]} />
              <Text style={styles.locationTitle}>{event.summary}</Text>
            </View>
            <Text style={styles.coordinates}>
              {event.location.lat.toFixed(6)}, {event.location.lng.toFixed(6)}
            </Text>
            {event.distanceKm != null && (
              <Text style={styles.distance}>{event.distanceKm} ק״מ מהעסק</Text>
            )}
            <TouchableOpacity onPress={() => {
              const url = `https://www.google.com/maps?q=${event.location.lat},${event.location.lng}`;
              Linking.openURL(url);
            }}>
              <Text style={styles.link}>פתח ב-Google Maps</Text>
            </TouchableOpacity>
          </View>
        ))}

        {locations.length === 0 && !businessLocation && (
          <Text style={styles.emptyText}>אין מיקומים להצגה</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContent: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  coordinates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  distance: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '600',
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: '#4285F4',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  businessPin: {
    backgroundColor: '#4285F4',
  },
  clientPin: {
    backgroundColor: '#EA4335',
  },
});
