// Use a simple X text instead of icon since we don't have @tamagui/lucide-icons
import {
  Adapt,
  Button,
  Dialog,
  Sheet,
  Unspaced,
  YStack,
  Text,
} from '@bbook/ui';
import { TermsAndConditions } from '@bbook/app/components/TermsAndConditions';
import type { ReactNode } from 'react';

type TermsDialogProps = {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TermsDialog({ trigger, open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <Adapt platform="touch">
        <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            backgroundColor="$shadow3"
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          backgroundColor="$shadow3"
          animateOnly={['transform', 'opacity']}
          opacity={0.7}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ opacity: 0, scale: 0.95 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          w="90%"
          maxWidth={800}
          h="80%"
          maxHeight={800}
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
          padding="$0"
          overflow="hidden"
        >
          <YStack
            flex={1}
            width="100%"
            height="100%"
            overflow="hidden"
            padding="$6"
          >
            <TermsAndConditions />
          </YStack>

          <Unspaced>
            <Dialog.Close asChild>
              <Button
                position="absolute"
                top="$3"
                right="$3"
                size="$2"
                circular
                padding="$0"
                justifyContent="center"
                alignItems="center"
                fontWeight="bold"
              >
                <Text>X</Text>
              </Button>
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
