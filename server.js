require("dotenv").config();
const express = require("express");
const request = require('request');
const jwt = require('jsonwebtoken');


const userRouter = require("./api/users/user.router");
const xeroRouter = require("./api/xero/xero.router");
const quickbookRouter = require("./api/quickbook/quickbook.router");

const AppError = require("./utils/appError");
const {static} = require("express");
const cors = require("cors");

const app = express();
const path = require('path');
const OAuthClient = require('intuit-oauth');
const {XeroClient} = require("xero-node");
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const ngrok = process.env.NGROK_ENABLED === 'true' ? require('ngrok') : null;
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// let corsOptions = {
//     origin: "http://localhost:3001"
// };
app.use(express.json());
app.use(cors());

app.use("/api/users", userRouter);
app.use("/api/xero", xeroRouter);
app.use("/api/quickbook", quickbookRouter);

process.on('uncaughtException', function(error) {
    console.log(error.stack);
});



//
// app.all('*', (req, res, next) => {
//     throw new AppError(`Requested URL ${req.path} not found!`, 404);
// })





/**
 * App Variables
 * @type {null}
 */
let oauth2_token_json = null;
let redirectUri = '';


let oauthClient = new OAuthClient({
    clientId: 'BB3E8jH6m6hbXrTPs0844okJCYwIgAkiHlchC2MUoopsOuReqH',            // enter the apps `clientId`
    clientSecret: 'vG0l5YnUvdg5qfrLCOuP5Js0UecF6diKBhjlT7PV',    // enter the apps `clientSecret`
    environment: 'sandbox',     // enter either `sandbox` or `production`
    redirectUri: 'http://localhost:3000/quickbooks_callback'     // enter the redirectUri
    // logging: true                               // by default the value is `false`
});

const xero = new XeroClient({
    clientId: 'F317863887B34D95B24C7AC61E427F36',
    clientSecret: 'mxApFpmb191At_PlvZ7nS4y3kvROLgt0YV0USFdyQPUWEqXb',
    redirectUris: [`http://localhost:3000/xero_callback`, `https://wepull.herokuapp.com/xero_callback`],
    scopes: 'openid profile email accounting.transactions offline_access'.split(" "),
    state: 'returnPage=my-sweet-dashboard', // custom params (optional)
    httpTimeout: 3000 // ms (optional)
});
let access_token = null;
let refresh_token = null;
let id_token = null;
let expire_at = null;

let qb_access_token = null;
let qb_refresh_token = null;
let qb_id_token = null;
let qb_expire_at = null;

let tenantId = null;
let tenantType = null;
let tenantName = null;
let tenantCreateDate = null;

let xero_clintid= 'F317863887B34D95B24C7AC61E427F36';
let xero_secretid = 'mxApFpmb191At_PlvZ7nS4y3kvROLgt0YV0USFdyQPUWEqXb';
let scope = 'openid profile email accounting.transactions offline_access'.split(" ");

/**
 * Get the Xero AuthorizeUri
 */

app.get('/', async (req, res) => {
    res.send("Apis Working");
});

app.get('/xero_url', async (req, res) => {
    let consentUrl = await xero.buildConsentUrl();
    res.redirect(consentUrl);
});

app.get("/xero_callback", async (req, res) => {
    // await xero.initialize();
    const tokenSet = await xero.apiCallback(req.url);
    let array = JSON.parse(JSON.stringify(tokenSet));
    access_token = array.access_token;
    refresh_token = array.refresh_token;
    id_token = array.id_token;
    expire_at = array.expires_at;


    const jwtTokenDecode = jwt.decode(id_token);
    console.log("email:::::",jwtTokenDecode);

    console.log(JSON.parse(JSON.stringify(tokenSet)));

    res.send(JSON.parse(JSON.stringify(tokenSet)));

});

app.get('/refreshTokenXero', async function (req, res) {
    console.log("Current Refresh Token: ",refresh_token);
    const validTokenSet = await xero.refreshWithRefreshToken(xero_clintid, xero_secretid, refresh_token)

    let array = JSON.parse(JSON.stringify(validTokenSet));
    id_token = array.id_token;
    access_token = array.access_token;
    refresh_token = array.refresh_token;
    expire_at = array.expires_at;
    let email = await xero
    console.log("Email::" , email);
    console.log("Refreshed Token Set");
    console.log(validTokenSet);
    let bearer = 'Bearer ' + access_token;
    console.log(bearer);

    // xero.setTokenSet(validTokenSet);

    // var options = {
    //     'method': 'POST',
    //     'url': 'https://identity.xero.com/connect/token?=',
    //     'headers': {
    //         'grant_type': 'refresh_token',
    //         'Content-Type': 'application/json',
    //         'Cookie': '_abck=A3EA3F813C4B0FE84B57724133558714~-1~YAAQZy83Fwk66rd+AQAAeveTAgc1lAuSDTxONuif05hKO2rJ8bPPq6yWOoB7X6b5hcyT5Ot9KzNwHqVfrYTTU6R9UkEm1QjWMBZhh30bKgANwHVSkh+3p4UPZ5pIXQichF5EvCGHAUuR7pGDnhVpdRdfIXXXZ6jnO2C2YndGPezlJmuNrSn/Xid8ZOKJ4otvnwaOLL08H9wRSe1AXm+K+7/BHdpnkvYoRjZrbxA2Bpc0hFBmx+jcjKLF7feCn6jQx01g4ZvmXhTMamDrDOOx/KKRZ5xLVxK7xvzuZdxLJrJuHq9sktEZh8OIRt8O8SSIB3I2s40Olg2R1+bAWFoaomxwAWw+ZwGGijfiItg/8t+Ey0etuf5vvkYNWncO/dAtHc/70wI=~-1~-1~-1'
    //     },
    //     formData: {
    //         'grant_type': 'refresh_token',
    //         'refresh_token': refresh_token,
    //         'client_id': 'F317863887B34D95B24C7AC61E427F36',
    //         'client_secret': 'mxApFpmb191At_PlvZ7nS4y3kvROLgt0YV0USFdyQPUWEqXb'
    //     }
    // };
    // request(options, function (error, response) {
    //     if (error) throw new Error(error);
    //     console.log(response.body);
    // });
})

//
// app.get('/retrieveXeroEmail', function (req, res) {
//     String idToken = String.valueOf(tokenResponse.get("id_token"));
//     DecodedJWT decodedJWT = JWT.decode(idToken);
//     let email = decodedJWT.getClaim("email").toString();
//     res.send(oauth2_token_json);
// });

app.get('/get_Tenants', async function (req, res) {
    //console.log("Current Access Token: ",access_token);
    let bearer = 'Bearer ' + access_token;
    console.log(bearer);
    let options = {
        'method': 'GET',
        'url': 'https://api.xero.com/connections',
        'headers': {
            'Authorization': bearer,
            'Cookie': '_abck=A3EA3F813C4B0FE84B57724133558714~-1~YAAQBGswF9QJod5+AQAAlxRaBwfmz1DVCmuZ4A6y1QjxRITSajH7n8Rsy8zkUSWPnCmGRnuG5t0jm5IrFS07DKVCAPDuzP3vgZRlXREUxGkRdW1sdKq5EixBRtXdQBcb3vN8Kd4O04mAc+GS9Svuzh4VaAjWhBqgqdELaGLqPBVuiuR9F9jU0kUbCs8yguEf3d6DwGKan6KMcOCjnjjDcveea3C9qbXOM+fbuXW8vo8+LPILT11uvABeB0YXryvq3Lnv3rDyeI37u/wj5syqZOMd67M3WgKOytWvPLInEOavlpPAxso6S5S/6enkW286/xfrPRMKUnn6wMcasyauZY2Hi2c7kpAp++J0Jqiws+x1PIKwLuKXFr3Oe+46hReqMrhDxeQ=~-1~-1~-1; ak_bmsc=5767EEF35D9998B1CEE1538075B0B0BD~000000000000000000000000000000~YAAQBGswF9UJod5+AQAAlxRaBw7kQBo2Lsk7bu5f5MVp0E7aCME6bXfLfGFHuLGD/WxBqoRLIpKI7pBEmUl5nxuz1ZGiDJZAI7VPSZS8R1B+WvP9M4bWivbnzec9uliIQxwwrekuOc17HvjYsz6sN4djNrGlfZVcI7oLZobO82ywlDSTuF1G2zfdJ7w7GF0bo4Wyahk9psBbJa+jl9qHxXUgZCvNXw5uBmurhjCdq4urFKgIMe33HA/um5agV/FXA8CyWxCxcuyEgMsWoh9xDGIpdkJghyQw+AB/NIqtV6iMqxYKVpslRGNw11H0cI++Lfn//V0ZrVV2uNsbkF5u3vd26RFasCLznNjrEmcx8XhtZ2RUhXPYid919g==; bm_sv=BA6EE1536FFE5162901ED703261238D0~N9d3GimHdz48LeSQ6weNOPKA5SoSmm61fnFdPu6r+raXVSyUCIV4sr3jWol9ItHVHrR8JJcETlm7EVDgC13MsX4bFzsXDWuKOMI33+Jys4u7VEcV4NGhR4WoBiY5TbtsWwfkVT0vWM6Cou2lAJpIZA==; bm_sz=8E8439F32D362EA97CFBD0F5CD05E449~YAAQBGswF9MJod5+AQAAlhRaBw42gmhbH5f13iqoAqkBuReIVeKGHYc8r8ZnNh4eAkc2cVTxm66bvzY3By3UoUrfYsfmHXSpBwk3s4b+s0KNBZmtNqRdOHm26nR6tCYGNkPdcL1dJR1u4WIWede5FPEEc1wANmDDyKhWVA+42/qRQq932ahp90yhCcNnBA=='
        }
    };

    request(options, function (error, response) {
        if (error) throw new Error(error);
        let array = JSON.parse(response.body);
        tenantId = array[0].tenantId;
        tenantType = array[0].tenantType;
        tenantName = array[0].tenantName;
        tenantCreateDate = moment.tz(array[0].createdDateUtc, "Asia/Karachi").format("DD-MM-YYYY h:s A");
        console.log("Tenant Details");
        console.log("ID: "+ tenantId);
        console.log("Name: "+ tenantName);
        console.log("Type: "+ tenantType);
        console.log("Created At: "+tenantCreateDate);
        // console.log(typeof response.body);
        // console.log("length : " + array.length);
        // console.log(array["tenantId"]);
        res.send(response.body);
    });
});


/**
 * Get the Quickbook AuthorizeUri
 */
app.get('/quickbooks_url', urlencodedParser, function (req, res) {

    let authUri = oauthClient.authorizeUri({
        scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId],
        state:'testState'
    });  // can be an array of multiple scopes ex : {scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId]}
    res.redirect(authUri);
});

/**
 * Handle the callback to extract the `Auth Code` and exchange them for `Bearer-Tokens`
 */
app.get('/quickbooks_callback', function (req, res) {
    oauthClient
        .createToken(req.url)
        .then(function (authResponse) {
            oauth2_token_json = JSON.stringify(authResponse.getJson())
            let array = JSON.parse(oauth2_token_json);
            qb_access_token = array.access_token;
            qb_refresh_token = array.refresh_token;
            qb_id_token = array.id_token;
            qb_expire_at = array.x_refresh_token_expires_in;
            console.log(JSON.parse(oauth2_token_json));
            res.send(oauth2_token_json);
        })
        .catch(function (e) {
            console.error(e);
            res.send('error');
        });
});
/**
 * Display the token : CAUTION : JUST for sample purposes
 */
app.get('/retrieveToken', function (req, res) {
    res.send(oauth2_token_json);
});


/**
 * Refresh the access-token
 */
app.get('/refreshAccessToken', function (req, res) {
    oauthClient
        .refresh()
        .then(function (authResponse) {
            console.log(`The Refresh Token is  ${JSON.stringify(authResponse.getJson())}`);
            oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
            let array = JSON.parse(oauth2_token_json);
            qb_access_token = array.access_token;
            qb_refresh_token = array.refresh_token;
            qb_id_token = array.id_token;
            qb_expire_at = array.x_refresh_token_expires_in;
            res.send(oauth2_token_json);
        })
        .catch(function (e) {
            console.error(e);
        });
});
/**
 * getCompanyInfo ()
 */
app.get('/getCompanyInfo', function (req, res) {
    const companyID = oauthClient.getToken().realmId;

    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    oauthClient
        .makeApiCall({ url: `${url}v3/company/${companyID}/companyinfo/${companyID}`})
        .then(function (authResponse) {
            let resp = JSON.parse(JSON.stringify(authResponse));
            console.log(resp);
            console.log(`The response for API call is :${JSON.stringify(authResponse)}`);
            res.send(JSON.parse(authResponse.text()));
        })
        .catch(function (e) {
            console.error(e);
        });
});

app.get('/createCustomer', function (req, res) {
    const companyID = oauthClient.getToken().realmId;

    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    console.log("URL:::",url);
    let sbRequestBody = {
          "Customer": {
            "domain": "QBO",
            "PrimaryEmailAddr": {
              "Address": "mj@myemail.com"
            },
            "DisplayName": "mj's Groceries",
            "CurrencyRef": {
              "name": "United States Dollar",
              "value": "USD"
            },
            "DefaultTaxCodeRef": {
              "value": "2"
            },
            "PreferredDeliveryMethod": "Print",
            "GivenName": "Mj",
            "FullyQualifiedName": "mj's Groceries",
            "BillWithParent": false,
            "Title": "Mr",
            "Job": false,
            "BalanceWithJobs": 0,
            "PrimaryPhone": {
              "FreeFormNumber": "(555) 555-5555"
            },
            "Taxable": true,
            "MetaData": {
              "CreateTime": "2022-02-11T10:58:12-07:00",
              "LastUpdatedTime": "2022-02-11T10:58:12-07:00"
            },
            "BillAddr": {
              "City": "Mountain View",
              "Country": "USA",
              "Line1": "123 Main Street",
              "PostalCode": "94042",
              "CountrySubDivisionCode": "CA",
              "Id": "113"
            },
            "MiddleName": "B",
            "Notes": "Here are other details.",
            "Active": true,
            "Balance": 0,
            "SyncToken": "0",
            "Suffix": "Jr",
            "CompanyName": "Mj Groceries",
            "FamilyName": "Mj",
            "PrintOnCheckName": "Mj Groceries",
            "sparse": false,
            "Id": "68"
          },
          "time": "2022-02-11T10:58:12.099-07:00"
        };


    // let sbRequestBody = {
    //       "FullyQualifiedName": "Mohin Javed",
    //       "PrimaryEmailAddr": {
    //         "Address": "mohsin@gmail.com"
    //       },
    //       "DisplayName": "Mohsin Javed",
    //       "Suffix": "Jr",
    //       "Title": "Mr",
    //       "MiddleName": "",
    //       "Notes": "Here are other details.",
    //       "FamilyName": "Javed",
    //       "PrimaryPhone": {
    //         "FreeFormNumber": "(555) 555-5555"
    //       },
    //       "CompanyName": "Mj",
    //       "BillAddr": {
    //         "CountrySubDivisionCode": "CA",
    //         "City": "Mountain View",
    //         "PostalCode": "94042",
    //         "Line1": "123 Main Street",
    //         "Country": "USA"
    //       },
    //       "GivenName": "Mohsin"
    //     }

    let options = {
        'method': 'POST',
        'url': `${url}v3/company/${companyID}/customer`,
        'headers':  {
        "realmId": '4620816365214175260',
            "token_type": 'bearer',
            "access_token": qb_access_token,
            "refresh_token": qb_refresh_token,
            "expires_in": 3600,
            "x_refresh_token_expires_in": qb_expire_at,
            "id_token": qb_id_token,
            "latency": 60000,
            "createdAt": 1645695001913,
            "state": 'testState'
        },
        body: JSON.stringify(sbRequestBody)
    };

    console.log(options);

    request(options, function (error, response) {
        if (error) throw new Error(error);
        // console.log(typeof response.body);
        // console.log("length : " + array.length);
        // console.log(array["tenantId"]);
        res.send(response.body);
    });

    // oauthClient
    //     .makeApiCall({ url: `${url}v3/company/${companyID}/customer`,formData: sbRequestBody, method: "POST"})
    //     .then(function (authResponse) {
    //         let resp = JSON.parse(JSON.stringify(authResponse));
    //         console.log(resp);
    //         // console.log(`The response for API call is :${JSON.stringify(authResponse)}`);
    //         res.send(JSON.parse(authResponse.text()));
    //     })
    //     .catch(function (e) {
    //         console.error(e);
    //     });
    // "POST","/v3/company/<realmID>/customer",sbRequestBody,sbResponseBody
})
app.get('/getExpenses', function (req, res) {
    const companyID = oauthClient.getToken().realmId;
    console.log(companyID);
    let realmId= companyID;
    let token_type= 'refresh_token';
    let access_token= qb_access_token;
    let refresh_token= qb_refresh_token;
    let expires_in= qb_expire_at;
    let x_refresh_token_expires_in= qb_expire_at;
    let id_token= qb_id_token;

    let header = {
        "realmId": realmId,
        "token_type": token_type,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": expires_in,
        "x_refresh_token_expires_in": x_refresh_token_expires_in,
        "id_token":id_token
    };

    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;
    console.log(url);
    oauthClient
        .makeApiCall({ url: `${url}v3/company/${companyID}/vendor/1`, header})
        .then(function (authResponse) {
            console.log(`The response for API call is :${JSON.stringify(authResponse)}`);
            res.send(JSON.parse(authResponse.text()));
        })
        .catch(function (e) {
            console.error("Error: ", e);
        });
});

/**
 * disconnect ()
 */
app.get('/disconnect', function (req, res) {
    console.log('The disconnect called ');
    const authUri = oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.OpenId, OAuthClient.scopes.Email],
        state: 'intuit-test',
    });
    res.send(authUri);
});

/**
 * Start server on HTTP (will use ngrok for HTTPS forwarding)
 */
const server = app.listen(process.env.PORT || 3008, () => {
    console.log(`💻 Server listening on port ${server.address().port}`);
    if (!ngrok) {
        redirectUri = `${server.address().port}` + '/quickbooks_callback';
        console.log(
            `💳  Step 1 : Paste this URL in your browser : ` +
            'http://localhost:' +
            `${server.address().port}`,
        );
        console.log(
            '💳  Step 2 : Copy and Paste the clientId and clientSecret from : https://developer.intuit.com',
        );
        console.log(
            `💳  Step 3 : Copy Paste this callback URL into redirectURI :` +
            'http://localhost:' +
            `${server.address().port}` +
            '/quickbooks_callback',
        );
        console.log(
            `💻  Step 4 : Make Sure this redirect URI is also listed under the Redirect URIs on your app in : https://developer.intuit.com`,
        );
    }
});

/**
 * Optional : If NGROK is enabled
 */
if (ngrok) {
    console.log('NGROK Enabled');
    ngrok
        .connect({ addr: process.env.PORT || 8000 })
        .then((url) => {
            redirectUri = `${url}/quickbooks_callback`;
            console.log(`💳 Step 1 : Paste this URL in your browser :  ${url}`);
            console.log(
                '💳 Step 2 : Copy and Paste the clientId and clientSecret from : https://developer.intuit.com',
            );
            console.log(`💳 Step 3 : Copy Paste this callback URL into redirectURI :  ${redirectUri}`);
            console.log(
                `💻 Step 4 : Make Sure this redirect URI is also listed under the Redirect URIs on your app in : https://developer.intuit.com`,
            );
        })
        .catch(() => {
            process.exit(1);
        });
}


const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log("server up and running on PORT :", port);
});