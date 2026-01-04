/**
 * Media Service
 *
 * Provides unified access to camera, image picker, media library, and video
 *
 * Features:
 * - Camera capture (photo & video)
 * - Image picker (library)
 * - Media library management
 * - Video playback utilities
 */

import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export type MediaType = 'photo' | 'video' | 'all';

export interface MediaResult {
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
  base64?: string;
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Request both camera and mic permissions (for video recording)
 */
export async function requestCameraAndMicPermissions(): Promise<boolean> {
  const camera = await Camera.requestCameraPermissionsAsync();
  const microphone = await Camera.requestMicrophonePermissionsAsync();
  return camera.status === 'granted' && microphone.status === 'granted';
}

/**
 * Take a photo using the camera
 * @param options Optional configuration
 */
export async function takePhoto(options?: {
  quality?: number;
  base64?: boolean;
  exif?: boolean;
}): Promise<MediaResult | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    console.warn('Camera permission denied');
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: options?.quality ?? 0.8,
      base64: options?.base64 ?? false,
      exif: options?.exif ?? false,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'image',
      width: asset.width ?? undefined,
      height: asset.height ?? undefined,
      base64: asset.base64 ?? undefined,
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
}

/**
 * Record a video using the camera
 * @param options Optional configuration
 */
export async function recordVideo(options?: {
  quality?: ImagePicker.UIImagePickerControllerQualityType;
  maxDuration?: number;
}): Promise<MediaResult | null> {
  const hasPermission = await requestCameraAndMicPermissions();
  if (!hasPermission) {
    console.warn('Camera or microphone permission denied');
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoQuality: options?.quality ?? ImagePicker.UIImagePickerControllerQualityType.High,
      videoMaxDuration: options?.maxDuration ?? 60,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'video',
      width: asset.width ?? undefined,
      height: asset.height ?? undefined,
      duration: asset.duration ?? undefined,
    };
  } catch (error) {
    console.error('Error recording video:', error);
    return null;
  }
}

/**
 * Pick an image from the library
 * @param options Optional configuration
 */
export async function pickImage(options?: {
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  base64?: boolean;
}): Promise<MediaResult | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: options?.quality ?? 0.8,
      allowsEditing: options?.allowsEditing ?? false,
      aspect: options?.aspect,
      base64: options?.base64 ?? false,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'image',
      width: asset.width ?? undefined,
      height: asset.height ?? undefined,
      base64: asset.base64 ?? undefined,
    };
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
}

/**
 * Pick a video from the library
 * @param options Optional configuration
 */
export async function pickVideo(options?: {
  quality?: ImagePicker.UIImagePickerControllerQualityType;
  allowsEditing?: boolean;
}): Promise<MediaResult | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoQuality: options?.quality ?? ImagePicker.UIImagePickerControllerQualityType.High,
      allowsEditing: options?.allowsEditing ?? false,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'video',
      width: asset.width ?? undefined,
      height: asset.height ?? undefined,
      duration: asset.duration ?? undefined,
    };
  } catch (error) {
    console.error('Error picking video:', error);
    return null;
  }
}

/**
 * Pick multiple images from the library
 * @param options Optional configuration
 */
export async function pickMultipleImages(options?: {
  quality?: number;
  limit?: number;
}): Promise<MediaResult[]> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: options?.quality ?? 0.8,
      allowsMultipleSelection: true,
      selectionLimit: options?.limit ?? 10,
    });

    if (result.canceled) {
      return [];
    }

    return result.assets.map((asset) => ({
      uri: asset.uri,
      type: 'image' as const,
      width: asset.width ?? undefined,
      height: asset.height ?? undefined,
    }));
  } catch (error) {
    console.error('Error picking multiple images:', error);
    return [];
  }
}

/**
 * Save media to device library
 * @param uri URI of the media file
 */
export async function saveToLibrary(uri: string): Promise<boolean> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    console.warn('Media library permission denied');
    return false;
  }

  try {
    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  } catch (error) {
    console.error('Error saving to library:', error);
    return false;
  }
}

/**
 * Get recent media from library
 * @param options Configuration
 */
export async function getRecentMedia(options?: {
  first?: number;
  mediaType?: MediaType;
}): Promise<MediaLibrary.Asset[]> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    console.warn('Media library permission denied');
    return [];
  }

  try {
    const mediaTypeMap: Record<MediaType, MediaLibrary.MediaTypeValue[]> = {
      photo: [MediaLibrary.MediaType.photo],
      video: [MediaLibrary.MediaType.video],
      all: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    };

    const result = await MediaLibrary.getAssetsAsync({
      first: options?.first ?? 20,
      mediaType: mediaTypeMap[options?.mediaType ?? 'all'],
      sortBy: [MediaLibrary.SortBy.creationTime],
    });

    return result.assets;
  } catch (error) {
    console.error('Error getting recent media:', error);
    return [];
  }
}
