import { Flex, Heading, Text, HStack, Button } from '@chakra-ui/react';

import Description from './description';

interface CertificateRequestViewProps {
  subject: string;
  validFrom: Date;
  validTo: Date;
  onRequest: () => void;
}

export default function CertificateRequestView({
  subject,
  validFrom,
  validTo,
  onRequest,
}: CertificateRequestViewProps) {
  return (
    <Flex flexDirection="column" gap="5" width="4xl">
      <Description
        description="Initial: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
        certRequested={false}
        validFrom={validFrom}
        validTo={validTo}
      />
      <Flex flexDirection="column" gap="1">
        <Heading as="h3" size="md" marginBottom="3">
          Domain Name
        </Heading>
        <Text>Lorem Ipsum is simply dummy text of the printing and typesetting industry</Text>

        <HStack>
          <Text fontWeight="bold">Domain Name:</Text> <Text>{subject}</Text>
        </HStack>
      </Flex>
      <Button width="3xs" shadow="xl" onClick={onRequest}>
        Request a Certificate
      </Button>
    </Flex>
  );
}
