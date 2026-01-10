import { useTheme } from '@/hooks';
import type React from 'react';
import {
  Pressable,
  Modal as RNModal,
  type ModalProps as RNModalProps,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ModalProps extends Partial<RNModalProps> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <Pressable className="flex-1 w-full" onPress={onClose} />
        <View
          className="w-11/12 max-w-md rounded-2xl p-6"
          style={{ backgroundColor: colors.card }}
        >
          {(title || showCloseButton) && (
            <View className="flex-row justify-between items-center mb-4">
              {title && (
                <Text className="text-xl font-bold" style={{ color: colors.text }}>
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Text className="text-2xl" style={{ color: colors.textSecondary }}>
                    ×
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {children}
        </View>
        <Pressable className="flex-1 w-full" onPress={onClose} />
      </View>
    </RNModal>
  );
};
