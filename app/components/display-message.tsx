import { Center, Flex, Image, Heading } from '@chakra-ui/react';

interface DisplayMessageProps {
  img: string;
  desc: string;
  alt: string;
}

export default function DisplayMessage({ img, desc, alt }: DisplayMessageProps) {
  return (
    <Center paddingY="24" paddingX="2">
      <Flex
        flexDirection="column"
        width={{ base: 'lg', sm: '2xl', md: '5xl' }}
        textAlign="center"
        gap="5"
      >
        <Flex justifyContent="center">
          <Image src={img} alt={alt} />
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
