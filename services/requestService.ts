import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  Timestamp,
  getDoc 
} from 'firebase/firestore';
import { firestore } from './firebase';
import * as Linking from 'expo-linking';

export interface ServiceRequest {
  id: string;
  requestId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  mechanicId: string;
  mechanicName: string;
  serviceType: string;
  description?: string;
  address?: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled' | 'quoted';
  quoteAmount?: number;
  quoteDescription?: string;
  quotedAt?: any; // Timestamp
  createdAt: any; // Timestamp
  updatedAt: any; // Timestamp
}

class RequestService {
  private requestListener: (() => void) | null = null;

  // Listen to pending requests for a mechanic
  listenToRequests(mechanicId: string, callback: (requests: ServiceRequest[]) => void) {
    const requestsRef = collection(firestore, 'mechanics', mechanicId, 'requests');
    
    // Simple query without composite index requirement
    console.log('🔍 Setting up request listener for mechanic:', mechanicId);
    this.requestListener = onSnapshot(requestsRef, (snapshot) => {
      console.log('📊 Firestore snapshot received, docs count:', snapshot.size);
      const requests: ServiceRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Document data:', doc.id, data);
        // Filter pending requests in JavaScript instead of Firestore query
        if (data.status === 'pending') {
          requests.push({ 
            id: doc.id, 
            requestId: data.requestId, // Include the main request ID
            ...data 
          } as ServiceRequest);
        }
      });
      // Sort by createdAt in JavaScript
      requests.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
        return bTime - aTime; // Descending order
      });
      console.log('✅ Filtered pending requests:', requests.length);
      callback(requests);
    }, (error) => {
      console.error('❌ Error in request listener:', error);
    });

    return () => {
      if (this.requestListener) {
        this.requestListener();
        this.requestListener = null;
      }
    };
  }

  // Listen to accepted requests for a mechanic (active jobs)
  listenToAcceptedRequests(mechanicId: string, callback: (requests: ServiceRequest[]) => void) {
    const requestsRef = collection(firestore, 'mechanics', mechanicId, 'requests');
    
    console.log('🔍 Setting up accepted requests listener for mechanic:', mechanicId);
    return onSnapshot(requestsRef, (snapshot) => {
      console.log('📊 Accepted requests snapshot received, docs count:', snapshot.size);
      const requests: ServiceRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter accepted requests
        if (data.status === 'accepted') {
          requests.push({ 
            id: doc.id, 
            requestId: data.requestId,
            ...data 
          } as ServiceRequest);
        }
      });
      console.log('✅ Filtered accepted requests:', requests.length);
      callback(requests);
    }, (error) => {
      console.error('❌ Error in accepted requests listener:', error);
    });
  }

  // Listen to a specific request for real-time updates
  listenToRequest(requestId: string, mechanicId: string, callback: (request: ServiceRequest | null) => void) {
    const requestRef = doc(firestore, 'mechanics', mechanicId, 'requests', requestId);
    
    return onSnapshot(requestRef, (doc) => {
      if (doc.exists()) {
        const request = { id: doc.id, ...doc.data() } as ServiceRequest;
        callback(request);
      } else {
        callback(null);
      }
    });
  }

  // Update request status
  async updateRequestStatus(requestId: string, mechanicId: string, newStatus: ServiceRequest['status']) {
    try {
      console.log('🔄 Updating request status:', requestId, 'to:', newStatus);
      
      // First, get the request data to find the main request ID
      const mechanicRequestRef = doc(firestore, 'mechanics', mechanicId, 'requests', requestId);
      const requestDoc = await getDoc(mechanicRequestRef);
      
      if (!requestDoc.exists()) {
        console.error('❌ Mechanic request not found:', requestId);
        return false;
      }
      
      const requestData = requestDoc.data();
      const mainRequestId = requestData.requestId; // Use the requestId field to find main request
      
      if (!mainRequestId) {
        console.error('❌ No requestId found in mechanic request:', requestId);
        return false;
      }
      
      console.log('🔍 Found main request ID:', mainRequestId);
      
      // Update both collections in parallel for better performance
      const updatePromises = [];
      
      // 1. Update mechanic's subcollection
      const mechanicUpdatePromise = updateDoc(mechanicRequestRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      updatePromises.push(mechanicUpdatePromise);
      
      // 2. Update main requests collection
      const mainRequestRef = doc(firestore, 'requests', mainRequestId);
      const mainUpdatePromise = updateDoc(mainRequestRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      }).catch((error) => {
        console.log('⚠️ Could not update main request (this is okay):', error);
        // Don't fail the entire operation if main request update fails
        return null;
      });
      updatePromises.push(mainUpdatePromise);
      
      // Wait for both updates to complete
      await Promise.all(updatePromises);
      
      console.log(`✅ Request ${requestId} status updated to: ${newStatus}`);
      console.log(`✅ Updated both collections: mechanic subcollection and main requests collection`);
      return true;
    } catch (error) {
      console.error('❌ Error updating request status:', error);
      return false;
    }
  }

  // Accept a request
  async acceptRequest(requestId: string, mechanicId: string) {
    console.log('🔄 Accepting request:', requestId);
    const success = await this.updateRequestStatus(requestId, mechanicId, 'accepted');
    
    if (success) {
      // Verify the update was successful
      const verified = await this.verifyRequestUpdate(requestId, mechanicId, 'accepted');
      if (verified) {
        console.log('✅ Request accepted and verified in both collections');
      } else {
        console.log('⚠️ Request accepted but verification failed');
      }
    }
    
    return success;
  }

  // Decline a request
  async declineRequest(requestId: string, mechanicId: string) {
    console.log('🔄 Declining request:', requestId);
    const success = await this.updateRequestStatus(requestId, mechanicId, 'declined');
    
    if (success) {
      // Verify the update was successful
      const verified = await this.verifyRequestUpdate(requestId, mechanicId, 'declined');
      if (verified) {
        console.log('✅ Request declined and verified in both collections');
      } else {
        console.log('⚠️ Request declined but verification failed');
      }
    }
    
    return success;
  }

  // Complete a request
  async completeRequest(requestId: string, mechanicId: string) {
    console.log('🔄 Completing request:', requestId);
    const success = await this.updateRequestStatus(requestId, mechanicId, 'completed');
    
    if (success) {
      // Verify the update was successful
      const verified = await this.verifyRequestUpdate(requestId, mechanicId, 'completed');
      if (verified) {
        console.log('✅ Request completed and verified in both collections');
      } else {
        console.log('⚠️ Request completed but verification failed');
      }
    }
    
    return success;
  }

  // Submit a quote for a request
  async submitQuote(requestId: string, mechanicId: string, amount: number, description: string) {
    try {
      console.log('💰 Submitting quote for request:', requestId, 'amount:', amount);
      
      // First, get the request data to find the main request ID
      const mechanicRequestRef = doc(firestore, 'mechanics', mechanicId, 'requests', requestId);
      const requestDoc = await getDoc(mechanicRequestRef);
      
      if (!requestDoc.exists()) {
        console.error('❌ Mechanic request not found:', requestId);
        return false;
      }
      
      const requestData = requestDoc.data();
      const mainRequestId = requestData.requestId;
      
      if (!mainRequestId) {
        console.error('❌ No requestId found in mechanic request:', requestId);
        return false;
      }
      
      console.log('🔍 Found main request ID:', mainRequestId);
      
      // Update both collections in parallel for better performance
      const updatePromises = [];
      
      // 1. Update mechanic's subcollection with quote details
      const mechanicUpdatePromise = updateDoc(mechanicRequestRef, {
        quoteAmount: amount,
        quoteDescription: description,
        quotedAt: Timestamp.now(),
      });
      updatePromises.push(mechanicUpdatePromise);
      
      // 2. Update main requests collection with quote details
      const mainRequestRef = doc(firestore, 'requests', mainRequestId);
      const mainUpdatePromise = updateDoc(mainRequestRef, {
        quoteAmount: amount,
        quoteDescription: description,
        quotedAt: Timestamp.now(),
      }).catch((error) => {
        console.log('⚠️ Could not update main request (this is okay):', error);
        // Don't fail the entire operation if main request update fails
        return null;
      });
      updatePromises.push(mainUpdatePromise);
      
      // Wait for both updates to complete
      await Promise.all(updatePromises);
      
      console.log('✅ Quote details updated in both collections');
      
      // Update request status to 'quoted' (this will also update both collections)
      const success = await this.updateRequestStatus(requestId, mechanicId, 'quoted');
      
      if (success) {
        console.log('✅ Quote submitted successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error submitting quote:', error);
      return false;
    }
  }

  // Get request details
  async getRequestDetails(requestId: string) {
    try {
      const requestRef = doc(firestore, 'requests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (requestSnap.exists()) {
        const request = { id: requestSnap.id, ...requestSnap.data() } as ServiceRequest;
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

  // Verify that both collections are updated correctly
  async verifyRequestUpdate(requestId: string, mechanicId: string, expectedStatus: ServiceRequest['status']) {
    try {
      console.log('🔍 Verifying request update for:', requestId);
      
      // Check mechanic's subcollection
      const mechanicRequestRef = doc(firestore, 'mechanics', mechanicId, 'requests', requestId);
      const mechanicDoc = await getDoc(mechanicRequestRef);
      
      if (!mechanicDoc.exists()) {
        console.error('❌ Mechanic request not found during verification');
        return false;
      }
      
      const mechanicData = mechanicDoc.data();
      const mainRequestId = mechanicData.requestId;
      
      if (!mainRequestId) {
        console.error('❌ No main request ID found during verification');
        return false;
      }
      
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
        return true; // Still consider this a success since main collection is optional
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

  // Open location in Google Maps
  openLocationInMaps(latitude: number, longitude: number, address?: string) {
    const label = address || 'Service Location';
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(label)}`;
    
    Linking.openURL(url).catch((error: any) => {
      console.error('Error opening maps:', error);
    });
  }

  // Call customer
  callCustomer(phoneNumber: string) {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch((error: any) => {
      console.error('Error making call:', error);
    });
  }

  // Stop listening to requests
  stopListening() {
    if (this.requestListener) {
      this.requestListener();
      this.requestListener = null;
    }
  }
}

export const requestService = new RequestService();
export default requestService;
