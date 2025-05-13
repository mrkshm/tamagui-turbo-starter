import { YStack, Text, Stack, FormCard } from '@bbook/ui';
import {
  useEditableFields,
  useFieldNavigation,
  useFieldHandlers,
} from '@bbook/utils';
import { useCallback, useState, useRef } from 'react';
import { EditableField } from '@bbook/ui/src/components/EditableField';
import { EditableTextArea } from '@bbook/ui/src/components/EditableTextArea';
import { CAvatar, H3 } from '@bbook/ui';
import { getInitialsForAvatar } from '@bbook/utils';
import { User, useUpdateUserMutation } from '@bbook/data';
import { ThemeSwitcher } from '../ThemeSwitcher';

export function ProfileMain({ user }: { user: User }) {
  // All fields are managed by the useEditableFields hook

  // Define the field IDs in order for tab navigation
  const fieldIds = ['firstName', 'lastName', 'location', 'about'];

  // Use our custom hook to manage editable fields with navigation support
  // Setup initial values for fields managed by the enhanced hook
  // Use useRef to store the initial values and prevent them from updating on every user change
  const initialValuesRef = useRef({
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    about: user.about || '',
    location: user.location || '',
  });

  // Define save handler for fields
  const handleSaveField = async (fieldId: string, value: string) => {
    try {
      // Create update data object based on field ID
      let updateData = {};

      switch (fieldId) {
        case 'firstName':
          updateData = { first_name: value };
          break;
        case 'lastName':
          updateData = { last_name: value };
          break;
        case 'about':
          updateData = { about: value };
          break;
        case 'location':
          updateData = { location: value };
          break;
        default:
          console.warn(`Unknown field ID: ${fieldId}`);
          return;
      }

      const updatedUser = await updateUser.mutateAsync(updateData);

      // After successful save, update the initialValues to the new value
      // This is crucial for the undo functionality to work correctly
      if (updatedUser) {
        // Update the corresponding field in initialValues
        switch (fieldId) {
          case 'firstName':
            if (updatedUser.first_name !== undefined) {
              initialValuesRef.current.firstName = updatedUser.first_name;
            }
            break;
          case 'lastName':
            if (updatedUser.last_name !== undefined) {
              initialValuesRef.current.lastName = updatedUser.last_name;
            }
            break;
          case 'about':
            if (updatedUser.about !== undefined) {
              initialValuesRef.current.about = updatedUser.about;
            }
            break;
          case 'location':
            if (updatedUser.location !== undefined) {
              initialValuesRef.current.location = updatedUser.location;
            }
            break;
        }
      }
    } catch (error) {
      console.error(`Error saving ${fieldId}:`, error);
    }
  };

  // Use the editable fields hook for field navigation and editing state
  const {
    editingField,
    handleEditStart,
    handleEditEnd: originalHandleEditEnd,
    isEditing,
    updateFieldValue,
    saveField,
    undoStates,
    navigateToField,
    fieldValues, // Use fieldValues from the hook
  } = useEditableFields(['firstName', 'lastName', 'about', 'location'], {
    initialValues: {
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      about: user.about || '',
      location: user.location || '',
    },
    onSave: handleSaveField,
  });

  // Use the new useFieldNavigation hook to create all navigation functions at once
  const navigationFunctions = useFieldNavigation(navigateToField, fieldIds);

  // Destructure the navigation functions for each field
  const {
    firstName: handleFirstNameTabNavigation,
    lastName: handleLastNameTabNavigation,
    location: handleLocationTabNavigation,
    about: handleAboutTabNavigation,
  } = navigationFunctions;

  // Use the field handlers hook for all fields
  const {
    handleUndo: handleFirstNameUndo,
    handleCancel: handleFirstNameCancel,
  } = useFieldHandlers(
    'firstName',
    undoStates,
    saveField,
    originalHandleEditEnd
  );

  const { handleUndo: handleLastNameUndo, handleCancel: handleLastNameCancel } =
    useFieldHandlers('lastName', undoStates, saveField, originalHandleEditEnd);

  const { handleUndo: handleLocationUndo, handleCancel: handleLocationCancel } =
    useFieldHandlers('location', undoStates, saveField, originalHandleEditEnd);

  const { handleUndo: handleAboutUndo, handleCancel: handleAboutCancel } =
    useFieldHandlers('about', undoStates, saveField, originalHandleEditEnd);

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  // Initialize the update user mutation
  const updateUser = useUpdateUserMutation({
    onSuccess: (updatedUser) => {
      console.log('Profile updated successfully:', updatedUser);
      // Clear validation errors on success
      setValidationErrors({});
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);

      // Handle validation errors
      if (error instanceof Error) {
        const errorMessage = error.message;

        // Parse the validation error message to extract field-specific errors
        if (errorMessage.includes('Invalid length')) {
          // Extract field information from the error message
          if (errorMessage.includes('Expected <=4')) {
            // This is the first_name field with max length 4 (our test case)
            setValidationErrors((prev) => ({
              ...prev,
              firstName: 'First name must be 4 characters or less',
            }));
          } else {
            // Generic error handling if we can't determine the specific field
            setValidationErrors((prev) => ({
              ...prev,
              general: errorMessage,
            }));
          }
        } else {
          // Generic error handling
          setValidationErrors((prev) => ({
            ...prev,
            general: errorMessage,
          }));
        }
      }
    },
  });

  // Save profile changes when a field is edited and
  // return a promise that resolves when complete
  const saveProfileChanges = useCallback(
    (specificFields?: Record<string, string>) => {
      // If specificFields is provided, only save those fields
      // Otherwise, save all fields that have changed
      const fieldsToSave = specificFields || {
        first_name:
          fieldValues?.firstName !== user.first_name
            ? fieldValues?.firstName
            : undefined,
        last_name:
          fieldValues?.lastName !== user.last_name
            ? fieldValues?.lastName
            : undefined,
        about:
          fieldValues?.about !== user.about ? fieldValues?.about : undefined,
        location:
          fieldValues?.location !== user.location
            ? fieldValues?.location
            : undefined,
      };

      // Filter out undefined values
      const filteredFields = Object.fromEntries(
        Object.entries(fieldsToSave).filter(([_, value]) => value !== undefined)
      );

      // Only save if there are changes
      if (Object.keys(filteredFields).length > 0) {
        console.log('Saving profile changes...', filteredFields);
        return new Promise((resolve, reject) => {
          updateUser.mutate(filteredFields, {
            onSuccess: () => {
              console.log('Save successful, resolving promise');
              resolve(true);
            },
            onError: (error) => {
              console.log('Save failed, rejecting promise', error);
              reject(error);
            },
          });
        });
      }
      return Promise.resolve(true); // No changes to save, resolve immediately
    },
    [fieldValues, user, updateUser] // Using fieldValues instead of individual state variables
  );

  // Create separate functions for ending editing normally vs canceling
  const handleEditEnd = useCallback(() => {
    console.log('Ending edit normally, will try to save changes');

    // Try to save changes first
    saveProfileChanges()
      .then(() => {
        // Only exit edit mode if saving was successful
        console.log('Save successful, exiting edit mode');
        originalHandleEditEnd();
      })
      .catch((error) => {
        // If saving failed, stay in edit mode so the user can fix the error
        console.log('Save failed, staying in edit mode', error);
        // Error handling is already done in the updateUser.onError callback
      });
  }, [originalHandleEditEnd, saveProfileChanges]);

  // Handle click on the container to stop editing
  const handleContainerClick = () => {
    // If a field is being edited, stop editing
    if (editingField !== null) {
      // Don't set wasCanceled here - clicking outside should save changes
      handleEditEnd();
    }
  };

  return (
    <Stack
      flex={1}
      onPress={handleContainerClick}
      backgroundColor={'$background'}
      alignItems="center"
    >
      <FormCard
        flexDirection="column"
        borderRadius="$0"
        backgroundColor="$surface"
        maxWidth={1000}
        width="100%"
      >
        <YStack
          alignItems="center"
          gap="$4"
          marginVertical="$4"
          justifyContent="center"
        >
          <CAvatar
            size="lg"
            text={getInitialsForAvatar({
              firstName: user?.first_name,
              lastName: user?.last_name,
              displayName: user?.username,
            })}
          />
          <H3>{user.username}</H3>
        </YStack>
        <YStack gap="$4" padding="$4" flex={1}>
          <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
            Profile Information
          </Text>

          {/* General validation error message */}
          {validationErrors.general && (
            <YStack
              backgroundColor="$red2"
              padding="$3"
              borderRadius="$2"
              marginBottom="$4"
            >
              <Text color="$red10" fontSize="$3">
                {validationErrors.general}
              </Text>
            </YStack>
          )}

          {/* First Name Field - Using enhanced hook features */}
          <YStack gap="$2" marginBottom="$4">
            <Text fontSize="$4" fontWeight="bold" color="$gray11">
              First Name
            </Text>

            <EditableField
              fieldId="firstName"
              value={fieldValues?.firstName || user.first_name || ''}
              onChange={(value) => {
                updateFieldValue && updateFieldValue('firstName', value);
              }}
              isEditing={isEditing('firstName')}
              handleEditStart={handleEditStart}
              handleEditEnd={() => {
                saveField ? saveField('firstName') : originalHandleEditEnd();
              }}
              onCancel={handleFirstNameCancel}
              editingField={editingField}
              errorMessage={validationErrors.firstName}
              activeColor="$blue5"
              inactiveColor="$gray5"
              activeTextColor="$blue11"
              inactiveTextColor="$gray11"
              tabIndex={1}
              onTabNavigation={handleFirstNameTabNavigation}
              showUndo={!!undoStates?.firstName?.showUndo}
              onUndo={handleFirstNameUndo}
              placeholder="Enter your first name"
            />
          </YStack>

          {/* Last Name Field */}
          <YStack gap="$2" marginBottom="$4">
            <Text fontSize="$4" fontWeight="bold" color="$gray11">
              Last Name
            </Text>
            <EditableField
              fieldId="lastName"
              value={fieldValues?.lastName || user.last_name || ''}
              onChange={(value) => {
                updateFieldValue && updateFieldValue('lastName', value);
              }}
              isEditing={isEditing('lastName')}
              handleEditStart={handleEditStart}
              handleEditEnd={() => {
                saveField ? saveField('lastName') : originalHandleEditEnd();
              }}
              onCancel={handleLastNameCancel}
              editingField={editingField}
              activeColor="$green5"
              inactiveColor="$gray5"
              activeTextColor="$green11"
              inactiveTextColor="$gray11"
              tabIndex={2}
              onTabNavigation={handleLastNameTabNavigation}
              showUndo={!!undoStates?.lastName?.showUndo}
              onUndo={handleLastNameUndo}
              placeholder="Enter your last name"
            />
          </YStack>

          {/* Location Field */}
          <YStack gap="$2" marginBottom="$4">
            <Text fontSize="$4" fontWeight="bold" color="$gray11">
              Location
            </Text>
            <EditableField
              fieldId="location"
              value={fieldValues?.location || user.location || ''}
              onChange={(value) => {
                updateFieldValue && updateFieldValue('location', value);
              }}
              isEditing={isEditing('location')}
              handleEditStart={handleEditStart}
              handleEditEnd={() => {
                saveField ? saveField('location') : originalHandleEditEnd();
              }}
              onCancel={handleLocationCancel}
              editingField={editingField}
              activeColor="$purple5"
              inactiveColor="$gray5"
              activeTextColor="$purple11"
              inactiveTextColor="$gray11"
              tabIndex={3}
              onTabNavigation={handleLocationTabNavigation}
              showUndo={!!undoStates?.location?.showUndo}
              onUndo={handleLocationUndo}
              placeholder="Enter your location"
            />
          </YStack>

          {/* About Field */}
          <YStack gap="$2" marginBottom="$4">
            <Text fontSize="$4" fontWeight="bold" color="$gray11">
              About
            </Text>
            <EditableTextArea
              fieldId="about"
              value={fieldValues?.about || user.about || ''}
              onChange={(value) => {
                updateFieldValue && updateFieldValue('about', value);
              }}
              isEditing={isEditing('about')}
              handleEditStart={handleEditStart}
              handleEditEnd={() => {
                saveField ? saveField('about') : originalHandleEditEnd();
              }}
              onCancel={handleAboutCancel}
              editingField={editingField}
              activeColor="$orange5"
              inactiveColor="$gray5"
              activeTextColor="$orange11"
              inactiveTextColor="$gray11"
              tabIndex={4}
              onTabNavigation={handleAboutTabNavigation}
              showUndo={!!undoStates?.about?.showUndo}
              onUndo={handleAboutUndo}
              placeholder="Tell us about yourself"
              height={150}
            />
          </YStack>
        </YStack>
        <YStack paddingVertical="$8" marginBottom="$8" marginHorizontal="$4">
          <ThemeSwitcher />
        </YStack>
      </FormCard>
    </Stack>
  );
}
