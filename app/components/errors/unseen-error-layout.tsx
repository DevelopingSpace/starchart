import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from '@remix-run/react';

interface UnseenErrorLayoutProps {
  errorText: string;
}

export default function UnseenErrorLayout({ errorText }: UnseenErrorLayoutProps) {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" py="10" px="">
      <Heading as="h2" size="2xl">
        Ooops, unexpected error
      </Heading>
      <Text fontSize="18px" mt="3" mb="8">
        {errorText}
      </Text>
      <Button colorScheme="brand" color="white" variant="solid" onClick={() => navigate('/')}>
        Go to Home
      </Button>
    </Box>
  );
}
