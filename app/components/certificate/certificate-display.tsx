import { useEffect } from 'react';
import {
  Flex,
  Box,
  HStack,
  Text,
  Heading,
  IconButton,
  Accordion,
  useClipboard,
  Icon,
} from '@chakra-ui/react';
import { FaDownload, FaCopy } from 'react-icons/fa6';
import { Tooltip } from '~/components/ui/tooltip';
import { Toaster, toaster } from '~/components/ui/toaster';
import { Link } from '@remix-run/react';

interface CertificateDisplayProps {
  title: string;
  value: string;
  description: string;
  downloadPart: 'certificate' | 'privateKey' | 'chain' | 'fullChain';
}

export default function CertificateDisplay({
  title,
  description,
  value,
  downloadPart,
}: CertificateDisplayProps) {
  const clipboard = useClipboard({ value });

  useEffect(() => {
    if (clipboard.copied) {
      toaster.create({
        title: `${title} was copied to the clipboard`,
        type: 'success',
      });
    }
  }, [title, clipboard.copied]);

  return (
    <>
      <Toaster />
      <Flex
        flexDirection="column"
        gap="4"
        textAlign={{ base: 'center', md: 'left' }}
        fontSize={{ base: 'sm', md: 'md' }}
        paddingBottom={6}
      >
        <HStack gap="4" alignSelf={{ base: 'center', md: 'flex-start' }}>
          <Heading as="h3" size="sm">
            {title}
          </Heading>
          <Tooltip content={`Copy ${title}`}>
            <IconButton
              backgroundColor="transparent"
              color="black"
              size="xs"
              _hover={{
                background: 'whitesmoke',
                color: 'teal.500',
              }}
              aria-label={`Copy ${title}`}
              onClick={clipboard.copy}
            >
              <Icon fontSize="md">
                <FaCopy />
              </Icon>
            </IconButton>
          </Tooltip>
          <Tooltip content={`Download ${title}`}>
            <Link to={`/certificate/download/${downloadPart}`} reloadDocument>
              <IconButton
                backgroundColor="transparent"
                color="black"
                size="xs"
                _hover={{
                  background: 'brand.500',
                  color: 'white',
                }}
                aria-label={`Download ${title}`}
              >
                <Icon
                  fontSize="md"
                  onClick={() =>
                    toaster.create({
                      title: `${title} is Downloaded`,
                      type: 'success',
                    })
                  }
                >
                  <FaDownload />
                </Icon>
              </IconButton>
            </Link>
          </Tooltip>
        </HStack>
        <Text>{description}</Text>
        <Accordion.Root multiple={true}>
          <Accordion.Item value="certificate">
            <Accordion.ItemTrigger>
              <Box as="span" flex="1">
                Show/Hide
              </Box>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Flex justifyContent="center">
                <Text
                  fontFamily="mono"
                  minWidth="max-content"
                  maxWidth={{ base: '2xs', xs: 'sm', sm: 'md', md: 'full' }}
                  fontSize={{ base: '3xs', xs: '2xs', sm: 'xs', md: 'md' }}
                  css={{ whiteSpace: 'pre-line', wordWrap: 'normal' }}
                >
                  {value}
                </Text>
              </Flex>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </Flex>
    </>
  );
}
