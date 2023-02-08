import { Heading, Text, Link } from '@chakra-ui/react';

export default function CertificateInstructionsRoute() {
  return (
    <div>
      <Heading as="h1" size="3xl">
        Certificate Instructions Page
      </Heading>
      <Text fontSize="2xl">
        For information about this page, click{' '}
        <Link
          href="https://github.com/Seneca-CDOT/starchart/issues/114"
          isExternal={true}
          color="blue.500"
        >
          here
        </Link>
      </Text>
    </div>
  );
}
