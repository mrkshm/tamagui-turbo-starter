import { FocusScope } from '@tamagui/focus-scope';
import { Portal } from '@tamagui/portal';
import type { Dispatch, SetStateAction } from 'react';
import React, { forwardRef, useRef, useState } from 'react';
import { Modal, PanResponder, Platform } from 'react-native';
import type { Animated } from 'react-native';
import type {
  GetProps,
  PortalProps,
  StackProps,
  TamaguiComponent,
  TamaguiElement,
} from 'tamagui';
import {
  AnimatePresence,
  Stack,
  YStack,
  createStyledContext,
  styled,
  useConfiguration,
  useControllableState,
  usePropsAndStyle,
  withStaticProperties,
} from 'tamagui';

export const DrawerContext = createStyledContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}>({
  open: false,
  setOpen: () => {},
});

const SwipeDismissableComponent = React.forwardRef<
  TamaguiElement,
  StackProps & { onDismiss: () => void; children: any; dismissAfter?: number }
>(({ onDismiss, children, dismissAfter = 80, ...rest }, ref) => {
  const { animationDriver } = useConfiguration();
  const { useAnimatedNumber, useAnimatedNumberStyle } = animationDriver;
  const AnimatedView = (animationDriver.View ?? Stack) as typeof Animated.View;
  const pan = useAnimatedNumber(0);
  const [props, style] = usePropsAndStyle(rest);
  const [dragStarted, setDragStarted] = useState(false);
  const dismissAfterRef = useRef(dismissAfter);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        if (dx < 0) {
          setDragStarted(true);
          pan.setValue(dx, {
            type: 'direct',
          });
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        setDragStarted(false);
        if (gestureState.dx < -dismissAfterRef.current) {
          if (onDismiss) {
            onDismiss();
          }
        } else {
          pan.setValue(0, {
            type: 'spring',
            overshootClamping: true,
          });
        }
      },
    })
  ).current;

  const panStyle = useAnimatedNumberStyle(pan, (val) => {
    'worklet';
    return {
      transform: [{ translateX: val }],
    };
  });

  return (
    <AnimatedView
      ref={ref}
      style={[
        panStyle,
        {
          height: '100%',
          ...(style as any),
          ...(dragStarted && {
            pointerEvents: 'none',
          }),
        },
      ]}
      {...panResponder.panHandlers}
      {...(props as any)}
    >
      {children}
    </AnimatedView>
  );
});

const DrawerFrame: TamaguiComponent = styled(YStack, {
  name: 'DrawerFrame',
  variants: {
    unstyled: {
      false: {
        themeInverse: true,
        paddingVertical: '$2',
        tag: 'nav',
        width: 210,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        backgroundColor: '$background',
        x: 0,
        gap: '$4',
      } as const,
    },
  },

  defaultVariants: {
    unstyled: false,
  },
});

type DrawerProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * When true, uses a portal to render at the very top of the root TamaguiProvider.
   */
  portalToRoot?: boolean;
};

const Overlay: TamaguiComponent = styled(YStack, {
  name: 'DrawerOverlay',
  context: DrawerContext,
  enterStyle: {
    opacity: 0,
  },
  exitStyle: {
    opacity: 0,
  },

  variants: {
    unstyled: {
      false: {
        fullscreen: true,
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 100_000 - 1,
        pointerEvents: 'auto',
      },
    },
  } as const,

  defaultVariants: {
    unstyled: process.env.TAMAGUI_HEADLESS === '1',
  },
});

type DrawerOverlayProps = GetProps<typeof Overlay>;
type DrawerOverlayComponent = React.ForwardRefExoticComponent<
  Omit<DrawerOverlayProps, 'ref'> & React.RefAttributes<TamaguiElement>
>;

const DrawerOverlay: DrawerOverlayComponent = React.forwardRef<
  TamaguiElement,
  DrawerOverlayProps
>((props, ref) => {
  const { setOpen } = DrawerContext.useStyledContext();
  return <Overlay ref={ref} onPress={() => setOpen(false)} {...props} />;
});

// Add display name for better dev tools
DrawerOverlay.displayName = 'DrawerOverlay';

const DrawerSwipeable = forwardRef<
  TamaguiElement,
  Omit<React.ComponentProps<typeof SwipeDismissableComponent>, 'onDismiss'>
>((props, ref) => {
  const { setOpen } = DrawerContext.useStyledContext();
  return (
    <SwipeDismissableComponent
      onDismiss={() => setOpen(false)}
      zIndex={1000_000_000}
      position="absolute"
      {...props}
      ref={ref}
    />
  );
});

type DrawerContentProps = GetProps<typeof DrawerFrame>;
type DrawerContentComponent = React.ForwardRefExoticComponent<
  Omit<DrawerContentProps, 'ref'> &
    React.RefAttributes<TamaguiElement> & { children?: React.ReactNode }
>;

const DrawerContent: DrawerContentComponent = React.forwardRef<
  TamaguiElement,
  DrawerContentProps
>((props, ref) => {
  const { children, ...rest } = props;

  return (
    <FocusScope trapped enabled={true} loop>
      <DrawerFrame
        ref={ref}
        animation="medium"
        enterStyle={{ x: -(rest.width || rest.w || 210) }}
        exitStyle={{ x: -(rest.width || rest.w || 210) }}
        {...rest}
      >
        {children}
      </DrawerFrame>
    </FocusScope>
  );
});

// Add display name for better dev tools
DrawerContent.displayName = 'DrawerContent';

const DrawerImpl = ({
  open = false,
  onOpenChange,
  children,
  portalToRoot,
  ...rest
}: DrawerProps & { children?: React.ReactNode }) => {
  const [_open, setOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange,
  });
  // biome-ignore lint/complexity/noUselessFragments: necessary for AnimatedPresence
  const content = open && <>{children}</>;
  return (
    <DrawerContext.Provider open={_open} setOpen={setOpen}>
      <AnimatePresence>{open && content}</AnimatePresence>
    </DrawerContext.Provider>
  );
};

const DrawerPortal = (props: PortalProps) => {
  return Platform.select({
    web: <Portal zIndex={1000000000} {...props} />,
    native: (
      <Modal animationType="none" transparent={true}>
        {props.children}
      </Modal>
    ),
  });
};

type DrawerComponent = React.FC<
  DrawerProps & { children?: React.ReactNode }
> & {
  Content: typeof DrawerContent;
  Overlay: typeof DrawerOverlay;
  Swipeable: typeof DrawerSwipeable;
  Portal: typeof DrawerPortal;
  Trigger: React.FC<{ children: React.ReactNode }>;
};

const DrawerTrigger: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};
DrawerTrigger.displayName = 'DrawerTrigger';

export const Drawer: DrawerComponent = withStaticProperties(DrawerImpl, {
  Content: DrawerContent,
  Overlay: DrawerOverlay,
  Swipeable: DrawerSwipeable,
  Portal: DrawerPortal,
  Trigger: DrawerTrigger,
}) as unknown as DrawerComponent;
