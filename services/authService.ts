import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  deleteUser as firebaseDeleteUser,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection 
} from 'firebase/firestore';
import { auth, firestore } from './firebase';
import { MechanicRegistrationData } from '../screens/RegisterScreen';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
}

export interface MechanicProfile extends MechanicRegistrationData {
  uid: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  isActive: boolean;
  rating?: number;
  totalJobs?: number;
  totalEarnings?: number;
}

class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Update user profile
  async updateProfile(displayName: string, photoURL?: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (user) {
        await firebaseUpdateProfile(user, {
          displayName,
          photoURL,
        });
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Update user email
  async updateEmail(newEmail: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (user) {
        await firebaseUpdateEmail(user, newEmail);
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Update user password
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (user) {
        await firebaseUpdatePassword(user, newPassword);
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Delete user account
  async deleteAccount(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (user) {
        await firebaseDeleteUser(user);
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    try {
      return onAuthStateChanged(auth, callback);
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      // Return a dummy unsubscribe function
      return () => {};
    }
  }

  // Register mechanic with profile data
  async registerMechanic(userData: MechanicRegistrationData): Promise<MechanicProfile> {
    try {
      // First, create the user account
      const userCredential = await this.signUp(userData.email, userData.password);
      const user = userCredential.user;

      // Create the mechanic profile in Firestore
      const mechanicProfile: Omit<MechanicProfile, 'uid'> = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
        isActive: true,
        rating: 0,
        totalJobs: 0,
        totalEarnings: 0,
      };

      // Save to Firestore
      const docRef = doc(firestore, 'mechanics', user.uid);
      await setDoc(docRef, mechanicProfile);

      // Update display name
      await this.updateProfile(`${userData.firstName} ${userData.lastName}`);

      // Return the complete profile
      return {
        ...mechanicProfile,
        uid: user.uid,
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Get mechanic profile from Firestore
  async getMechanicProfile(uid: string): Promise<MechanicProfile | null> {
    try {
      const docRef = doc(firestore, 'mechanics', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          uid: docSnap.id,
          ...docSnap.data(),
        } as MechanicProfile;
      }
      return null;
    } catch (error: any) {
      throw this.handleFirestoreError(error);
    }
  }

  // Update mechanic profile
  async updateMechanicProfile(uid: string, updates: Partial<MechanicProfile>): Promise<void> {
    try {
      const docRef = doc(firestore, 'mechanics', uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw this.handleFirestoreError(error);
    }
  }

  // Delete mechanic profile
  async deleteMechanicProfile(uid: string): Promise<void> {
    try {
      const docRef = doc(firestore, 'mechanics', uid);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw this.handleFirestoreError(error);
    }
  }

  // Handle Firebase Auth errors
  private handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication';

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters long';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/requires-recent-login':
        message = 'Please log in again to perform this action';
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }

  // Handle Firestore errors
  private handleFirestoreError(error: any): Error {
    let message = 'An error occurred while accessing the database';

    switch (error.code) {
      case 'permission-denied':
        message = 'You do not have permission to perform this action';
        break;
      case 'not-found':
        message = 'The requested data was not found';
        break;
      case 'already-exists':
        message = 'The data already exists';
        break;
      case 'resource-exhausted':
        message = 'Database quota exceeded. Please try again later';
        break;
      case 'failed-precondition':
        message = 'The operation failed due to a precondition';
        break;
      case 'aborted':
        message = 'The operation was aborted';
        break;
      case 'out-of-range':
        message = 'The operation is out of range';
        break;
      case 'unimplemented':
        message = 'This operation is not implemented';
        break;
      case 'internal':
        message = 'An internal error occurred';
        break;
      case 'unavailable':
        message = 'The service is currently unavailable';
        break;
      case 'data-loss':
        message = 'Data loss occurred';
        break;
      case 'unauthenticated':
        message = 'You must be authenticated to perform this action';
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }
}

// Export a singleton instance
export const authService = new AuthService();
export default authService;
