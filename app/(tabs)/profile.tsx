import { Button, Card, Container, Screen } from '@/components';
import { useAuth, useI18n, useTheme } from '@/hooks';
import { router } from 'expo-router';
import React from 'react';
import { Image, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const { t } = useI18n();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <Screen scroll>
      <Container className="py-6">
        <Card className="mb-6 items-center">
          <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-4">
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} className="w-24 h-24 rounded-full" />
            ) : (
              <Text className="text-4xl">👤</Text>
            )}
          </View>
          <Text className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
            {user?.fullName || 'User'}
          </Text>
          <Text className="text-base mb-4" style={{ color: colors.textSecondary }}>
            {user?.email}
          </Text>
          <Button
            variant="outline"
            onPress={() => console.log('Edit profile - not implemented yet')}
          >
            {t('profile.editProfile')}
          </Button>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            Profile Information
          </Text>
          <InfoRow label={t('profile.firstName')} value={user?.firstName || 'N/A'} />
          <InfoRow label={t('profile.lastName')} value={user?.lastName || 'N/A'} />
          <InfoRow label={t('auth.email')} value={user?.email || 'N/A'} />
        </Card>

        <Button variant="danger" fullWidth onPress={handleSignOut}>
          {t('auth.signOut')}
        </Button>
      </Container>
    </Screen>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  const { colors } = useTheme();
  return (
    <View className="flex-row justify-between py-3 border-b border-gray-200 dark:border-gray-700">
      <Text className="text-base font-medium" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      <Text className="text-base" style={{ color: colors.text }}>
        {value}
      </Text>
    </View>
  );
};
