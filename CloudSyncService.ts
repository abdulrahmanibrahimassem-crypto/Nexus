import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

// Secure Firebase Client SDK configuration for Zenith Core Cloud Sync
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyMockKeyForZenithCoreCloudSync12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zenith-core-os.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zenith-core-os",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zenith-core-os.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

let db: any = null;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
} catch {
  // Graceful fallback for offline or unconfigured environments
}

export interface EncryptedCloudPayload {
  userId: string;
  encryptedData: string;
  iv: string;
  updatedAt: string;
}

// Client-side lightweight AES-GCM encryption helper for Zero-Knowledge cloud sync
async function deriveKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("zenith-core-salt-v1"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptUserData(data: object, secretKey: string): Promise<{ encryptedData: string; iv: string }> {
  const key = await deriveKey(secretKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

export async function decryptUserData(encryptedData: string, ivStr: string, secretKey: string): Promise<any> {
  try {
    const key = await deriveKey(secretKey);
    const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded);
  } catch {
    throw new Error("Decryption failed: Invalid key or corrupted payload.");
  }
}

export async function syncEncryptedVaultToCloud(userId: string, vaultData: object, secretKey: string) {
  if (!db) return { success: false, error: 'Firestore client not initialized' };
  try {
    const { encryptedData, iv } = await encryptUserData(vaultData, secretKey);
    const docRef = doc(db, 'zenith_encrypted_vaults', userId);
    await setDoc(docRef, {
      userId,
      encryptedData,
      iv,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchEncryptedVaultFromCloud(userId: string, secretKey: string) {
  if (!db) return { success: false, error: 'Firestore client not initialized' };
  try {
    const docRef = doc(db, 'zenith_encrypted_vaults', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return { success: false, error: 'No cloud vault found for user.' };
    }
    const data = snap.data() as EncryptedCloudPayload;
    const decrypted = await decryptUserData(data.encryptedData, data.iv, secretKey);
    return { success: true, data: decrypted };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
