import { useWindowDimensions } from 'react-native';

/**
 * Hook to detect if the current device is mobile based on screen width
 * Mobile devices are considered to have width less than 768px
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile(): boolean {
  // Using React Native's useWindowDimensions hook to get current screen width
  const { width } = useWindowDimensions();
  
  // Consider mobile if width is less than 768px
  return width < 768;
}
