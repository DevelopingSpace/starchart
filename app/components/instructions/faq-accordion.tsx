import { Accordion, Box, Text } from '@chakra-ui/react';

interface FaqAccordionProps {
  title: string;
  children: string | JSX.Element | JSX.Element[];
}

export default function FaqAccordion({ title, children }: FaqAccordionProps) {
  return (
    <Accordion.Item value={title}>
      <Accordion.ItemTrigger>
        <Box flex="1" textAlign="left">
          <Text fontWeight="medium">{title}</Text>
        </Box>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent pb={4}>
        <Accordion.ItemBody>{children}</Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}
