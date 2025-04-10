/*
  Adding MX Record ENUM type for DNS Records
*/

-- AlterTable
ALTER TABLE `DnsRecord` MODIFY `type` ENUM('A', 'AAAA', 'CNAME', 'TXT', 'MX') NOT NULL;
