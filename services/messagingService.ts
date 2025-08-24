import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { firestore } from './firebase';

export interface Message {
  id: string;
  text: string;
  sender: 'mechanic' | 'customer';
  senderId: string;
  senderName: string;
  timestamp: any; // Timestamp
  requestId: string;
  read?: boolean; // Track if message has been read
}

export interface ChatSession {
  id: string;
  requestId: string;
  mechanicId: string;
  customerId: string;
  mechanicName: string;
  customerName: string;
  lastMessage?: string;
  lastMessageTime?: any; // Timestamp
  createdAt: any; // Timestamp
}

class MessagingService {
  private messageListeners: Map<string, () => void> = new Map();

  // Create or get chat session for a request
  async createChatSession(requestId: string, mechanicId: string, customerId: string, mechanicName: string, customerName: string): Promise<string> {
    try {
      console.log('🔍 Looking for existing chat session for request:', requestId);
      
      // Check if chat session already exists
      const chatSessionsRef = collection(firestore, 'chatSessions');
      
      // Get all chat sessions and filter in JavaScript to avoid composite index issues
      const snapshot = await getDocs(chatSessionsRef);
      let existingSessionId: string | null = null;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.requestId === requestId) {
          existingSessionId = doc.id;
          console.log('✅ Found existing chat session:', doc.id);
        }
      });

      if (existingSessionId) {
        return existingSessionId;
      }

      // Create new chat session if none exists
      const chatSessionData = {
        requestId,
        mechanicId,
        customerId,
        mechanicName,
        customerName,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(chatSessionsRef, chatSessionData);
      console.log('✅ New chat session created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating chat session:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(chatSessionId: string, messageData: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    try {
      const messagesRef = collection(firestore, 'chatSessions', chatSessionId, 'messages');
      
      const message = {
        ...messageData,
        timestamp: Timestamp.now(),
      };

      const docRef = await addDoc(messagesRef, message);
      console.log('✅ Message sent:', docRef.id);

      // Update chat session with last message
      const chatSessionRef = doc(firestore, 'chatSessions', chatSessionId);
      await updateDoc(chatSessionRef, {
        lastMessage: messageData.text,
        lastMessageTime: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  // Listen to messages for a chat session
  listenToMessages(chatSessionId: string, callback: (messages: Message[]) => void) {
    console.log('🔍 Setting up message listener for chat session:', chatSessionId);
    
    const messagesRef = collection(firestore, 'chatSessions', chatSessionId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📨 Messages snapshot received, count:', snapshot.size);
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      callback(messages);
    }, (error) => {
      console.error('❌ Error in message listener:', error);
    });

    this.messageListeners.set(chatSessionId, unsubscribe);
    return unsubscribe;
  }

  // Stop listening to messages
  stopListeningToMessages(chatSessionId: string) {
    const unsubscribe = this.messageListeners.get(chatSessionId);
    if (unsubscribe) {
      unsubscribe();
      this.messageListeners.delete(chatSessionId);
      console.log('🛑 Stopped listening to messages for chat session:', chatSessionId);
    }
  }

  // Stop all message listeners
  stopAllListeners() {
    this.messageListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.messageListeners.clear();
    console.log('🛑 Stopped all message listeners');
  }
}

export const messagingService = new MessagingService();
export default messagingService;
