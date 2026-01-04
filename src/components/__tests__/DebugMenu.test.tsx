/**
 * DebugMenu Component Tests
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { DebugMenu } from '../DebugMenu';

// Mock expo modules
jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
  applicationId: 'com.example.app',
}));

jest.mock('expo-device', () => ({
  modelName: 'iPhone 15',
  isDevice: false,
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    sdkVersion: '54.0.0',
  },
}));

jest.mock('react-native-mmkv', () => ({
  useMMKVString: () => [undefined, jest.fn()],
}));

describe('DebugMenu', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<DebugMenu onClose={mockOnClose} />);
    expect(screen.getByText('🛠️ Debug Menu')).toBeTruthy();
  });

  it('displays app information', () => {
    render(<DebugMenu onClose={mockOnClose} />);
    expect(screen.getByText('App Information')).toBeTruthy();
    expect(screen.getByText('Version')).toBeTruthy();
    expect(screen.getByText('1.0.0')).toBeTruthy();
  });

  it('displays device information', () => {
    render(<DebugMenu onClose={mockOnClose} />);
    expect(screen.getByText('Device Information')).toBeTruthy();
    expect(screen.getByText('Device')).toBeTruthy();
  });

  it('displays feature flags section', () => {
    render(<DebugMenu onClose={mockOnClose} />);
    expect(screen.getByText('Feature Flags')).toBeTruthy();
    expect(screen.getByText('Mock Data')).toBeTruthy();
    expect(screen.getByText('Debug Logging')).toBeTruthy();
  });

  it('displays API configuration', () => {
    render(<DebugMenu onClose={mockOnClose} />);
    expect(screen.getByText('API Configuration')).toBeTruthy();
    expect(screen.getByText('Production')).toBeTruthy();
    expect(screen.getByText('Staging')).toBeTruthy();
    expect(screen.getByText('Local')).toBeTruthy();
  });

  it('displays storage management options', () => {
    render(<DebugMenu onClose={mockOnClose} />);
    expect(screen.getByText('Storage Management')).toBeTruthy();
    expect(screen.getByText('Clear AsyncStorage')).toBeTruthy();
    expect(screen.getByText('Clear MMKV Storage')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    render(<DebugMenu onClose={mockOnClose} />);
    const closeButton = screen.getByText('Close');
    fireEvent.press(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays environment variables section', () => {
    render(<DebugMenu onClose={mockOnClose} />);
    expect(screen.getByText('Environment Variables')).toBeTruthy();
  });
});
