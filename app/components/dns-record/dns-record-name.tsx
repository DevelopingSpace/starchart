import type { FC } from 'react';
import React from 'react';
import { Flex, Text } from '@chakra-ui/react';

interface DnsRecordNameProps {
  name: string;
}

const DnsRecordName: FC<DnsRecordNameProps> = (props) => {
  const { name } = props;
  const [nameBase, ...restOfName] = name.split('.');

  return (
    <Flex alignItems="flex-end" flexDirection="row">
      <Text>
        <Text as="span" sx={{ fontWeight: 'medium' }}>
          {nameBase}
        </Text>
        <Text as="span" color="gray.500">
          .{restOfName}
        </Text>
      </Text>
    </Flex>
  );
};

export default DnsRecordName;
