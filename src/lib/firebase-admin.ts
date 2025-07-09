
import admin from 'firebase-admin';
import { getFirestore, Timestamp, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let adminDB: Firestore;
let adminAuth: Auth;
let adminStorage: Storage;
let isInitialized = false;

if (admin.apps.length > 0) {
    const defaultApp = admin.app();
    adminDB = getFirestore(defaultApp);
    adminAuth = getAuth(defaultApp);
    adminStorage = getStorage(defaultApp);
    isInitialized = true;
} else {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        
        if (serviceAccountJson) {
            const serviceAccount = JSON.parse(serviceAccountJson);
            const app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: "taxiandosp.appspot.com"
            });

            adminDB = getFirestore(app);
            adminAuth = getAuth(app);
            adminStorage = getStorage(app);
            isInitialized = true;
        }
    } catch (e) {
        console.error("CRITICAL: Failed to parse 'FIREBASE_SERVICE_ACCOUNT_JSON'. Ensure it is a valid, unescaped JSON string. Error: ", (e as Error).message);
    }
}

if (!isInitialized) {
    console.warn(`
****************************************************************************************************
*                                                                                                  *
*    WARNING: FIREBASE ADMIN SDK CREDENTIALS NOT FOUND OR INVALID.                                 *
*                                                                                                  *
*    The application will build, but any server-side features that require database access         *
*    (like logging in, fetching data for dashboards, etc.) WILL FAIL AT RUNTIME.                   *
*                                                                                                  *
*    This is a CONFIGURATION issue, not a code bug.                                                *
*                                                                                                  *
*    TO FIX THIS:                                                                                  *
*    - Set the 'FIREBASE_SERVICE_ACCOUNT_JSON' environment variable.                               *
*    - Refer to the README.md for detailed instructions.                                           *
*                                                                                                  *
****************************************************************************************************
    `);
    
    // Create a dummy proxy that will throw a more helpful error when accessed.
    const createDummyProxy = (name: string) => {
        return new Proxy({}, {
            get: function(target, prop, receiver) {
                // This error will be thrown only when a database/auth/storage function is actually called.
                throw new Error(`Firebase Admin SDK not initialized. Cannot access '${name}.${String(prop)}'. Please check your server environment variables as described in the README.`);
            }
        });
    };
    
    adminDB = createDummyProxy('adminDB') as Firestore;
    adminAuth = createDummyProxy('adminAuth') as Auth;
    adminStorage = createDummyProxy('adminStorage') as Storage;
}

export { adminAuth, adminDB, adminStorage, Timestamp };
