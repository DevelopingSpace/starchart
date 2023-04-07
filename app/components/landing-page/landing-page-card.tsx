import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  Link,
  Text,
} from '@chakra-ui/react';
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
    <Card variant="filled" backgroundColor="whitesmoke" maxWidth="sm" align="center">
      <CardHeader>
        <Heading as="h2" size="lg" color="brand.500" height="100%">
          {cardName}
        </Heading>
      </CardHeader>
      <CardBody>
        <Flex direction="column" gap={4}>
          <Text>{cardDescription}</Text>
          {instructionsPath && (
            <Text>
              To learn more, see{' '}
              <Link as={RemixLink} to={instructionsPath}>
                these instructions
              </Link>
              .
            </Text>
          )}
        </Flex>
      </CardBody>
      <CardFooter>
        <Button as={RemixLink} to={{ pathname: path }} size={{ base: 'xs', xs: 'sm', md: 'md' }}>
          {pathName}
        </Button>
      </CardFooter>
    </Card>
  );
}
