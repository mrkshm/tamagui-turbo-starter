import { Sheet } from '@bbook/ui';
import { TermsAndConditions } from '@bbook/app/components/terms-and-conditions';
import { useInteractionState } from '@bbook/utils';
import { Button, H2, YStack } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';
import { memo } from 'react';

type TermsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TermsSheet({ open, onOpenChange }: TermsSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[90]}
      dismissOnSnapToBottom
      animation="medium"
      zIndex={100000}
    >
      <Sheet.Overlay
        animation="lazy"
        backgroundColor="$shadow6"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />

      <Sheet.Handle />
      <Sheet.Frame padding="$4" flex={1}>
        <SheetContents onClose={() => onOpenChange(false)} />
      </Sheet.Frame>
    </Sheet>
  );
}

// Memoize the contents to avoid expensive renders during animations
const SheetContents = memo(({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();

  return (
    <YStack flex={1} width="100%">
      <YStack padding="$2" alignItems="flex-end">
        <Button
          size="$3"
          onPress={onClose}
          backgroundColor="$background"
          color="$color"
        >
          {t('common:close')}
        </Button>
      </YStack>

      <YStack flex={1} width="100%">
        <TermsAndConditions />
      </YStack>
    </YStack>
  );
});

// Hook to manage the terms sheet state
export function useTermsSheet() {
  return useInteractionState();
}
