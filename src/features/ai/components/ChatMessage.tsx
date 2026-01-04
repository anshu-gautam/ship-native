import { useTheme } from '@/hooks';
import type React from 'react';
import { Text, View } from 'react-native';
import type { Message } from '../hooks/useAIChat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { colors } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <Text
          className={`text-base ${isUser ? 'text-white' : ''}`}
          style={!isUser ? { color: colors.text } : undefined}
        >
          {message.content}
        </Text>
      </View>
      <Text className="text-xs mt-1 px-2" style={{ color: colors.textSecondary }}>
        {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};
