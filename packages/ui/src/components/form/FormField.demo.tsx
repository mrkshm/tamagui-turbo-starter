import { Button, YStack, Text, XStack, Card } from 'tamagui';
import { FormField } from './FormField';

// Local type definition for demo purposes
type UIFieldConfig<T extends string = string> = {
  id?: T;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'number';
  placeholder?: string;
  required?: boolean;
  validate?: (value: string) => string | undefined;
  rows?: number;
  [key: string]: any;
};

const useEditableForm = <T extends Record<string, any>>(config: {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  fieldConfigs?: Record<keyof T, UIFieldConfig<string>>;
}) => {
  return {
    isEditing: false,
    isFormDirty: false,
    handleEditStart: () => {},
    handleSave: () => {},
    handleCancel: () => {},
    getFieldProps: (fieldId: string) => ({
      value: config.initialValues[fieldId as keyof T] || '',
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
      isEditing: false,
    }),
  };
};

type DemoFormData = {
  name: string;
  email: string;
  bio: string;
};

export function FormFieldDemo() {
  const initialValues: DemoFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software developer and open source enthusiast',
  };

  const { 
    isEditing, 
    isFormDirty, 
    handleEditStart, 
    handleSave, 
    handleCancel, 
    getFieldProps 
  } = useEditableForm<DemoFormData>({
    initialValues,
    onSubmit: async (formValues: DemoFormData) => {
      // In a real app, this would be an API call
      console.log('Submitting form:', formValues);
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    },
    fieldConfigs: {
      name: {
        label: 'Full Name',
        required: true,
        validate: (value: string) => {
          if (!value) return 'Name is required';
          if (value.length < 3) return 'Name must be at least 3 characters';
          return undefined;
        },
      },
      email: {
        label: 'Email Address',
        type: 'email',
        required: true,
        validate: (value: string) => {
          if (!value) return 'Email is required';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Please enter a valid email address';
          }
          return undefined;
        },
      },
      bio: {
        label: 'Biography',
        type: 'textarea',
        rows: 4,
        placeholder: 'Tell us about yourself...',
        validate: (value: string) => {
          if (value && value.length > 500) {
            return 'Biography must be less than 500 characters';
          }
          return undefined;
        },
      },
    },
  });

  return (
    <Card padding="$4" width="100%" maxWidth={600}>
      <YStack gap="$4">
        <Text fontSize="$8" fontWeight="bold" marginBottom="$2">
          Edit Profile
        </Text>

        <YStack gap="$4">
          <FormField
            fieldId="name"
            label="Full Name"
            {...getFieldProps('name')}
          />

          <FormField
            fieldId="email"
            label="Email Address"
            type="email"
            {...getFieldProps('email')}
          />

          <FormField
            fieldId="bio"
            label="Biography"
            type="textarea"
            rows={4}
            placeholder="Tell us about yourself..."
            {...getFieldProps('bio')}
          />
        </YStack>

        <XStack gap="$3" justifyContent="flex-end" marginTop="$4">
          {!isEditing ? (
            <Button onPress={handleEditStart} theme="blue">
              Edit Profile
            </Button>
          ) : (
            <>
              <Button 
                variant="outlined" 
                onPress={handleCancel}
                disabled={!isFormDirty}
              >
                Cancel
              </Button>
              <Button 
                theme="blue"
                onPress={handleSave}
                disabled={!isFormDirty}
              >
                Save Changes
              </Button>
            </>
          )}
        </XStack>

      </YStack>
    </Card>
  );
}

export default FormFieldDemo;
