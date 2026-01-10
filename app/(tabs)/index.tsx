import { Button, Card, Container, Screen } from '@/components';
import { useAuth, useI18n, useTheme } from '@/hooks';
import type React from 'react';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <Screen scroll>
      <Container className="py-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
            {t('home.title')}
          </Text>
          <Text className="text-base" style={{ color: colors.textSecondary }}>
            {t('common.welcome')}, {user?.firstName || 'User'}!
          </Text>
        </View>

        <Card className="mb-4">
          <Text className="text-xl font-bold mb-2" style={{ color: colors.text }}>
            {t('home.getStarted')}
          </Text>
          <Text className="text-base mb-4" style={{ color: colors.textSecondary }}>
            This is a production-ready React Native Expo boilerplate with all essential features
            pre-configured.
          </Text>
          <View className="flex-row">
            <Button variant="primary" className="flex-1 mr-2">
              Learn More
            </Button>
            <Button variant="outline" className="flex-1 ml-2">
              Documentation
            </Button>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>
            Features Included
          </Text>
          <View className="space-y-2">
            <FeatureItem>✅ Expo Router v8+ with typed routes</FeatureItem>
            <FeatureItem>✅ Clerk authentication</FeatureItem>
            <FeatureItem>✅ Supabase integration</FeatureItem>
            <FeatureItem>✅ NativeWind (Tailwind CSS)</FeatureItem>
            <FeatureItem>✅ Zustand + MMKV storage</FeatureItem>
            <FeatureItem>✅ TanStack Query v5</FeatureItem>
            <FeatureItem>✅ React Hook Form + Zod</FeatureItem>
            <FeatureItem>✅ i18next with RTL support</FeatureItem>
            <FeatureItem>✅ Sentry error monitoring</FeatureItem>
            <FeatureItem>✅ Dark mode support</FeatureItem>
          </View>
        </Card>
      </Container>
    </Screen>
  );
}

const FeatureItem = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();
  return (
    <View className="py-1">
      <Text className="text-base" style={{ color: colors.text }}>
        {children}
      </Text>
    </View>
  );
};
