/**
 * File Management Service
 *
 * Provides file upload, download, and document picking capabilities
 *
 * Features:
 * - File upload with progress tracking
 * - File download with progress and resume
 * - Document picker for various file types
 * - File info and metadata
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

export interface FileInfo {
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
  lastModified?: number;
}

export interface UploadProgress {
  totalBytesSent: number;
  totalBytesExpectedToSend: number;
  progress: number; // 0-1
}

export interface DownloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
  progress: number; // 0-1
}

/**
 * Pick a document from device storage
 * @param options Document picker options
 */
export async function pickDocument(options?: {
  type?: string | string[];
  multiple?: boolean;
  copyToCacheDirectory?: boolean;
}): Promise<FileInfo[] | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: options?.type || '*/*',
      multiple: options?.multiple ?? false,
      copyToCacheDirectory: options?.copyToCacheDirectory ?? true,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.name,
      size: asset.size ?? 0,
      mimeType: asset.mimeType ?? undefined,
    }));
  } catch (error) {
    console.error('Error picking document:', error);
    return null;
  }
}

/**
 * Get file information
 * @param fileUri URI of the file
 */
export async function getFileInfo(fileUri: string): Promise<FileInfo | null> {
  try {
    const info = await FileSystem.getInfoAsync(fileUri);

    if (!info.exists) {
      return null;
    }

    // Extract filename from URI
    const filename = fileUri.split('/').pop() || 'unknown';

    return {
      uri: info.uri,
      name: filename,
      size: info.size ?? 0,
      lastModified: info.modificationTime,
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}

/**
 * Upload a file to a server with progress tracking
 * @param fileUri Local file URI
 * @param uploadUrl Server upload URL
 * @param options Upload options
 */
export async function uploadFile(
  fileUri: string,
  uploadUrl: string,
  options?: {
    fieldName?: string;
    httpMethod?: 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    parameters?: Record<string, string>;
    onProgress?: (progress: UploadProgress) => void;
  }
): Promise<{ success: boolean; response?: unknown; error?: string }> {
  try {
    const uploadTask = FileSystem.createUploadTask(
      uploadUrl,
      fileUri,
      {
        fieldName: options?.fieldName || 'file',
        httpMethod: (options?.httpMethod as 'POST' | 'PUT' | 'PATCH') || 'POST',
        headers: options?.headers,
        parameters: options?.parameters,
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      },
      (progress) => {
        if (options?.onProgress) {
          const progressData: UploadProgress = {
            totalBytesSent: progress.totalBytesSent,
            totalBytesExpectedToSend: progress.totalBytesExpectedToSend,
            progress: progress.totalBytesSent / progress.totalBytesExpectedToSend,
          };
          options.onProgress(progressData);
        }
      }
    );

    const response = await uploadTask.uploadAsync();

    if (response && response.status >= 200 && response.status < 300) {
      return {
        success: true,
        response: response.body ? JSON.parse(response.body) : null,
      };
    }

    return {
      success: false,
      error: `Upload failed with status ${response?.status}`,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Download a file from URL with progress tracking
 * @param fileUrl Remote file URL
 * @param destinationUri Local destination URI (optional, defaults to cache)
 * @param options Download options
 */
export async function downloadFile(
  fileUrl: string,
  destinationUri?: string,
  options?: {
    onProgress?: (progress: DownloadProgress) => void;
    headers?: Record<string, string>;
  }
): Promise<{ success: boolean; uri?: string; error?: string }> {
  try {
    const filename = fileUrl.split('/').pop() || `download-${Date.now()}`;
    const destination = destinationUri || `${FileSystem.cacheDirectory}${filename}`;

    const callback = options?.onProgress
      ? (downloadProgress: FileSystem.DownloadProgressData) => {
          const progressData: DownloadProgress = {
            totalBytesWritten: downloadProgress.totalBytesWritten,
            totalBytesExpectedToWrite: downloadProgress.totalBytesExpectedToWrite,
            progress:
              downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite,
          };
          options.onProgress?.(progressData);
        }
      : undefined;

    const downloadResumable = FileSystem.createDownloadResumable(
      fileUrl,
      destination,
      { headers: options?.headers },
      callback
    );

    const result = await downloadResumable.downloadAsync();

    if (result?.uri) {
      return {
        success: true,
        uri: result.uri,
      };
    }

    return {
      success: false,
      error: 'Download failed',
    };
  } catch (error) {
    console.error('Error downloading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed',
    };
  }
}

/**
 * Create a resumable download
 * Returns a download object that can be paused/resumed
 */
export function createResumableDownload(
  fileUrl: string,
  destinationUri: string,
  options?: {
    onProgress?: (progress: DownloadProgress) => void;
    headers?: Record<string, string>;
  }
): FileSystem.DownloadResumable {
  const callback = options?.onProgress
    ? (downloadProgress: FileSystem.DownloadProgressData) => {
        const progressData: DownloadProgress = {
          totalBytesWritten: downloadProgress.totalBytesWritten,
          totalBytesExpectedToWrite: downloadProgress.totalBytesExpectedToWrite,
          progress: downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite,
        };
        options.onProgress?.(progressData);
      }
    : undefined;

  return FileSystem.createDownloadResumable(
    fileUrl,
    destinationUri,
    { headers: options?.headers },
    callback
  );
}

/**
 * Delete a file
 * @param fileUri URI of the file to delete
 */
export async function deleteFile(fileUri: string): Promise<boolean> {
  try {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Copy a file
 * @param sourceUri Source file URI
 * @param destinationUri Destination file URI
 */
export async function copyFile(sourceUri: string, destinationUri: string): Promise<boolean> {
  try {
    await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });
    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
}

/**
 * Move a file
 * @param sourceUri Source file URI
 * @param destinationUri Destination file URI
 */
export async function moveFile(sourceUri: string, destinationUri: string): Promise<boolean> {
  try {
    await FileSystem.moveAsync({ from: sourceUri, to: destinationUri });
    return true;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
}

/**
 * Read file as string
 * @param fileUri URI of the file
 */
export async function readFileAsString(fileUri: string): Promise<string | null> {
  try {
    const content = await FileSystem.readAsStringAsync(fileUri);
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

/**
 * Write string to file
 * @param fileUri URI of the file
 * @param content Content to write
 */
export async function writeStringToFile(fileUri: string, content: string): Promise<boolean> {
  try {
    await FileSystem.writeAsStringAsync(fileUri, content);
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    return false;
  }
}

/**
 * Common file type filters for document picker
 */
export const FILE_TYPES = {
  IMAGES: 'image/*',
  VIDEOS: 'video/*',
  AUDIO: 'audio/*',
  PDF: 'application/pdf',
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  TEXT: 'text/*',
  ALL: '*/*',
};
