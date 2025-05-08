import { getFontSized } from '@tamagui/get-font-sized';
import { GetProps } from '@tamagui/web';
import { getSpace } from '@tamagui/get-token';
import { User } from '@tamagui/lucide-icons';
import type { SizeVariantSpreadFunction, TamaguiComponent } from '@tamagui/web';
import React, { useState } from 'react';
import type { ColorTokens, FontSizeTokens } from 'tamagui';
import { tamaguiTokenChecker } from '../../utils/tamagui-token-checker';
import {
  Label,
  Button as TButton,
  Input as TInput,
  Text,
  View,
  XGroup,
  createStyledContext,
  getFontSize,
  getVariable,
  isWeb,
  styled,
  useGetThemedIcon,
  useTheme,
  withStaticProperties,
} from 'tamagui';

declare const process: {
  env: Record<string, string | undefined>;
};

const defaultContextValues = {
  size: '$true',
  scaleicon: 1.2, // lowercase to avoid React DOM warnings
  color: undefined,
} as const;

export const InputContext = createStyledContext<{
  size: FontSizeTokens;
  scaleicon: number; // lowercase to avoid React DOM warnings
  color?: ColorTokens | string;
}>(defaultContextValues);

export const defaultInputGroupStyles = {
  size: '$true',
  fontFamily: '$body',
  borderWidth: 1,
  outlineWidth: 0,
  color: '$color',

  ...(isWeb
    ? {
        tabIndex: 0,
      }
    : {
        focusable: true,
      }),

  borderColor: '$borderColor',
  backgroundColor: '$color2',

  // this fixes a flex bug where it overflows container
  minWidth: 0,

  hoverStyle: {
    borderColor: '$borderColorHover',
  },

  focusStyle: {
    outlineColor: '$outlineColor',
    outlineWidth: 2,
    outlineStyle: 'solid',
    borderColor: '$borderColorFocus',
  },
} as const;

// No need for a special wrapper now that we use lowercase scaleicon
const InputGroupView = XGroup;

const InputGroupFrame = styled(InputGroupView, {
  justifyContent: 'space-between',
  context: InputContext,
  variants: {
    unstyled: {
      false: defaultInputGroupStyles,
    },
    applyFocusStyle: {
      ':boolean': (val, { props }) => {
        if (val) {
          return props.focusStyle || defaultInputGroupStyles.focusStyle;
        }
      },
    },
    size: {
      '...size': (val, { tokens }) => {
        return {
          borderRadius: tamaguiTokenChecker(val, tokens.radius),
        };
      },
    },
  } as const,
  defaultVariants: {
    unstyled: process?.env?.TAMAGUI_HEADLESS === '1',
  },
});

const FocusContext = createStyledContext({
  setFocused: (_val: boolean) => {},
  focused: false,
});

const InputGroupImpl: TamaguiComponent = InputGroupFrame.styleable(
  // @ts-expect-error Tamagui .styleable expects (props, ref)
  (props: GetProps<typeof InputGroupFrame>, ref: React.ForwardedRef<any>) => {
    const { children, ...rest } = props;
    const [focused, setFocused] = useState(false);

    return (
      <FocusContext.Provider focused={focused} setFocused={setFocused}>
        <InputGroupFrame 
          applyFocusStyle={focused} 
          ref={ref} 
          {...rest}
          // Prevent capturing tab focus
          tabIndex={-1}
        >
          {children}
        </InputGroupFrame>
      </FocusContext.Provider>
    );
  }
);

export const inputSizeVariant: SizeVariantSpreadFunction<any> = (
  val = '$true',
  extras
) => {
  const radiusToken = tamaguiTokenChecker(val, extras.tokens.radius, '$true');
  const paddingHorizontal = getSpace(val, {
    shift: -1,
    bounds: [2],
  });
  const fontStyle = getFontSized(val as any, extras);
  // lineHeight messes up input on native
  if (!isWeb && fontStyle) {
    delete fontStyle['lineHeight'];
  }
  return {
    ...fontStyle,
    height: val,
    borderRadius: extras.props.circular ? 100_000 : radiusToken,
    paddingHorizontal,
  };
};

const InputFrame = styled(TInput, {
  unstyled: true,
  context: InputContext,
});

const InputImpl = InputFrame.styleable(
  // @ts-expect-error Tamagui .styleable expects (props, ref)
  (props: GetProps<typeof InputFrame>, ref: React.ForwardedRef<any>) => {
    const { setFocused } = FocusContext.useStyledContext();
    const { size } = InputContext.useStyledContext();
    const { ...rest } = props;
    
    return (
      <View flex={1} tabIndex={-1}>
        <InputFrame
          ref={ref} // Pass the ref directly to InputFrame
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          size={size}
          {...rest}
          // Make sure the input itself is focusable
          tabIndex={0}
        />
      </View>
    );
  }
);

const InputSection = styled(XGroup.Item, {
  justifyContent: 'center',
  alignItems: 'center',
  context: InputContext,
});

const Button: TamaguiComponent = styled(TButton, {
  context: InputContext,
  justifyContent: 'center',
  alignItems: 'center',

  variants: {
    size: {
      '...size': (val = '$true', { tokens }) => {
        if (typeof val === 'number') {
          return {
            paddingHorizontal: 0,
            height: val,
            borderRadius: val * 0.2,
          };
        }
        return {
          paddingHorizontal: 0,
          height: val,
          borderRadius: tamaguiTokenChecker(val, tokens.radius),
        };
      },
    },
  } as const,
});

// Icon starts

// No need for a special wrapper now that we use lowercase scaleicon
const InputIconView = View;

export const InputIconFrame: TamaguiComponent = styled(InputIconView, {
  justifyContent: 'center',
  alignItems: 'center',
  context: InputContext,

  variants: {
    size: {
      '...size': (val, { tokens }) => {
        return {
          paddingHorizontal: tamaguiTokenChecker(val, tokens.space, '$4'),
        };
      },
    },
  } as const,
});

const getIconSize = (size: FontSizeTokens, scale: number) => {
  return (
    (typeof size === 'number'
      ? size * 0.5
      : getFontSize(size as FontSizeTokens)) * scale
  );
};

const InputIcon = InputIconFrame.styleable<{
  scaleIcon?: number;
  color?: ColorTokens | string;
  children?: React.ReactNode;
}>(
  // @ts-expect-error Tamagui .styleable expects (props, ref)
  (
    props: GetProps<typeof InputIconFrame> & {
      scaleIcon?: number;
      color?: ColorTokens | string;
      children?: React.ReactNode;
    },
    ref: React.ForwardedRef<any>
  ) => {
    const {
      children,
      color: colorProp,
      scaleicon: propScaleIcon,
      ...rest
    } = props;
    const inputContext = InputContext.useStyledContext();
    const { size = '$true', color: contextColor, scaleicon = 1 } = inputContext;

    const theme = useTheme();
    const color = getVariable(
      contextColor ||
        theme[contextColor as any]?.get('web') ||
        theme.color10?.get('web')
    );
    const iconSize = getIconSize(size as FontSizeTokens, scaleicon);

    const getThemedIcon = useGetThemedIcon({
      size: iconSize,
      color: color as any,
    });
    return (
      <InputIconFrame ref={ref} {...rest}>
        {getThemedIcon(children)}
      </InputIconFrame>
    );
  }
);

// No need for a special wrapper now that we use lowercase scaleicon
const InputContainerView = View;

export const InputContainerFrame: TamaguiComponent = styled(
  InputContainerView,
  {
    context: InputContext,
    flexDirection: 'column',

    variants: {
      size: {
        '...size': (val, { tokens }) => ({
          gap: tamaguiTokenChecker(val, tokens.space, '$4').val * 0.3,
        }),
      },
      color: {
        '...color': () => ({}),
      },
      gapScale: {
        ':number': {} as any,
      },
    } as const,

    defaultVariants: {
      size: '$4',
    },
  }
);

export const InputLabel = styled(Label, {
  context: InputContext,
  variants: {
    size: {
      '...fontSize': getFontSized as any,
    },
  } as const,
});

export const InputInfo: TamaguiComponent = styled(Text, {
  context: InputContext,
  color: '$color10',

  variants: {
    size: {
      '...fontSize': (val, { font }) => {
        if (!font) return;
        const fontSize =
          (tamaguiTokenChecker(val, font.size, '$4') as { val: number }).val *
          0.8;
        const lineHeight =
          (
            tamaguiTokenChecker(val, font.lineHeight, '$4') as {
              val: number;
            }
          ).val * 0.8;
        const fontWeight = font.weight?.['$2'];
        const letterSpacing = font.letterSpacing?.[val];
        const textTransform = font.transform?.[val];
        const fontStyle = font.style?.[val];
        return {
          fontSize,
          lineHeight,
          fontWeight,
          letterSpacing,
          textTransform,
          fontStyle,
        };
      },
    },
  } as const,
});

const InputXGroup: TamaguiComponent = styled(XGroup, {
  context: InputContext,

  variants: {
    size: {
      '...size': (val, { tokens }) => {
        const radiusToken = tamaguiTokenChecker(val, tokens.radius, '$true');
        return {
          borderRadius: radiusToken,
        };
      },
    },
  } as const,
});

interface InputStatics {
  Box: typeof InputGroupImpl;
  Area: typeof InputImpl;
  Section: typeof InputSection;
  Button: typeof Button;
  Icon: typeof InputIcon;
  Info: typeof InputInfo;
  Label: typeof InputLabel;
  XGroup: typeof InputXGroup & { Item: typeof XGroup.Item };
}

export const Input = withStaticProperties(InputContainerFrame, {
  Box: InputGroupImpl,
  Area: InputImpl,
  Section: InputSection,
  Button,
  Icon: InputIcon,
  Info: InputInfo,
  Label: InputLabel,
  XGroup: withStaticProperties(InputXGroup, { Item: XGroup.Item }),
}) as typeof InputContainerFrame & InputStatics;

export const InputNew = () => {
  return (
    <Input w={400} size="$3">
      <Input.Box>
        <Input.Section>
          {/* @ts-expect-error */}
          <Input.Icon>
            <User />
          </Input.Icon>
        </Input.Section>
        <Input.Section>
          <Input.Area paddingLeft={0} />
        </Input.Section>
        <Input.Section>
          <Input.Button>
            {/* @ts-expect-error */}
            <Input.Icon>
              <User />
            </Input.Icon>
          </Input.Button>
        </Input.Section>
      </Input.Box>
    </Input>
  );
};
