/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

// Import your theme colors
const lightPalette = require('./src/modules/settings/themes/light').lightPalette;
const darkPalette = require('./src/modules/settings/themes/dark').darkPalette;

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

// Extract colors from your theme
const getThemeColors = () => {
  return {
    light: {
      primary: {
        DEFAULT: lightPalette.primary.main,
        light: lightPalette.primary.light,
        dark: lightPalette.primary.dark,
        contrast: lightPalette.primary.contrastText,
      },
      secondary: {
        DEFAULT: lightPalette.secondary.main,
        light: lightPalette.secondary.light,
        dark: lightPalette.secondary.dark,
        contrast: lightPalette.secondary.contrastText,
      },
      error: {
        DEFAULT: lightPalette.error.main,
        light: lightPalette.error.light,
        dark: lightPalette.error.dark,
        contrast: lightPalette.error.contrastText,
      },
      warning: {
        DEFAULT: lightPalette.warning.main,
        light: lightPalette.warning.light,
        dark: lightPalette.warning.dark,
        contrast: lightPalette.warning.contrastText,
      },
      info: {
        DEFAULT: lightPalette.info.main,
        light: lightPalette.info.light,
        dark: lightPalette.info.dark,
        contrast: lightPalette.info.contrastText,
      },
      success: {
        DEFAULT: lightPalette.success.main,
        light: lightPalette.success.light,
        dark: lightPalette.success.dark,
        contrast: lightPalette.success.contrastText,
      },
      background: {
        DEFAULT: lightPalette.background.default,
        paper: lightPalette.background.paper,
      },
      text: {
        primary: lightPalette.text.primary,
        secondary: lightPalette.text.secondary,
        disabled: lightPalette.text.disabled,
      },
      action: {
        active: lightPalette.action.active,
        hover: lightPalette.action.hover,
        selected: lightPalette.action.selected,
        disabled: lightPalette.action.disabled,
        disabledBackground: lightPalette.action.disabledBackground,
      },
      divider: lightPalette.divider,
    },
    dark: {
      primary: {
        DEFAULT: darkPalette.primary.main,
        light: darkPalette.primary.light,
        dark: darkPalette.primary.dark,
        contrast: darkPalette.primary.contrastText,
      },
      secondary: {
        DEFAULT: darkPalette.secondary.main,
        light: darkPalette.secondary.light,
        dark: darkPalette.secondary.dark,
        contrast: darkPalette.secondary.contrastText,
      },
      error: {
        DEFAULT: darkPalette.error.main,
        light: darkPalette.error.light,
        dark: darkPalette.error.dark,
        contrast: darkPalette.error.contrastText,
      },
      warning: {
        DEFAULT: darkPalette.warning.main,
        light: darkPalette.warning.light,
        dark: darkPalette.warning.dark,
        contrast: darkPalette.warning.contrastText,
      },
      info: {
        DEFAULT: darkPalette.info.main,
        light: darkPalette.info.light,
        dark: darkPalette.info.dark,
        contrast: darkPalette.info.contrastText,
      },
      success: {
        DEFAULT: darkPalette.success.main,
        light: darkPalette.success.light,
        dark: darkPalette.success.dark,
        contrast: darkPalette.success.contrastText,
      },
      background: {
        DEFAULT: darkPalette.background.default,
        paper: darkPalette.background.paper,
      },
      text: {
        primary: darkPalette.text.primary,
        secondary: darkPalette.text.secondary,
        disabled: darkPalette.text.disabled,
      },
      action: {
        active: darkPalette.action.active,
        hover: darkPalette.action.hover,
        selected: darkPalette.action.selected,
        disabled: darkPalette.action.disabled,
        disabledBackground: darkPalette.action.disabledBackground,
      },
      divider: darkPalette.divider,
    },
  };
};

const themeColors = getThemeColors();

// Generate CSS variables for light and dark themes
const generateThemeVars = () => {
  const lightVars = {};
  const darkVars = {};

  // Helper to flatten the theme object
  const flattenTheme = (obj, parentKey = '', target) => {
    Object.entries(obj).forEach(([key, value]) => {
      const cssVar = parentKey ? `${parentKey}-${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        flattenTheme(value, cssVar, target);
      } else {
        target[`--${cssVar}`] = value;
      }
    });
  };

  flattenTheme(themeColors.light, 'color', lightVars);
  flattenTheme(themeColors.dark, 'color', darkVars);

  return {
    ':root': lightVars,
    '.dark': darkVars,
  };
};

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '!./node_modules',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Map theme colors to Tailwind's color system
        primary: {
          DEFAULT: 'var(--color-primary-DEFAULT)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
          contrast: 'var(--color-primary-contrast)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary-DEFAULT)',
          light: 'var(--color-secondary-light)',
          dark: 'var(--color-secondary-dark)',
          contrast: 'var(--color-secondary-contrast)',
        },
        error: {
          DEFAULT: 'var(--color-error-DEFAULT)',
          light: 'var(--color-error-light)',
          dark: 'var(--color-error-dark)',
          contrast: 'var(--color-error-contrast)',
        },
        warning: {
          DEFAULT: 'var(--color-warning-DEFAULT)',
          light: 'var(--color-warning-light)',
          dark: 'var(--color-warning-dark)',
          contrast: 'var(--color-warning-contrast)',
        },
        info: {
          DEFAULT: 'var(--color-info-DEFAULT)',
          light: 'var(--color-info-light)',
          dark: 'var(--color-info-dark)',
          contrast: 'var(--color-info-contrast)',
        },
        success: {
          DEFAULT: 'var(--color-success-DEFAULT)',
          light: 'var(--color-success-light)',
          dark: 'var(--color-success-dark)',
          contrast: 'var(--color-success-contrast)',
        },
        background: {
          DEFAULT: 'var(--color-background-DEFAULT)',
          paper: 'var(--color-background-paper)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          disabled: 'var(--color-text-disabled)',
        },
        action: {
          active: 'var(--color-action-active)',
          hover: 'var(--color-action-hover)',
          selected: 'var(--color-action-selected)',
          disabled: 'var(--color-action-disabled)',
          disabledBackground: 'var(--color-action-disabledBackground)',
        },
        divider: 'var(--color-divider)',
      },
      // Add theme variables
      ...generateThemeVars(),
      // Keep your existing animations and shadows
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
      borderColor: ['active', 'disabled'],
      ringWidth: ['hover', 'active'],
      ringColor: ['hover', 'active'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    function ({ addComponents }) {
      addComponents({
        '.container': {
          '@screen xl': {
            maxWidth: '1280px',
          },
        },
      });
    },
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
};