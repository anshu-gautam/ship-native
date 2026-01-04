/**
 * Device Features Service
 *
 * Provides access to device features like clipboard, contacts, calendar, and device info
 *
 * Features:
 * - Clipboard operations (copy/paste)
 * - Contacts access and management
 * - Calendar integration
 * - Device information (battery, storage, network)
 */

import * as Battery from 'expo-battery';
import * as Calendar from 'expo-calendar';
import * as Clipboard from 'expo-clipboard';
import * as Contacts from 'expo-contacts';
import * as Device from 'expo-device';
import * as Network from 'expo-network';

// ============= CLIPBOARD =============

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Get text from clipboard
 */
export async function getFromClipboard(): Promise<string | null> {
  try {
    const text = await Clipboard.getStringAsync();
    return text || null;
  } catch (error) {
    console.error('Error getting from clipboard:', error);
    return null;
  }
}

/**
 * Check if clipboard has string content
 */
export async function hasClipboardString(): Promise<boolean> {
  try {
    return await Clipboard.hasStringAsync();
  } catch (error) {
    console.error('Error checking clipboard:', error);
    return false;
  }
}

// ============= CONTACTS =============

export interface ContactInfo {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers?: Array<{ number?: string; label?: string }>;
  emails?: Array<{ email?: string; label?: string }>;
  company?: string;
  jobTitle?: string;
  image?: { uri?: string };
}

/**
 * Request contacts permission
 */
export async function requestContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Get all contacts
 */
export async function getContacts(options?: {
  pageSize?: number;
  pageOffset?: number;
  fields?: Array<Contacts.Fields>;
}): Promise<ContactInfo[]> {
  try {
    const { status } = await Contacts.getPermissionsAsync();
    if (status !== 'granted') {
      const granted = await requestContactsPermission();
      if (!granted) return [];
    }

    const { data } = await Contacts.getContactsAsync({
      pageSize: options?.pageSize,
      pageOffset: options?.pageOffset,
      fields: options?.fields || [
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.FirstName,
        Contacts.Fields.LastName,
        Contacts.Fields.Company,
        Contacts.Fields.JobTitle,
        Contacts.Fields.Image,
      ],
    });

    return data.map((contact) => ({
      id: contact.id,
      name: contact.name,
      firstName: contact.firstName ?? undefined,
      lastName: contact.lastName ?? undefined,
      phoneNumbers: contact.phoneNumbers,
      emails: contact.emails,
      company: contact.company ?? undefined,
      jobTitle: contact.jobTitle ?? undefined,
      image: contact.image ?? undefined,
    }));
  } catch (error) {
    console.error('Error getting contacts:', error);
    return [];
  }
}

/**
 * Get contact by ID
 */
export async function getContactById(contactId: string): Promise<ContactInfo | null> {
  try {
    const contact = await Contacts.getContactByIdAsync(contactId);
    if (!contact) return null;

    return {
      id: contact.id,
      name: contact.name,
      firstName: contact.firstName ?? undefined,
      lastName: contact.lastName ?? undefined,
      phoneNumbers: contact.phoneNumbers,
      emails: contact.emails,
      company: contact.company ?? undefined,
      jobTitle: contact.jobTitle ?? undefined,
      image: contact.image ?? undefined,
    };
  } catch (error) {
    console.error('Error getting contact:', error);
    return null;
  }
}

// ============= CALENDAR =============

export interface CalendarEvent {
  id?: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  alarms?: Array<{ relativeOffset: number }>; // minutes before event
}

/**
 * Request calendar permission
 */
export async function requestCalendarPermission(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

/**
 * Get all calendars
 */
export async function getCalendars(): Promise<Calendar.Calendar[]> {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      const granted = await requestCalendarPermission();
      if (!granted) return [];
    }

    return await Calendar.getCalendarsAsync();
  } catch (error) {
    console.error('Error getting calendars:', error);
    return [];
  }
}

/**
 * Create calendar event
 */
export async function createCalendarEvent(
  event: CalendarEvent,
  calendarId?: string
): Promise<string | null> {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      const granted = await requestCalendarPermission();
      if (!granted) return null;
    }

    let targetCalendarId = calendarId;

    // If no calendar ID provided, get default calendar
    if (!targetCalendarId) {
      const calendars = await Calendar.getCalendarsAsync();
      const defaultCalendar = calendars.find((cal) => cal.allowsModifications);
      if (!defaultCalendar) {
        console.error('No writable calendar found');
        return null;
      }
      targetCalendarId = defaultCalendar.id;
    }

    const eventId = await Calendar.createEventAsync(targetCalendarId, {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      notes: event.notes,
      alarms: event.alarms,
    });

    return eventId;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

// ============= DEVICE INFO =============

export interface DeviceInfo {
  // Device hardware
  brand: string | null;
  manufacturer: string | null;
  modelName: string | null;
  modelId: string | null;
  designName: string | null;
  productName: string | null;
  deviceYearClass: number | null;
  totalMemory: number | null;

  // OS info
  osName: string | null;
  osVersion: string | null;
  osBuildId: string | null;
  osInternalBuildId: string | null;
  platformApiLevel: number | null;

  // Device type
  deviceType: Device.DeviceType | null;
  isDevice: boolean;
}

/**
 * Get device information
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  return {
    brand: Device.brand,
    manufacturer: Device.manufacturer,
    modelName: Device.modelName,
    modelId: Device.modelId,
    designName: Device.designName,
    productName: Device.productName,
    deviceYearClass: Device.deviceYearClass,
    totalMemory: Device.totalMemory,
    osName: Device.osName,
    osVersion: Device.osVersion,
    osBuildId: Device.osBuildId,
    osInternalBuildId: Device.osInternalBuildId,
    platformApiLevel: Device.platformApiLevel,
    deviceType: Device.deviceType,
    isDevice: Device.isDevice,
  };
}

/**
 * Get battery level (0-1)
 */
export async function getBatteryLevel(): Promise<number> {
  try {
    return await Battery.getBatteryLevelAsync();
  } catch (error) {
    console.error('Error getting battery level:', error);
    return -1;
  }
}

/**
 * Get battery state
 */
export async function getBatteryState(): Promise<Battery.BatteryState> {
  try {
    return await Battery.getBatteryStateAsync();
  } catch (error) {
    console.error('Error getting battery state:', error);
    return Battery.BatteryState.UNKNOWN;
  }
}

/**
 * Check if device is in low power mode
 */
export async function isLowPowerMode(): Promise<boolean> {
  try {
    return await Battery.isLowPowerModeEnabledAsync();
  } catch (error) {
    console.error('Error checking low power mode:', error);
    return false;
  }
}

/**
 * Get network state
 */
export async function getNetworkState(): Promise<Network.NetworkState> {
  try {
    return await Network.getNetworkStateAsync();
  } catch (error) {
    console.error('Error getting network state:', error);
    return {
      type: Network.NetworkStateType.UNKNOWN,
      isConnected: false,
      isInternetReachable: false,
    };
  }
}

/**
 * Get IP address
 */
export async function getIpAddress(): Promise<string | null> {
  try {
    return await Network.getIpAddressAsync();
  } catch (error) {
    console.error('Error getting IP address:', error);
    return null;
  }
}

/**
 * Check if device is connected to internet
 */
export async function isConnectedToInternet(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected === true && (state.isInternetReachable ?? false);
  } catch (error) {
    console.error('Error checking internet connection:', error);
    return false;
  }
}
