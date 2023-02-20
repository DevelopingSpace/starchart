import { Center, Flex, Box, Image, Heading } from '@chakra-ui/react';

import undrawSvg from 'img/undraw_processing_re_tbdu.svg';

export default function LoadingView() {
  return (
    <Center paddingY="24">
      <Flex flexDirection="column" width="5xl" textAlign="center" gap="5">
        <Box>
          <Image src={undrawSvg} />
        </Box>
        <Heading as="h2" size="xl" fontFamily="heading" fontWeight="light" color="brand.500">
          We have received your request, and will notify you when your certificate is ready
        </Heading>
      </Flex>
    </Center>
  );
}
