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
          fg: { value: '{colors.brand.500}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.500}' },
        },
      },
    },
  },
  globalCss: styles,
});

export default theme;
