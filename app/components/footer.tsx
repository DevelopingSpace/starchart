import { Box, Container, Stack, HStack, Text, Link } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box as="footer" backgroundColor="whitesmoke" borderTopWidth={1} borderStyle={'solid'}>
      <Container asChild>
        <Stack
          maxW={'6xl'}
          py={'4px'}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
        >
          <Box padding="3">
            <HStack>
              <Link
                href="https://github.com/DevelopingSpace/starchart"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Link>
              <Link
                href="https://www.senecapolytechnic.ca/about/policies/information-technology-acceptable-use-policy.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Acceptable Use Policy
              </Link>
            </HStack>
          </Box>

          <Text>&copy; {new Date().getFullYear()} Seneca Polytechnic. All rights reserved.</Text>
        </Stack>
      </Container>
    </Box>
  );
}
