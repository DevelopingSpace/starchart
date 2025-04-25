import { FaPlus, FaPenToSquare } from 'react-icons/fa6';
import {
  Button,
  Input,
  InputGroup,
  Portal,
  Select,
  Textarea,
  VStack,
  createListCollection,
  Icon,
} from '@chakra-ui/react';
import { Form } from '@remix-run/react';
import type { DnsRecord } from '@prisma/client';
import { useEffectiveUser } from '~/utils';
import FormField from './form-field';
import { useMemo } from 'react';
import type { z } from 'zod';

type FormMode = 'CREATE' | 'EDIT';

interface dnsRecordFormProps {
  mode: FormMode;
  dnsRecord?: DnsRecord;
  errors?: z.typeToFlattenedError<DnsRecord>;
}

export default function DnsRecordForm({ dnsRecord, mode, errors }: dnsRecordFormProps) {
  const user = useEffectiveUser();

  const submitButtonText = useMemo(() => (mode === 'CREATE' ? 'Create' : 'Update'), [mode]);
  const SubmitButtonIcon = useMemo(() => (mode === 'CREATE' ? FaPlus : FaPenToSquare), [mode]);

  const recordTypes = createListCollection({
    items: [
      { label: 'A Record (IPv4 Address)', value: 'A' },
      { label: 'AAAA Record (IPv6 Address)', value: 'AAAA' },
      { label: 'CNAME Record (Domain Name)', value: 'CNAME' },
      { label: 'MX Record (Mail Server)', value: 'MX' },
      { label: 'TXT Record (Text Value)', value: 'TXT' },
    ],
  });

  return (
    <Form method="post">
      <VStack maxW="xl" gap="6">
        <FormField
          label="Name"
          isRequired={true}
          error={errors?.fieldErrors.subdomain?.join(' ')}
          helpText="DNS Record Names can contain lowercase letters (a-z), numbers (0-9), and - or _"
        >
          <InputGroup endElement={`.${user.baseDomain}`}>
            <Input name="subdomain" defaultValue={dnsRecord?.subdomain} />
          </InputGroup>
        </FormField>

        <FormField
          label="Type"
          isRequired={true}
          helpText="DNS Record Type (IPv4, IPv6, Domain Name, Mail Server, Text) indicates what Value will be"
          error={errors?.fieldErrors.type?.join(' ')}
        >
          <Select.Root
            collection={recordTypes}
            name="type"
            {...(dnsRecord?.type !== undefined && { defaultValue: [dnsRecord.type] })}
          >
            <Select.HiddenSelect />
            <Select.Label>Choose DNS Record Type</Select.Label>

            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select a type" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>

            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {recordTypes.items.map((type) => (
                    <Select.Item item={type} key={type.value}>
                      {type.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </FormField>

        <FormField
          label="Value"
          isRequired={true}
          helpText="Value must match Type: A=IPv4, AAAA=IPv6, CNAME=domain.com, MX=domain.com, TXT=any text..."
          error={errors?.fieldErrors.value?.join(' ')}
        >
          <Input name="value" defaultValue={dnsRecord?.value} />
        </FormField>

        <FormField
          label="Ports"
          helpText="Enter one or more Ports in use, separated by comma (e.g., 8080, 1234)"
          error={errors?.fieldErrors.ports?.join(' ')}
        >
          <Input name="ports" defaultValue={dnsRecord?.ports ?? ''} />
        </FormField>

        <FormField
          label="Course"
          helpText="Course name using this DNS Record (e.g., OSD700)"
          error={errors?.fieldErrors.course?.join(' ')}
        >
          <Input name="course" defaultValue={dnsRecord?.course ?? ''} />
        </FormField>

        <FormField label="Description" error={errors?.fieldErrors.description?.join(' ')}>
          <Textarea rows={10} name="description" defaultValue={dnsRecord?.description ?? ''} />
        </FormField>
      </VStack>
      {dnsRecord && <input type="hidden" name="id" value={dnsRecord.id} />}
      <Button type="submit" mt="6">
        {submitButtonText}{' '}
        <Icon boxSize={3.5} mt="0.15rem">
          <SubmitButtonIcon />
        </Icon>
      </Button>
    </Form>
  );
}
