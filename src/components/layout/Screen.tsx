import { useTheme } from '@/hooks';
import type React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  safeArea?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  className?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  keyboardAvoiding = true,
  safeArea = true,
  edges = ['top', 'bottom'],
  className = '',
}) => {
  const { colors } = useTheme();

  const content = scroll ? (
    <ScrollView
      className={`flex-1 ${className}`}
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${className}`} style={{ backgroundColor: colors.background }}>
      {children}
    </View>
  );

  if (keyboardAvoiding) {
    const keyboardContent = (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {content}
      </KeyboardAvoidingView>
    );

    return safeArea ? (
      <SafeAreaView edges={edges} className="flex-1" style={{ backgroundColor: colors.background }}>
        {keyboardContent}
      </SafeAreaView>
    ) : (
      keyboardContent
    );
  }

  return safeArea ? (
    <SafeAreaView edges={edges} className="flex-1" style={{ backgroundColor: colors.background }}>
      {content}
    </SafeAreaView>
  ) : (
    content
  );
};
