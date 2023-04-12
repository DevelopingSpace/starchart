import { useEffect } from 'react';
import {
  Flex,
  Box,
  HStack,
  Text,
  Heading,
  Tooltip,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  useToast,
  useClipboard,
} from '@chakra-ui/react';
import { DownloadIcon, CopyIcon } from '@chakra-ui/icons';
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
  const toast = useToast();
  const { onCopy, hasCopied } = useClipboard(value);

  useEffect(() => {
    if (hasCopied) {
      toast({
        title: `${title} was copied to the clipboard`,
        position: 'bottom-right',
        status: 'success',
      });
    }
  }, [title, toast, hasCopied]);

  return (
    <Flex
      flexDirection="column"
      gap="4"
      textAlign={{ base: 'center', md: 'left' }}
      fontSize={{ base: 'sm', md: 'md' }}
    >
      <HStack gap="4" alignSelf={{ base: 'center', md: 'flex-start' }}>
        <Heading as="h4" size="sm">
          {title}
        </Heading>
        <Tooltip label={`Copy ${title}`}>
          <IconButton
            backgroundColor="transparent"
            color="black"
            size="xs"
            _hover={{
              background: 'whitesmoke',
              color: 'teal.500',
            }}
            aria-label={`Copy ${title}`}
            icon={<CopyIcon fontSize="md" />}
            onClick={onCopy}
          />
        </Tooltip>
        <Tooltip label={`Download ${title}`}>
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
              icon={
                <DownloadIcon
                  fontSize="md"
                  onClick={() =>
                    toast({
                      title: `${title} is Downloaded`,
                      position: 'bottom-right',
                      status: 'success',
                    })
                  }
                />
              }
            />
          </Link>
        </Tooltip>
      </HStack>
      <Text>{description}</Text>
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box as="span" flex="1">
              Show/Hide
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Flex justifyContent="center">
              <Text
                fontFamily="mono"
                maxWidth={{ base: '2xs', xs: 'sm', sm: 'md', md: 'full' }}
                fontSize={{ base: '3xs', xs: '2xs', sm: 'xs', md: 'md' }}
                css={{ whiteSpace: 'pre-line' }}
              >
                {value}
              </Text>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Flex>
  );
}
