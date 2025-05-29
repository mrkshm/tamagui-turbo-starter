export const TEXT_LENGTHS = {
  NAME: {
    MIN: 1,
    MAX: 55,
  },

  USERNAME: {
    MIN: 3,
    MAX: 33,
  },

  EMAIL: {
    MAX: 254,
  },

  PASSWORD: {
    MIN: 6,
    MAX: 128,
  },

  LOCATION: {
    MIN: 1,
    MAX: 100,
  },

  PHONE: {
    MIN: 6,
    MAX: 25,
  },

  URL: {
    MAX: 2048,
  },

  TEXT: {
    SHORT: 100,
    MEDIUM: 500,
    LONG: 5000,
  },
} as const;

export type TextLengthKey = keyof typeof TEXT_LENGTHS;

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

export type TextLengths = DeepReadonly<typeof TEXT_LENGTHS>;
