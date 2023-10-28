import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkAutoscalingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'CdkMainVpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16')
    });

    const alb = new elb.ApplicationLoadBalancer(this, 'ALB', {
      vpc,

    })
  }
}
