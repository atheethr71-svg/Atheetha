import { collection, getDocs, doc, getDocFromServer } from 'firebase/firestore';
import { db, handleFirestoreError } from '@/lib/firebase';

export interface Room {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  floor: number;
}

export async function getRooms(): Promise<Room[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "rooms"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Room[];
  } catch (error) {
    handleFirestoreError(error, 'list', 'rooms');
  }
}

export async function checkConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error.message.includes('the client is offline')) {
      console.error("Firebase is offline. Check your internet connection.");
    } else if (error.code === 'permission-denied') {
      console.warn("Firebase connected, but test document access was restricted (expected if document doesn't exist).");
    } else {
      console.error("Firebase connection error:", error);
    }
  }
}
