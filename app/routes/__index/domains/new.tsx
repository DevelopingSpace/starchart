import { Container, Heading, Text } from '@chakra-ui/react';
import DomainForm from '~/components/domain-form';

export default function NewDomainRoute() {
  return (
    <Container maxW="container.xl">
      <Heading as="h1" size="xl" mt="8">
        Create new domain
      </Heading>
      <Text maxW="lg" mb="3" mt="2">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s
      </Text>
      <DomainForm />
    </Container>
  );
}
