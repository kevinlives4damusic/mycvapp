import * as admin from 'firebase-admin';
import { Subscription } from '../types';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Get environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Replace escaped newlines
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error('Missing Firebase credentials');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

const db = admin.firestore();
const subscriptionsRef = db.collection('subscriptions');

export class FirebaseService {
  async createSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription> {
    try {
      const docRef = await subscriptionsRef.add({
        ...subscription,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const doc = await docRef.get();
      return {
        id: doc.id,
        ...doc.data(),
      } as Subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    try {
      const snapshot = await subscriptionsRef
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error('Failed to get subscription');
    }
  }

  async updateSubscription(id: string, update: Partial<Subscription>): Promise<void> {
    try {
      await subscriptionsRef.doc(id).update({
        ...update,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  async cancelSubscription(id: string): Promise<void> {
    try {
      await subscriptionsRef.doc(id).update({
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async listUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const snapshot = await subscriptionsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Subscription[];
    } catch (error) {
      console.error('Error listing subscriptions:', error);
      throw new Error('Failed to list subscriptions');
    }
  }
}