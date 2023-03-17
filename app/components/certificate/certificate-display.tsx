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
              <Text maxWidth={{ base: '3xs', xs: 'xs', sm: 'md', md: 'full' }}>{value}</Text>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Flex>
  );
}
