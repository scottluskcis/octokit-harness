/**
 * Parses a command line option as an integer
 * @param value The string value to parse
 * @returns The parsed integer or undefined if parsing fails
 */
export function parseIntOption(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid integer value: ${value}`);
  }
  return parsed;
}

/**
 * Parses a command line option as a float
 * @param value The string value to parse
 * @returns The parsed float or undefined if parsing fails
 */
export function parseFloatOption(value: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error(`Invalid float value: ${value}`);
  }
  return parsed;
}
