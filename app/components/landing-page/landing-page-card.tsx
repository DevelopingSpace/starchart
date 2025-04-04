import { Button, Card, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { Link as RemixLink } from '@remix-run/react';

interface LandingPageCardProps {
  path: string;
  pathName: string;
  cardName: string;
  cardDescription: string;
  instructionsPath?: string;
}

export default function LandingPageCard({
  path,
  pathName,
  cardName,
  cardDescription,
  instructionsPath,
}: LandingPageCardProps) {
  return (
    <Card.Root variant="subtle" backgroundColor="whitesmoke" maxWidth="sm">
      <Card.Header>
        <Heading as="h2" size="lg" color="brand.500" height="100%">
          {cardName}
        </Heading>
      </Card.Header>
      <Card.Body>
        <Flex direction="column" gap={4}>
          <Text>{cardDescription}</Text>
          {instructionsPath && (
            <Text>
              To learn more, refer to our{' '}
              <Link asChild>
                <RemixLink to={instructionsPath}>
                  {instructionsPath === '/certificate/information'
                    ? 'information page'
                    : 'instructions page'}
                </RemixLink>
              </Link>
              .
            </Text>
          )}
        </Flex>
      </Card.Body>
      <Card.Footer>
        <Button asChild size={{ base: 'xs', sm: 'sm', md: 'md' }}>
          <RemixLink to={{ pathname: path }}>{pathName}</RemixLink>
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}
