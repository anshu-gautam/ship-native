import { useHaptics, useTheme } from '@/hooks';
import type React from 'react';
import { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
}) => {
  const { colors } = useTheme();
  const { light } = useHaptics();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      light();
      onPress?.();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: `bg-primary-500 ${disabled ? 'opacity-50' : ''}`,
          text: 'text-white font-semibold',
        };
      case 'secondary':
        return {
          container: `bg-secondary-500 ${disabled ? 'opacity-50' : ''}`,
          text: 'text-white font-semibold',
        };
      case 'outline':
        return {
          container: `border-2 border-primary-500 ${disabled ? 'opacity-50' : ''}`,
          text: 'text-primary-500 font-semibold',
        };
      case 'ghost':
        return {
          container: `${disabled ? 'opacity-50' : ''}`,
          text: 'text-primary-500 font-semibold',
        };
      case 'danger':
        return {
          container: `bg-error-500 ${disabled ? 'opacity-50' : ''}`,
          text: 'text-white font-semibold',
        };
      default:
        return {
          container: `bg-primary-500 ${disabled ? 'opacity-50' : ''}`,
          text: 'text-white font-semibold',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-10 px-4',
          text: 'text-sm',
        };
      case 'md':
        return {
          container: 'h-12 px-6',
          text: 'text-base',
        };
      case 'lg':
        return {
          container: 'h-14 px-8',
          text: 'text-lg',
        };
      default:
        return {
          container: 'h-12 px-6',
          text: 'text-base',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={{ transform: [{ scale: scaleAnim }] }}
      className={`rounded-lg items-center justify-center flex-row ${variantStyles.container} ${sizeStyles.container} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.text}
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`${variantStyles.text} ${sizeStyles.text}`}>{children}</Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </AnimatedTouchable>
  );
};
