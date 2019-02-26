const AWS = require('aws-sdk');
var s3 = new AWS.S3();
exports.handler = (event, context, callback) => {
    // A very hacky way of getting the contents of the uploaded file!
    var mySubString = event.body.substring(
        event.body.lastIndexOf("vnd.ms-excel") + 16, 
        event.body.lastIndexOf("------") - 4
    );
    let decodedImage = mySubString;
     var filePath = "adj.csv"
     var params = {
       "Body": decodedImage,
       "Bucket": "nodes-and-links-demo",
       "Key": filePath  
    };
    s3.upload(params, function(err, data){
       if(err) {
           let response = {
                "statusCode": 400,
                "headers": {
                    'Access-Control-Allow-Origin': '*'
                },
                "body": JSON.stringify(err),
                "isBase64Encoded": false
            }
           callback(null, response);
       } 
       else {
           let response = {
                "statusCode": 200,
                "headers": {
                    'Access-Control-Allow-Origin': '*'
                },
                "body": JSON.stringify(data),
                "isBase64Encoded": false
            };
           callback(null, response);
        }
    });
    
};