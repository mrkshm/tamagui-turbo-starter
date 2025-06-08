// packages/app/components/AppFrame.tsx
import { useTranslation } from '@bbook/i18n';
import { useInteractionState } from '@bbook/utils';
import {
  Menu,
  Drawer,
  Text,
  Button,
  useMedia,
  XStack,
  YStack,
  X,
  AnimatePresence,
} from '@bbook/ui';

type LinkType = {
  title: string;
  href: string;
};

type AppFrameProps = {
  children: React.ReactNode;
  isMember?: boolean;
  Link: React.ComponentType<{ to: string; children: React.ReactNode }>;
};

export function AppFrame({ children, isMember = false, Link }: AppFrameProps) {
  const { t } = useTranslation();
  const {
    state: mobileMenuOpen,
    onIn: openMobileMenu,
    onOut: closeMobileMenu,
  } = useInteractionState();
  const { sm } = useMedia();

  const publicLinks: LinkType[] = [
    { title: t('nav:login'), href: '/landing/login' },
    { title: t('nav:register'), href: '/landing/register' },
  ];

  const memberLinks: LinkType[] = [
    { title: t('nav:dashboard'), href: '/member/' },
    { title: t('nav:contacts'), href: '/member/contacts' },
    { title: t('nav:profile_and_settings'), href: '/member/profile' },
  ];
  const links = isMember ? memberLinks : publicLinks;

  const renderDesktopNav = () => (
    <XStack gap="$4" alignItems="center">
      {links.map((link) => (
        <Link key={link.href} to={link.href}>
          <Text fontSize="$4" cursor="pointer">
            {link.title}
          </Text>
        </Link>
      ))}
    </XStack>
  );

  const renderMobileNav = () => (
    <>
      <Button circular icon={<Menu size="$1" />} onPress={openMobileMenu} />

      <Drawer open={mobileMenuOpen} onOpenChange={openMobileMenu}>
        <AnimatePresence>
          {mobileMenuOpen && (
            <Drawer.Overlay
              key="overlay"
              fullscreen
              animation="quick"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
              backgroundColor="$background"
              height="100vh"
              opacity={1}
              zIndex={1000}
              onPress={closeMobileMenu}
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
              // Prevent clicks on the content from closing the drawer
              onPressIn={(e: any) => e.stopPropagation()}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileMenuOpen && (
            <Drawer.Content
              key="content"
              width="100%"
              maxWidth="100%"
              backgroundColor="$background"
              padding="$4"
              animation="quick"
              enterStyle={{ x: -280 }}
              exitStyle={{ x: -280 }}
              elevation="$4"
              position="fixed"
              top={0}
              left={0}
              bottom={0}
              zIndex={1001}
            >
              <XStack width="100%" justifyContent="flex-end" marginBottom="$4">
                <Button
                  circular
                  icon={<X size="$1" />}
                  onPress={closeMobileMenu}
                  alignSelf="flex-end"
                />
              </XStack>
              <YStack gap="$4">
                {links.map((link) => (
                  <Link key={link.href} to={link.href}>
                    <Text fontSize="$5" onPress={closeMobileMenu}>
                      {link.title}
                    </Text>
                  </Link>
                ))}
              </YStack>
            </Drawer.Content>
          )}
        </AnimatePresence>
      </Drawer>
    </>
  );

  return (
    <YStack alignItems="center">
      <XStack
        padding="$4"
        flex={1}
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="$background"
        width="100%"
        maxWidth="1200px"
      >
        <Text fontSize="$6" fontWeight="bold">
          MyApp
        </Text>

        {sm ? renderMobileNav() : renderDesktopNav()}
      </XStack>

      <YStack
        flex={1}
        paddingHorizontal="$4"
        backgroundColor="$background"
        maxWidth="1200px"
        width="100%"
      >
        {children}
      </YStack>
    </YStack>
  );
}
