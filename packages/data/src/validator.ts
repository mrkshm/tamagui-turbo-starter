import { ValiError, BaseSchema, parse, BaseIssue, MapPathItem } from 'valibot';

export class ValidationError extends Error {
  constructor(
    message: string,
    public issues: { path: string; message: string }[],
    public receivedData: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export type ValidationSuccess<T> = {
  success: true;
  data: T;
};

export type ValidationFailure = {
  success: false;
  error: ValidationError;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

// Pure functions for creating results
const createSuccess = <T>(data: T): ValidationSuccess<T> => ({
  success: true,
  data,
});

const createFailure = (
  message: string,
  issues: { path: string; message: string }[],
  receivedData: unknown
): ValidationFailure => ({
  success: false,
  error: new ValidationError(message, issues, receivedData),
});

/**
 * Creates a validator function for the given schema.
 *
 * @param {Schema} schema - The schema to validate against.
 * @returns {Function} - A function that takes data and validates it against the schema.
 *                       The function returns a validation result, which is either a success or a failure.
 *
 * @example
 * // Usage example
 * const ProfileValidator = createValidator(ProfileResponseSchema);
 *
 * @typedef {Object} ValidationResult
 * @property {boolean} success - Indicates whether the validation was successful.
 * @property {string} [message] - The error message if the validation failed.
 * @property {Array<{path: string, message: string}>} [errors] - The list of validation errors.
 * @property {any} [data] - The validated data if the validation was successful.
 *
 * @typedef {Object} Schema
 * @property {Function} validate - The validation function of the schema.
 *
 * @param {any} data - The data to validate.
 * @returns {ValidationResult} - The result of the validation.
 */
export const createValidator = <
  TInput,
  TOutput,
  TIssue extends BaseIssue<unknown>,
>(
  schema: BaseSchema<TInput, TOutput, TIssue>
) => {
  return (data: unknown): ValidationResult<TOutput> => {
    try {
      return createSuccess(parse(schema, data));
    } catch (error) {
      if (error instanceof ValiError) {
        const issues = error.issues.map((issue) => ({
          path: issue.path?.map((p: MapPathItem) => p.key).join('.') || 'root',
          message: issue.message,
        }));

        return createFailure('Validation failed', issues, data);
      }

      return createFailure(
        error instanceof Error ? error.message : 'Unknown error',
        [{ path: 'unknown', message: 'Unexpected error during validation' }],
        data
      );
    }
  };
};
