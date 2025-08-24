# Creating a Service Request

This document explains how service requests are created and structured for the Grease Monkey app, including the data format that the mechanics app needs to handle.

## Overview

When a customer requests a mechanic's service, the system creates request documents in two places:
1. **Main requests collection** - For general tracking and history
2. **Mechanic's requests subcollection** - For the mechanics app to pick up and handle

## Request Creation Flow

```
Customer selects service → Chooses mechanic → Creates request → Mechanic receives notification
```

### 1. Customer Flow
1. Customer selects a service type (e.g., "battery", "oil-change")
2. System searches for nearby mechanics
3. Customer selects a mechanic from the list
4. System creates request in both collections
5. Customer is taken to request session screen with pinging animation

### 2. Mechanic Flow (Mechanics App)
1. Mechanic app listens to their requests subcollection
2. New request appears in real-time
3. Mechanic can accept/decline the request
4. Customer receives real-time status updates

## Data Structure

### Service Request Interface

```typescript
interface ServiceRequest {
  id: string;                    // Auto-generated Firestore ID
  requestId: string;             // Custom request ID (UUID)
  
  // Customer Information
  customerId: string;            // Customer's Firebase UID
  customerName: string;          // "John Doe"
  customerPhone: string;         // "+1234567890"
  
  // Mechanic Information
  mechanicId: string;            // Mechanic's Firebase UID
  mechanicName: string;          // "Jane Smith"
  
  // Service Details
  serviceType: string;           // "battery", "oil-change", "tire-repair", etc.
  description?: string;          // Optional service description
  address?: string;              // Optional address (if provided)
  
  // Location
  location: {
    latitude: number;            // Customer's latitude
    longitude: number;           // Customer's longitude
    accuracy: number;            // GPS accuracy in meters
  };
  
  // Status and Timestamps
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  createdAt: Timestamp;          // When request was created
  updatedAt: Timestamp;          // Last status update
}
```

## Collections Structure

### 1. Main Requests Collection
**Path:** `requests/{documentId}`

```javascript
// Example document in main requests collection
{
  "requestId": "req_abc123def456",
  "customerId": "user_123",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "mechanicId": "mechanic_456",
  "mechanicName": "Jane Smith",
  "serviceType": "battery",
  "description": "Battery service requested",
  "location": {
    "latitude": -26.2041,
    "longitude": 28.0473,
    "accuracy": 100
  },
  "status": "pending",
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

### 2. Mechanic's Requests Subcollection
**Path:** `mechanics/{mechanicId}/requests/{documentId}`

```javascript
// Example document in mechanic's requests subcollection
{
  "requestId": "req_abc123def456",
  "customerId": "user_123",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "mechanicId": "mechanic_456",
  "mechanicName": "Jane Smith",
  "serviceType": "battery",
  "description": "Battery service requested",
  "location": {
    "latitude": -26.2041,
    "longitude": 28.0473,
    "accuracy": 100
  },
  "status": "pending",
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

## Service Types

The system supports these service types:

- `battery` - Battery replacement/charging
- `oil-change` - Oil change service
- `tire-repair` - Tire repair/replacement
- `brake-service` - Brake system service
- `engine-diagnostic` - Engine diagnostics
- `ac-service` - Air conditioning service
- `electrical` - Electrical system repair
- `general` - General maintenance

## Status Flow

```
pending → accepted/declined → completed (if accepted)
     ↓
  cancelled (at any time)
```

### Status Meanings
- **pending**: Request created, waiting for mechanic response
- **accepted**: Mechanic accepted the request
- **declined**: Mechanic declined the request
- **completed**: Service has been completed
- **cancelled**: Request was cancelled (by customer or system)

## Implementation for Mechanics App

### 1. Listen to Incoming Requests

```typescript
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const mechanicId = 'current_mechanic_id';

// Listen to mechanic's requests subcollection
const requestsRef = collection(db, 'mechanics', mechanicId, 'requests');
const requestsQuery = query(
  requestsRef,
  where('status', '==', 'pending'),
  orderBy('createdAt', 'desc')
);

const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      const request = { id: change.doc.id, ...change.doc.data() };
      console.log('New request received:', request);
      // Show notification to mechanic
      showRequestNotification(request);
    }
  });
});
```

### 2. Update Request Status

```typescript
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

async function updateRequestStatus(requestId: string, newStatus: string) {
  try {
    // Update in mechanic's subcollection
    const mechanicRequestRef = doc(db, 'mechanics', mechanicId, 'requests', requestId);
    await updateDoc(mechanicRequestRef, {
      status: newStatus,
      updatedAt: Timestamp.now()
    });

    // Update in main requests collection
    const mainRequestRef = doc(db, 'requests', requestId);
    await updateDoc(mainRequestRef, {
      status: newStatus,
      updatedAt: Timestamp.now()
    });

    console.log(`Request ${requestId} status updated to: ${newStatus}`);
  } catch (error) {
    console.error('Error updating request status:', error);
  }
}

// Usage examples
await updateRequestStatus('req_abc123', 'accepted');
await updateRequestStatus('req_abc123', 'declined');
await updateRequestStatus('req_abc123', 'completed');
```

### 3. Get Request Details

```typescript
import { doc, getDoc } from 'firebase/firestore';

async function getRequestDetails(requestId: string) {
  try {
    const requestRef = doc(db, 'requests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (requestSnap.exists()) {
      const request = { id: requestSnap.id, ...requestSnap.data() };
      return request;
    } else {
      console.log('Request not found');
      return null;
    }
  } catch (error) {
    console.error('Error getting request details:', error);
    return null;
  }
}
```

## Real-time Updates

### Customer Side (Request Session Screen)
The customer's request session screen listens for status changes:

```typescript
// Listen to request status changes
const requestRef = doc(db, 'requests', requestId);
const unsubscribe = onSnapshot(requestRef, (doc) => {
  if (doc.exists()) {
    const request = doc.data();
    const status = request.status;
    
    switch (status) {
      case 'accepted':
        // Show accepted UI
        break;
      case 'declined':
        // Show declined UI
        break;
      case 'completed':
        // Show completed UI
        break;
    }
  }
});
```

## Error Handling

### Common Issues
1. **Undefined values**: The system filters out undefined values before saving
2. **Network errors**: Implement retry logic for failed requests
3. **Invalid status**: Only allow valid status transitions

### Validation
- Ensure all required fields are present
- Validate location coordinates
- Check that mechanic exists and is online
- Verify customer has valid profile

## Security Rules

### Firestore Security Rules Example

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Main requests collection
    match /requests/{requestId} {
      allow read, write: if request.auth != null;
    }
    
    // Mechanic requests subcollection
    match /mechanics/{mechanicId}/requests/{requestId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == mechanicId || 
         resource.data.customerId == request.auth.uid);
    }
  }
}
```

## Testing

### Test Data
You can create test requests manually in Firestore:

```javascript
// Test request data
const testRequest = {
  requestId: "test_req_001",
  customerId: "test_user_123",
  customerName: "Test Customer",
  customerPhone: "+1234567890",
  mechanicId: "test_mechanic_456",
  mechanicName: "Test Mechanic",
  serviceType: "battery",
  description: "Test battery service",
  location: {
    latitude: -26.2041,
    longitude: 28.0473,
    accuracy: 100
  },
  status: "pending",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
};
```

This documentation provides everything needed to implement request handling in the mechanics app, including data structure, real-time listening, status updates, and error handling.
