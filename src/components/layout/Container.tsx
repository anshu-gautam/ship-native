import type React from 'react';
import { View } from 'react-native';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return <View className={`px-4 ${className}`}>{children}</View>;
};
