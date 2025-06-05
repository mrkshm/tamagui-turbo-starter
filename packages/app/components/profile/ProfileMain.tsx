import { YStack, Text, Stack, FormCard, XStack, Spinner } from '@bbook/ui';
import {
  useEditableFields,
  useFieldNavigation,
  useFieldHandlers,
} from '@bbook/utils';
import { useCallback, useState, useRef, useEffect } from 'react';
import { TextInput } from 'react-native';
import { EditableField } from '@bbook/ui/src/components/EditableField';
import { EditableTextArea } from '@bbook/ui/src/components/EditableTextArea';
import { H3 } from '@bbook/ui';
import { getInitialsForAvatar } from '@bbook/utils';
import { User, useUpdateUserMutation, useUsernameCheck, useUpdateUsernameMutation } from '@bbook/data';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { AvatarUploader } from '../avatar';
import { useTranslation } from '@bbook/i18n';

export function ProfileMain({ user }: { user: User }) {
  const { t } = useTranslation();
  
  // Username availability check with built-in debouncing
  const { isChecking, isAvailable, checkUsername } = useUsernameCheck(500);
  const [canSaveUsername, setCanSaveUsername] = useState(true);
  
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  
  // Update canSaveUsername whenever isAvailable changes
  useEffect(() => {
    // If we're not checking and have a result, update canSaveUsername
    if (!isChecking && isAvailable !== null) {
      setCanSaveUsername(isAvailable);
    }
  }, [isChecking, isAvailable]);
  


  // All fields are managed by the useEditableFields hook

  // Define the field IDs in order for tab navigation
  const fieldIds = ['username', 'firstName', 'lastName', 'location', 'about'];

  // Use our custom hook to manage editable fields with navigation support
  // Setup initial values for fields managed by the enhanced hook
  // Use useRef to store the initial values and prevent them from updating on every user change
  const initialValuesRef = useRef({
    username: user.username || '',
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    about: user.about || '',
    location: user.location || '',
  });

  // Custom save handler that delegates to different mutations based on field
  const handleSaveField = async (fieldId: string, value: string) => {
    try {
      let updatedUser: User | null = null;

      // Special handling for username field
      if (fieldId === 'username') {
        // Check if username is available before saving
        if (!canSaveUsername) {
          console.error('Cannot save username - username is not available');
          setValidationErrors({
            username: 'Username is not available'
          });
          return;
        }
        
        try {
          // Use the dedicated username update endpoint
          updatedUser = await updateUsername.mutateAsync(value);
          // End editing after successful save
          originalHandleEditEnd();
        } catch (error) {
          console.error('Error updating username:', error);
          setValidationErrors({
            username: 'Failed to update username'
          });
          return;
        }
      } else {
        // For all other fields, use the general update endpoint
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
  
        updatedUser = await updateUser.mutateAsync(updateData);
      }

      // After successful save, update the initialValues to the new value
      // This is crucial for the undo functionality to work correctly
      if (updatedUser) {
        // Update the corresponding field in initialValues
        switch (fieldId) {
          case 'username':
            if (updatedUser.username !== undefined) {
              initialValuesRef.current.username = updatedUser.username;
            }
            break;
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
  } = useEditableFields(
    ['username', 'firstName', 'lastName', 'about', 'location'],
    {
      initialValues: {
        username: user.username || '',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        about: user.about || '',
        location: user.location || '',
      },
      onSave: handleSaveField,
    }
  );

  // Reset validation errors when the user starts editing the username field
  useEffect(() => {
    if (isEditing && isEditing('username')) {
      // Clear any username-specific validation errors
      setValidationErrors(prev => ({
        ...prev,
        username: undefined
      }));
    }
  }, [isEditing]);

  // Use the new useFieldNavigation hook to create all navigation functions at once
  const navigationFunctions = useFieldNavigation(navigateToField, fieldIds);

  // Destructure the navigation functions for each field
  const {
    firstName: handleFirstNameTabNavigation,
    lastName: handleLastNameTabNavigation,
    location: handleLocationTabNavigation,
    about: handleAboutTabNavigation,
  } = navigationFunctions;

  // For username field, we don't want to use the regular saveField function
  // Instead, we'll create a custom handler that doesn't do anything
  const noopSave = useCallback(() => Promise.resolve(), []);
  
  // Use the field handlers hook for username with a noop save function
  const { handleUndo: handleUsernameUndo } = useFieldHandlers(
    'username', 
    undoStates, 
    noopSave, // Use noopSave instead of saveField
    originalHandleEditEnd
  );
  
  // Custom cancel handler for username that resets validation state
  const handleUsernameCancel = useCallback(() => {
    // Reset username validation state
    setCanSaveUsername(true);
    setValidationErrors(prev => ({
      ...prev,
      username: undefined
    }));
    
    // Restore original value by setting it back to the user's current username
    if (updateFieldValue && user) {
      updateFieldValue('username', user.username || '');
    }
    
    // End editing without saving
    originalHandleEditEnd();
  }, [updateFieldValue, user, originalHandleEditEnd, setValidationErrors, setCanSaveUsername]);

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

  // Initialize the username update mutation
  const updateUsername = useUpdateUsernameMutation({
    onSuccess: () => {
      // Clear validation errors on success
      setValidationErrors({});
    },
    onError: (error) => {
      console.error('Failed to update username:', error);
      if (error instanceof Error) {
        setValidationErrors({
          username: error.message,
        });
      }
    },
  });

  // Initialize the general update user mutation
  const updateUser = useUpdateUserMutation({
    onSuccess: (updatedUser) => {
      console.log('Profile updated successfully:', updatedUser);
      // Clear validation errors on success
      setValidationErrors({});
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);

      if (error instanceof Error) {
        setValidationErrors({
          general: error.message,
        });
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
        username:
          fieldValues?.username !== user.username
            ? fieldValues?.username
            : undefined,
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
          <AvatarUploader
            // Add a key prop that changes when the avatar path changes
            // This forces a complete re-render of the component
            key={`avatar-${user?.avatar_path || 'none'}`}
            image={user?.avatar_path || undefined}
            size="lg"
            text={getInitialsForAvatar({
              firstName: user?.first_name,
              lastName: user?.last_name,
              displayName: user?.username,
            })}
            circular
          />
          {/* Username - Custom implementation for cross-platform compatibility */}
          <YStack 
            onPress={(e) => {
              e.stopPropagation();
              if (!isEditing('username')) {
                handleEditStart('username');
              }
            }}
            backgroundColor={isEditing('username') ? "$blue5" : "transparent"}
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius="$4"
          >
            {isEditing('username') ? (
              <XStack width="100%" alignItems="center" gap="$2" flexDirection="column">
                <XStack width="100%" alignItems="center" gap="$2">
                  <TextInput
                    value={fieldValues?.username || ''}
                    onChangeText={(value: string) => {
                      updateFieldValue && updateFieldValue('username', value);
                      // Check username availability when typing
                      // Don't check if the username hasn't changed from the user's current username
                      if (value === user.username) {
                        setCanSaveUsername(true);
                        return;
                      }
                      checkUsername(value);
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      fontSize: 20,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: isAvailable === false ? '$red11' : '$blue11',
                      padding: 8,
                    }}
                    placeholder={t('profile:fields.username.placeholder') || 'Username'}
                    onSubmitEditing={() => {
                      if (canSaveUsername) {
                        // Use the dedicated username save handler
                        handleSaveField('username', fieldValues?.username || '');
                        // Don't call originalHandleEditEnd() here, it will be called by handleSaveField
                      }
                    }}
                  />
                  {isChecking && <Spinner size="small" color="$blue10" />}
                  {!isChecking && isAvailable === false && (
                    <Text color="$red11" fontSize="$3">✗</Text>
                  )}
                  {!isChecking && isAvailable === true && (
                    <Text color="$green11" fontSize="$3">✓</Text>
                  )}
                </XStack>
                {!isChecking && isAvailable === false && (
                  <Text color="$red11" fontSize="$2" textAlign="center">
                    {t('profile:fields.username.taken') || 'Username already taken'}
                  </Text>
                )}
                {validationErrors.username && (
                  <Text color="$red11" fontSize="$2" textAlign="center">
                    {validationErrors.username}
                  </Text>
                )}
                <XStack gap="$2">
                  {!!undoStates?.username?.showUndo && (
                    <Text 
                      color="$blue11" 
                      fontWeight="bold"
                      onPress={handleUsernameUndo}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      Undo
                    </Text>
                  )}
                  <Text 
                    color="$blue11" 
                    fontWeight="bold"
                    onPress={() => {
                      // Use our custom cancel handler that properly resets everything
                      handleUsernameCancel();
                    }}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    Cancel
                  </Text>
                  <Text 
                    color="$blue11" 
                    fontWeight="bold"
                    onPress={() => {
                      if (canSaveUsername) {
                        // Use the dedicated username save handler
                        handleSaveField('username', fieldValues?.username || '');
                        // handleSaveField will call originalHandleEditEnd() after successful save
                      }
                    }}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    Save
                  </Text>
                </XStack>
              </XStack>
            ) : (
              <H3 textAlign="center">{user.username}</H3>
            )}
          </YStack>
        </YStack>
        <YStack gap="$4" padding="$4" flex={1}>
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
              {t('profile:fields.first_name.label')}
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
              placeholder={t('profile:fields.first_name.placeholder')}
            />
          </YStack>

          {/* Last Name Field */}
          <YStack gap="$2" marginBottom="$4">
            <Text fontSize="$4" fontWeight="bold" color="$gray11">
              {t('profile:fields.last_name.label')}
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
              placeholder={t('profile:fields.last_name.placeholder')}
            />
          </YStack>

          {/* Location Field */}
          <YStack gap="$2" marginBottom="$4">
            <Text fontSize="$4" fontWeight="bold" color="$gray11">
              {t('profile:fields.location.label')}
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
              placeholder={t('profile:fields.location.placeholder')}
            />
          </YStack>

          {/* About Field */}
          <YStack gap="$2" marginBottom="$4">
            <Text fontSize="$4" fontWeight="bold" color="$gray11">
              {t('profile:fields.about.label')}
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
              placeholder={t('profile:fields.about.placeholder')}
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
