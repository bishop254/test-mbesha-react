const express = require('express');
const request = require('request')
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json())


const access = (req, resp, next) => {
    let url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    let auth = new Buffer('6TGuDGENXHduT7IoQgcf8mvlkmCZnxlx:zUxivY71Pycj1qyW').toString('base64');

    request({
        url: url,
        headers: {
            'Authorization': 'Basic ' + auth 
        }
    }, (error, response, body) => {
        if(error){ 
            console.log(error);
        } else {
            req.access_token = JSON.parse(body).access_token;
            next();
        }
    });
}


//routes
app.get('/', (req, resp) => {
    resp.send('Hello KC')
});

app.get('/access_token', access, (req,resp) => {
    resp.status(200).json({access_token: req.access_token})
});

app.get('/register', access, (req, resp) => {
    let url = 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl';
    let auth = 'Bearer ' + req.access_token;

    request({
        url: url,
        method: 'POST',
        headers: {
            'Authorization': auth
        },
        json: {
            "ShortCode": "600610",
            "ResponseType": "Complete",
            "ConfirmationURL": "http://192.168.100.4:5007/confirmation",
            "ValidationURL": "http://192.168.100.4:5007/validation_url"
        }
    }, (error, response, body) => {
        if(error){
            console.log(error)
        } else {
            resp.status(200).json(body);
        }
    });
});

app.post('/confirmation', (req,resp) => {
    console.log(' ...confirmation... ')
    console.log(resp.client)
});

app.post('/validation_url', (req,resp) => {
    console.log(' ...validation... ')
    console.log(req.body)
    console.log(req)

    
});

app.get('/simulate', access, (req, resp) => {
    let url = 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate';
    let auth = 'Bearer ' + req.access_token;

    request({
        url: url,
        method: 'POST',
        headers: {
            'Authorization': auth
        },
        json: {
            "ShortCode":"600610",
            "CommandID":"CustomerPayBillOnline",
            "Amount":"2430",
            "Msisdn":"254708374149",
            "BillRefNumber":"TestAPI"
        }
    }, (error, response, body) => {
        if(error){
            console.log(error);
        } else {
            resp.status(200).json(body);
        }
    });
});

app.get('/balance', access, (req, resp) => {
    let url = 'https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query';
    let auth = 'Bearer ' + req.access_token;

    request({
        url: url,
        method: 'POST',
        headers: {
            'Authorization': auth
        },
        json: {
            "Initiator":"test2",
            "SecurityCredential":"dG/Hkr6H/Yd3dtJEyHK3tUD8YeE96dfsQ27Uv43vFjnevp7YTvtMCrmdlBSN/zd4dGVAWsNT8pvXuK4/r6UaLATCUyE/hnJYP89mhgm/8O8E2r77VjOYOhSbJVAV9qPm+9v/ZoDGBHWJA6bfTgZoHbJ3WcFc+P1YXW34WAzbNssfWD46NU23x8Goy7wk/PsT8hn+Dx2JphbpYTCLbK20DHBk32l3K9AIwcry1afQowqS+HSVxLAU/ZfRvT82+aHUYlPJrTIvzltgRIj1PVSKFwL98dCDjvB+lGXtFdp1bDFWxbLAOBS5DJSu/wpfWPRMvfnYiWzoeGdOi34rkGltBA==",
            "CommandID":"AccountBalance",
            "PartyA":"600610",
            "IdentifierType":"4",
            "Remarks":"Remarks",
            "QueueTimeOutURL":"http://192.168.100.4:5007/timeout_url",
            "ResultURL":"http://192.168.100.4:5007/result_url" 
        }
    }, (error, response, body) => {
        if(error){
            console.log(error);
        } else {
            resp.status(200).json(body);
        }
    });
})

app.post('/timeout_url', (req, resp) => {
    console.log('...balance...');
    console.log(req.body);
});

app.post('/result_url', (req, resp) => {
    console.log('...balance...');
    console.log(JSON.stringify(req.body.Result.ResultParameters));
});

app.get('/stk', access, (req, resp) => {
    let url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    let auth = 'Bearer ' + req.access_token

    let dateNow = new Date();
    const timestamp = dateNow.getFullYear() + "" + "" + "0" + "" + "" + dateNow.getMonth() + "" + "" + dateNow.getDate() + "" + "" + dateNow.getHours() + "" + "" + dateNow.getMinutes() + "" + "" + dateNow.getMilliseconds();
    const password = new Buffer.from('174379' + 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919' + timestamp).toString('base64');
    console.log(timestamp)
    request({
        url: url,
        method: 'POST',
        headers: {
            'Authorization': auth
        },
        json: {
            "BusinessShortCode": "174379",
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": "1",
            "PartyA": "254701720503",
            "PartyB": "174379",
            "PhoneNumber": "254701720503",
            "CallBackURL": "http://192.168.100.4:5007/callback",
            "AccountReference": "account",
            "TransactionDesc": "test" ,
        }
    }, (error, response, body) => {
        if(error){
            console.log(error);
        } else {
            resp.status(200).json(body);
        }
    });
});

app.post('/callback', (req,resp) => {
    console.log('....lipa na m-pesa....');
    console.log(JSON.stringify(req.body.Body.stkCallback));
})




//listen
app.listen(5007, (err, live) => {
    if(err){
        console.log(err)
    } 
    console.log('Server running on port 5007')
});