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

async function createRouteTable(params: AWS.EC2.CreateRouteTableRequest): Promise<AWS.EC2.CreateRouteTableResult> {
  console.log(`Creating RouteTable`);  
  return await ec2.createRouteTable(params).promise();
}

async function createRoute(params: AWS.EC2.CreateRouteRequest): Promise<AWS.EC2.CreateRouteResult> {
  console.log(`Creating Route`);
  return await ec2.createRoute(params).promise();
}

async function createSubnet(params: AWS.EC2.CreateSubnetRequest): Promise<AWS.EC2.CreateSubnetResult> {
  console.log(`Creating Subnet`);
  return await ec2.createSubnet(params).promise();
}

async function createEndpoint(params: AWS.EC2.CreateVpcEndpointRequest): Promise<AWS.EC2.CreateVpcEndpointResult> {
  console.log(`Creating Endpoint`);
  return await ec2.createVpcEndpoint(params).promise();
}

async function createDhcpOptionSet(params: AWS.EC2.CreateDhcpOptionsRequest): Promise<AWS.EC2.CreateDhcpOptionsResult> {
  console.log(`Creating DHCP Option Set`);
  return await ec2.createDhcpOptions(params).promise();
} 

async function createNetworkInterface(params: AWS.EC2.CreateNetworkInterfaceRequest): Promise<AWS.EC2.CreateNetworkInterfaceResult> {
  console.log(`Creating Network Interface`);
  return await ec2.createNetworkInterface(params).promise();
}

async function createVpc(params: AWS.EC2.CreateVpcRequest) {
  try {
    let vpc = await ec2.createVpc(params).promise();
    console.log(vpc);   
    await createTag(vpc.Vpc.VpcId, [ { Key: "Name", Value: "My Cloud Node" } ]);
    await ec2.modifyVpcAttribute({ 
      EnableDnsHostnames: {
        Value: true 
      }, 
      VpcId: vpc.Vpc.VpcId 
    }).promise();
    // Note, it's not necessary to create a Network ACL as a default will be created.
    let ig: AWS.EC2.CreateInternetGatewayResult = await createInternetGateway(vpc.Vpc.VpcId, "Internet Gateway Node");
    let publicRouteTable = await createRouteTable({ VpcId: vpc.Vpc.VpcId });
    createTag(publicRouteTable.RouteTable.RouteTableId, [ { Key: "Name", Value: "Public Route Table Node"}]);
    let privateRouteTable = await createRouteTable({ VpcId: vpc.Vpc.VpcId });
    createTag(privateRouteTable.RouteTable.RouteTableId, [ { Key: "Name", Value: "Private Route Table Node"}]);

    let publicSubnet = await createSubnet({
      CidrBlock: "10.2.0.0/24",
      AvailabilityZone: "us-east-1a",
      VpcId: vpc.Vpc.VpcId
    });
    await ec2.associateRouteTable({RouteTableId: publicRouteTable.RouteTable.RouteTableId, SubnetId: publicSubnet.Subnet.SubnetId}).promise();
    createTag(publicSubnet.Subnet.SubnetId, [ { Key: "Name", Value: "Public Subnet Node"}])
    createRoute({
      DestinationCidrBlock: "0.0.0.0/0",
      RouteTableId: publicRouteTable.RouteTable.RouteTableId,
      GatewayId: ig.InternetGateway.InternetGatewayId
    });

    // private
    let privateSubnet = await createSubnet({
      CidrBlock: "10.2.1.0/24",
      AvailabilityZone: "us-east-1a",
      VpcId: vpc.Vpc.VpcId,
    });
    createTag(privateSubnet.Subnet.SubnetId, [ { Key: "Name", Value: "Private Subnet Node"}]);
/*    
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
    let endpoint = await createEndpoint({ 
      ServiceName: "com.amazonaws.us-east-1.dynamodb",
      VpcEndpointType: "Gateway",
      VpcId: vpc.Vpc.VpcId,
      RouteTableIds: [ privateRouteTable.RouteTable.RouteTableId ]
    });
    let dhcpOptions = await createDhcpOptionSet({
      DhcpConfigurations: [ {      
        Key: "domain-name",
        Values: [ "ec2.internal" ],
      },
      {
        Key: "domain-name-servers",
        Values: [ "AmazonProvidedDNS" ]
      }]
    });
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
