import { Box, Button, Heading, Text } from '@chakra-ui/react';
import type { ThrownResponse } from '@remix-run/react';
import { useNavigate } from '@remix-run/react';
import { getErrorMessageFromStatusCode } from '~/utils';

interface SeenErrorLayoutProps {
  result: ThrownResponse<number, any>;
  mapStatusToErrorText?: (statusCode: number) => string;
}

export default function SeenErrorLayout({
  result,
  mapStatusToErrorText = getErrorMessageFromStatusCode,
}: SeenErrorLayoutProps) {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading as="h2" size="2xl">
        {result.status}
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        {mapStatusToErrorText(result.status)}
      </Text>
      <Text color={'gray.500'} mb={6}>
        {result.data}
      </Text>
      <Button colorScheme="brand" color="white" variant="solid" onClick={() => navigate('/')}>
        Go to Home
      </Button>
    </Box>
  );
}
