import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const isMockMode = process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key' || 
                   !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
                   process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.startsWith('your_');

let app: any;
let auth: any;
let db: any;
let googleProvider: any;

if (isMockMode) {
  console.log('🔧 Running in MOCK mode - authentication will work without Firebase credentials');
  
  const mockUser = {
    uid: 'mock-user-123',
    email: 'demo@tradingrocket.app',
    displayName: 'Demo User',
    photoURL: null,
    emailVerified: true,
  };

  const mockDb: any = {
    users: new Map(),
  };

  app = {
    name: '[MOCK]',
    options: {},
  };

  auth = {
    app,
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },
    signInWithPopup: async () => {
      auth.currentUser = mockUser;
      return { user: mockUser };
    },
    signInWithEmailAndPassword: async (_: any, email: string) => {
      auth.currentUser = { ...mockUser, email };
      return { user: { ...mockUser, email } };
    },
    createUserWithEmailAndPassword: async (_: any, email: string) => {
      auth.currentUser = { ...mockUser, email };
      return { user: { ...mockUser, email } };
    },
    signOut: async () => {
      auth.currentUser = null;
    },
  };

  googleProvider = {};

  db = {
    collection: (name: string) => ({
      doc: (id: string) => ({
        get: async () => {
          const data = mockDb.users.get(`${name}/${id}`);
          return {
            exists: !!data,
            data: () => data,
          };
        },
        set: async (data: any) => {
          mockDb.users.set(`${name}/${id}`, data);
        },
        setDoc: async (data: any) => {
          mockDb.users.set(`${name}/${id}`, data);
        },
      }),
    }),
  };
} else {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  try {
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase auth/db init failed - check credentials');
  }
}

export { app, auth, db, googleProvider, isMockMode };
