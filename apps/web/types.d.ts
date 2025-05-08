import { config } from '@bbook/ui';

export type Conf = typeof config;

declare module '@bbook/ui' {
  interface TamaguiCustomConfig extends Conf {}
}
