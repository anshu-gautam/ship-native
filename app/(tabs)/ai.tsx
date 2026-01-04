import { Button, Card, Container, Screen } from '@/components';
import { ChatMessage } from '@/features/ai/components/ChatMessage';
import { TokenCounter, estimateTokens } from '@/features/ai/components/TokenCounter';
import { useAIChat } from '@/features/ai/hooks/useAIChat';
import { useHaptics, useTheme } from '@/hooks';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image as RNImage,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function AIPlaygroundScreen() {
  const { colors } = useTheme();
  const { light } = useHaptics();

  const [activeTab, setActiveTab] = useState<'chat' | 'complete' | 'image'>('chat');

  return (
    <Screen>
      <Container className="flex-1 py-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
            AI Playground
          </Text>
          <Text className="text-base" style={{ color: colors.textSecondary }}>
            Explore AI capabilities with streaming chat, completions, and image generation
          </Text>
        </View>

        {/* Tab Selector */}
        <View className="flex-row mb-6 gap-2">
          <Button
            variant={activeTab === 'chat' ? 'primary' : 'outline'}
            onPress={() => {
              light();
              setActiveTab('chat');
            }}
            className="flex-1"
          >
            💬 Chat
          </Button>
          <Button
            variant={activeTab === 'complete' ? 'primary' : 'outline'}
            onPress={() => {
              light();
              setActiveTab('complete');
            }}
            className="flex-1"
          >
            ✍️ Complete
          </Button>
          <Button
            variant={activeTab === 'image' ? 'primary' : 'outline'}
            onPress={() => {
              light();
              setActiveTab('image');
            }}
            className="flex-1"
          >
            🎨 Image
          </Button>
        </View>

        {/* Tab Content */}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'complete' && <CompletionTab />}
        {activeTab === 'image' && <ImageTab />}
      </Container>
    </Screen>
  );
}

/**
 * Chat Tab - Streaming conversational AI
 */
function ChatTab() {
  const { colors } = useTheme();
  const { success, error: errorHaptic } = useHaptics();
  const [input, setInput] = useState('');

  const { messages, isLoading, isStreaming, error, send, abort, clear, isOnline } = useAIChat();

  const handleSend = async () => {
    if (!input.trim()) return;

    await send(input);
    setInput('');
    success();
  };

  const handleAbort = () => {
    abort();
    errorHaptic();
  };

  const tokens = messages.reduce((sum, msg) => sum + estimateTokens(msg.content), 0);

  return (
    <View className="flex-1">
      {!isOnline && (
        <View className="bg-warning-100 p-3 rounded-lg mb-4">
          <Text className="text-warning-800 text-center">
            ⚠️ You're offline. Connect to use AI features.
          </Text>
        </View>
      )}

      <Card className="flex-1 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Chat with AI
          </Text>
          <View className="flex-row gap-2">
            <TokenCounter tokens={tokens} />
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onPress={clear}>
                Clear
              </Button>
            )}
          </View>
        </View>

        <FlatList
          data={messages}
          renderItem={({ item }) => <ChatMessage message={item} />}
          keyExtractor={(item) => item.id}
          className="flex-1 mb-4"
          contentContainerClassName="pb-4"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-6xl mb-4">💬</Text>
              <Text className="text-base text-center" style={{ color: colors.textSecondary }}>
                Start a conversation with AI
              </Text>
            </View>
          }
        />

        {error && (
          <View className="bg-error-100 p-3 rounded-lg mb-4">
            <Text className="text-error-800">{error.message}</Text>
          </View>
        )}

        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 h-12 rounded-lg px-4 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            editable={!isLoading && isOnline}
            multiline
          />

          {isLoading || isStreaming ? (
            <Button variant="danger" onPress={handleAbort}>
              Stop
            </Button>
          ) : (
            <Button onPress={handleSend} disabled={!input.trim() || !isOnline}>
              Send
            </Button>
          )}
        </View>

        {isStreaming && (
          <View className="mt-2 flex-row items-center">
            <ActivityIndicator size="small" color={colors.primary} />
            <Text className="ml-2 text-sm" style={{ color: colors.textSecondary }}>
              AI is typing...
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}

/**
 * Completion Tab - Single-shot text completion
 */
function CompletionTab() {
  const { colors } = useTheme();
  const { success } = useHaptics();
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer your-token', // TODO: Get from auth
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get completion');
      }

      const data = await response.json();
      setResult(data.text);
      success();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const tokens = estimateTokens(prompt + result);

  return (
    <View className="flex-1">
      <Card className="flex-1">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Text Completion
          </Text>
          <TokenCounter tokens={tokens} />
        </View>

        <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
          Prompt
        </Text>
        <TextInput
          className="h-32 rounded-lg p-4 mb-4 border"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          }}
          placeholder="Enter your prompt here..."
          placeholderTextColor={colors.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          textAlignVertical="top"
        />

        <Button fullWidth onPress={handleComplete} loading={isLoading} disabled={!prompt.trim()}>
          Generate Completion
        </Button>

        {error && (
          <View className="bg-error-100 p-3 rounded-lg mt-4">
            <Text className="text-error-800">{error}</Text>
          </View>
        )}

        {result && (
          <View className="mt-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Result
            </Text>
            <ScrollView
              className="h-48 rounded-lg p-4 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text }}>{result}</Text>
            </ScrollView>
          </View>
        )}
      </Card>
    </View>
  );
}

/**
 * Image Tab - AI image generation
 */
function ImageTab() {
  const { colors } = useTheme();
  const { success } = useHaptics();
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer your-token', // TODO: Get from auth
        },
        body: JSON.stringify({
          prompt,
          size: '1024x1024',
          quality: 'standard',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(data.images[0]?.url || null);
      success();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <Card className="flex-1">
        <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
          Generate Image
        </Text>

        <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
          Describe your image
        </Text>
        <TextInput
          className="h-24 rounded-lg p-4 mb-4 border"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          }}
          placeholder="A serene landscape with mountains and a lake..."
          placeholderTextColor={colors.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          textAlignVertical="top"
        />

        <Button fullWidth onPress={handleGenerate} loading={isLoading} disabled={!prompt.trim()}>
          Generate Image
        </Button>

        {error && (
          <View className="bg-error-100 p-3 rounded-lg mt-4">
            <Text className="text-error-800">{error}</Text>
          </View>
        )}

        {imageUrl && (
          <View className="mt-4">
            <RNImage
              source={{ uri: imageUrl }}
              className="w-full aspect-square rounded-lg"
              resizeMode="cover"
            />
          </View>
        )}

        {isLoading && (
          <View className="mt-4 items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-4 text-center" style={{ color: colors.textSecondary }}>
              Generating your image...
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}
