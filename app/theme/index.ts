import { createSystem, defaultConfig, defineRecipe } from '@chakra-ui/react';
import colors from './colors';
import breakpoints from './breakpoints';
import styles from './styles';

const theme = createSystem(defaultConfig, {
  theme: {
    recipes: {
      link: defineRecipe({
        base: {
          textDecor: 'underline',
        },
      }),
    },
    tokens: {
      colors,
      breakpoints,
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: 'white' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.500}' },
        },
        brand_gray: {
          solid: { value: '{colors.brand_gray.500}' },
          contrast: { value: 'colors.brand_gray.100' },
          fg: { value: '{colors.brand_gray.700}' },
          muted: { value: '{colors.brand_gray.100}' },
          subtle: { value: '{colors.brand_gray.200}' },
          emphasized: { value: '{colors.brand_gray.300}' },
          focusRing: { value: '{colors.brand_gray.500}' },
        },
      },
    },
  },
  globalCss: styles,
});

export default theme;
