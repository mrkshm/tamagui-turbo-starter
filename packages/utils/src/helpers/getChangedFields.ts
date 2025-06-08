interface GetChangedFieldsOptions {
  /** Optional debug label for logging */
  debug?: string;
  /** Whether to log changes (defaults to true if debug is provided) */
  logChanges?: boolean;
}

/**
 * Returns an object containing only the fields that have changed between two objects
 * @param current The current object (usually from state/API)
 * @param updates The updates object (usually from form/input)
 * @param options Optional configuration
 * @returns An object containing only the changed fields
 */
export function getChangedFields<T extends Record<string, unknown>>(
  current: T,
  updates: Partial<T>,
  options: GetChangedFieldsOptions = {}
): Partial<T> {
  const { debug, logChanges = Boolean(debug) } = options;

  const changedFields = Object.entries(updates).reduce<Partial<T>>(
    (acc, [key, newValue]) => {
      const currentValue = current[key as keyof T];

      // Handle null/undefined cases
      const newValueStr =
        newValue === null || newValue === undefined ? '' : String(newValue);
      const currentValueStr =
        currentValue === null || currentValue === undefined
          ? ''
          : String(currentValue);

      if (newValueStr !== currentValueStr) {
        if (logChanges) {
          console.log(
            debug ? `[${debug}] ` : '',
            `Field ${key} changed from '${currentValue}' to '${newValue}'`
          );
        }
        acc[key as keyof T] = newValue;
      }

      return acc;
    },
    {}
  );

  if (logChanges && debug) {
    console.log(`[${debug}] Changed fields:`, changedFields);
  }

  return changedFields;
}
