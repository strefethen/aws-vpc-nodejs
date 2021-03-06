#!/usr/bin/env node
import AWS = require('aws-sdk');

var ec2 = new AWS.EC2({apiVersion: '2016-11-15', region: "us-east-1"});

async function createTag(resource: string, tags: Array<AWS.EC2.Tag>): Promise<any> {
  console.log(`Creating tag, Resource: ${resource}, Tags: ${tags}`);  
  const resourceTags: AWS.EC2.CreateTagsRequest = {
    Resources: [ resource ], 
    Tags: tags
  };
  return ec2.createTags(resourceTags).promise();
}

/**
 * Create Internet Gateway, attach to vpc and assign tag
 * @param vpc - id of vpc
 * @param tag - tag name for vpc
 */
async function createInternetGateway(vpc: string, tag: string): Promise<AWS.EC2.CreateInternetGatewayResult> {
  console.log(`Creating Internet Gateway`);
  var ig = await ec2.createInternetGateway({}).promise();
  await createTag(ig.InternetGateway.InternetGatewayId, [ { Key: "Name", Value: tag }]);
  console.log(`Attaching Internet Gateway`);  
  var attach = ec2.attachInternetGateway({ InternetGatewayId: ig.InternetGateway.InternetGatewayId, VpcId: vpc}).promise();
  return ig;
}

async function createVpc(params: AWS.EC2.CreateVpcRequest) {
  try {
    let vpc = await ec2.createVpc(params).promise();
    console.log(vpc);   

    // Launch NAT instance
    ec2.startInstances({
      InstanceIds: [
        "i-095424cbde35cb686"
      ]
    }, (err: AWS.AWSError, data: AWS.EC2.StartInstancesResult) => {
      console.log(data);
    });

    await createTag(vpc.Vpc.VpcId, [ { Key: "Name", Value: "My Cloud Node" } ]);

    await ec2.modifyVpcAttribute({ 
      EnableDnsHostnames: {
        Value: true 
      }, 
      VpcId: vpc.Vpc.VpcId 
    }).promise();

    // Note, it's not necessary to create a Network ACL as a default will be created.
    let ig: AWS.EC2.CreateInternetGatewayResult = await createInternetGateway(vpc.Vpc.VpcId, "Internet Gateway Node");

    let publicRouteTable = await ec2.createRouteTable({ VpcId: vpc.Vpc.VpcId }).promise();
    createTag(publicRouteTable.RouteTable.RouteTableId, [ { Key: "Name", Value: "Public Route Table Node"}]);

    let privateRouteTable = await ec2.createRouteTable({ VpcId: vpc.Vpc.VpcId }).promise();
    createTag(privateRouteTable.RouteTable.RouteTableId, [ { Key: "Name", Value: "Private Route Table Node"}]);

    let publicSubnet = await ec2.createSubnet({
      CidrBlock: "10.2.0.0/24",
      AvailabilityZone: "us-east-1a",
      VpcId: vpc.Vpc.VpcId
    }).promise();
    await ec2.associateRouteTable({RouteTableId: publicRouteTable.RouteTable.RouteTableId, SubnetId: publicSubnet.Subnet.SubnetId}).promise();
    createTag(publicSubnet.Subnet.SubnetId, [ { Key: "Name", Value: "Public Subnet Node"}])
    ec2.createRoute({
      DestinationCidrBlock: "0.0.0.0/0",
      RouteTableId: publicRouteTable.RouteTable.RouteTableId,
      GatewayId: ig.InternetGateway.InternetGatewayId
    }).promise();

    // private
    let privateSubnet = await ec2.createSubnet({
      CidrBlock: "10.2.1.0/24",
      AvailabilityZone: "us-east-1a",
      VpcId: vpc.Vpc.VpcId,
    }).promise();
    createTag(privateSubnet.Subnet.SubnetId, [ { Key: "Name", Value: "Private Subnet Node"}]);


/*  
    // TODO: Setup NAT instance
    let NetworkInterface = await createNetworkInterface({
      SubnetId: privateSubnet.Subnet.SubnetId,
    });
    await createRoute({
      DestinationCidrBlock: "0.0.0.0/0",
      NetworkInterfaceId: "eni-e679a0f0",
      InstanceId: "i-095424cbde35cb686",
      RouteTableId: privateRouteTable.RouteTable.RouteTableId,
    });
*/
    let endpoint = await ec2.createVpcEndpoint({ 
      ServiceName: "com.amazonaws.us-east-1.dynamodb",
      VpcEndpointType: "Gateway",
      VpcId: vpc.Vpc.VpcId,
      RouteTableIds: [ privateRouteTable.RouteTable.RouteTableId ]
    }).promise();
    let dhcpOptions = await ec2.createDhcpOptions({
      DhcpConfigurations: [ {      
        Key: "domain-name",
        Values: [ "ec2.internal" ],
      },
      {
        Key: "domain-name-servers",
        Values: [ "AmazonProvidedDNS" ]
      }]
    }).promise();
    createTag(dhcpOptions.DhcpOptions.DhcpOptionsId, [ { Key: "Name", Value: "DHCP options Node" }]);
    await ec2.associateDhcpOptions({ DhcpOptionsId: dhcpOptions.DhcpOptions.DhcpOptionsId, VpcId: vpc.Vpc.VpcId }).promise();

    // TODO: Security Groups
    // TODO: Elastic IP

    process.exit(0);
  } catch(err) {
    console.log(err);
    process.exit(1);
  }
}

createVpc({
  CidrBlock: "10.2.0.0/16",
  AmazonProvidedIpv6CidrBlock: false,
  DryRun: false,
  InstanceTenancy: "default"
});
