// Configuration for production builds
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import purgecss from '@fullhuman/postcss-purgecss';
import cssnano from 'cssnano';
import postcssPresetEnv from 'postcss-preset-env';
import postcssNesting from 'postcss-nesting';

const production = process.env.NODE_ENV === 'production';

// PostCSS plugins configuration
export default {
  plugins: [
    postcssNesting,
    tailwindcss,
    autoprefixer,
    
    // Production-only plugins
    production && purgecss({
      content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
      ],
      defaultExtractor: (content) => {
        // Capture as liberally as possible, including things like `h-(screen-1.5)`
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
        
        // Capture classes within other delimiters like .block(class="w-1/2" in pug)
        const innerMatches = content.match(/[^<>"'`\s.(){}[\]]+[^<>"'`\s.(){}[\]:]/g) || [];
        
        return broadMatches.concat(innerMatches);
      },
      safelist: {
        standard: [
          /^swiper-/,         // Swiper.js classes
          /^slick-/,          // Slick slider classes
          /^Toastify/,        // Toastify notification classes
          /^Mui/,             // Material-UI classes
          /^css-/,            // Emotion CSS classes
          /^makeStyles-/,     // JSS classes
          /^Mui(?!-Mui-)/,    // More Material-UI classes
          /-active$/,         // All active states
          /-enter$/,          // Animation enter states
          /-exit$/,           // Animation exit states
          /show$/,            // Show/hide states
          /^ais-/,            // Algolia InstantSearch
          /^react-/,          // React specific classes
          /^data-/,           // Data attributes
          /^::?[a-z-]+$/,     // Pseudo-elements and pseudo-classes
        ],
        greedy: [
          /-active$/,         // All active states
          /-enter$/,          // Animation enter states
          /-exit$/,           // Animation exit states
          /show$/,            // Show/hide states
        ],
      },
    }),
    production && cssnano({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: true,
        minifyFontValues: {
          removeQuotes: false,
        },
        // Disable z-index minification as it can cause issues
        zindex: false,
      }],
    }),
    // Ensure CSS variables are preserved
    postcssPresetEnv({
      stage: 1,
      features: {
        'nesting-rules': true,
        'custom-media-queries': true,
        'custom-selectors': true,
        'custom-properties': {
          preserve: true,
          fallback: true,
        },
      },
    }),
  ].filter(Boolean),
};
