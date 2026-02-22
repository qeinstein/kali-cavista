import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

/**
 * Entry route — immediately redirects to the correct screen based on auth state.
 * Using <Redirect /> is the recommended Expo Router pattern: it fires once during
 * the render cycle with no useEffect / useSegments involved, so there is no risk
 * of an infinite navigation loop.
 */
export default function Index() {
    const token = useAuthStore((s) => s.token);
    const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

    if (token) {
        return <Redirect href="/(tabs)" />;
    }

    if (!hasCompletedOnboarding) {
        return <Redirect href="/onboarding/welcome" />;
    }

    return <Redirect href="/auth/login" />;
}
