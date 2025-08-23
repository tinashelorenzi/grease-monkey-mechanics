import * as Location from 'expo-location';
import { doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface MechanicStatus {
  isOnline: boolean;
  location: LocationData | null;
  lastUpdated: number;
  isAvailable: boolean;
}

class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null;
  private firebaseSubscription: (() => void) | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  // Request location permissions
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: Date.now(),
      };

      // Cache location data
      await this.cacheLocationData(locationData);

      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Start location tracking
  async startLocationTracking(mechanicId: string): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      // Start watching location
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 300000, // 5 minutes
          distanceInterval: 100, // 100 meters
        },
        async (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: Date.now(),
          };

          // Update Firebase
          await this.updateLocationInFirebase(mechanicId, locationData);
          
          // Cache location data
          await this.cacheLocationData(locationData);
        }
      );

      // Set up periodic updates to Firebase (every 5 minutes)
      this.updateInterval = setInterval(async () => {
        const location = await this.getCurrentLocation();
        if (location) {
          await this.updateLocationInFirebase(mechanicId, location);
        }
      }, 300000); // 5 minutes

    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  }

  // Stop location tracking
  stopLocationTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.firebaseSubscription) {
      this.firebaseSubscription();
      this.firebaseSubscription = null;
    }
  }

  // Update location in Firebase
  async updateLocationInFirebase(mechanicId: string, locationData: LocationData): Promise<void> {
    try {
      const mechanicRef = doc(firestore, 'mechanics', mechanicId);
      await updateDoc(mechanicRef, {
        location: locationData,
        lastLocationUpdate: Date.now(),
      });
    } catch (error) {
      console.error('Error updating location in Firebase:', error);
    }
  }

  // Update online status in Firebase
  async updateOnlineStatus(mechanicId: string, isOnline: boolean): Promise<void> {
    try {
      const mechanicRef = doc(firestore, 'mechanics', mechanicId);
      
      if (isOnline) {
        // Get current location when going online
        const locationData = await this.getCurrentLocation();
        
        await updateDoc(mechanicRef, {
          isOnline: true,
          isAvailable: true,
          lastOnlineUpdate: Date.now(),
          location: locationData,
          lastLocationUpdate: Date.now(),
        });
      } else {
        await updateDoc(mechanicRef, {
          isOnline: false,
          isAvailable: false,
          lastOnlineUpdate: Date.now(),
        });
      }

      // Cache online status
      await this.cacheOnlineStatus(isOnline);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  // Listen to mechanic status changes
  listenToMechanicStatus(mechanicId: string, callback: (status: MechanicStatus) => void): () => void {
    const mechanicRef = doc(firestore, 'mechanics', mechanicId);
    
    this.firebaseSubscription = onSnapshot(mechanicRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const status: MechanicStatus = {
          isOnline: data.isOnline || false,
          location: data.location || null,
          lastUpdated: data.lastOnlineUpdate || Date.now(),
          isAvailable: data.isAvailable || false,
        };
        callback(status);
      }
    });

    return () => {
      if (this.firebaseSubscription) {
        this.firebaseSubscription();
        this.firebaseSubscription = null;
      }
    };
  }

  // Cache location data
  private async cacheLocationData(locationData: LocationData): Promise<void> {
    try {
      await AsyncStorage.setItem('cachedLocation', JSON.stringify(locationData));
    } catch (error) {
      console.error('Error caching location data:', error);
    }
  }

  // Get cached location data
  async getCachedLocationData(): Promise<LocationData | null> {
    try {
      const cached = await AsyncStorage.getItem('cachedLocation');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached location data:', error);
      return null;
    }
  }

  // Cache online status
  private async cacheOnlineStatus(isOnline: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('cachedOnlineStatus', JSON.stringify(isOnline));
    } catch (error) {
      console.error('Error caching online status:', error);
    }
  }

  // Get cached online status
  async getCachedOnlineStatus(): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem('cachedOnlineStatus');
      return cached ? JSON.parse(cached) : false;
    } catch (error) {
      console.error('Error getting cached online status:', error);
      return false;
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const locationService = new LocationService();
export default locationService;
