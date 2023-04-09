import { defineStyleConfig, extendTheme, withDefaultColorScheme } from '@chakra-ui/react';
import colors from './colors';
import breakpoints from './breakpoints';

const theme = extendTheme(
  {
    colors,
    breakpoints,
    components: {
      Link: defineStyleConfig({
        baseStyle: {
          color: 'brand.500',
          textDecor: 'underline',
        },
      }),
    },
  },
  withDefaultColorScheme({ colorScheme: 'brand' })
);

export default theme;
