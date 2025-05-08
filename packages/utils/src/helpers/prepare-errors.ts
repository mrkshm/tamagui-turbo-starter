import type { BaseIssue } from 'valibot';
/**
 * Converts a valibot Issue[] or other error shapes to a string[] for UI display.
 */

export function prepareErrors(errors: unknown): string[] {
  if (Array.isArray(errors) && errors.length > 0) {
    // Valibot BaseIssue[]
    if (typeof errors[0] === 'object' && errors[0] && 'message' in errors[0]) {
      return (errors as BaseIssue<unknown>[]).map((e) => e.message);
    }
    // Already string[]
    if (typeof errors[0] === 'string') {
      return errors as string[];
    }
  }
  if (typeof errors === 'string') return [errors];
  return [];
}
