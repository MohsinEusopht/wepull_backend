const express = require("express");
const userRouter = require("./api/users/user.router");
const AppError = require("./utils/appError");
const {static, json} = require("express");

//Xero Node
const {XeroClient} = require("xero-node");
//Quickbook Auth
const OAuthClient = require('intuit-oauth');

const app = express();
//Xero connection
const xero = new XeroClient({
    clientId: 'F317863887B34D95B24C7AC61E427F36',
    clientSecret: 'mxApFpmb191At_PlvZ7nS4y3kvROLgt0YV0USFdyQPUWEqXb',
    redirectUris: [`http://localhost:3000/api/xero_callback`],
    scopes: 'openid profile email accounting.transactions offline_access'.split(" "),
    state: 'returnPage=my-sweet-dashboard', // custom params (optional)
    httpTimeout: 3000 // ms (optional)
});
//Quickbooks connection
const oauthClient = new OAuthClient({
    clientId: 'BB3E8jH6m6hbXrTPs0844okJCYwIgAkiHlchC2MUoopsOuReqH',            // enter the apps `clientId`
    clientSecret: 'vG0l5YnUvdg5qfrLCOuP5Js0UecF6diKBhjlT7PV',    // enter the apps `clientSecret`
    environment: 'sandbox',     // enter either `sandbox` or `production`
    redirectUri: 'http://localhost:3000/api/quickbooks_callback',     // enter the redirectUri
    logging: true                               // by default the value is `false`
});

app.use(express.json());

app.get('/api/xero_url', async (req, res) => {
    let consentUrl = await xero.buildConsentUrl();
    res.redirect(consentUrl);
});


let xero_access_token = "";
let xero_refresh_token = "";
let xero_expire_at = "";
let xero_id_token = "";
app.get("/api/xero_callback", async (req, res) => {
    await xero.initialize();
    const tokenSet = await xero.apiCallback(req.url);
    let tokenJson = JSON.parse(JSON.stringify(tokenSet));
    console.log(tokenJson);
    xero_access_token = tokenJson.access_token;
    xero_refresh_token = tokenJson.refresh_token;
    xero_expire_at = tokenJson.expires_at;
    xero_id_token = tokenJson.id_token;


    res.send(tokenSet);
});

app.get('/api/quickbooks_url', async (req, res) => {
    let authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId],state:'testState'});
    res.redirect(authUri);
});


app.get("/api/quickbooks_callback", async (req, res) => {
    let parseRedirect = req.url;
    let data="";
    // Exchange the auth code retrieved from the **req.url** on the redirectUri
    oauthClient.createToken(parseRedirect)
        .then(function(authResponse) {
            // data = JSON.stringify(authResponse.getJson());
            let status = authResponse.status();
            let body = authResponse.text();
            let jsonResponse = authResponse.getJson();
            let intuit_tid = authResponse.get_intuit_tid();

            console.log('The Token is  '+ JSON.stringify(jsonResponse));
            oauthClient.getToken().setToken({
                "token_type": jsonResponse["token_type"],
                "expires_in": jsonResponse["expires_in"],
                "refresh_token":jsonResponse["refresh_token"],
                "x_refresh_token_expires_in":jsonResponse["x_refresh_token_expires_in"],
                "id_token": jsonResponse["id_token"],
                "access_token":jsonResponse["access_token"]
            });
            console.log('Set The Token is  '+ JSON.stringify(oauthClient.token.getToken()));

            res.send(JSON.stringify(oauthClient.token.getToken()).replaceAll(',','<br/><br/>'));
        })
        .catch(function(e) {
            console.error("Creating Error. The error message is :"+e.originalMessage);
            console.error(e.intuit_tid);
        });
    //
    // if(oauthClient.isAccessTokenValid()) {
    //     console.log("The access_token is valid");
    // }
    //
    // if(!oauthClient.isAccessTokenValid()){
    //
    //     oauthClient.refresh()
    //         .then(function(authResponse) {
    //             console.log('Tokens refreshed : ' + JSON.stringify(authResponse.json()));
    //         })
    //         .catch(function(e) {
    //             console.error("The error message is :"+e.originalMessage);
    //             console.error(e.intuit_tid);
    //         });
    //
    // }





});

//app.use("/api/users", userRouter);

process.on('uncaughtException', function(error) {
    console.log(error.stack);
});

//app.use('/api/example', express.static('api'));
//app.use('/upload', static('upload'));

// app.all('*', (req, res, next) => {
//     throw new AppError(`Requested URL ${req.path} not found!`, 404);
// })

// app.use((err, req, res, next) => {
//     const statusCode = err.statusCode || 500;
//     res.status(statusCode).json({
//         success: 0,
//         message: err.message,
//         stack: err.stack
//     })
// })

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("server up and running on PORT :", port);
});