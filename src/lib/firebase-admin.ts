import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// This function ensures we only initialize the app once.
const getAdminApp = (): App => {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    // In a managed environment like App Hosting, initializeApp() with no arguments
    // should find default credentials automatically.
    return initializeApp();
}

// Export the initialized services
export const adminAuth = getAuth(getAdminApp());
export const db = getFirestore(getAdminApp());

// Export Timestamp type as well
export { Timestamp };
