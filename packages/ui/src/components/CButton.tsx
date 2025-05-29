import { Button as TamaguiButton, View, Spinner } from 'tamagui';
import { ReactNode } from 'react';

export type CustomButtonProps = {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  width?: number | string;
  marginTop?: any;
  marginBottom?: any;
  marginLeft?: any;
  marginRight?: any;
  margin?: any;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
};

// Size configurations for different button sizes
const sizeConfigs = {
  sm: {
    height: 36,
    paddingHorizontal: '$3',
    fontSize: '$2',
    gap: '$1',
  },
  md: {
    height: 46,
    paddingHorizontal: '$4',
    fontSize: '$3',
    gap: '$2',
  },
  lg: {
    height: 56,
    paddingHorizontal: '$5',
    fontSize: '$4',
    gap: '$3',
  },
};

// Theme configurations for different button variants
const variantConfigs = {
  primary: {
    // Use theme colors from themes.ts
    backgroundColor: '$primary',
    color: '$onPrimary',
    // Add specific hover styles for primary variant
    hoverStyle: {
      backgroundColor: '$primary',
      opacity: 0.9,
    },
    pressStyle: {
      backgroundColor: '$primary',
      opacity: 0.8,
    },
  },
  secondary: {
    backgroundColor: '$secondary',
    color: '$onSecondary',
    // Add specific hover styles for secondary variant
    hoverStyle: {
      backgroundColor: '$secondary',
      opacity: 0.9,
    },
    pressStyle: {
      backgroundColor: '$secondary',
      opacity: 0.8,
    },
  },
  outline: {
    borderWidth: 1,
    borderColor: '$borderColor',
    backgroundColor: 'transparent',
    color: '$color',
    // Add specific hover styles for outline variant
    hoverStyle: {
      backgroundColor: '$backgroundHover',
    },
    pressStyle: {
      backgroundColor: '$backgroundActive',
    },
  },
  destructive: {
    backgroundColor: '$warning',
    color: '$onWarning',
    // Add specific hover styles for destructive variant
    hoverStyle: {
      backgroundColor: '$warning',
      opacity: 0.9,
    },
    pressStyle: {
      backgroundColor: '$warning',
      opacity: 0.8,
    },
  },
};

/**
 * A button component with properly centered text and support for variants and sizes.
 * Uses the nested View approach for reliable text centering.
 */
export function CButton({
  children,
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false,
  onPress,
  width,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  margin,
  icon,
  iconPosition = 'left',
  ...props
}: CustomButtonProps) {
  // Get size configuration
  const sizeConfig = sizeConfigs[size];

  // Get variant configuration
  const variantConfig = variantConfigs[variant];

  return (
    <TamaguiButton
      {...props}
      {...sizeConfig}
      {...variantConfig}
      disabled={disabled}
      onPress={onPress}
      width={width}
      marginTop={marginTop}
      marginBottom={marginBottom}
      marginLeft={marginLeft}
      marginRight={marginRight}
      margin={margin}
      opacity={disabled ? 0.5 : 1}
      // Apply variant-specific hover styles
      hoverStyle={{
        ...variantConfig.hoverStyle,
        scale: 0.98,
      }}
      pressStyle={{
        ...variantConfig.pressStyle,
        scale: 0.96,
      }}
    >
      <View
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        width="100%"
        gap="$2"
        height="100%"
      >
        {loading ? (
          <Spinner size="small" color={variantConfig.color} />
        ) : (
          <View
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            gap="$2"
          >
            {icon && iconPosition === 'left' && icon}
            <TamaguiButton.Text
              // textAlign="center"
              // alignSelf="center"
              // justifyContent="center"
              // alignItems="center"
              height="100%"
              fontSize={sizeConfig.fontSize}
            >
              {children}
            </TamaguiButton.Text>
            {icon && iconPosition === 'right' && icon}
          </View>
        )}
      </View>
    </TamaguiButton>
  );
}
