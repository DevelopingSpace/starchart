import { Box, Container, Stack, HStack, Text, Link } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box as="footer" backgroundColor="whitesmoke" borderTopWidth={1} borderStyle={'solid'}>
      <Container
        as={Stack}
        maxW={'6xl'}
        py={4}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
      >
        <HStack spacing={6}>
          <Link href="https://github.com/DevelopingSpace/starchart" target="_blank" isExternal>
            GitHub
          </Link>
          <Link
            href="https://www.senecacollege.ca/about/policies/information-technology-acceptable-use-policy.html"
            target="_blank"
            isExternal
          >
            Acceptable Use Policy
          </Link>
        </HStack>
        <Text>&copy; {new Date().getFullYear()} Seneca College. All rights reserved.</Text>
      </Container>
    </Box>
  );
}
