const _ = require('lodash');
const aws = require('aws-sdk');
var ddb = new aws.DynamoDB();
const parseCsv = require('csv-parse');
const s3 = new aws.S3();
const DYNAMO_BATCH_LIMIT = 25;
aws.config.update({
  region: "us-east1-2"
});

var parseFile = async (event, context, callback) => {
    var fileName = event.fileName;
    console.log(fileName);
    return await new Promise((resolve, reject)=>{
            // Retrieve the object
            s3.getObject({
                Bucket: 'nodes-and-links-demo',
                Key: fileName
            }, function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                    resolve(null)
                } else {
                    parseCsv(data.Body.toString('ascii'), {}, (err, output) => {
                      resolve(output)
                    })
                }
            });
    })
}

var deleteTable = (callback) => {
    var params = {
        TableName : "nodes"
    };
    
    ddb.deleteTable(params, function(err, data) {
        callback(err, data);
    });
}

var createTable = (callback) => {
    var params = {
        TableName : "nodes",
        KeySchema: [       
            { AttributeName: "id", KeyType: "HASH"}
        ],
    AttributeDefinitions: [       
        { AttributeName: "id", AttributeType: "S" }
    ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 5, 
            WriteCapacityUnits: 5
        }
    };
    
    ddb.createTable(params, function(err, data) {
        callback(err, data);
    });
}

exports.handler = async (event, context, callback) => {
    
    var nodesData = await parseFile({fileName: 'nodeProperties.csv'})
    
    var params = [];
    
    var j = -1;
    for (var i = 1; i < nodesData.length; i++) { //start from second row to skip header
        if (i % DYNAMO_BATCH_LIMIT == 1){
            j++;
            params[j] = {
              RequestItems: {
                "nodes": []
              }
            };
        }
        params[j].RequestItems.nodes.push({
            PutRequest:{
                Item:{
                    "id": {'S': nodesData[i][0]},
                    "startDate": {'S': nodesData[i][1]},
                    "endDate": {'S': nodesData[i][2]},
                }
            }
        })
    }
    
    return await new Promise((resolve, reject)=>{
        // keep recursing until all batches have been sent to Dynamo DB
        var recu = (i) => {
            if(i==params.length)
                resolve();
            else{
                console.log('executing batch' + (i+1))
                ddb.batchWriteItem(params[i], function(err, data) {
                  if (err) {
                    reject(err)
                  } else {
                    recu(++i)
                  }
                });
                
            }
        }
        
        // initially an attempt was made to delete and recreate the table in as a quick way to clear all data from it, and replace with the new data,
        // but when the callback handler is called, the table is still not ready for processing. It requires another minute maybe. So this approach was dropped
        
        // deleteTable((err,data)=>{
        //     console.log('table deleted')
        //     createTable((err, data)=>{
        //         console.log('table created')
        //         if(!err && nodesData.length)
        //             setTimeout(()=>{
                        recu(0);
        //             }, 5000)
        //         else if(err)
        //             console.log(err)
        //     })
        // })
        
    })
}