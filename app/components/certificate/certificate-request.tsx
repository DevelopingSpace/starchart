import { Flex, Heading, Text, Button, Alert } from '@chakra-ui/react';
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
        description="By clicking the Request a Certificate button, you will initiate a request for an HTTPS certificate that you can use with any project connected to your DNS records."
        certRequested={false}
        link="information"
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
        <Text maxW={600}>All of your subdomains can be secured by your certificate</Text>
        <Flex
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'center', md: 'flex-start' }}
        >
          <Text fontWeight="bold">Domain Name:&nbsp;</Text>
          <Text>*.{domain}</Text>
        </Flex>
      </Flex>
      <Form method="post" onSubmit={() => setIsDisabled(true)}>
        <Button type="submit" width={{ base: 'full', md: '3xs' }} shadow="xl" disabled={isDisabled}>
          Request a Certificate
        </Button>
      </Form>
      {isFailed && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title mr={2}>Request Unsuccessful: </Alert.Title>
          <Alert.Description>
            Unfortunately, your previous request was not successful.
          </Alert.Description>
        </Alert.Root>
      )}
    </Flex>
  );
}
