#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var AWS = require("aws-sdk");
var ec2 = new AWS.EC2({ apiVersion: '2016-11-15', region: "us-east-1" });
ec2.describeVpcs(function (err, data) {
    //  console.log(data);
});
function createTag(resource, tags) {
    return __awaiter(this, void 0, void 0, function () {
        var resourceTags;
        return __generator(this, function (_a) {
            console.log("Creating tag, Resource: " + resource + ", Tags: " + tags);
            resourceTags = {
                Resources: [
                    resource
                ],
                Tags: tags
            };
            return [2 /*return*/, ec2.createTags(resourceTags).promise()];
        });
    });
}
/**
 * Create Internet Gateway, attach to vpc and assign tag
 * @param vpc - id of vpc
 * @param tag - tag name for vpc
 */
function createInternetGateway(vpc, tag) {
    return __awaiter(this, void 0, void 0, function () {
        var ig, attach;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Creating Internet Gateway");
                    return [4 /*yield*/, ec2.createInternetGateway({}).promise()];
                case 1:
                    ig = _a.sent();
                    return [4 /*yield*/, createTag(ig.InternetGateway.InternetGatewayId, [{ Key: "Name", Value: tag }])];
                case 2:
                    _a.sent();
                    console.log("Attaching Internet Gateway");
                    attach = ec2.attachInternetGateway({ InternetGatewayId: ig.InternetGateway.InternetGatewayId, VpcId: vpc }).promise();
                    return [2 /*return*/, ig];
            }
        });
    });
}
function createACL(params, tag) {
    return __awaiter(this, void 0, void 0, function () {
        var acl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Creating ACL");
                    return [4 /*yield*/, ec2.createNetworkAcl(params).promise()];
                case 1:
                    acl = _a.sent();
                    return [4 /*yield*/, createTag(acl.NetworkAcl.NetworkAclId, [{ Key: "Name", Value: tag }])];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, acl];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createRouteTable(params) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Creating RouteTable");
                    return [4 /*yield*/, ec2.createRouteTable(params).promise()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createRoute(params) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Creating Route");
                    return [4 /*yield*/, ec2.createRoute(params).promise()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createSubnet(params) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Creating Subnet");
                    return [4 /*yield*/, ec2.createSubnet(params).promise()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createEndpoint(params) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Creating Endpoint");
                    return [4 /*yield*/, ec2.createVpcEndpoint(params).promise()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createDhcpOptionSet(params) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Creating DHCP Option Set");
                    return [4 /*yield*/, ec2.createDhcpOptions(params).promise()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createNetworkInterface(params) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Creating Network Interface");
                    return [4 /*yield*/, ec2.createNetworkInterface(params).promise()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var vpcCreateParams = {
    CidrBlock: "10.2.0.0/16",
    AmazonProvidedIpv6CidrBlock: false,
    DryRun: false,
    InstanceTenancy: "default"
};
function createVpc(params) {
    return __awaiter(this, void 0, void 0, function () {
        var vpc, ig, publicRouteTable, privateRouteTable, publicSubnet, privateSubnet, dhcp, dhcp, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, ec2.createVpc(params).promise()];
                case 1:
                    vpc = _a.sent();
                    console.log(vpc);
                    return [4 /*yield*/, createTag(vpc.Vpc.VpcId, [{ Key: "Name", Value: "My Cloud Node" }])];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, ec2.modifyVpcAttribute({
                            EnableDnsHostnames: {
                                Value: true
                            },
                            VpcId: vpc.Vpc.VpcId
                        }).promise()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, createInternetGateway(vpc.Vpc.VpcId, "Internet Gateway Node")];
                case 4:
                    ig = _a.sent();
                    createACL({ VpcId: vpc.Vpc.VpcId }, "My NetworkAcl Node");
                    return [4 /*yield*/, createRouteTable({ VpcId: vpc.Vpc.VpcId })];
                case 5:
                    publicRouteTable = _a.sent();
                    createTag(publicRouteTable.RouteTable.RouteTableId, [{ Key: "Name", Value: "Public Route Table Node" }]);
                    return [4 /*yield*/, createRouteTable({ VpcId: vpc.Vpc.VpcId })];
                case 6:
                    privateRouteTable = _a.sent();
                    createTag(privateRouteTable.RouteTable.RouteTableId, [{ Key: "Name", Value: "Private Route Table Node" }]);
                    return [4 /*yield*/, createSubnet({
                            CidrBlock: "10.2.0.0/24",
                            AvailabilityZone: "us-east-1a",
                            VpcId: vpc.Vpc.VpcId
                        })];
                case 7:
                    publicSubnet = _a.sent();
                    return [4 /*yield*/, ec2.associateRouteTable({ RouteTableId: publicRouteTable.RouteTable.RouteTableId, SubnetId: publicSubnet.Subnet.SubnetId }).promise()];
                case 8:
                    _a.sent();
                    createTag(publicSubnet.Subnet.SubnetId, [{ Key: "Name", Value: "Public Subnet Node" }]);
                    createRoute({
                        DestinationCidrBlock: "0.0.0.0/0",
                        RouteTableId: publicRouteTable.RouteTable.RouteTableId,
                        GatewayId: ig.InternetGateway.InternetGatewayId
                    });
                    return [4 /*yield*/, createSubnet({
                            CidrBlock: "10.2.1.0/24",
                            AvailabilityZone: "us-east-1a",
                            VpcId: vpc.Vpc.VpcId,
                        })];
                case 9:
                    privateSubnet = _a.sent();
                    createTag(privateSubnet.Subnet.SubnetId, [{ Key: "Name", Value: "Private Subnet Node" }]);
                    /*
                        let NetworkInterface = await createNetworkInterface({
                          SubnetId: privateSubnet.Subnet.SubnetId,
                        });
                        await createRoute({
                          DestinationCidrBlock: "0.0.0.0/0",
                          //NetworkInterfaceId:
                          RouteTableId: privateRouteTable.RouteTable.RouteTableId,
                        });
                    */
                    createEndpoint({
                        ServiceName: "com.amazonaws.us-east-1.s3",
                        VpcEndpointType: "Gateway",
                        VpcId: vpc.Vpc.VpcId,
                        RouteTableIds: [privateRouteTable.RouteTable.RouteTableId]
                    });
                    return [4 /*yield*/, createDhcpOptionSet({
                            DhcpConfigurations: [{
                                    Key: "domain-name",
                                    Values: ["ec2.internal"],
                                },
                                {
                                    Key: "domain-name-servers",
                                    Values: ["AmazonProvidedDNS"]
                                }]
                        })];
                case 10:
                    dhcp = _a.sent();
                    dhcp = createTag(dhcp.DhcpOptions.DhcpOptionsId, [{ Key: "Name", Value: "DHCP options Node" }]);
                    return [4 /*yield*/, ec2.associateDhcpOptions({ DhcpOptionsId: dhcp.DhcpOptions.DhcpOptionsId, VpcId: vpc.Vpc.VpcId }).promise()];
                case 11:
                    _a.sent();
                    process.exit(0);
                    return [3 /*break*/, 13];
                case 12:
                    err_1 = _a.sent();
                    console.log(err_1);
                    process.exit(1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
createVpc(vpcCreateParams);
//# sourceMappingURL=index.js.map