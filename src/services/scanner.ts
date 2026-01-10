/**
 * QR/Barcode Scanner Service
 *
 * Provides QR code and barcode scanning capabilities
 *
 * Features:
 * - QR code scanning
 * - Multiple barcode format support
 * - Permission handling
 * - Camera access management
 */

import { BarCodeScanner, type BarCodeScannerResult } from 'expo-barcode-scanner';

export type BarcodeType = keyof typeof BarCodeScanner.Constants.BarCodeType;

export interface ScanResult {
  data: string;
  type: string;
  bounds?: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
}

/**
 * Request camera permission for scanning
 */
export async function requestScannerPermission(): Promise<boolean> {
  const { status } = await BarCodeScanner.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Check if camera permission is granted
 */
export async function hasScannerPermission(): Promise<boolean> {
  const { status } = await BarCodeScanner.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Parse scan result into structured format
 */
export function parseScanResult(result: BarCodeScannerResult): ScanResult {
  return {
    data: result.data,
    type: result.type,
    bounds: result.bounds,
  };
}

/**
 * Validate if scanned data is a valid URL
 */
export function isValidUrl(data: string): boolean {
  try {
    new URL(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate if scanned data is a valid email
 */
export function isValidEmail(data: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(data);
}

/**
 * Extract contact information from vCard QR code
 */
export function parseVCard(data: string): {
  name?: string;
  phone?: string;
  email?: string;
  organization?: string;
} | null {
  if (!data.startsWith('BEGIN:VCARD')) {
    return null;
  }

  const lines = data.split('\n');
  const contact: Record<string, string> = {};

  for (const line of lines) {
    if (line.startsWith('FN:')) {
      contact.name = line.substring(3).trim();
    } else if (line.startsWith('TEL:')) {
      contact.phone = line.substring(4).trim();
    } else if (line.startsWith('EMAIL:')) {
      contact.email = line.substring(6).trim();
    } else if (line.startsWith('ORG:')) {
      contact.organization = line.substring(4).trim();
    }
  }

  return Object.keys(contact).length > 0 ? contact : null;
}

/**
 * Parse WiFi QR code
 * Format: WIFI:S:<SSID>;T:<WPA|WEP|>;P:<password>;;
 */
export function parseWiFiQR(data: string): {
  ssid?: string;
  password?: string;
  security?: string;
} | null {
  if (!data.startsWith('WIFI:')) {
    return null;
  }

  const parts = data.substring(5).split(';');
  const wifi: Record<string, string> = {};

  for (const part of parts) {
    const [key, value] = part.split(':');
    if (key === 'S') wifi.ssid = value;
    if (key === 'P') wifi.password = value;
    if (key === 'T') wifi.security = value;
  }

  return Object.keys(wifi).length > 0 ? wifi : null;
}

/**
 * Get human-readable barcode type name
 */
export function getBarcodeTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    qr: 'QR Code',
    pdf417: 'PDF417',
    aztec: 'Aztec',
    ean13: 'EAN-13',
    ean8: 'EAN-8',
    upc_e: 'UPC-E',
    code39: 'Code 39',
    code93: 'Code 93',
    code128: 'Code 128',
    codabar: 'Codabar',
    itf14: 'ITF-14',
    datamatrix: 'Data Matrix',
  };

  return typeMap[type.toLowerCase()] || type;
}

/**
 * Supported barcode types
 */
export const BARCODE_TYPES = {
  QR: BarCodeScanner.Constants.BarCodeType.qr,
  PDF417: BarCodeScanner.Constants.BarCodeType.pdf417,
  AZTEC: BarCodeScanner.Constants.BarCodeType.aztec,
  EAN13: BarCodeScanner.Constants.BarCodeType.ean13,
  EAN8: BarCodeScanner.Constants.BarCodeType.ean8,
  UPC_E: BarCodeScanner.Constants.BarCodeType.upc_e,
  CODE39: BarCodeScanner.Constants.BarCodeType.code39,
  CODE93: BarCodeScanner.Constants.BarCodeType.code93,
  CODE128: BarCodeScanner.Constants.BarCodeType.code128,
  CODABAR: BarCodeScanner.Constants.BarCodeType.codabar,
  ITF14: BarCodeScanner.Constants.BarCodeType.itf14,
  DATA_MATRIX: BarCodeScanner.Constants.BarCodeType.datamatrix,
};
