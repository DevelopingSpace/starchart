import {
  toRoute53RecordValue,
  fromRoute53RecordValue,
} from 'services/reconciler/route53Utils.server';
import { DnsRecordType } from '@prisma/client';

describe('Route53 functionality test raw => Route53 format', () => {
  test('Ignores a non-TXT record', () => {
    const result = toRoute53RecordValue(DnsRecordType.A, '1.2.3.4');

    expect(result).toEqual('1.2.3.4');
  });

  test('Handles input with no special chars, and < 255 length', () => {
    // Adding characters from the edge of range
    const result = toRoute53RecordValue(DnsRecordType.TXT, '!Hello~');

    expect(result).toEqual('"!Hello~"');
  });

  test('Handles special characters correctly (space, quotation mark, backslash)', () => {
    const result = toRoute53RecordValue(
      DnsRecordType.TXT,
      // Using a sequence of chars, trying to mislead parsing
      [' ', '\\', '"', '\\', ' ', 'Hello', ' ', '"', 'World', '"', ' '].join('')
    );

    expect(result).toEqual(
      [
        '"',
        '\\040',
        '\\\\',
        '\\"',
        '\\\\',
        '\\040',
        'Hello',
        '\\040',
        '\\"',
        'World',
        '\\"',
        '\\040',
        '"',
      ].join('')
    );
  });

  test('Handles long strings (> 255 char)', () => {
    const result = toRoute53RecordValue(DnsRecordType.TXT, 'a'.repeat(1000));

    expect(result).toEqual(
      `"${'a'.repeat(255)}" "${'a'.repeat(255)}" "${'a'.repeat(255)}" "${'a'.repeat(235)}"`
    );
  });
});

describe('Route53 functionality test Route53 => raw format', () => {
  test('Ignores a non-TXT record', () => {
    const result = fromRoute53RecordValue(DnsRecordType.A, '1.2.3.4');

    expect(result).toEqual('1.2.3.4');
  });

  test('Handles input with no special chars, and < 255 length', () => {
    // Adding characters from the edge of range
    const result = fromRoute53RecordValue(DnsRecordType.TXT, '"!Hello~"');

    expect(result).toEqual('!Hello~');
  });

  test('Handles special characters correctly (space quotation mark and backslash)', () => {
    const result = fromRoute53RecordValue(
      DnsRecordType.TXT,
      // Using a sequence of chars, trying to mislead parsing (do not double unescape escape characters)
      [
        '"',
        '\\040',
        '\\\\',
        '\\"',
        '\\\\',
        '\\040',
        'Hello',
        '\\040',
        '\\"',
        'World',
        '\\"',
        '\\040',
        '"',
      ].join('')
    );

    expect(result).toEqual(
      [' ', '\\', '"', '\\', ' ', 'Hello', ' ', '"', 'World', '"', ' '].join('')
    );
  });

  test('Handles long strings (> 255 char)', () => {
    const result = fromRoute53RecordValue(
      DnsRecordType.TXT,
      `"${'a'.repeat(255)}" "${'a'.repeat(255)}" "${'a'.repeat(255)}" "${'a'.repeat(235)}"`
    );

    expect(result).toEqual('a'.repeat(1000));
  });
});
