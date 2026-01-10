import { Card, Container, Screen } from '@/components';
import { useI18n, useTheme } from '@/hooks';
import { useUserStore } from '@/store';
import Constants from 'expo-constants';
import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { language, changeLanguage, t } = useI18n();
  const { preferences, setNotificationsEnabled } = useUserStore();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
  ];

  return (
    <Screen scroll>
      <Container className="py-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
            {t('settings.title')}
          </Text>
        </View>

        <Card className="mb-4">
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            {t('settings.appearance')}
          </Text>

          <View className="mb-4">
            <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>
              {t('settings.theme')}
            </Text>
            <View className="flex-row space-x-2">
              <ThemeButton
                label={t('settings.lightMode')}
                active={theme === 'light'}
                onPress={() => setTheme('light')}
              />
              <ThemeButton
                label={t('settings.darkMode')}
                active={theme === 'dark'}
                onPress={() => setTheme('dark')}
              />
              <ThemeButton
                label={t('settings.systemMode')}
                active={theme === 'system'}
                onPress={() => setTheme('system')}
              />
            </View>
          </View>

          <View>
            <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>
              {t('settings.language')}
            </Text>
            <View className="flex-row space-x-2 flex-wrap">
              {languages.map((lang) => (
                <ThemeButton
                  key={lang.code}
                  label={lang.name}
                  active={language === lang.code}
                  onPress={() => changeLanguage(lang.code)}
                />
              ))}
            </View>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            {t('settings.notifications')}
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-base" style={{ color: colors.text }}>
              Enable Notifications
            </Text>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </Card>

        <Card>
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            {t('settings.about')}
          </Text>
          <SettingRow
            label={t('settings.version')}
            value={Constants.expoConfig?.version || '1.0.0'}
          />
          <SettingRow label="App Name" value={Constants.expoConfig?.name || 'App'} />
        </Card>
      </Container>
    </Screen>
  );
}

const ThemeButton = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-lg ${active ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <Text className="text-sm font-medium" style={{ color: active ? '#fff' : colors.text }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const SettingRow = ({ label, value }: { label: string; value: string }) => {
  const { colors } = useTheme();
  return (
    <View className="flex-row justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <Text className="text-base" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      <Text className="text-base font-medium" style={{ color: colors.text }}>
        {value}
      </Text>
    </View>
  );
};
