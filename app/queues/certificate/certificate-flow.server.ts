import { FlowProducer } from 'bullmq';
import * as certificateModel from '~/models/certificate.server';
import { orderCreatorQueueName, orderCreatorWorker } from './order-creator-worker.server';
import { dnsWaiterQueueName, dnsWaiterWorker } from './dns-waiter-worker.server';
import {
  challengeCompleterQueueName,
  challengeCompleterWorker,
} from './challenge-completer-worker.server';
import { orderCompleterQueueName, orderCompleterWorker } from './order-completer-worker.server';
import { dnsCleanerQueueName, dnsCleanerWorker } from './dns-cleaner-worker.server';

import { redis } from '~/lib/redis.server';

import type { FlowJob } from 'bullmq';
import type { CertificateJobData } from './certificateJobTypes.server';
import { initCertificateErrorHandler } from './certificate-error-handler.server';

// Exporting these to allow for graceful shutdown
export {
  orderCreatorWorker,
  dnsWaiterWorker,
  challengeCompleterWorker,
  orderCompleterWorker,
  dnsCleanerWorker,
};

interface AddCertRequest {
  rootDomain: string;
  username: string;
}

const { JOB_REMOVAL_FREQUENCY_S } = process.env;

// constant  for removing job on completion/failure (in seconds)
const JOB_REMOVAL_INTERVAL_S = 7 * 24 * 60 * 60; // 7 days

const flowProducer = new FlowProducer({ connection: redis });

// Initialize error handling before any flows are dispatched
initCertificateErrorHandler();

export const addCertRequest = async ({ rootDomain, username }: AddCertRequest) => {
  /**
   * We are adding 5 jobs, to separate queues, each
   * parent depending on the child to complete
   *
   * We need to nest these in reverse order, the
   * parent is always executed *after* the child
   *
   * https://docs.bullmq.io/guide/flows
   */

  /**
   * Store order data in the DB
   */
  let certificateId;

  // Destructuring assignment to existing variable
  ({ id: certificateId } = await certificateModel.createCertificate({
    username,
    domain: rootDomain,
  }));

  // Uniform data passed to every worker in the flow
  const jobData: CertificateJobData = { rootDomain, username, certificateId };

  // Step 1, create order
  const orderCreator: FlowJob = {
    name: `createOrder:${rootDomain}`,
    queueName: orderCreatorQueueName,
    data: jobData,
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: process.env.NODE_ENV === 'test' ? 15_000 : 60_000, // start with 1 minute in production, double each time
      },
      removeOnComplete: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
      removeOnFail: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
    },
  };

  // Step 2, wait for DNS propagation
  const dnsVerifier: FlowJob = {
    name: `waitDns:${rootDomain}`,
    queueName: dnsWaiterQueueName,
    data: jobData,
    children: [orderCreator],
    opts: {
      failParentOnFailure: true,
      attempts: 10,
      backoff: {
        type: 'exponential',
        delay: process.env.NODE_ENV === 'test' ? 5_000 : 10_000, // start with 10 seconds in production, double each time
      },
      removeOnComplete: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
      removeOnFail: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
    },
  };

  // Step 3, complete ACME challenges
  const challengeCompleter: FlowJob = {
    name: `completeChallenges:${rootDomain}`,
    queueName: challengeCompleterQueueName,
    data: jobData,
    children: [dnsVerifier],
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: process.env.NODE_ENV === 'test' ? 15_000 : 60_000, // start with 1 minute in production, double each time
      },
      removeOnComplete: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
      removeOnFail: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
    },
  };

  // Step 4, complete order
  const orderCompleter: FlowJob = {
    name: `completeOrder:${rootDomain}`,
    queueName: orderCompleterQueueName,
    data: jobData,
    children: [challengeCompleter],
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: process.env.NODE_ENV === 'test' ? 15_000 : 60_000, // start with 1 minute in production, double each time
      },
      removeOnComplete: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
      removeOnFail: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
    },
  };

  // Step 5, DNS cleanup
  // This will run even if the child failed!
  const dnsCleaner: FlowJob = {
    name: `cleanDns:${rootDomain}`,
    queueName: dnsCleanerQueueName,
    data: jobData,
    children: [orderCompleter],
    opts: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: process.env.NODE_ENV === 'test' ? 15_000 : 60_000, // start with 1 minute in production, double each time
      },
      removeOnComplete: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
      removeOnFail: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
    },
  };

  const flow = await flowProducer.add(dnsCleaner);

  return flow;
};
