import { getDatabase, ref, onValue } from "firebase/database";

export class FirebaseConnectionMonitor {
  constructor(app) {
    this.db = getDatabase(app);
    this.connectedRef = ref(this.db, ".info/connected");
    this.connectionListener = null;
  }

  startMonitoring(onConnected, onDisconnected) {
    this.connectionListener = onValue(this.connectedRef, (snap) => {
      if (snap.val() === true) {
        console.log("Connected to Firebase");
        onConnected?.();
      } else {
        console.warn("Disconnected from Firebase");
        onDisconnected?.();
      }
    });
  }

  stopMonitoring() {
    if (this.connectionListener) {
      this.connectionListener();
      this.connectionListener = null;
    }
  }

  async testConnection() {
    try {
      const response = await fetch(`https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com/.json?shallow=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      return false;
    }
  }
}