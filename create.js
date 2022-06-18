// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// update the region to 
// where dynamodb is hosted
AWS.config.update({ 
    region: 'us-west-2',
    accessKeyId: 'KJPAMI', //không thêm cũng được
    secretAccessKey: 'KJPAMI', //không thêm cũng được
    endpoint: 'http://localhost:8000'
});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB();

const tableName = 'Account';
const attrId = 'id';
const attrIdType = 'S';
const attrName = 'name';
const attrNameType = 'S';
const attrEmail = 'email';
const attrEmailType = 'S';


var params = {
    //định nghĩa thuộc tính
    AttributeDefinitions: [
        {
            AttributeName: attrId,
            AttributeType: attrIdType
        }
    ],
    //định nghĩa key, tên key là attrId (Id) và key type là partitionkey (HASH), RANGE-sortkey
    KeySchema: [
        {
            AttributeName: attrId,
            KeyType: "HASH"
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    },
    TableName: tableName,
    StreamSpecification: {
        StreamEnabled: false
    }
};

// Call DynamoDB to create the table
ddb.createTable(params, function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Table Created", data);
    }
});