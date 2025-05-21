/**
 * Override the useColorScheme hook to always return 'light' regardless of system settings
 */

// Import original but don't use it

export function useColorScheme(): "light" | "dark" {
  // Always return 'light' regardless of device settings
  return "light";
}
