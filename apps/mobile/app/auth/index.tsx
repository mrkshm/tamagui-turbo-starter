import { Redirect } from 'expo-router';

/**
 * Default route for the auth directory
 * Redirects to the login screen
 */
export default function AuthIndex() {
  return <Redirect href="/auth/login" />;
}
