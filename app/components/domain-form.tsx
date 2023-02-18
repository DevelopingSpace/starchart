import { AddIcon } from '@chakra-ui/icons';
import { Button, Input, Select, Textarea, VStack } from '@chakra-ui/react';
import { Form } from '@remix-run/react';

export default function DomainForm() {
  return (
    <Form method="post">
      <VStack maxW="lg" spacing="5">
        <Input placeholder="Domain Name" name="name" />
        <Select placeholder="Type" name="type">
          <option value="A">A</option>
          <option value="AAAA">AAAA</option>
          <option value="CNAME">CNAME</option>
          <option value="TXT">TXT</option>
        </Select>
        <Input placeholder="Value" name="value" />
        <Input placeholder="Ports" name="ports" />
        <Input placeholder="Course" name="course" />
        <Textarea placeholder="Description" rows={10} name="description" />
      </VStack>
      <Button type="submit" mt="6" rightIcon={<AddIcon boxSize={3} />}>
        Create
      </Button>
    </Form>
  );
}
