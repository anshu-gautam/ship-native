import { useTheme } from '@/hooks';
import React, { useState } from 'react';
import { Text, TextInput, type TextInputProps, TouchableOpacity, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      secureTextEntry,
      containerClassName = '',
      className = '',
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    return (
      <View className={`mb-4 ${containerClassName}`}>
        {label && (
          <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>
            {label}
          </Text>
        )}
        <View
          className={`h-12 flex-row items-center rounded-lg px-4 border ${
            error
              ? 'border-error-500'
              : isFocused
                ? 'border-primary-500'
                : 'border-gray-300 dark:border-gray-600'
          } ${className}`}
          style={{
            backgroundColor: colors.surface,
          }}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className="flex-1 text-base"
            style={{ color: colors.text }}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={isSecure}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {secureTextEntry && (
            <TouchableOpacity onPress={() => setIsSecure(!isSecure)} className="ml-2">
              <Text style={{ color: colors.textSecondary }}>{isSecure ? '👁' : '👁‍🗨'}</Text>
            </TouchableOpacity>
          )}
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
        {error && <Text className="text-error-500 text-sm mt-1">{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';
