# Mechanics Firebase Collection Documentation

## Overview
The `mechanics` collection in Firestore stores all mechanic profiles and their real-time status information for the Grease Monkey mechanics app.

## Collection: `mechanics`

### Document ID
- **Format**: `{mechanic_uid}` (Firebase Auth UID)
- **Example**: `abc123def456ghi789`

### Document Structure

```typescript
interface MechanicDocument {
  // Basic Profile Information
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  
  // Address Information
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  
  // Personal Information
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  ethnicity: string;
  dateOfBirth: string; // ISO date string
  
  // Professional Information
  yearsOfExperience: number;
  certifications: string[];
  businessName: string;
  businessLicense: string;
  insuranceNumber: string;
  
  // Vehicle Information
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  
  // Real-time Status (Updated frequently)
  isOnline: boolean;
  isAvailable: boolean;
  lastOnlineUpdate: number; // Timestamp
  
  // Location Information (Updated every 5 minutes)
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  };
  lastLocationUpdate: number; // Timestamp
  
  // Performance Metrics
  rating: number; // Average rating (0-5)
  totalJobs: number;
  totalEarnings: number;
  completedJobs: number;
  
  // Account Status
  isVerified: boolean;
  isActive: boolean;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
  
  // Service Areas & Specializations
  serviceAreas: string[]; // Array of service area names
  specializations: string[]; // Array of service types
  
  // Payment Information
  paymentMethods?: {
    bankAccount?: {
      accountNumber: string;
      accountType: string;
      bankName: string;
    };
    paypal?: {
      email: string;
    };
  };
  
  // Settings & Preferences
  preferences: {
    notificationsEnabled: boolean;
    locationSharingEnabled: boolean;
    maxDistance: number; // Maximum distance willing to travel (km)
    hourlyRate: number; // Base hourly rate in ZAR
  };
}
```

## Real-time Status Fields

### Online/Availability Status
```typescript
{
  isOnline: boolean,        // Whether mechanic is currently online
  isAvailable: boolean,     // Whether mechanic is available for jobs
  lastOnlineUpdate: number  // Timestamp of last status update
}
```

### Location Tracking
```typescript
{
  location: {
    latitude: number,    // GPS latitude
    longitude: number,   // GPS longitude
    accuracy: number,    // GPS accuracy in meters
    timestamp: number    // When location was captured
  },
  lastLocationUpdate: number // Timestamp of last location update
}
```

## Data Update Patterns

### Frequent Updates (Every 5 minutes)
- `location` - GPS coordinates
- `lastLocationUpdate` - Timestamp

### Status Updates (Real-time)
- `isOnline` - When mechanic toggles online/offline
- `isAvailable` - When mechanic changes availability
- `lastOnlineUpdate` - Timestamp of status change

### Profile Updates (Occasional)
- All profile fields when mechanic updates their information
- `updatedAt` - Timestamp of last profile update

## Query Examples

### Get All Online Mechanics
```javascript
const onlineMechanics = await getDocs(
  query(
    collection(db, 'mechanics'),
    where('isOnline', '==', true),
    where('isAvailable', '==', true)
  )
);
```

### Get Mechanics Near Location
```javascript
const nearbyMechanics = await getDocs(
  query(
    collection(db, 'mechanics'),
    where('isOnline', '==', true),
    where('location.latitude', '>=', minLat),
    where('location.latitude', '<=', maxLat),
    where('location.longitude', '>=', minLng),
    where('location.longitude', '<=', maxLng)
  )
);
```

### Get Top Rated Mechanics
```javascript
const topMechanics = await getDocs(
  query(
    collection(db, 'mechanics'),
    where('isActive', '==', true),
    orderBy('rating', 'desc'),
    limit(10)
  )
);
```

## Security Rules

### Read Access
- Clients can read basic profile info and status of online mechanics
- Mechanics can read their own full profile
- Admin can read all mechanic profiles

### Write Access
- Mechanics can update their own profile and status
- Only the mechanic can update their location
- Admin can update verification status

## Client App Integration

### Finding Nearby Mechanics
1. Get client's current location
2. Query mechanics collection with location constraints
3. Filter by `isOnline: true` and `isAvailable: true`
4. Sort by distance and rating

### Real-time Updates
```javascript
// Listen to mechanic status changes
const unsubscribe = onSnapshot(
  doc(db, 'mechanics', mechanicId),
  (doc) => {
    const mechanic = doc.data();
    // Update UI with new status/location
  }
);
```

### Job Assignment
1. Find available mechanics in area
2. Send job request to selected mechanics
3. Update mechanic's `isAvailable` status when job accepted
4. Track job completion and update performance metrics

## Performance Considerations

### Indexes Required
- `isOnline` (ascending)
- `isAvailable` (ascending)
- `location.latitude` (ascending)
- `location.longitude` (ascending)
- `rating` (descending)
- `isActive` (ascending)

### Data Size
- Average document size: ~2-3KB
- Location updates: ~100 bytes per update
- Status updates: ~50 bytes per update

### Update Frequency
- Location: Every 5 minutes per online mechanic
- Status: On demand (online/offline toggle)
- Profile: Occasional (when mechanic updates info)

## Error Handling

### Common Issues
- Missing location data for offline mechanics
- Stale location data (older than 10 minutes)
- Inconsistent online/available status
- Missing required profile fields

### Validation
- Ensure all required fields are present
- Validate location data accuracy
- Check timestamp freshness
- Verify mechanic is active and verified

## Migration Notes

### Version 1.0
- Basic profile structure
- Real-time status tracking
- Location updates every 5 minutes

### Future Enhancements
- Service area polygons
- Advanced scheduling
- Multi-language support
- Enhanced verification system
