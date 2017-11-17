# aws-vpc-nodejs
This Typescript/NodeJS application that creates a Virtual Private Cloud on AWS setup as follows:

* Creates VPC
    * Sets Enable DNS Host Names = true
* Creates Internet Gateway connected to the new VPC
* Creates a Public Route Table
* Creates a Private Route Table
* Creates a Public Subnet using:
    * CIDR: 10.2.0.0/24
    * Availability Zone: us-east-1a
    * Associates the Public Subnet with the Public Route Table
* Creates a Route in the Public Route Table connecting the Internet Gateway with Destination CIDR block: 0.0.0.0/0
* Creates a Private Subnet using:
    * CIDR: 10.2.1.0/24
    * Availability Zone: us-east-1a
* Creates an Endpoint for DynamoDB access
* Creates a DHCP Option set using DNS of "AmazonProvidedDNS"
    * Associates DHCP Option Set with VPC

## Prerequisites
* AWS Account
* Setup [aws-sdk](https://aws.amazon.com/sdk-for-node-js/) node package from Amazon

## Run
    $ git clone https://github.com/strefethen/aws-vpc-nodejs.git
    $ cd aws-vpc-nodejs
    $ npm install
    $ tsc --project .
    $ node built/index.js