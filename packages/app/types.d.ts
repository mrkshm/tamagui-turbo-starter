import { config } from '@bbook/config'

export type Conf = typeof config

declare module '@bbook/ui' {
  interface TamaguiCustomConfig extends Conf {}
}
