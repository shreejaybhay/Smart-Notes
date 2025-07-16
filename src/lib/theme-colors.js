// Theme color mapping for folder colors
// Maps theme color names to their corresponding CSS custom properties

export const THEME_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))',
  destructive: 'hsl(var(--destructive))',
};

export const THEME_COLOR_BACKGROUNDS = {
  primary: 'hsl(var(--primary) / 0.1)',
  secondary: 'hsl(var(--secondary) / 0.1)',
  accent: 'hsl(var(--accent) / 0.1)',
  muted: 'hsl(var(--muted) / 0.1)',
  destructive: 'hsl(var(--destructive) / 0.1)',
};

/**
 * Get the CSS color value for a theme color name
 * @param {string} colorName - Theme color name (primary, secondary, etc.)
 * @returns {string} CSS color value
 */
export function getThemeColor(colorName) {
  return THEME_COLORS[colorName] || THEME_COLORS.primary;
}

/**
 * Get the CSS background color value for a theme color name
 * @param {string} colorName - Theme color name (primary, secondary, etc.)
 * @returns {string} CSS background color value with opacity
 */
export function getThemeColorBackground(colorName) {
  return THEME_COLOR_BACKGROUNDS[colorName] || THEME_COLOR_BACKGROUNDS.primary;
}

/**
 * Check if a color is a valid theme color name
 * @param {string} color - Color to check
 * @returns {boolean} True if it's a valid theme color name
 */
export function isThemeColor(color) {
  return color && THEME_COLORS.hasOwnProperty(color);
}

/**
 * Get color for display - handles both theme colors and hex colors
 * @param {string} color - Color value (theme name or hex)
 * @returns {string} CSS color value
 */
export function getDisplayColor(color) {
  if (!color) return getThemeColor('primary');
  
  // If it's a theme color name, convert to CSS custom property
  if (isThemeColor(color)) {
    return getThemeColor(color);
  }
  
  // If it's already a hex color or other CSS color, return as-is
  return color;
}

/**
 * Get background color for display - handles both theme colors and hex colors
 * @param {string} color - Color value (theme name or hex)
 * @returns {string} CSS background color value
 */
export function getDisplayBackgroundColor(color) {
  if (!color) return getThemeColorBackground('primary');
  
  // If it's a theme color name, convert to CSS custom property with opacity
  if (isThemeColor(color)) {
    return getThemeColorBackground(color);
  }
  
  // If it's a hex color, add opacity
  if (color.startsWith('#')) {
    return `${color}20`; // Add 20 for ~12% opacity
  }
  
  // For other CSS colors, return as-is
  return color;
}
