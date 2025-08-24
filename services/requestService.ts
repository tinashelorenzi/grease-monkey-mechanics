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
      
      // Update in mechanic's subcollection
      const mechanicRequestRef = doc(firestore, 'mechanics', mechanicId, 'requests', requestId);
      await updateDoc(mechanicRequestRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });

      // Get the request data to find the main request ID
      const requestDoc = await getDoc(mechanicRequestRef);
      if (requestDoc.exists()) {
        const requestData = requestDoc.data();
        const mainRequestId = requestData.requestId; // Use the requestId field to find main request
        
        if (mainRequestId) {
          try {
            // Update in main requests collection using the requestId
            const mainRequestRef = doc(firestore, 'requests', mainRequestId);
            await updateDoc(mainRequestRef, {
              status: newStatus,
              updatedAt: Timestamp.now()
            });
            console.log('✅ Updated main request:', mainRequestId);
          } catch (mainRequestError) {
            console.log('⚠️ Could not update main request (this is okay):', mainRequestError);
            // Don't fail the status update if main request update fails
          }
        } else {
          console.log('⚠️ No requestId found in mechanic request');
        }
      }

      console.log(`✅ Request ${requestId} status updated to: ${newStatus}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating request status:', error);
      return false;
    }
  }

  // Accept a request
  async acceptRequest(requestId: string, mechanicId: string) {
    return await this.updateRequestStatus(requestId, mechanicId, 'accepted');
  }

  // Decline a request
  async declineRequest(requestId: string, mechanicId: string) {
    return await this.updateRequestStatus(requestId, mechanicId, 'declined');
  }

  // Complete a request
  async completeRequest(requestId: string, mechanicId: string) {
    console.log('🔄 completeRequest called with:', { requestId, mechanicId });
    const result = await this.updateRequestStatus(requestId, mechanicId, 'completed');
    console.log('🔄 completeRequest result:', result);
    return result;
  }

  // Submit a quote for a request
  async submitQuote(requestId: string, mechanicId: string, amount: number, description: string) {
    try {
      console.log('💰 Submitting quote for request:', requestId, 'amount:', amount);
      
      // Add quote details to the mechanic's request first
      const mechanicRequestRef = doc(firestore, 'mechanics', mechanicId, 'requests', requestId);
      await updateDoc(mechanicRequestRef, {
        quoteAmount: amount,
        quoteDescription: description,
        quotedAt: Timestamp.now(),
      });

      console.log('✅ Quote details added to mechanic request');

      // Get the main request ID from the mechanic's request
      const requestDoc = await getDoc(mechanicRequestRef);
      if (requestDoc.exists()) {
        const requestData = requestDoc.data();
        const mainRequestId = requestData.requestId;
        
        console.log('🔍 Found main request ID:', mainRequestId);
        
        if (mainRequestId) {
          try {
            // Update main request collection
            const mainRequestRef = doc(firestore, 'requests', mainRequestId);
            await updateDoc(mainRequestRef, {
              quoteAmount: amount,
              quoteDescription: description,
              quotedAt: Timestamp.now(),
            });
            console.log('✅ Quote details updated in main request:', mainRequestId);
          } catch (mainRequestError) {
            console.log('⚠️ Could not update main request (this is okay):', mainRequestError);
            // Don't fail the quote submission if main request update fails
          }
        } else {
          console.log('⚠️ No main request ID found in mechanic request');
        }
      }

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
