import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkAutoscalingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPCの作成
    const vpc = new ec2.Vpc(this, 'CdkMainVpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16')
    });

    // ALBの作成
    const alb = new elb.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
    });

    // セキュリティグループの作成
    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'Ec2SecurityGroup', {
      vpc,
      allowAllOutbound: true
    });

    ec2SecurityGroup.addIngressRule(
      ec2.Peer.ipv4('3.112.23.0/29'),
      ec2.Port.tcp(22),
      'Allow SSH from 3.112.23.0/29'
    )

    // UserDataを使ってApacheをインストールする
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'yum update -y',
      'yum install httpd -y',
      'systemctl start httpd',
      'systemctl enable httpd',
      'echo Hello > /var/www/html/index.html'
    );

    // AutoScalingグループの作成
    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: ec2SecurityGroup,
      maxCapacity: 3,
      minCapacity: 2,
      userData,
      associatePublicIpAddress: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      }
    });

    // HTTPリスナーの設定
    const httpListener = alb.addListener('listener', {
      port: 80,
      open: true
    });

    // リスナーのターゲット設定
    httpListener.addTargets('asgTargets', {
      port: 80,
      targets: [asg]
    });
  }
}
