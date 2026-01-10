/**
 * Social Sharing Service
 *
 * Provides sharing capabilities for text, URLs, images, and files
 * across different platforms and social networks.
 *
 * Features:
 * - Share text and URLs
 * - Share images and files
 * - Platform-specific sharing (iOS Share Sheet, Android Share Sheet)
 * - Social media deep links (WhatsApp, Twitter, etc.)
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';

export interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
  dialogTitle?: string;
}

export interface ShareFileOptions {
  fileUri: string;
  mimeType?: string;
  dialogTitle?: string;
}

/**
 * Check if sharing is available on the device
 */
export async function isSharingAvailable(): Promise<boolean> {
  return await Sharing.isAvailableAsync();
}

/**
 * Share text or URL using the native share sheet
 * @param options Share options
 */
export async function shareContent(options: ShareOptions): Promise<boolean> {
  try {
    const isAvailable = await isSharingAvailable();
    if (!isAvailable) {
      console.warn('Sharing is not available on this device');
      return false;
    }

    // For web, use Web Share API if available
    if (Platform.OS === 'web' && 'share' in navigator) {
      await (navigator as any).share({
        title: options.title,
        text: options.message,
        url: options.url,
      });
      return true;
    }

    // For native platforms, we need to share a file
    // So we'll create a temporary text file with the content
    const content = [options.title, options.message, options.url].filter(Boolean).join('\n\n');

    if (!content) {
      console.warn('No content to share');
      return false;
    }

    const tempFilePath = `${FileSystem.cacheDirectory}share-${Date.now()}.txt`;
    await FileSystem.writeAsStringAsync(tempFilePath, content);

    await Sharing.shareAsync(tempFilePath, {
      dialogTitle: options.dialogTitle || 'Share',
      mimeType: 'text/plain',
    });

    // Clean up temp file
    await FileSystem.deleteAsync(tempFilePath, { idempotent: true });

    return true;
  } catch (error) {
    console.error('Error sharing content:', error);
    return false;
  }
}

/**
 * Share a file using the native share sheet
 * @param options File share options
 */
export async function shareFile(options: ShareFileOptions): Promise<boolean> {
  try {
    const isAvailable = await isSharingAvailable();
    if (!isAvailable) {
      console.warn('Sharing is not available on this device');
      return false;
    }

    await Sharing.shareAsync(options.fileUri, {
      dialogTitle: options.dialogTitle || 'Share File',
      mimeType: options.mimeType || '*/*',
    });

    return true;
  } catch (error) {
    console.error('Error sharing file:', error);
    return false;
  }
}

/**
 * Share an image file
 * @param imageUri URI of the image file
 * @param dialogTitle Optional dialog title
 */
export async function shareImage(imageUri: string, dialogTitle?: string): Promise<boolean> {
  return await shareFile({
    fileUri: imageUri,
    mimeType: 'image/*',
    dialogTitle: dialogTitle || 'Share Image',
  });
}

/**
 * Share to WhatsApp
 * @param message Message to share
 */
export async function shareToWhatsApp(message: string): Promise<boolean> {
  try {
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }

    console.warn('WhatsApp is not installed');
    return false;
  } catch (error) {
    console.error('Error sharing to WhatsApp:', error);
    return false;
  }
}

/**
 * Share to Twitter/X
 * @param message Tweet text
 * @param url Optional URL to include
 */
export async function shareToTwitter(message: string, url?: string): Promise<boolean> {
  try {
    const tweetUrl = url
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`
      : `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;

    await Linking.openURL(tweetUrl);
    return true;
  } catch (error) {
    console.error('Error sharing to Twitter:', error);
    return false;
  }
}

/**
 * Share to Facebook
 * @param url URL to share
 */
export async function shareToFacebook(url: string): Promise<boolean> {
  try {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    await Linking.openURL(facebookUrl);
    return true;
  } catch (error) {
    console.error('Error sharing to Facebook:', error);
    return false;
  }
}

/**
 * Share to Instagram (only works with media files)
 * Note: Instagram sharing requires the Instagram app to be installed
 * and only supports images/videos, not text
 * @param mediaUri URI of the image or video
 */
export async function shareToInstagram(mediaUri: string): Promise<boolean> {
  try {
    // Instagram sharing on iOS
    if (Platform.OS === 'ios') {
      const url = `instagram://library?AssetPath=${encodeURIComponent(mediaUri)}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    }

    // For Android or if iOS URL scheme doesn't work, use native share
    return await shareImage(mediaUri, 'Share to Instagram');
  } catch (error) {
    console.error('Error sharing to Instagram:', error);
    return false;
  }
}

/**
 * Share via Email
 * @param options Email options
 */
export async function shareViaEmail(options: {
  to?: string[];
  subject?: string;
  body?: string;
}): Promise<boolean> {
  try {
    const recipients = options.to?.join(',') || '';
    const subject = encodeURIComponent(options.subject || '');
    const body = encodeURIComponent(options.body || '');

    const url = `mailto:${recipients}?subject=${subject}&body=${body}`;
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Error sharing via email:', error);
    return false;
  }
}

/**
 * Share via SMS
 * @param phoneNumber Optional phone number
 * @param message Message to send
 */
export async function shareViaSMS(message: string, phoneNumber?: string): Promise<boolean> {
  try {
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = phoneNumber
      ? `sms:${phoneNumber}${separator}body=${encodeURIComponent(message)}`
      : `sms:${separator}body=${encodeURIComponent(message)}`;

    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Error sharing via SMS:', error);
    return false;
  }
}
