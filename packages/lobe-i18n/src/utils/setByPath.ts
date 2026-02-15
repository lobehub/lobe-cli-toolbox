/**
 * Custom implementation of lodash set() that preserves numeric string keys as object keys
 * instead of converting them to array indices.
 *
 * This fixes the issue where objects like {"0": {...}, "1": {...}} were being converted
 * to arrays during the i18n translation process.
 *
 * @param obj - The object to set the value in
 * @param path - Array of keys representing the path
 * @param value - The value to set
 */
export function setByPath(obj: any, path: Array<string | number>, value: any): void {
  if (path.length === 0) return;

  let current = obj;

  // Navigate to the parent of the target key
  for (let i = 0; i < path.length - 1; i++) {
    const key = String(path[i]); // Always treat keys as strings

    // Create intermediate object if it doesn't exist or is not an object
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }

    current = current[key];
  }

  // Set the final value
  const finalKey = String(path.at(-1));
  current[finalKey] = value;
}
