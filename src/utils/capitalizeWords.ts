// src/utils/capitalizeWords.ts

/**
 * Converts a string to Title Case, handling various input formats including ALL CAPS.
 *
 * @param {string | null | undefined} str The string to convert.
 * @returns {string} The converted string in Title Case, or an empty string if input is null/undefined.
 *
 * @example
 * capitalizeWords("hello world"); // "Hello World"
 * capitalizeWords("HELLO-WORLD"); // "Hello World"
 * @example
 * capitalizeWords("AIRCRAFT COMPONENTS AND ACCESSORIES"); // "Aircraft Components And Accessories"
 */
export function capitalizeWords(str: string | null | undefined): string {
  if (!str) {
    return ""; // Return an empty string for null or undefined input
  }

  // The key fix is adding .toLowerCase() first.
  // This creates a consistent baseline before capitalizing.
  return str
    .toLowerCase() // 1. Force the entire string to lowercase
    .replaceAll("-", " ") // 2. Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // 3. Capitalize the first letter of each word
}