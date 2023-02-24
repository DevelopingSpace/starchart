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
} from '@chakra-ui/react';
import { DownloadIcon, CopyIcon } from '@chakra-ui/icons';

interface CertificateDisplayProps {
  title: string;
  value: string;
  description: string;
}

export default function CertificateDisplay({ title, description, value }: CertificateDisplayProps) {
  const toast = useToast();

  function onCopy() {
    navigator.clipboard.writeText(value);
    toast({
      title: `${title} was copied to the clipboard`,
      position: 'bottom-right',
      status: 'success',
    });
  }

  return (
    <Flex flexDirection="column" gap="5">
      <Flex flexDirection="column" gap="4">
        <HStack gap="4">
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
              aria-label="Copy to Clipboard"
              icon={<CopyIcon fontSize="md" />}
              onClick={() => onCopy()}
            />
          </Tooltip>
          <Tooltip label={`Download ${title}`}>
            <IconButton
              backgroundColor="transparent"
              color="black"
              size="xs"
              _hover={{
                background: 'brand.500',
                color: 'white',
              }}
              aria-label="Download"
              icon={
                <DownloadIcon
                  fontSize="md"
                  onClick={() =>
                    toast({
                      title: `Downloading ${title}`,
                      position: 'bottom-right',
                      status: 'success',
                    })
                  }
                />
              }
            />
          </Tooltip>
        </HStack>
        <Text>{description}</Text>
        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Show/Hide
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Text>{value}</Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
    </Flex>
  );
}
