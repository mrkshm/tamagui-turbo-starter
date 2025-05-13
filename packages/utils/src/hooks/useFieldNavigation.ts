import { useCallback } from 'react';
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
  // Create an object to store all the navigation functions
  const navigationFunctions: Record<string, (direction: NavigationDirection) => void> = {};
  
  // Create a navigation function for each field ID
  fieldIds.forEach(fieldId => {
    navigationFunctions[fieldId] = useCallback(
      (direction: NavigationDirection) => {
        navigateToField(fieldId, direction);
      },
      [navigateToField, fieldId]
    );
  });
  
  return navigationFunctions;
}
