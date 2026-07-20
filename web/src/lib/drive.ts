import { google } from 'googleapis'
import { Readable } from 'stream'
import fs from 'fs'

export async function uploadFileToDrive(file: File, folderId: string) {
  // Render.com lưu Secret Files ở /etc/secrets/
  const renderSecretPath = '/etc/secrets/credentials.json'
  const localPath = 'credentials.json'
  
  const keyFilePath = fs.existsSync(renderSecretPath) ? renderSecretPath : localPath

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ['https://www.googleapis.com/auth/drive.file']
  })

  const drive = google.drive({ version: 'v3', auth })

  // Convert File to Node.js Readable Stream
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)

  const fileMetadata = {
    name: file.name,
    parents: [folderId]
  }

  const media = {
    mimeType: file.type || 'application/octet-stream',
    body: stream
  }

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    })

    // Set permission to anyone with link can view (so users can see it)
    await drive.permissions.create({
      fileId: response.data.id as string,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })

    return response.data.webViewLink
  } catch (error) {
    console.error('Lỗi khi upload file lên Google Drive:', error)
    throw new Error('Google Drive Upload failed. Hãy chắc chắn bạn đã cấu hình credentials.json và share quyền thư mục.')
  }
}
