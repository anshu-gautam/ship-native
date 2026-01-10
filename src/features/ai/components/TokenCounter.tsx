import { useTheme } from '@/hooks';
import type React from 'react';
import { Text, View } from 'react-native';

interface TokenCounterProps {
  tokens: number;
  maxTokens?: number;
}

/**
 * Estimate tokens from text (rough approximation)
 * Real token counting should use tiktoken or similar
 */
export const estimateTokens = (text: string): number => {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
};

export const TokenCounter: React.FC<TokenCounterProps> = ({ tokens, maxTokens = 4096 }) => {
  const { colors } = useTheme();
  const percentage = (tokens / maxTokens) * 100;

  const getColor = () => {
    if (percentage > 90) return colors.error;
    if (percentage > 70) return colors.warning;
    return colors.success;
  };

  return (
    <View className="flex-row items-center">
      <View
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ backgroundColor: `${getColor()}20` }}
      >
        <Text className="text-xs font-bold" style={{ color: getColor() }}>
          {tokens}
        </Text>
      </View>
      <View className="ml-2">
        <Text className="text-xs font-medium" style={{ color: colors.text }}>
          Tokens
        </Text>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>
          {maxTokens - tokens} left
        </Text>
      </View>
    </View>
  );
};
