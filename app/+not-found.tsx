import { Button, Container, Screen } from '@/components';
import { useTheme } from '@/hooks';
import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Screen>
        <Container className="flex-1 justify-center items-center">
          <Text className="text-6xl mb-4">404</Text>
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            Page Not Found
          </Text>
          <Text className="text-base mb-8 text-center" style={{ color: colors.textSecondary }}>
            The page you're looking for doesn't exist.
          </Text>
          <Link href="/" asChild>
            <Button>Go to Home</Button>
          </Link>
        </Container>
      </Screen>
    </>
  );
}
