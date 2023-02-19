import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react';
import colors from './colors';

const theme = extendTheme(
  {
    colors,
    styles: {
      global: {
        '.domain-form': {
          // InfoIcon
          '.chakra-icon': {
            color: '#d9d9d9',
            fontSize: 'xl',
          },
        },
      },
    },
  },
  withDefaultColorScheme({ colorScheme: 'brand' })
);

export default theme;
