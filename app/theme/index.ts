import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react';
import colors from './colors';
import breakpoints from './breakpoints';

const theme = extendTheme(
  {
    colors,
    breakpoints,
  },
  withDefaultColorScheme({ colorScheme: 'brand' })
);

export default theme;
