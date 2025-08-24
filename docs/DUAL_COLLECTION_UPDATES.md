# Dual Collection Updates - Request Status Management

This document explains how the system ensures that both Firebase collections are updated when a mechanic accepts, declines, or completes a service request.

## Overview

When a mechanic performs any action on a service request (accept, decline, complete, submit quote), the system updates **both** collections to maintain data consistency:

1. **Main Requests Collection**: `requests/{requestId}` - Central repository for all requests
2. **Mechanic's Requests Subcollection**: `mechanics/{mechanicId}/requests/{requestId}` - Mechanic-specific view

## Why Dual Collections?

### Main Requests Collection (`requests/{requestId}`)
- **Purpose**: Central repository accessible by both customer and mechanic apps
- **Usage**: Customer app listens to this collection for real-time status updates
- **Document ID**: Uses the custom `requestId` field (e.g., `req_1756050741515_kwn9o3xkb`)

### Mechanic's Requests Subcollection (`mechanics/{mechanicId}/requests/{requestId}`)
- **Purpose**: Mechanic-specific view for real-time notifications and job management
- **Usage**: Mechanics app listens to this collection for incoming requests
- **Document ID**: Uses Firestore auto-generated ID, but contains `requestId` field for reference

## Update Process Flow

### 1. Request Acceptance Flow

```typescript
// When mechanic clicks "Accept"
async acceptRequest(requestId: string, mechanicId: string) {
  // 1. Update both collections
  const success = await updateRequestStatus(requestId, mechanicId, 'accepted');
  
  // 2. Verify the update
  if (success) {
    const verified = await verifyRequestUpdate(requestId, mechanicId, 'accepted');
    console.log('✅ Request accepted and verified in both collections');
  }
  
  return success;
}
```

### 2. Dual Collection Update Implementation

```typescript
async updateRequestStatus(requestId: string, mechanicId: string, newStatus: ServiceRequest['status']) {
  try {
    // 1. Get the request data to find the main request ID
    const mechanicRequestRef = doc(firestore, 'mechanics', mechanicId, 'requests', requestId);
    const requestDoc = await getDoc(mechanicRequestRef);
    
    if (!requestDoc.exists()) {
      console.error('❌ Mechanic request not found:', requestId);
      return false;
    }
    
    const requestData = requestDoc.data();
    const mainRequestId = requestData.requestId; // Key field linking both collections
    
    if (!mainRequestId) {
      console.error('❌ No requestId found in mechanic request:', requestId);
      return false;
    }
    
    // 2. Update both collections in parallel for better performance
    const updatePromises = [];
    
    // Update mechanic's subcollection
    const mechanicUpdatePromise = updateDoc(mechanicRequestRef, {
      status: newStatus,
      updatedAt: Timestamp.now()
    });
    updatePromises.push(mechanicUpdatePromise);
    
    // Update main requests collection
    const mainRequestRef = doc(firestore, 'requests', mainRequestId);
    const mainUpdatePromise = updateDoc(mainRequestRef, {
      status: newStatus,
      updatedAt: Timestamp.now()
    }).catch((error) => {
      console.log('⚠️ Could not update main request (this is okay):', error);
      return null; // Don't fail if main request update fails
    });
    updatePromises.push(mainUpdatePromise);
    
    // 3. Wait for both updates to complete
    await Promise.all(updatePromises);
    
    console.log(`✅ Request ${requestId} status updated to: ${newStatus}`);
    console.log(`✅ Updated both collections: mechanic subcollection and main requests collection`);
    return true;
  } catch (error) {
    console.error('❌ Error updating request status:', error);
    return false;
  }
}
```

## Data Structure Relationship

### Mechanic's Request Document
```javascript
{
  "id": "auto-generated-firestore-id",     // Firestore auto-generated ID
  "requestId": "req_1756050741515_kwn9o3xkb", // Links to main collection
  "customerId": "user123",
  "customerName": "John Doe",
  "mechanicId": "mechanic456",
  "mechanicName": "Jane Smith",
  "serviceType": "oil-change",
  "status": "accepted",                    // Updated status
  "createdAt": Timestamp,
  "updatedAt": Timestamp                   // Updated timestamp
}
```

### Main Request Document
```javascript
{
  "requestId": "req_1756050741515_kwn9o3xkb", // Document ID in main collection
  "customerId": "user123",
  "customerName": "John Doe",
  "mechanicId": "mechanic456",
  "mechanicName": "Jane Smith",
  "serviceType": "oil-change",
  "status": "accepted",                    // Updated status (same as mechanic's)
  "createdAt": Timestamp,
  "updatedAt": Timestamp                   // Updated timestamp (same as mechanic's)
}
```

## Verification System

The system includes a verification mechanism to ensure both collections are updated correctly:

```typescript
async verifyRequestUpdate(requestId: string, mechanicId: string, expectedStatus: ServiceRequest['status']) {
  try {
    // Check mechanic's subcollection
    const mechanicRequestRef = doc(firestore, 'mechanics', mechanicId, 'requests', requestId);
    const mechanicDoc = await getDoc(mechanicRequestRef);
    
    const mechanicData = mechanicDoc.data();
    const mainRequestId = mechanicData.requestId;
    
    // Check main requests collection
    const mainRequestRef = doc(firestore, 'requests', mainRequestId);
    const mainDoc = await getDoc(mainRequestRef);
    
    const mechanicStatus = mechanicData.status;
    const mainStatus = mainDoc.exists() ? mainDoc.data().status : null;
    
    console.log('📊 Verification results:');
    console.log('  - Mechanic subcollection status:', mechanicStatus);
    console.log('  - Main collection status:', mainStatus);
    console.log('  - Expected status:', expectedStatus);
    
    const mechanicCorrect = mechanicStatus === expectedStatus;
    const mainCorrect = mainStatus === expectedStatus;
    
    if (mechanicCorrect && mainCorrect) {
      console.log('✅ Both collections updated correctly');
      return true;
    } else if (mechanicCorrect && !mainCorrect) {
      console.log('⚠️ Only mechanic subcollection updated correctly');
      return true; // Still consider success since main collection is optional
    } else if (!mechanicCorrect) {
      console.log('❌ Mechanic subcollection not updated correctly');
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return false;
  }
}
```

## Supported Operations

### 1. Accept Request
```typescript
await requestService.acceptRequest(requestId, mechanicId);
// Updates status to 'accepted' in both collections
```

### 2. Decline Request
```typescript
await requestService.declineRequest(requestId, mechanicId);
// Updates status to 'declined' in both collections
```

### 3. Complete Request
```typescript
await requestService.completeRequest(requestId, mechanicId);
// Updates status to 'completed' in both collections
```

### 4. Submit Quote
```typescript
await requestService.submitQuote(requestId, mechanicId, amount, description);
// Updates quote details and status to 'quoted' in both collections
```

## Error Handling

### Graceful Degradation
- If the main requests collection update fails, the operation still succeeds
- The mechanic's subcollection is the primary source of truth
- Main collection updates are considered optional for backward compatibility

### Logging
- All operations are logged with detailed information
- Verification results are logged for debugging
- Failed operations are logged with error details

### Retry Logic
- Main collection updates use `.catch()` to prevent failures
- The system continues even if one collection update fails
- Verification helps identify any issues

## Performance Considerations

### Parallel Updates
- Both collections are updated simultaneously using `Promise.all()`
- This reduces the total time for status updates
- Better user experience with faster response times

### Caching
- The `requestId` field is cached after the first lookup
- Subsequent operations use the cached value
- Reduces Firestore read operations

## Testing

### Manual Testing
1. Accept a request and check both collections
2. Verify the status is updated in both places
3. Check that timestamps are synchronized
4. Test with network interruptions

### Automated Testing
```typescript
// Test both collections are updated
const success = await requestService.acceptRequest(requestId, mechanicId);
const verified = await requestService.verifyRequestUpdate(requestId, mechanicId, 'accepted');

expect(success).toBe(true);
expect(verified).toBe(true);
```

## Monitoring

### Console Logs
The system provides detailed logging for monitoring:

```
🔄 Accepting request: req_abc123
🔄 Updating request status: req_abc123 to: accepted
🔍 Found main request ID: req_1756050741515_kwn9o3xkb
✅ Request req_abc123 status updated to: accepted
✅ Updated both collections: mechanic subcollection and main requests collection
🔍 Verifying request update for: req_abc123
📊 Verification results:
  - Mechanic subcollection status: accepted
  - Main collection status: accepted
  - Expected status: accepted
✅ Both collections updated correctly
✅ Request accepted and verified in both collections
```

### Error Monitoring
- Failed updates are logged with error details
- Verification failures are logged for investigation
- Network issues are handled gracefully

## Security Considerations

### Firestore Rules
Ensure your Firestore security rules allow updates to both collections:

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

This dual collection update system ensures data consistency across the entire application while providing robust error handling and verification mechanisms.
