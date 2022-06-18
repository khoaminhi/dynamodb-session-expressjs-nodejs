const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const session = require('express-session');
const port = 3000;
const app = express();

//app.use(bodyParser.json()); //for object
//app.use(bodyParser.urlencoded({ extended: true })); // for take data from ajax = bodyParser.json() + bodyParser.urlencoded({ extended: false })
app.use(bodyParser.urlencoded({ extended: false })); //for string, array
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))
// import the aws sdk to use the dynamodb
// libraries in the app
const AWS = require('aws-sdk');

// update the region to 
// where dynamodb is hosted
AWS.config.update({ 
    region: 'us-west-2',
    accessKeyId: 'KJPAMI', //Không thêm cũng được
    secretAccessKey: 'KJPAMI', //Không thêm cũng được
    endpoint: 'http://localhost:8000'
});

// create a new dynamodb client
// which provides connectivity b/w the app
// and the db instance
const client = new AWS.DynamoDB.DocumentClient();
const tableName = 'Account';



app.post('/login/check', (req, res) => {
    const data = req.body;
    const email = req.body.email;
    const password = req.body.password;
    let params = {
        TableName : 'Account',
        FilterExpression : 'email = :email',
        ExpressionAttributeValues : {':email' : email}
    };
    let userData;
    client.scan(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            if (data.Items.length > 0) {
                userData = data.Items[0];
                if (userData.password === password) {
                    req.session.authId = userData.id;
                    res.send({
                        status: 'success',
                        user: userData.id
                    });
                } else {
                    res.send({
                        status: 'fail',
                        message: 'Wrong password'
                    });
                }
            } else {
                res.send({
                    status: 'fail',
                    message: 'User not found'
                });
            }
        }
    });
})

app.get("/login/html", (req, res) => {
    res.sendFile(__dirname + '/session/login.html');
})

app.get("/login/success", (req, res) => {
    if(req.session.authId) {
        res.send("<h1>Login Success</h1>");
    }
    else {
        res.send("<h1>Login Fail</h1> <a href='/login/html'>Login</a>");

    }
})

app.get("/rows/all", (req, res) => {
    var params = {
        TableName: tableName
    };

    client.scan(params, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            var items = [];
            for (var i in data.Items)
                items.push(data.Items[i]);

            res.contentType = 'application/json';
            res.send(items);
        }
    });
});

app.post("/rows/add", (req, res) => {
    var body = req.body;
    var params = {
        TableName: tableName,
        Item: {
            "id": uuidv4(),
            "name": body["name"],
            "email": body["email"],
            "password": body["password"]
        }
    };

    client.put(params, (err, data) => {
        var status = {};
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            status["success"] = false;
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            status["success"] = true;
        }
        res.contentType = "application/json";
        res.send(status);
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})