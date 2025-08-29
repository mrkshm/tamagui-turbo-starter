import * as v from 'valibot';

type ValidatorFunction = (value: unknown) => string | undefined;

/**
 * Creates a validator function from a Valibot schema
 * @param schema - The Valibot schema to validate against
 * @returns A function that returns an error message or undefined if valid
 */
export function createFieldValidator<T = unknown>(schema: v.BaseSchema<T, unknown, any>): ValidatorFunction {
  return (value: unknown): string | undefined => {
    const result = v.safeParse(schema, value);
    return result.success ? undefined : result.issues[0]?.message || 'Invalid value';
  };
}

/**
 * Combines multiple validators into a single validator function
 * @param validators - Array of validator functions
 * @returns A function that returns the first error found or undefined if all validations pass
 */
export function combineValidators<T>(
  ...validators: ((value: T) => string | undefined)[]
) {
  return (value: T): string | undefined => {
    for (const validate of validators) {
      const error = validate(value);
      if (error) return error;
    }
    return undefined;
  };
}

// Common validators
export const required = (message = 'This field is required'): ValidatorFunction => 
  (value: unknown) => 
    value === undefined || value === null || value === '' ? message : undefined;

export const email = (message = 'Invalid email format'): ValidatorFunction =>
  createFieldValidator(
    v.pipe(
      v.string('Must be text'),
      v.email(message)
    )
  );

export const minLength = (min: number, message?: string): ValidatorFunction =>
  createFieldValidator(
    v.pipe(
      v.string('Must be text'),
      v.minLength(min, message || `Must be at least ${min} characters`)
    )
  );

export const maxLength = (max: number, message?: string): ValidatorFunction =>
  createFieldValidator(
    v.pipe(
      v.string('Must be text'),
      v.maxLength(max, message || `Must be at most ${max} characters`)
    )
  );

// Re-export commonly used validators from valibot
export { string, number, boolean, object, array, union, literal, regex } from 'valibot';
