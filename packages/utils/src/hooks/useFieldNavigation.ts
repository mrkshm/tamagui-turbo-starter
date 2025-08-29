import { useMemo } from 'react';
import { NavigationDirection } from './useEditableFields';

/**
 * Helper hook to create tab navigation wrapper functions for multiple fields
 * This reduces boilerplate code in components that use fields with tab navigation
 * 
 * @param navigateToField - The navigateToField function from useEditableFields
 * @param fieldIds - Array of field IDs to create navigation functions for
 * @returns Object with navigation functions for each field ID
 */
export function useFieldNavigation(
  navigateToField: (fieldId: string, direction: NavigationDirection) => void,
  fieldIds: string[]
) {
  // Create the navigation functions in a memoized map to keep stable identities
  const navigationFunctions = useMemo(() => {
    const map: Record<string, (direction: NavigationDirection) => void> = {};
    for (const fieldId of fieldIds) {
      map[fieldId] = (direction: NavigationDirection) => {
        navigateToField(fieldId, direction);
      };
    }
    return map;
  }, [navigateToField, fieldIds]);

  return navigationFunctions;
}
