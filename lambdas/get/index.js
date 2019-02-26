// This is actually the GET function that retrieves the graph

const _ = require('lodash');
const aws = require('aws-sdk');
const parseCsv = require('csv-parse');
const s3 = new aws.S3();
var docClient = new aws.DynamoDB.DocumentClient();

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

var getNodesFromDb = async () => {
    return await new Promise((resolve, reject)=>{

        
        var params = {
            TableName: "nodes",
            ProjectionExpression: "id, startDate, endDate"
        };

        docClient.scan(params, function(err, data) {
            if (err) {
                reject(err)
            } else {
                var newItems = [];
                data.Items.forEach(function(item) {
                    newItems.push({
                        data: item
                    })
                });
                resolve(newItems);
            }
        });
    })
}

exports.handler = async (event, context, callback) => {

    var nodes = await getNodesFromDb();
    
    // Ideally we shouldn't be parsing the edge data here, it should already be stored in the database right after the adj.csv
    // file was uploaded and processed. But because no easy way was produced to purge the old edge info from the table before adding the new
    // info, I had to leave this as is. See SeedNodesTable lambda function for an attempt to of quick purging of DynamoDB data.
    
    var edgesData = await parseFile({fileName: 'adj.csv'})
    var nodesLength = nodes.length;
    if(edgesData){
        var counter = 0;
        for (var i = 0; i < edgesData.length; i++) {
            for (var j = 0; j < edgesData.length; j++) {
                if(edgesData[i][j]=='1'){
                    nodes[nodesLength+counter] = {
                        data:{
                            id: `${i+1} to ${j+1}`,
                            source: `${i+1}`,
                            target: `${j+1}`
                        }
                    }
                    counter++;
                }
            }
        }
    }
    
    return await new Promise((resolve, reject)=>{
    
        resolve({
            statusCode: 200,
            body: JSON.stringify(nodes),
            headers:{
                'content-type': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*'
            }
        })
    })
}