import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getStorage, type Storage } from 'firebase-admin/storage'

function ensureInitialized(): void {
  if (getApps().length > 0) return

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error(
      'Firebase Admin not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET.'
    )
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  })
}

export function getFirebaseStorage(): Storage {
  ensureInitialized()
  return getStorage()
}

export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_STORAGE_BUCKET
  )
}
