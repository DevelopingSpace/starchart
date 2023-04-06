import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import { Link } from '@remix-run/react';

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
              <Text as={Link} to={instructionsPath} color="brand.500" textDecor="underline">
                these instructions
              </Text>
              .
            </Text>
          )}
        </Flex>
      </CardBody>
      <CardFooter>
        <Button as={Link} to={{ pathname: path }} size={{ base: 'xs', xs: 'sm', md: 'md' }}>
          {pathName}
        </Button>
      </CardFooter>
    </Card>
  );
}
