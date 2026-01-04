import { useI18n, useTheme } from '@/hooks';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color }) => <AIIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

// Simple icon components (you can replace these with proper icons from @expo/vector-icons)
const HomeIcon = ({ color }: { color: string }) => <span style={{ fontSize: 24, color }}>🏠</span>;

const AIIcon = ({ color }: { color: string }) => <span style={{ fontSize: 24, color }}>🤖</span>;

const ProfileIcon = ({ color }: { color: string }) => (
  <span style={{ fontSize: 24, color }}>👤</span>
);

const SettingsIcon = ({ color }: { color: string }) => (
  <span style={{ fontSize: 24, color }}>⚙️</span>
);
