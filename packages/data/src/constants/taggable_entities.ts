export const taggableEntities = {
  contact: {
    app: 'contacts',
    model: 'contact',
    label: 'Contact',
    // Add any entity-specific config here
  },
  // Add other taggable entities
} as const;

export type TaggableEntity = keyof typeof taggableEntities;

// Helper types for even more better type safety
export type TaggableEntityConfig = (typeof taggableEntities)[TaggableEntity];
export type TaggableEntityPath =
  `${TaggableEntityConfig['app']}/${TaggableEntityConfig['model']}`;
