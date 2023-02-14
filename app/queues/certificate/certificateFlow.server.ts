import { FlowProducer } from 'bullmq';
import type { FlowJob } from 'bullmq';
import { orderCreatorQueueName, orderCreatorWorker } from './orderCreatorWorker.server';
import type { OrderCreatorData } from './orderCreatorWorker.server';
import { dnsWaiterQueueName, dnsWaiterWorker } from './dnsWaiterWorker.server';
import type { DnsWaiterData } from './dnsWaiterWorker.server';
import {
  challengeCompleterQueueName,
  challengeCompleterWorker,
} from './challengeCompleterWorker.server';
import type { ChallengeCompleterData } from './challengeCompleterWorker.server';
import { orderCompleterQueueName, orderCompleterWorker } from './orderCompleterWorker.server copy';
import type { OrderCompleterData } from './orderCompleterWorker.server copy';
import { dnsCleanerQueueName, dnsCleanerWorker } from './dnsCleanerWorker.server';
import type { DnsCleanerData } from './dnsCleanerWorker.server';

// Exporting these to allow for graceful shutdown
export {
  orderCreatorWorker,
  dnsWaiterWorker,
  challengeCompleterWorker,
  orderCompleterWorker,
  dnsCleanerWorker,
};

const flowProducer = new FlowProducer();

export const addCertRequest = async (rootDomain: string) => {
  /**
   * We are adding 5 jobs, to separate queues, each
   * parent depending on the child to complete
   *
   * We need to nest these in reverse order, the
   * parent is always executed *after* the child
   *
   * https://docs.bullmq.io/guide/flows
   */

  // Step 1, create order
  const orderCreator: FlowJob = {
    name: `createOrder:${rootDomain}`,
    queueName: orderCreatorQueueName,
    data: { rootDomain } as OrderCreatorData,
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 60_000, // start with 1 minute, double each time
      },
    },
  };

  // Step 2, wait for DNS propagation
  const dnsVerifier: FlowJob = {
    name: `waitDns:${rootDomain}`,
    queueName: dnsWaiterQueueName,
    data: { rootDomain } as DnsWaiterData,
    children: [orderCreator],
    opts: {
      failParentOnFailure: true,
      attempts: 10,
      backoff: {
        type: 'exponential',
        delay: 10_000, // start with 10 seconds, double each time
      },
    },
  };

  // Step 3, complete ACME challenges
  const challengeCompleter: FlowJob = {
    name: `completeChallenges:${rootDomain}`,
    queueName: challengeCompleterQueueName,
    data: { rootDomain } as ChallengeCompleterData,
    children: [dnsVerifier],
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 60_000, // start with 1 minute, double each time
      },
    },
  };

  // Step 4, complete order
  const orderCompleter: FlowJob = {
    name: `completeOrder:${rootDomain}`,
    queueName: orderCompleterQueueName,
    data: { rootDomain } as OrderCompleterData,
    children: [challengeCompleter],
    opts: {
      failParentOnFailure: false, // Important, don't wail the cleanup step
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 60_000, // start with 1 minute, double each time
      },
    },
  };

  // Step 5, DNS cleanup
  // This will run even if the child failed!
  const dnsCleaner: FlowJob = {
    name: `cleanDns:${rootDomain}`,
    queueName: dnsCleanerQueueName,
    data: { rootDomain } as DnsCleanerData,
    children: [orderCompleter],
    opts: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 60_000, // start with 1 minute, double each time
      },
    },
  };

  const flow = await flowProducer.add(dnsCleaner);

  return flow;
};
