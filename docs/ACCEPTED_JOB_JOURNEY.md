# Accepted Job Journey - Firebase Structure & Data Flow

This document outlines the complete Firebase structure and data flow for a mechanic's job journey, from accepting a request to completing the service.

## Overview

When a mechanic accepts a service request, the system manages data across multiple Firebase collections to track the job status, enable messaging, handle quotes, and manage the completion process.

## Job Journey Flow

```
Request Received → Accept Job → Active Job → Quote Client → Complete Job → Success
     ↓              ↓           ↓           ↓            ↓
  Messaging    Location    Navigation   Billing     Job History
```

## Firebase Collections Structure

### 1. Main Requests Collection
**Path:** `requests/{documentId}`

**Purpose:** Central repository for all service requests, used by both client and mechanic apps.

```javascript
{
  "requestId": "req_1756050741515_kwn9o3xkb",  // Custom request ID
  "customerId": "OqUE2fNH7MbCprQl25a5K4XDuYm1",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "mechanicId": "bhVVv4leUrWPqEhxQBFsVynICt92",
  "mechanicName": "Tinashe Matanda",
  "serviceType": "oil-change",
  "description": "Oil Change service requested",
  "address": "123 Main St, Johannesburg",
  "location": {
    "latitude": -26.2041,
    "longitude": 28.0473,
    "accuracy": 100
  },
  "status": "pending" | "accepted" | "declined" | "quoted" | "completed" | "cancelled",
  "quoteAmount": 2000,                    // Added when quote is submitted
  "quoteDescription": "Full oil change service", // Added when quote is submitted
  "quotedAt": Timestamp,                  // Added when quote is submitted
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

### 2. Mechanic's Requests Subcollection
**Path:** `mechanics/{mechanicId}/requests/{documentId}`

**Purpose:** Mechanic-specific view of requests, used by the mechanics app for real-time updates.

```javascript
{
  "requestId": "req_1756050741515_kwn9o3xkb",  // References main request
  "customerId": "OqUE2fNH7MbCprQl25a5K4XDuYm1",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "mechanicId": "bhVVv4leUrWPqEhxQBFsVynICt92",
  "mechanicName": "Tinashe Matanda",
  "serviceType": "oil-change",
  "description": "Oil Change service requested",
  "address": "123 Main St, Johannesburg",
  "location": {
    "latitude": -26.2041,
    "longitude": 28.0473,
    "accuracy": 100
  },
  "status": "pending" | "accepted" | "declined" | "quoted" | "completed" | "cancelled",
  "quoteAmount": 2000,                    // Added when quote is submitted
  "quoteDescription": "Full oil change service", // Added when quote is submitted
  "quotedAt": Timestamp,                  // Added when quote is submitted
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

### 3. Chat Sessions Collection
**Path:** `chatSessions/{sessionId}`

**Purpose:** Manages real-time messaging between mechanic and customer.

```javascript
{
  "sessionId": "qK5a2KD5wS3P5iuMRgnb",           // Auto-generated
  "requestId": "req_1756050741515_kwn9o3xkb",    // Links to the service request
  "customerId": "OqUE2fNH7MbCprQl25a5K4XDuYm1",
  "mechanicId": "bhVVv4leUrWPqEhxQBFsVynICt92",
  "customerName": "John Doe",
  "mechanicName": "Tinashe Matanda",
  "lastMessage": "I'm on my way to your location", // Last message content
  "lastMessageTime": Timestamp,                    // When last message was sent
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

### 4. Chat Messages Subcollection
**Path:** `chatSessions/{sessionId}/messages/{messageId}`

**Purpose:** Individual messages within a chat session.

```javascript
{
  "messageId": "msg_abc123",                      // Auto-generated
  "senderId": "bhVVv4leUrWPqEhxQBFsVynICt92",    // Mechanic or customer ID
  "senderType": "mechanic" | "customer",          // Who sent the message
  "senderName": "Tinashe Matanda",                // Display name
  "content": "I'm on my way to your location",    // Message content
  "read": false,                                  // Whether message has been read
  "timestamp": Timestamp
}
```

### 5. Mechanics Collection
**Path:** `mechanics/{mechanicId}`

**Purpose:** Mechanic profile and current status information.

```javascript
{
  "mechanicId": "bhVVv4leUrWPqEhxQBFsVynICt92",
  "name": "Tinashe Matanda",
  "email": "tinashe@example.com",
  "phone": "+1234567890",
  "address": "456 Mechanic St, Johannesburg",
  "gender": "male",
  "ethnicity": "African",
  "yearsExperience": 5,
  "certifications": ["ASE Certified", "BMW Certified"],
  "businessName": "Tinashe's Auto Repair",
  "license": "MECH123456",
  "insurance": "INS789012",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Hilux",
    "year": 2020,
    "color": "White"
  },
  "isOnline": true,                               // Current online status
  "currentLocation": {                            // Real-time location
    "latitude": -26.2041,
    "longitude": 28.0473,
    "accuracy": 100,
    "updatedAt": Timestamp
  },
  "lastActive": Timestamp,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

## Job Journey Stages & Data Updates

### Stage 1: Request Acceptance

**Trigger:** Mechanic clicks "Accept" on incoming request notification

**Firebase Updates:**
1. **Mechanic's Requests Subcollection:**
   ```javascript
   // Update status to 'accepted'
   await updateDoc(mechanicRequestRef, {
     status: 'accepted',
     updatedAt: Timestamp.now()
   });
   ```

2. **Main Requests Collection:**
   ```javascript
   // Update status to 'accepted' (if document exists)
   await updateDoc(mainRequestRef, {
     status: 'accepted',
     updatedAt: Timestamp.now()
   });
   ```

3. **Mechanics Collection:**
   ```javascript
   // Set mechanic to offline/inactive
   await updateDoc(mechanicRef, {
     isOnline: false,
     updatedAt: Timestamp.now()
   });
   ```

### Stage 2: Active Job Management

**Features:** Location tracking, navigation, customer communication

**Firebase Updates:**
1. **Mechanics Collection (Location Updates):**
   ```javascript
   // Update location every 5 minutes
   await updateDoc(mechanicRef, {
     currentLocation: {
       latitude: newLat,
       longitude: newLng,
       accuracy: accuracy,
       updatedAt: Timestamp.now()
     },
     lastActive: Timestamp.now()
   });
   ```

### Stage 3: Quote Submission

**Trigger:** Mechanic clicks "Quote Client" and submits amount/description

**Firebase Updates:**
1. **Mechanic's Requests Subcollection:**
   ```javascript
   // Add quote details
   await updateDoc(mechanicRequestRef, {
     quoteAmount: 2000,
     quoteDescription: "Full oil change service",
     quotedAt: Timestamp.now()
   });
   ```

2. **Main Requests Collection:**
   ```javascript
   // Add quote details (if document exists)
   await updateDoc(mainRequestRef, {
     quoteAmount: 2000,
     quoteDescription: "Full oil change service",
     quotedAt: Timestamp.now()
   });
   ```

3. **Update Status to 'quoted':**
   ```javascript
   // Both collections updated to 'quoted' status
   await updateRequestStatus(requestId, mechanicId, 'quoted');
   ```

### Stage 4: Messaging System

**Trigger:** Mechanic clicks "Message Client" button

**Firebase Operations:**
1. **Create/Find Chat Session:**
   ```javascript
   // Check if chat session exists for this request
   const existingSession = await findChatSessionByRequestId(requestId);
   
   if (existingSession) {
     sessionId = existingSession.id;
   } else {
     // Create new chat session
     const sessionRef = await addDoc(chatSessionsRef, {
       requestId: requestId,
       customerId: customerId,
       mechanicId: mechanicId,
       customerName: customerName,
       mechanicName: mechanicName,
       createdAt: Timestamp.now()
     });
     sessionId = sessionRef.id;
   }
   ```

2. **Send Message:**
   ```javascript
   // Add message to chat session
   await addDoc(messagesRef, {
     senderId: mechanicId,
     senderType: 'mechanic',
     senderName: mechanicName,
     content: messageContent,
     read: false,
     timestamp: Timestamp.now()
   });
   
   // Update chat session
   await updateDoc(sessionRef, {
     lastMessage: messageContent,
     lastMessageTime: Timestamp.now(),
     updatedAt: Timestamp.now()
   });
   ```

3. **Listen for Messages:**
   ```javascript
   // Real-time listener for new messages
   const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
     snapshot.docChanges().forEach((change) => {
       if (change.type === 'added') {
         const message = { id: change.doc.id, ...change.doc.data() };
         // Handle new message
       }
     });
   });
   ```

### Stage 5: Job Completion

**Trigger:** Mechanic clicks "Complete Job" after quote is submitted

**Firebase Updates:**
1. **Mechanic's Requests Subcollection:**
   ```javascript
   // Update status to 'completed'
   await updateDoc(mechanicRequestRef, {
     status: 'completed',
     updatedAt: Timestamp.now()
   });
   ```

2. **Main Requests Collection:**
   ```javascript
   // Update status to 'completed' (if document exists)
   await updateDoc(mainRequestRef, {
     status: 'completed',
     updatedAt: Timestamp.now()
   });
   ```

3. **Mechanics Collection:**
   ```javascript
   // Set mechanic back to online
   await updateDoc(mechanicRef, {
     isOnline: true,
     updatedAt: Timestamp.now()
   });
   ```

## Status Flow Throughout Journey

```
pending → accepted → quoted → completed
   ↓         ↓         ↓
declined  messaging  billing
```

### Status Meanings:
- **pending**: Request created, waiting for mechanic response
- **accepted**: Mechanic accepted, job is active
- **quoted**: Quote submitted, ready for completion
- **completed**: Service finished successfully
- **declined**: Mechanic declined the request

## Real-time Listeners

### 1. Request Status Updates
```javascript
// Listen to mechanic's requests for status changes
const requestsRef = collection(firestore, 'mechanics', mechanicId, 'requests');
const unsubscribe = onSnapshot(requestsRef, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const request = { id: change.doc.id, ...change.doc.data() };
    // Handle status updates
  });
});
```

### 2. Messaging Updates
```javascript
// Listen to chat messages
const messagesRef = collection(firestore, 'chatSessions', sessionId, 'messages');
const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      const message = { id: change.doc.id, ...change.doc.data() };
      // Handle new message
    }
  });
});
```

### 3. Location Updates
```javascript
// Update location every 5 minutes when online
setInterval(async () => {
  if (isOnline) {
    const location = await getCurrentPositionAsync();
    await updateLocationInFirebase(location);
  }
}, 5 * 60 * 1000); // 5 minutes
```

## Error Handling

### 1. Main Request Not Found
- **Scenario:** Main `requests` collection document doesn't exist
- **Solution:** Continue with mechanic's subcollection update only
- **Implementation:** Try-catch around main request updates

### 2. Chat Session Issues
- **Scenario:** Chat session creation fails
- **Solution:** Retry with exponential backoff
- **Implementation:** Error handling in messaging service

### 3. Location Update Failures
- **Scenario:** Location permission denied or GPS unavailable
- **Solution:** Use last known location or default coordinates
- **Implementation:** Fallback in location service

## Security Rules Considerations

### 1. Mechanic Access Control
```javascript
// Only mechanics can access their own requests
match /mechanics/{mechanicId}/requests/{requestId} {
  allow read, write: if request.auth.uid == mechanicId;
}
```

### 2. Chat Session Security
```javascript
// Only participants can access chat sessions
match /chatSessions/{sessionId} {
  allow read, write: if request.auth.uid in resource.data.customerId || 
                           request.auth.uid in resource.data.mechanicId;
}
```

### 3. Message Security
```javascript
// Only session participants can send messages
match /chatSessions/{sessionId}/messages/{messageId} {
  allow read, write: if request.auth.uid in get(/databases/$(database.name)/documents/chatSessions/$(sessionId)).data.customerId || 
                           request.auth.uid in get(/databases/$(database.name)/documents/chatSessions/$(sessionId)).data.mechanicId;
}
```

## Performance Considerations

### 1. Indexing
- Create composite indexes for queries with multiple `where` clauses
- Index on `status` and `createdAt` for request filtering
- Index on `timestamp` for message ordering

### 2. Data Optimization
- Use `onSnapshot` sparingly, unsubscribe when components unmount
- Implement pagination for message history
- Cache frequently accessed data locally

### 3. Real-time Updates
- Use `docChanges()` to handle only new/updated documents
- Implement debouncing for location updates
- Use `merge: true` for partial updates

This documentation provides a complete overview of the Firebase structure and data flow throughout the mechanic's job journey, ensuring proper implementation and maintenance of the system.
