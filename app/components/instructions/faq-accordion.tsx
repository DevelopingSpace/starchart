import {
  AccordionItem,
  AccordionButton,
  Box,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';

interface FaqAccordionProps {
  title: string;
  children: string | JSX.Element | JSX.Element[];
}

export default function FaqAccordion({ title, children }: FaqAccordionProps) {
  return (
    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          {title}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>{children}</AccordionPanel>
    </AccordionItem>
  );
}
