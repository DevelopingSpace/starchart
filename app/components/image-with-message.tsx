import { Center, Flex, Image, Heading, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from '@remix-run/react';
interface ImageWithMessageProps {
  img: string;
  desc: string;
  alt: string;
}

export default function ImageWithMessage({ img, desc, alt }: ImageWithMessageProps) {
  const navigate = useNavigate();

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
          <VStack>
            <Heading
              as="h2"
              size={{ base: 'md', sm: 'lg', md: 'xl' }}
              fontFamily="heading"
              fontWeight="light"
              color="brand.500"
              maxWidth="30ch"
              mb={4}
            >
              {desc}
            </Heading>
            <Button
              colorScheme="brand"
              color="white"
              variant="solid"
              onClick={() => navigate('/')}
              w={120}
            >
              Go to Home
            </Button>
          </VStack>
        </Center>
      </Flex>
    </Center>
  );
}
