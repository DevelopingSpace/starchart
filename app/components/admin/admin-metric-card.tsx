import { Card, Text, Flex, Icon } from '@chakra-ui/react';
import { Tooltip } from '~/components/ui/tooltip';
import { FaCircleInfo } from 'react-icons/fa6';
import type { IconType } from 'react-icons';

interface AdminMetricCardProps {
  name: string;
  tooltipText: string;
  value: number;
  IconComponent: IconType;
}

export default function AdminMetricCard({
  IconComponent,
  name,
  value,
  tooltipText,
}: AdminMetricCardProps) {
  return (
    <Card.Root w={{ sm: '100%', md: 300 }} minW={270} maxW={400} mr={{ sm: '0', md: '4' }} mt="4">
      <Card.Body flexDirection="row" display="flex" justifyContent="space-between">
        <Flex alignItems="center">
          <Flex
            background="#d9d9d9"
            w="10"
            h="10"
            borderRadius="full"
            justifyContent="center"
            alignItems="center"
            mr="4"
          >
            <IconComponent color="white" size={24} />
          </Flex>
          <Flex flexDirection="column">
            <Text color="blackAlpha.700" fontSize="lg">
              {name}
            </Text>
            <Text fontSize="3xl" fontWeight="semibold">
              {new Intl.NumberFormat('en-CA').format(value)}
            </Text>
          </Flex>
        </Flex>
        <Tooltip content={tooltipText}>
          <Icon color="#d9d9d9" fontSize="xl">
            <FaCircleInfo />
          </Icon>
        </Tooltip>
      </Card.Body>
    </Card.Root>
  );
}
