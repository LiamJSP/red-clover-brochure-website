#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RedCloverInfraStack } from '../lib/infra-stack';

const app = new cdk.App();

new RedCloverInfraStack(app, 'RedCloverInfraStack', {
  /* Env configuration is mandatory for Route 53 Hosted Zone lookups */
  env: { 
    account: '807434077491',
    region: 'us-east-1'
  },
});