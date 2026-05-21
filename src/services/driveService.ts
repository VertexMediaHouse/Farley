/**
 * Google Drive Upload Service
 * Converts files to Base64 and uploads them to Google Drive
 * via the Google Apps Script Web App endpoint.
 */

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL as string;

interface FilePayload {
  base64: string;
  name: string;
  type: string;
}

/**
 * Convert a File object to a Base64 data URL string.
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an array of File objects to Google Drive via the Apps Script Web App.
 * Each call creates a new sequentially-numbered folder in the parent Drive folder
 * and saves all files inside it with their original names.
 *
 * @param files - Array of File objects selected by the user.
 * @returns The response from the Google Apps Script.
 */
export async function uploadFilesToDrive(files: File[]): Promise<{ status: string; folderCreated?: string; message?: string }> {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('VITE_GOOGLE_SCRIPT_URL is not configured in .env');
  }

  if (files.length === 0) {
    return { status: 'success', message: 'No files to upload.' };
  }

  // Convert all files to Base64 in parallel
  const filePayloads: FilePayload[] = await Promise.all(
    files.map(async (file) => {
      const base64 = await fileToBase64(file);
      return {
        base64,
        name: file.name,
        type: file.type,
      };
    })
  );

  // Send to Google Apps Script
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ files: filePayloads }),
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const result = await response.json();

  if (result.status === 'error') {
    throw new Error(result.message || 'Unknown error from Google Apps Script');
  }

  return result;
}
