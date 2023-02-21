import { Center, Flex, Image, Heading } from '@chakra-ui/react';

import undrawSvg from '~/assets/undraw_processing_re_tbdu.svg';

export default function LoadingView() {
  return (
    <Center paddingY="24" paddingX="2">
      <Flex
        flexDirection="column"
        width={{ base: 'lg', sm: '2xl', md: '5xl' }}
        textAlign="center"
        gap="5"
      >
        <Image src={undrawSvg} />
        <Heading
          as="h2"
          size={{ base: 'md', sm: 'lg', md: 'xl' }}
          fontFamily="heading"
          fontWeight="light"
          color="brand.500"
        >
          We have received your request, and will notify you when your certificate is ready
        </Heading>
      </Flex>
    </Center>
  );
}
