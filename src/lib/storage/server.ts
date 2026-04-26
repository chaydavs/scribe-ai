import { getFirebaseStorage } from '@/lib/firebase/admin'

const SIGNED_URL_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface UploadResult {
  storagePath: string
  signedUrl: string
}

export async function uploadExportPDF(
  userId: string,
  exportId: string,
  pdfBuffer: Buffer,
  meta: { fileName: string; templateId: string }
): Promise<UploadResult> {
  const storage = getFirebaseStorage()
  const bucket = storage.bucket()
  const storagePath = `users/${userId}/exports/${exportId}.pdf`
  const file = bucket.file(storagePath)

  await file.save(pdfBuffer, {
    contentType: 'application/pdf',
    metadata: {
      metadata: {
        userId,
        exportId,
        fileName: meta.fileName,
        templateId: meta.templateId,
        createdAt: new Date().toISOString(),
      },
    },
  })

  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + SIGNED_URL_TTL_MS,
  })

  return { storagePath, signedUrl }
}

export async function uploadResumePDF(
  userId: string,
  uploadId: string,
  pdfBuffer: Buffer
): Promise<string> {
  const storage = getFirebaseStorage()
  const bucket = storage.bucket()
  const storagePath = `users/${userId}/uploads/${uploadId}.pdf`
  const file = bucket.file(storagePath)

  await file.save(pdfBuffer, {
    contentType: 'application/pdf',
    metadata: {
      metadata: {
        userId,
        uploadId,
        createdAt: new Date().toISOString(),
      },
    },
  })

  return storagePath
}
