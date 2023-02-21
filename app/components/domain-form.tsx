import { AddIcon, InfoIcon } from '@chakra-ui/icons';
import { Button, HStack, Input, Select, Textarea, Tooltip, VStack } from '@chakra-ui/react';
import { Form } from '@remix-run/react';

export default function DomainForm() {
  return (
    <Form className="domain-form" method="post">
      <VStack maxW="xl" spacing="5">
        <HStack w="100%">
          <Input placeholder="Domain Name" name="name" />
          <Tooltip>
            <InfoIcon color="#d9d9d9" fontSize="xl" />
          </Tooltip>
        </HStack>
        <HStack w="100%">
          <Select placeholder="Type" name="type">
            <option value="A">A</option>
            <option value="AAAA">AAAA</option>
            <option value="CNAME">CNAME</option>
            <option value="TXT">TXT</option>
          </Select>
          <Tooltip>
            <InfoIcon />
          </Tooltip>
        </HStack>
        <HStack w="100%">
          <Input placeholder="Value" name="value" />
          <Tooltip>
            <InfoIcon />
          </Tooltip>
        </HStack>
        <HStack w="100%">
          <Input placeholder="Ports" name="ports" />
          <Tooltip>
            <InfoIcon />
          </Tooltip>
        </HStack>
        <HStack w="100%">
          <Input placeholder="Course" name="course" />
          <Tooltip>
            <InfoIcon />
          </Tooltip>
        </HStack>
        <Textarea placeholder="Description" rows={10} name="description" />
      </VStack>
      <Button type="submit" mt="6" rightIcon={<AddIcon boxSize={3.5} mt="0.15rem" />}>
        Create
      </Button>
    </Form>
  );
}
