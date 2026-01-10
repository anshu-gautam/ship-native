import { type ColorScheme, Colors } from '@/constants';
import { useUserStore } from '@/store';
import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const { preferences, setTheme } = useUserStore();

  const getActiveColorScheme = (): ColorScheme => {
    if (preferences.theme === 'system') {
      return (systemColorScheme || 'light') as ColorScheme;
    }
    return preferences.theme as ColorScheme;
  };

  const activeColorScheme = getActiveColorScheme();
  const colors = Colors[activeColorScheme];
  const isDark = activeColorScheme === 'dark';

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return {
    colors,
    isDark,
    colorScheme: activeColorScheme,
    theme: preferences.theme,
    setTheme,
    toggleTheme,
  };
};
