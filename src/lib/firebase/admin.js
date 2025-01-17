import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

let app;

try {
    // Check for required environment variables
    if (!process.env.VITE_FIREBASE_SA_PRIVATE_KEY) {
        throw new Error('VITE_FIREBASE_SA_PRIVATE_KEY environment variable is not set');
    }
    if (!process.env.VITE_FIREBASE_DATABASE_URL) {
        throw new Error('VITE_FIREBASE_DATABASE_URL environment variable is not set');
    }

    // Create service account config
    const serviceAccount = {
        type: process.env.VITE_FIREBASE_SA_TYPE,
        project_id: process.env.VITE_FIREBASE_SA_PROJECT_ID,
        private_key_id: process.env.VITE_FIREBASE_SA_PRIVATE_KEY_ID,
        private_key: process.env.VITE_FIREBASE_SA_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.VITE_FIREBASE_SA_CLIENT_EMAIL,
        client_id: process.env.VITE_FIREBASE_SA_CLIENT_ID,
        auth_uri: process.env.VITE_FIREBASE_SA_AUTH_URI,
        token_uri: process.env.VITE_FIREBASE_SA_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.VITE_FIREBASE_SA_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.VITE_FIREBASE_SA_CLIENT_CERT_URL,
        universe_domain: process.env.VITE_FIREBASE_SA_UNIVERSE_DOMAIN
    };

    // Initialize Firebase Admin
    if (!admin.apps.length) {
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
        });
    } else {
        app = admin.app();
    }

    // Test database connection
    const testRef = getDatabase().ref('.info/connected');
    testRef.once('value', (snapshot) => {
        if (snapshot.val() === true) {
            console.log('Successfully connected to Firebase Admin Database');
        } else {
            console.warn('Not connected to Firebase Admin Database');
        }
    });

} catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw error;
}

const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };