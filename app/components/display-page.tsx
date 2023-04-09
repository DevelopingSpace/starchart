import { Center, Flex, Image, Heading } from '@chakra-ui/react';

interface DisplayPageProps {
  img: string;
  desc: string;
}

export default function DisplayPage({ img, desc }: DisplayPageProps) {
  return (
    <Center paddingY="24" paddingX="2">
      <Flex
        flexDirection="column"
        width={{ base: 'lg', sm: '2xl', md: '5xl' }}
        textAlign="center"
        gap="5"
      >
        <Flex justifyContent="center">
          <Image src={img} />
        </Flex>

        <Center>
          <Heading
            as="h2"
            size={{ base: 'md', sm: 'lg', md: 'xl' }}
            fontFamily="heading"
            fontWeight="light"
            color="brand.500"
            maxWidth="30ch"
          >
            {desc}
          </Heading>
        </Center>
      </Flex>
    </Center>
  );
}
