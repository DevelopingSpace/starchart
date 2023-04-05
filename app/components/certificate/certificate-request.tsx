import {
  Flex,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { Form } from '@remix-run/react';
import { useState } from 'react';

import Description from './description';

interface CertificateRequestViewProps {
  domain: string;
  isFailed: boolean;
}

export default function CertificateRequestView({ domain, isFailed }: CertificateRequestViewProps) {
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <Flex
      flexDirection="column"
      gap="5"
      alignItems={{ base: 'center', md: 'flex-start' }}
      paddingX="1"
    >
      <Description
        description="Initial: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
        certRequested={false}
      />
      <Flex
        flexDirection="column"
        fontSize={{ base: 'sm', md: 'md' }}
        gap={{ base: '3', md: '' }}
        alignItems={{ base: 'center', md: 'flex-start' }}
        textAlign={{ base: 'center', md: 'left' }}
      >
        <Heading as="h3" size={{ base: 'sm', md: 'md' }}>
          Domain Name
        </Heading>
        <Text>Lorem Ipsum is simply dummy text of the printing and typesetting industry</Text>
        <Flex
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'center', md: 'flex-start' }}
        >
          <Text fontWeight="bold">Domain Name:&nbsp;</Text>
          <Text>{domain}</Text>
        </Flex>
      </Flex>
      <Form method="post" onSubmit={() => setIsDisabled(true)}>
        <Button
          type="submit"
          width={{ base: 'full', md: '3xs' }}
          shadow="xl"
          isDisabled={isDisabled}
        >
          Request a Certificate
        </Button>
      </Form>
      {isFailed && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Request Unsuccessful: </AlertTitle>
          <AlertDescription>
            Unfortunately, your previous request was not successful.
          </AlertDescription>
        </Alert>
      )}
    </Flex>
  );
}
