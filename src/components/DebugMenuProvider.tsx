/**
 * DebugMenuProvider Component
 *
 * Provides debug menu functionality throughout the app
 * Only renders in development mode
 */

import type React from 'react';
import { Modal } from 'react-native';
import { useDebugMenu } from '../hooks/useDebugMenu';
import { DebugMenu } from './DebugMenu';

export interface DebugMenuProviderProps {
  children: React.ReactNode;
}

export const DebugMenuProvider: React.FC<DebugMenuProviderProps> = ({ children }) => {
  const { isVisible, close } = useDebugMenu();

  // Only render in development mode
  if (!__DEV__) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}
      >
        <DebugMenu onClose={close} />
      </Modal>
    </>
  );
};
