import type { Href } from 'expo-router';

export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)/sign-in': undefined;
  '(auth)/sign-up': undefined;
  '(auth)/forgot-password': undefined;
  '+not-found': undefined;
};

export type TabParamList = {
  index: undefined;
  profile: undefined;
  settings: undefined;
};

export type AppRoute = Href;
