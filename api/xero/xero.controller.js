const {
    TokenSet
} = require("openid-client");
const {
    hashSync,
    genSaltSync,
    compareSync
} = require("bcrypt");
const crypto = require('crypto');
const strtotime = require('strtotime');
const nodemailer = require("nodemailer");
const {
    xeroSignUp,
    getRefreshToken,
    updateRefreshToken,
    createXeroAccount,
    addXeroExpense,
    checkTenantExpense,
    getExpenseCount,
    updateXeroExpense,
    checkTenantDepartment,
    addDepartment,
    updateDepartment,
    getAttachment,
    setAllDepartStatusToZero
} = require("./xero.service");

const {
    getCompanyByID,
    checkUserEmail,
    checkUserCompany,
    updateUserCompany,
    createUserRole,
    createCompany,
    getUserByUserEmail,
    checkUserQuickbook,
    updateXeroLoginToken,
    checkTenantAccount,
    createTenantAccount,
    getAccounts,
    getCompanyByTenant,
    getActivateCompany,
    disableAllCompany,
    activateCompany,
    getUserById,
    updateCompanyInfo,
    checkAttachable,
    updateUserCompanyResult,
    getCompanyById,
    storeActivity,
    foreignKeyCheck,
    removeAccounts,
    removeActivities,
    removeExpenses,
    removeAttachables,
    removeDepartments,
    removeUserRelations,
    removeVendors,
    removeCompany,
    updateUserStatus,
    removeUsersOfCompany,
    setForeignKeyDisable,
    setForeignKeyEnable,
    updateConnectionID,
    updateCompanyStatus
} = require("../users/user.service");

const {
    XeroClient
} = require("xero-node");
const jwt = require('jsonwebtoken');
const request = require('request');
const moment = require('moment-timezone');
const {
    updateXeroAccountEmail
} = require("../users/user.service");
const {
    getUserByEmail
} = require("../users/user.service");
const {
    checkUserCompanyByTenant
} = require("../users/user.service");
const {
    updateTenantAccount
} = require("../users/user.service");
const {
    getDepartByDepartName
} = require("../users/user.service");
const {
    getDepartByDepartID
} = require("../users/user.service");
const {
    getVendorByID
} = require("../users/user.service");
const {
    updateVendor
} = require("../quickbook/quickbook.service");
const {
    addVendor
} = require("../quickbook/quickbook.service");
const {
    checkTenantVendor
} = require("../quickbook/quickbook.service");
const {
    updateAttachable
} = require("../quickbook/quickbook.service");
const {
    addAttachable
} = require("../quickbook/quickbook.service");
const {
    getCompany
} = require("../users/user.service");
const {
    sign
} = require("jsonwebtoken");
// const httpProxy = require('http-proxy');
// const proxy = httpProxy.createServer({});
// const {createCompany} = require("../users/user.service");
// const {createUserRole} = require("../users/user.service");
// const {updateUserCompany} = require("../users/user.service");

let tokenset;

let xero_access_token = null;
let xero_refresh_token = null;
let xero_id_token = null;
let xero_expire_at = null;

let tenantId = null;
let tenantType = null;
let tenantName = null;
let tenantCreateDate = null;

let TS = null;

let xero_clintid = process.env.XERO_CLIENT_ID;
let xero_secretid = process.env.XERO_SECRET_ID;
let scope = 'openid profile email';
// let scope = 'openid profile email accounting.transactions offline_access accounting.settings accounting.attachments accounting.contacts'.split(" ");

let callbackurl = "http://localhost:3000/api/xero/xero_callback";
//let callbackurl="https://wepullbackend.herokuapp.com/api/xero/xero_callback";
const xerosignin = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_SECRET_ID,
    redirectUris: [process.env.XERO_REDIRECT_URI],
    scopes: 'openid profile email'.split(" "),
    state: 'returnPage=login', // custom params (optional)
    httpTimeout: 100000 // ms (optional)
});

const xero = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_SECRET_ID,
    redirectUris: [process.env.XERO_REDIRECT_URIS],
    scopes: 'openid profile email accounting.transactions offline_access accounting.settings accounting.attachments accounting.contacts'.split(" "),
    state: 'returnPage=signup', // custom params (optional)
    httpTimeout: 100000 // ms (optional)
});

async function xero_get_tenant(access_token) {
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
    let array = [];

    return new Promise(function(resolve, reject) {
        request(options, function(error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
    // request(options, function (error, response) {
    //     if (error) throw new Error(error);
    //     array = JSON.parse(response.body);
    // });
    // console.log(array[0]);
    // tenantId = array[0].tenantId;
    // tenantType = array[0].tenantType;
    // tenantName = array[0].tenantName;
    // tenantCreateDate = moment.tz(array[0].createdDateUtc, "Asia/Karachi").format("DD-MM-YYYY h:s A");
    // console.log("Tenant Details");
    // console.log("ID: "+ tenantId);
    // console.log("Name: "+ tenantName);
    // console.log("Type: "+ tenantType);
    // console.log("Created At: "+tenantCreateDate);
}

async function xero_remove_connection(access_token, tenant_id) {
    try {
        let bearer = "Bearer " + access_token;
        console.log(bearer);
        // return "working";
        let options = {
            'method': 'DELETE',
            'url': `https://api.xero.com/connections/${tenant_id}`,
            'headers': {
                'Authorization': bearer
            }
        };

        let res = null;

        new Promise(function(resolve, reject) {
            request(options, function(error, res, body) {
                if (error) {
                    res = "Error";
                }
                res = "Success";
            });
        });

        return res;
    } catch (e) {
        console.log("r", e);
    }
}

async function getExpense(access_token, tenantID) {
    //
    try {
        let bearer = 'Bearer ' + access_token;
        console.log(bearer);
        let options = {
            'method': 'GET',
            'url': 'https://api.xero.com/api.xro/2.0/ExpenseClaims',
            'headers': {
                'Authorization': bearer,
                'xero-tenant-id': tenantID,
                'user-agent': 'xero-node-4.17.1',
                'accept': 'application/json'
            }
        };
        let array = [];

        return new Promise(function(resolve, reject) {
            request(options, function(error, res, body) {
                if (!error && res.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    } catch (e) {
        console.log("Error")
        console.log(e.message);
    }
}

async function getUser() {
    //
    try {
        // let bearer = 'Bearer ' + "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFDQUY4RTY2NzcyRDZEQzAyOEQ2NzI2RkQwMjYxNTgxNTcwRUZDMTkiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJISy1PWm5jdGJjQW8xbkp2MENZVmdWY09fQmsifQ.eyJuYmYiOjE2NTMyODg2NjcsImV4cCI6MTY1MzI5MDQ2NywiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS54ZXJvLmNvbSIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHkueGVyby5jb20vcmVzb3VyY2VzIiwiY2xpZW50X2lkIjoiRjMxNzg2Mzg4N0IzNEQ5NUIyNEM3QUM2MUU0MjdGMzYiLCJzdWIiOiJkYTIyZjdiZjgxYjM1Mjk2YjRlN2YzNWI1YTYzMWU5OSIsImF1dGhfdGltZSI6MTY1MzI4ODY0NSwieGVyb191c2VyaWQiOiJmMmJlMDViOC03MjkwLTQ0YjAtYjJlZi1kZDk4ZWNiZjNlMGQiLCJnbG9iYWxfc2Vzc2lvbl9pZCI6IjdkMjJjZTI1ZTAxNzRjMTVhZDkxNDA1ZDRiMDI1YmZmIiwianRpIjoiZDIxODViMTE0MWUyN2Q5ODk1ZTU5ODI0NjlmMTVjZmIiLCJhdXRoZW50aWNhdGlvbl9ldmVudF9pZCI6Ijc0NmFhOWQ0LTkwOWEtNGJkMi04NjE2LWJlN2RjOGI5OThiNSIsInNjb3BlIjpbImVtYWlsIiwicHJvZmlsZSIsIm9wZW5pZCIsImFjY291bnRpbmcuc2V0dGluZ3MiLCJhY2NvdW50aW5nLmF0dGFjaG1lbnRzIiwiYWNjb3VudGluZy50cmFuc2FjdGlvbnMiLCJhY2NvdW50aW5nLmNvbnRhY3RzIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.DqFY7WzkrKuutyFApfGszCIHeicROkZjIF83GBK80ipMEdmcyTnwoxmJ-A7fhaDF9NdumU4OORZPLoGR3iP2v69SZ0p6XGZG0IUWvzRHFB26k_49LUwrYk3T2MsnfIybu22bneh1vay6w0zze3aTHvizbxeXbpuX8BGhcH_mzS85Y7tkFYJNdFqegKrUZCy5ZgaGJIi-0nOiKUphL2Nup2tvx4DOpKJI-bzoMi1Dd74K4TpEG4qA_NbDwrnq7sjxgzmdmnKshrAOzDLmp84qZiXlINeAl5HB_ILATIycfXKAst9P-8nyGsBDXH4GjcjSu5zIVJkp5HMW9MNdc1lRgw";
        // console.log(bearer);
        let options = {
            'method': 'GET',
            'url': `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${process.env.XERO_CLIENT_ID}&redirect_uri=${process.env.XERO_REDIRECT_URI}&scope=openid profile email&state=123`,
            'headers': {
                'accept': 'application/json'
            }
        };
        let array = [];

        return new Promise(function(resolve, reject) {
            request(options, function(error, res, body) {
                if (!error && res.statusCode == 200) {
                    resolve(body);
                } else {
                    console.log("Eror1");
                    console.log(error);
                    reject(error);
                }
            });
        }).catch((error) => {
            console.log("Eror2");
            console.error(error);
        });;
    } catch (e) {
        console.log("Error")
        console.log(e.message);
    }
}

async function refreshToken(email) {
    const getUserByUserEmailResult = await getUserByUserEmail(email);
    // console.log("user", getUserByUserEmailResult);
    let expire_at = getUserByUserEmailResult.xero_expire_at;
    let ts = Number(expire_at); // cast it to a Number
    const unixTimestamp = ts;
    const milliseconds = unixTimestamp * 1000 // 1575909015000
    const expire = new Date(milliseconds).toLocaleString();
    let current_date = new Date().toLocaleString();
    console.log(ts);
    console.log("exipre date", expire);
    console.log("current_date", current_date);
    if (current_date > expire) {
        console.log("Expired");
        const validTokenSet = await xero.refreshWithRefreshToken(process.env.XERO_CLIENT_ID, process.env.XERO_SECRET_ID, getUserByUserEmailResult.xero_refresh_token);
        let array = JSON.parse(JSON.stringify(validTokenSet));
        xero_access_token = array.access_token;
        xero_refresh_token = array.refresh_token;
        xero_id_token = array.id_token;
        xero_expire_at = array.expires_at;

        const updateRefreshTokenResult = await updateRefreshToken(email, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at);
        console.log("Refreshed Token Set UPDATED");
        console.log(validTokenSet);
        TS = new TokenSet({
            id_token: xero_id_token,
            access_token: xero_access_token,
            refresh_token: xero_refresh_token,
            token_type: "Bearer",
            scope: scope
        });

        await xero.setTokenSet(TS);

        console.log("Token set data after refresh: ", xero.readTokenSet());
        tokenset = validTokenSet;
        let res = {
            'validTokenSet': validTokenSet,
            'TS': TS
        };

        return res;
    } else {
        console.log("Not Expired");
        return "Not Expired";
        // return res.json({
        //     status:200,
        //     message: "Not Expired"
        // });
    }
}

// async function refreshToken(access_token, email) {
//     const validTokenSet = await xero.refreshWithRefreshToken(xero_clintid, xero_secretid, access_token);
//     let array = JSON.parse(JSON.stringify(validTokenSet));
//     xero_access_token = array.access_token;
//     xero_refresh_token = array.refresh_token;
//     xero_id_token = array.id_token;
//     xero_expire_at = array.expires_at;
//
//     const updateRefreshTokenResult = await updateRefreshToken(email, xero_access_token, xero_refresh_token, xero_expire_at);
//     console.log("Refreshed Token Set UPDATED");
//     console.log(validTokenSet);
//     await xero.setTokenSet(validTokenSet);
//     // tokenset = validTokenSet;
//     return validTokenSet;
// }
let login_type = null;
module.exports = {
    activateCompany: async  (req, res) => {
        try {
            const body = req.body;
            const company = await getCompanyByID(body.selectedCompany);

            const user = await getUserById(body.user_id);
            console.log("tennat id", company[0].tenant_id);
            // console.log(user);

            const TS = new TokenSet({
                id_token: user[0].xero_id_token,
                access_token: user[0].xero_access_token,
                refresh_token: user[0].xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });
            console.log("a")
            await xero.setTokenSet(TS);
            console.log("b")

            const order = 'Name ASC';
            //getting all account by tenant id
            const response = await xero.accountingApi.getAccounts(company[0].tenant_id, null, null, order);
            console.log("responseresponse",response);
            // if(response){
            const disableAllCompanyResult = await disableAllCompany(body.user_id);
            const activateCompanyResult = await activateCompany(body.selectedCompany);
            await refreshToken(body.email)
            return res.json({
                success: 1,
                message: "Company activated successfully",
                company: company[0]
            });
            // }



            // const company = await getActivateCompany(body.user_id);
            //
            // console.log(company);

        } catch (e) {
            const body = req.body;
            // const updateCompanyStatusRes = await updateCompanyStatus(body.selectedCompany,0);
            // console.log("updateCompanyStatusRes",updateCompanyStatusRes)

            const setForeignKeyResulten = await setForeignKeyDisable('companies');
            const setForeignKeyResulten1 = await setForeignKeyDisable('users');
            await removeAccounts(body.selectedCompany).then(async () => {
                await removeActivities(body.selectedCompany).then(async () => {
                    await removeUserRelations(body.selectedCompany).then(async () => {
                        await removeVendors(body.selectedCompany).then(async () => {
                            await removeExpenses(body.selectedCompany).then(async () => {
                                await removeAttachables(body.selectedCompany).then(async () => {
                                    await removeDepartments(body.selectedCompany).then(async () => {
                                        await removeUsersOfCompany(body.selectedCompany).then(async () => {
                                            await removeCompany(body.selectedCompany).then(async () => {
                                                const setForeignKeyResulten = await setForeignKeyEnable('companies');
                                                const setForeignKeyResulten1 = await setForeignKeyEnable('users');
                                                const user_companies = await getCompany(body.user_id);
                                                if (user_companies.length > 0) {
                                                    console.log("user_companies", user_companies);
                                                    const disableAllCompanyResult = await disableAllCompany(body.user_id);
                                                    const activateCompanyResult = await activateCompany(user_companies[0].id);
                                                } else {
                                                    console.log("change user status to 0");
                                                    const updateUserStatusResult = await updateUserStatus(body.user_id, 0);
                                                    console.log("updateUserStatus");
                                                }
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            });
            console.log("eror",e.message);
            return res.json({
                success: 403,
                message: "Company disconnected from WePull by Xero."
            });
        }
    },
    xero_url: async (req, res) => {
        // const getUserResult = await getUser();
        // console.log("GU")
        // console.log(getUserResult);
        // console.log("GU")
        login_type = req.params.login_type;
        console.log(login_type);
        let consentUrl = await xerosignin.buildConsentUrl();
        // console.log("eerror");
        res.redirect(consentUrl);
    },
    xero_url_sign_up: async (req, res) => {
        // const getUserResult = await getUser();
        // console.log("GU")
        // console.log(getUserResult);
        // console.log("GU")
        // login_type = req.params.login_type;
        // console.log(login_type);

        console.log("comes to xero sign up url route");
        let consentUrl = await xero.buildConsentUrl();
        // console.log("eerror");
        res.redirect(consentUrl);
    },
    xero_callback: async (req, res) => {
        // await xero.initialize();
        try {
            const tokenSet = await xerosignin.apiCallback(req.url);
            tokenset = tokenSet;
            console.log("tokenSet", tokenSet)
            let array = JSON.parse(JSON.stringify(tokenSet));
            xero_access_token = array.access_token;
            xero_refresh_token = array.refresh_token;
            xero_id_token = array.id_token;
            xero_expire_at = array.expires_at;
            // console.log(xero_access_token);

            TS = new TokenSet({
                id_token: xero_id_token,
                access_token: xero_access_token,
                refresh_token: xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            await xerosignin.setTokenSet(TS);
            // console.log("Token set data: ", xero.readTokenSet());
            const jwtTokenDecode = jwt.decode(xero_id_token);
            const activeTenant = await xero_get_tenant(xero_access_token);

            // await xero_get_tenant(xero_access_token);

            let email = jwtTokenDecode.email;
            let xero_userid = jwtTokenDecode.xero_userid;
            let first_name = jwtTokenDecode.given_name;
            let last_name = jwtTokenDecode.family_name;
            let name = jwtTokenDecode.name;

            let tenantArray = JSON.parse(activeTenant);
            // console.log("tenants ", tenantArray);
            let getuser = await getUserByEmail(email);
            console.log("getuser", getuser);
                const checkUserEmailResult = await checkUserEmail(email);

                const checkUserQuickbookResult = await checkUserQuickbook(email);

                console.log("TTTTTT", tenantArray);
                console.log("checkUserEmailResult[0].count_user sign in", checkUserEmailResult[0].count_user, "email", email);
                // this.exit();
                if (checkUserEmailResult[0].count_user === 0) {
                    console.log("account donot exist.");
                    console.log("login_type", login_type);
                    if (login_type === "sign_up" || login_type === "connect") {
                        console.log("tenantArray", tenantArray);
                        for (const tenant of tenantArray) {
                            const checkUserCompanyResult = await checkUserCompanyByTenant(tenant.tenantId);
                            if (checkUserCompanyResult[0].count_company === 0) {
                                let consentUrl = await xero.buildConsentUrl();
                                // console.log("eerror");
                                res.redirect(consentUrl);
                            }
                        }
                    } else if (login_type === "sign_in") {
                        if (tenantArray.length > 0) {
                            if(getuser.length === 0) {
                                return res.redirect(`${process.env.APP_URL}login/error/404`);
                            }
                            if (getuser[0].status === 1) {
                                // for (const tenant of tenantArray) {
                                const checkUserCompanyResultt = await checkUserCompanyByTenant(tenantArray[0].tenantId);
                                console.log("checkUserCompanyResult[0].count_company", checkUserCompanyResultt[0].count_company);
                                if (checkUserCompanyResultt[0].count_company === 1) {
                                    // const checkUserEmailResultt = await checkUserEmail(email);
                                    // if(checkUserCompanyResultt.count_user === 0) {
                                    const getCompanyByTenantResult = await getCompanyByTenant(tenantArray[0].tenantId);
                                    console.log(getCompanyByTenantResult[0].user_id)
                                    const updateXeroAccountEmailResult = await updateXeroAccountEmail(getCompanyByTenantResult[0].user_id, email);

                                    console.log("User Email", email);
                                    console.log("User xero_userid", xero_userid);
                                    console.log("User first_name", first_name);
                                    console.log("User last_name", last_name);
                                    console.log("User name", name);
                                    console.log("direct login");
                                    const token = crypto.randomBytes(48).toString('hex');
                                    const updateLoginTokenResult = await updateXeroLoginToken(email, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, 1);
                                    const getUserByUserEmailResult = await getUserByUserEmail(email);

                                    const getCompanyResult = await getCompany(getUserByUserEmailResult.id);
                                    if (tenantArray.length > 0) {
                                        //disable all active company
                                        const disableAllCompanyResult = await disableAllCompany(getUserByUserEmailResult.id);
                                        const getCompanyByTenantResultt = await getCompanyByTenant(tenantArray[0].tenantId);
                                        console.log("disable all company of", getUserByUserEmailResult.id);
                                        console.log("company data", getCompanyByTenantResultt);
                                        // console.log("active tenant",getCompanyByTenantResultt);

                                        //enable first existing company
                                        const activateCompanyResult = await activateCompany(getCompanyByTenantResultt[0].id);
                                        // console.log("token",token);
                                        res.redirect(`${process.env.APP_URL}auth_login/` + encodeURIComponent(email) + `/xero/1/` + token + `/sign_in`);
                                    }
                                    // updateXeroAccountEmail
                                    // }
                                } else {
                                    res.redirect(`${process.env.APP_URL}login/error/404`);
                                }
                                // }

                            }
                            else {
                                res.redirect(`${process.env.APP_URL}login/error/company_disconnected`);
                            }
                        }
                        else {
                            res.redirect(`${process.env.APP_URL}login/error/no_tenant`);
                        }
                    }
                    // this.exit();
                    // const order = 'Name ASC';
                    // Check if email exist as quickbooks account
                    // if(checkUserQuickbookResult[0].count_quickbook==0) {
                    //     //Good to go
                    //     if (checkUserEmailResult[0].count_user === 0) {
                    //         //Sign up Execution
                    //
                    //         //Create Xero user in users table
                    //         const token = crypto.randomBytes(48).toString('hex');
                    //         const createUsersResult = await xeroSignUp(first_name,last_name, email,xero_userid, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token);
                    //
                    //         //get all tenants from api callback
                    //         for (const tenant of tenantArray) {
                    //             console.log(tenant.tenantId);
                    //             console.log(tenant.tenantName);
                    //             console.log(tenant.tenantType);
                    //             console.log(tenant.createdDateUtc);
                    //             // const orderc = 'Code ASC';
                    //
                    //             const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId,  null, null);
                    //
                    //             const createCompanyResult = await createCompany(tenant.tenantId,tenant.tenantName,tenant.createdDateUtc, tenant.tenantType, null, currencyResponse.body.currencies[0].code,null,null,createUsersResult.insertId);
                    //             // const updateUserCompanyResult = await updateUserCompanyResult(createCompanyResult.insertId,createUsersResult.insertId);
                    //             const createUserRoleResult = await createUserRole(createUsersResult.insertId, createCompanyResult.insertId, null, 1, null);
                    //
                    //             //Get Accounts
                    //             try {
                    //                 //getting all account by tenant id
                    //                 const response = await xero.accountingApi.getAccounts(tenant.tenantId, null, null, order);
                    //                 // console.log(typeof response.body.accounts);
                    //                 let res = response.body.accounts;
                    //                 for (const Account of res) {
                    //                     console.log("Company ID:",createCompanyResult.insertId, "Account ID: ", Account.accountID);
                    //
                    //                     //Check if tenant account already exist
                    //                     const checkTenantAccountResult = await checkTenantAccount(Account.accountID,createCompanyResult.insertId);
                    //                     console.log("count:",checkTenantAccountResult[0].account_count);
                    //                     if(checkTenantAccountResult[0].account_count === 0) {
                    //                         console.log(createCompanyResult.insertId ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
                    //                         const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, createCompanyResult.insertId, createUsersResult.insertId,"xero");
                    //                     }
                    //                 }
                    //             } catch (err) {
                    //                 const error = JSON.stringify(err.response, null, 2)
                    //                 console.log(`Status Code: ${err.response} => ${error}`);
                    //             }
                    //
                    //             //Get Vendor
                    //
                    //             const VifModifiedSince = null;
                    //             const Vwhere = 'ContactStatus=="ACTIVE"';
                    //             const Vorder = null;
                    //             const ViDs = null;
                    //             const Vpage = 1;
                    //             const VincludeArchived = true;
                    //             const VsummaryOnly = false;
                    //             const VsearchTerm = null;
                    //
                    //             // console.log("tokenSeT",xero.readTokenSet().expired());
                    //             // if(xero.readTokenSet().expired() === false) {
                    //                 console.log("record[0].tenant_id",tenant.tenantId);
                    //                 const responseVendor = await xero.accountingApi.getContacts(tenant.tenantId, VifModifiedSince, Vwhere, Vorder, ViDs, Vpage, VincludeArchived, VsummaryOnly, VsearchTerm);
                    //                 if(responseVendor.body.contacts.length>0) {
                    //                     for(const Contact of responseVendor.body.contacts) {
                    //                         let vendor_id = Contact.contactID;
                    //                         let name = Contact.name;
                    //                         let acct_num = Contact.accountNumber!==undefined?Contact.accountNumber:null;
                    //                         let status = Contact.contactStatus==='ACTIVE'?1:0;
                    //                         let email = Contact.emailAddress;
                    //                         let address1 =  Contact.addresses[0].addressLine1!==undefined? Contact.addresses[0].addressLine1:"";
                    //                         let address2 =  Contact.addresses[0].addressLine2!==undefined? Contact.addresses[0].addressLine2:"";
                    //                         let address3 =  Contact.addresses[0].addressLine3!==undefined? Contact.addresses[0].addressLine3:"";
                    //                         let address4 =  Contact.addresses[0].addressLine4!==undefined? Contact.addresses[0].addressLine4:"";
                    //                         let address = address1 + address2 + address3 + address4;
                    //                         let city = Contact.addresses[0].city;
                    //                         let postalCode = Contact.addresses[0].postalCode;
                    //                         let country = Contact.addresses[0].country;
                    //                         let contact = Contact.phones[1].phoneCountryCode!==undefined? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneNumber:null;
                    //                         let mobile = Contact.phones[3].phoneCountryCode!==undefined? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneNumber:null;
                    //                         let website = Contact.website!==undefined?Contact.website:null;
                    //                         let balance = Contact.balances!==undefined?Contact.balances:null;
                    //                         let date = Contact.updatedDateUTC;
                    //                         console.log(vendor_id);
                    //                         console.log(name);
                    //                         console.log(status);
                    //                         console.log(acct_num);
                    //                         console.log(email);
                    //                         console.log(address!==""?address:null);
                    //                         console.log(contact);
                    //                         console.log(mobile);
                    //                         console.log(website);
                    //                         console.log(null);
                    //                         console.log(date);
                    //                         console.log("-----------")
                    //                         const checkTenantVendorResult = await checkTenantVendor(vendor_id,company_id);
                    //                         if(checkTenantVendorResult[0].vendor_count === 0) {
                    //                             // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                    //                             // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                    //                             // console.log("address",address);
                    //                             console.log(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, null, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', 'USD', createUsersResult.insertId, date, date);
                    //                             const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, 'USD', status, 'xero', createCompanyResult.insertId, createUsersResult.insertId, date, date);
                    //                             console.log("added");
                    //                         }
                    //                         else {
                    //                             console.log("found ",vendor_id);
                    //                             const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, 'USD', status, 'xero', createCompanyResult.insertId, createUsersResult.insertId, date, date);
                    //                             console.log("updated");
                    //                         }
                    //                         // console.log(Contact);
                    //                     }
                    //                 }
                    //                 // const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
                    //             // }
                    //
                    //             //Get Departments
                    //             const orderDep = 'Name ASC';
                    //             const includeArchivedDep = true;
                    //             const responseDep = await xero.accountingApi.getTrackingCategories(tenant.tenantId,  null, orderDep, includeArchivedDep);
                    //             console.log("result:::",responseDep.body.trackingCategories.length)
                    //             if(responseDep.body.trackingCategories.length>0) {
                    //                 for(let i=0;i<responseDep.body.trackingCategories.length;i++) {
                    //                     for(const Department of responseDep.body.trackingCategories[i].options) {
                    //                         const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID,createCompanyResult.insertId);
                    //                         if(checkTenantDepartmentResult[0].depart_count === 0) {
                    //                             console.log("Depart id",Department.trackingOptionID);
                    //                             console.log("Name",Department.name);
                    //                             console.log("Status",Department.status);
                    //                             console.log()
                    //                             const addDepartmentResult = addDepartment(Department.trackingOptionID, responseDep.body.trackingCategories[i].trackingCategoryID, Department.name,null,Department.status==="ACTIVE"?1:0, createCompanyResult.insertId, createUsersResult.insertId,0);
                    //                         }
                    //                         else {
                    //                             console.log("depart found")
                    //                             const updateDepartmentResult = updateDepartment(Department.trackingOptionID, responseDep.body.trackingCategories[i].trackingCategoryID, Department.name,null,Department.status==="ACTIVE"?1:0, createCompanyResult.insertId,0);
                    //                         }
                    //                     }
                    //                 }
                    //
                    //             }
                    //         }
                    //
                    //             //Get Expense
                    //             const page = 1;
                    //             const includeArchived = true;
                    //             const createdByMyApp = false;
                    //             const unitdp = 4;
                    //             const summaryOnly = false;
                    //             const response = await xero.accountingApi.getInvoices(tenant.tenantId, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                    //             console.log(response.body.invoices.length);
                    //             // console.log(response.body || response.response.statusCode)
                    //             // let expenseArray = JSON.parse(response.body.invoices);
                    //             //
                    //             for(const Expense of response.body.invoices) {
                    //                 if(Expense.type === "ACCPAY") {
                    //                     const getExpenseCountResult = await checkTenantExpense(Expense.invoiceID, createCompanyResult.insertId);
                    //                     if (getExpenseCountResult[0].expense_count === 0) {
                    //                         console.log(Expense)
                    //                         // console.log("Company id",getCompanyByTenantResult)
                    //                         console.log()
                    //                         let vn = await getVendorByID(Expense.contact.contactID);
                    //                         console.log("vendor", vn[0].name);
                    //                         let gdpart = null;
                    //                         let is_paid = "false";
                    //                         let payment_ref_number = null;
                    //                         let paid_amount = null;
                    //                         let payment_date = null;
                    //                         if (Expense.payments.length>0) {
                    //                             is_paid = "true";
                    //                             payment_ref_number = Expense.payments[0].reference;
                    //                             paid_amount = Expense.payments[0].amount;
                    //                             payment_date = Expense.payments[0].date;
                    //
                    //                             console.log("is_paid", is_paid);
                    //                             console.log("payment_ref_number", payment_ref_number);
                    //                             console.log("paid_amount", paid_amount);
                    //                             console.log("payment_date", payment_date);
                    //                         }
                    //                         if(Expense.lineItems[0].tracking.length>0) {
                    //                             gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                    //                             console.log("GETED DEPART", gdpart);
                    //                             console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                    //                         }
                    //                         const addExpenseResult = await addXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null,vn[0].vendor_id!==undefined?vn[0].vendor_id:null,vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date, createCompanyResult.insertId, createUsersResult.insertId)
                    //                         // const addExpenseResult = await addXeroExpense(Expense.invoiceID, Expense.date, Expense.updatedDateUTC, null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, Expense.lineItems[0].description, null, Expense.lineItems[0].unitAmount, createCompanyResult.insertId, createUsersResult.insertId)
                    //                     }
                    //                     else {
                    //                         let vn = await getVendorByID(Expense.contact.contactID);
                    //                         console.log("vendor", vn[0].name);
                    //                         let gdpart = null;
                    //                         let is_paid = "false";
                    //                         let payment_ref_number = null;
                    //                         let paid_amount = null;
                    //                         let payment_date = null;
                    //                         if (Expense.payments.length>0) {
                    //                             is_paid = "true";
                    //                             payment_ref_number = Expense.payments[0].reference;
                    //                             paid_amount = Expense.payments[0].amount;
                    //                             payment_date = Expense.payments[0].date;
                    //
                    //                             console.log("is_paid", is_paid);
                    //                             console.log("payment_ref_number", payment_ref_number);
                    //                             console.log("paid_amount", paid_amount);
                    //                             console.log("payment_date", payment_date);
                    //                         }
                    //                         if(Expense.lineItems[0].tracking.length>0) {
                    //                             gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                    //                             console.log("GETED DEPART", gdpart);
                    //                             console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                    //                         }
                    //                         console.log("vendor", vn[0].name);
                    //                         const updateExpenseResult = await updateXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null,vn[0].vendor_id!==undefined?vn[0].vendor_id:null,vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date, createCompanyResult.insertId, createUsersResult.insertId)
                    //                     }
                    //                 }
                    //
                    //                 if(Expense.hasAttachments === true) {
                    //                     console.log("Line item", Expense.lineItems[0])
                    //                     console.log("aaa");
                    //                     try {
                    //                         const responseAttachment = await xero.accountingApi.getInvoiceAttachments(tenant.tenantId, Expense.invoiceID);
                    //                         // console.log(responseAttachment.body.attachments[0]);
                    //                         for (let i=0;i<responseAttachment.body.attachments.length;i++) {
                    //                             console.log("attachment",i);
                    //                             console.log("attachment:::",responseAttachment.body.attachments[i])
                    //                             let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[i].attachmentID,Expense.invoiceID);
                    //                             if(checkAttachableResult[0].attach_count === 0) {
                    //                                 // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                    //                                 let addAttachableResult = await addAttachable(Expense.invoiceID,  createCompanyResult.insertId, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID,null, null);
                    //                                 console.log("attachable inserted",Expense.invoiceID,  createCompanyResult.insertId, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID,null, null);
                    //                             }
                    //                             else {
                    //                                 let updateAttachableResult = await updateAttachable(Expense.invoiceID, createCompanyResult.insertId, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID,null, null);
                    //                             }
                    //
                    //                         }
                    //
                    //                     }
                    //                     catch (e) {
                    //                         console.log("Error",e);
                    //                     }
                    //                 }
                    //             }
                    //
                    //
                    //         let transporter = nodemailer.createTransport({
                    //             service: 'Gmail',
                    //             auth: {
                    //                 user: 'mohjav031010@gmail.com',
                    //                 pass: 'Javed@0348'
                    //             }
                    //         });
                    //
                    //         let mailOptions = {
                    //             from: 'no-reply@wepull.io',
                    //             to: email,
                    //             subject: 'WePull Account Creation',
                    //             html: "<p>We have successfully pulled all your data from xero and your account is ready to be in use.</p>" +
                    //                   "Login now at <a href="+ process.env.APP_URL+">" + process.env.APP_URL + "</a>"
                    //         };
                    //
                    //         await transporter.sendMail(mailOptions);
                    //
                    //
                    //
                    //         // const disableAllCompanyResult = await disableAllCompany(getUserByUserEmailResult.id);
                    //         const getCompanyByTenantResult = await getCompanyByTenant(tenantArray[0].tenantId)
                    //         const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);
                    //         // const updateUserCompanyResult = await updateUserCompany(createUsersResult.insertId, createCompanyResult.insertId);
                    //         res.redirect(`${process.env.APP_URL}auth_login/`+ encodeURIComponent(email)+`/xero/0/`+ token + `/sign_up`);
                    //     }
                    //     else {
                    //         //Login Execution
                    //         const token = crypto.randomBytes(48).toString('hex');
                    //         const updateLoginTokenResult = await updateXeroLoginToken(email, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at);
                    //         const getUserByUserEmailResult = await getUserByUserEmail(email);
                    //
                    //         const getCompanyResult = await getCompany(getUserByUserEmailResult.id);
                    //         // console.log(getCompanyResult);
                    //         for (const tenant of tenantArray) {
                    //             // const getCompanyByTenantResult = await getCompanyByTenant(jwtTokenDecode.realmid)
                    //             const getCompanyByTenantResult = await getCompanyByTenant(tenant.tenantId)
                    //             //Check weather company exist or not
                    //             if(getCompanyByTenantResult.length > 0) {
                    //                 //Execute if company already exist by tenant id
                    //
                    //                 //Get currency
                    //                 await xero.setTokenSet(tokenSet);
                    //
                    //                 // const xeroTenantId = 'YOUR_XERO_TENANT_ID';
                    //                 // const where = 'Code=="USD"';
                    //
                    //
                    //
                    //                 // //Get all account of existing company
                    //                 // const response = await xero.accountingApi.getAccounts(tenant.tenantId, null, null, order);
                    //                 // // console.log(typeof response.body.accounts);
                    //                 // let res = response.body.accounts;
                    //                 // for (const Account of res) {
                    //                 //     // console.log("Company ID:",company.id, "Account ID: ", Account.accountID);
                    //                 //     //get company by tenant id
                    //                 //     console.log("company by tenant length of tenant", tenant.tenantId , " : " ,getCompanyByTenantResult.length);
                    //                 //     const checkTenantAccountResult = await checkTenantAccount(Account.accountID,getCompanyByTenantResult[0].id);
                    //                 //     // console.log("count:",checkTenantAccountResult[0].account_count);
                    //                 //     console.log("account id:",Account.accountID,"company id:",getCompanyByTenantResult[0].id,"count:",checkTenantAccountResult[0].account_count);
                    //                 //     if(checkTenantAccountResult[0].account_count === 0) {
                    //                 //         console.log(getCompanyByTenantResult[0].id ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
                    //                 //         const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,"xero");
                    //                 //     }
                    //                 // }
                    //
                    //
                    //
                    //                 // const VifModifiedSince = null;
                    //                 // const Vwhere = 'ContactStatus=="ACTIVE"';
                    //                 // const Vorder = null;
                    //                 // const ViDs = null;
                    //                 // const Vpage = 1;
                    //                 // const VincludeArchived = true;
                    //                 // const VsummaryOnly = false;
                    //                 // const VsearchTerm = null;
                    //                 //
                    //                 // // console.log("tokenSeT",xero.readTokenSet().expired());
                    //                 // // if(xero.readTokenSet().expired() === false) {
                    //                 // console.log("record[0].tenant_id",tenant.tenantId);
                    //                 // const responseVendor = await xero.accountingApi.getContacts(tenant.tenantId, VifModifiedSince, Vwhere, Vorder, ViDs, Vpage, VincludeArchived, VsummaryOnly, VsearchTerm);
                    //                 // if(responseVendor.body.contacts.length>0) {
                    //                 //     for(const Contact of responseVendor.body.contacts) {
                    //                 //         let vendor_id = Contact.contactID;
                    //                 //         let name = Contact.name;
                    //                 //         let acct_num = Contact.accountNumber!==undefined?Contact.accountNumber:null;
                    //                 //         let status = Contact.contactStatus==='ACTIVE'?1:0;
                    //                 //         let email = Contact.emailAddress;
                    //                 //         let address1 =  Contact.addresses[0].addressLine1!==undefined? Contact.addresses[0].addressLine1:"";
                    //                 //         let address2 =  Contact.addresses[0].addressLine2!==undefined? Contact.addresses[0].addressLine2:"";
                    //                 //         let address3 =  Contact.addresses[0].addressLine3!==undefined? Contact.addresses[0].addressLine3:"";
                    //                 //         let address4 =  Contact.addresses[0].addressLine4!==undefined? Contact.addresses[0].addressLine4:"";
                    //                 //         let address = address1 + address2 + address3 + address4;
                    //                 //         let city = Contact.addresses[0].city;
                    //                 //         let postalCode = Contact.addresses[0].postalCode;
                    //                 //         let country = Contact.addresses[0].country;
                    //                 //         let contact = Contact.phones[1].phoneCountryCode!==undefined? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneNumber:null;
                    //                 //         let mobile = Contact.phones[3].phoneCountryCode!==undefined? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneNumber:null;
                    //                 //         let website = Contact.website!==undefined?Contact.website:null;
                    //                 //         let balance = Contact.balances!==undefined?Contact.balances:null;
                    //                 //         let date = Contact.updatedDateUTC;
                    //                 //         console.log(vendor_id);
                    //                 //         console.log(name);
                    //                 //         console.log(status);
                    //                 //         console.log(acct_num);
                    //                 //         console.log(email);
                    //                 //         console.log(address!==""?address:null);
                    //                 //         console.log(contact);
                    //                 //         console.log(mobile);
                    //                 //         console.log(website);
                    //                 //         console.log(null);
                    //                 //         console.log(date);
                    //                 //         console.log("-----------")
                    //                 //         const checkTenantVendorResult = await checkTenantVendor(vendor_id,getCompanyByTenantResult[0].id);
                    //                 //         if(checkTenantVendorResult[0].vendor_count === 0) {
                    //                 //             // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                    //                 //             // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                    //                 //             // console.log("address",address);
                    //                 //             console.log(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, null, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                    //                 //             const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                    //                 //             console.log("added");
                    //                 //         }
                    //                 //         else {
                    //                 //             console.log("found ",vendor_id);
                    //                 //             const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                    //                 //             console.log("updated");
                    //                 //         }
                    //                 //         // console.log(Contact);
                    //                 //     }
                    //                 // }
                    //                 // // const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
                    //                 // // }
                    //
                    //
                    //                 // //Get Departments of existing company
                    //                 // const orderDep = 'Name ASC';
                    //                 // const includeArchivedDep = true;
                    //                 // const responseDep = await xero.accountingApi.getTrackingCategories(tenant.tenantId,  null, orderDep, includeArchivedDep);
                    //                 // console.log("result:::",responseDep.body.trackingCategories.length)
                    //                 // if(responseDep.body.trackingCategories.length>0) {
                    //                 //     for(let i=0;i<responseDep.body.trackingCategories.length;i++) {
                    //                 //         for(const Department of responseDep.body.trackingCategories[i].options) {
                    //                 //             const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID,getCompanyByTenantResult[0].id);
                    //                 //             if(checkTenantDepartmentResult[0].depart_count === 0) {
                    //                 //                 console.log("Depart id",Department.trackingOptionID);
                    //                 //                 console.log("Name",Department.name);
                    //                 //                 console.log("Status",Department.status);
                    //                 //                 console.log()
                    //                 //                 const addDepartmentResult = addDepartment(Department.trackingOptionID, responseDep.body.trackingCategories[i].trackingCategoryID, Department.name,null,Department.status==="ACTIVE"?1:0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,0);
                    //                 //             }
                    //                 //             else {
                    //                 //                 console.log("depart found")
                    //                 //                 const updateDepartmentResult = updateDepartment(Department.trackingOptionID, responseDep.body.trackingCategories[i].trackingCategoryID, Department.name,null,Department.status==="ACTIVE"?1:0, getCompanyByTenantResult[0].id,0);
                    //                 //             }
                    //                 //         }
                    //                 //     }
                    //                 //
                    //                 // }
                    //
                    //
                    //                 // //Get Expense of existing company
                    //                 // const page = 1;
                    //                 // const includeArchived = true;
                    //                 // const createdByMyApp = false;
                    //                 // const unitdp = 4;
                    //                 // const summaryOnly = false;
                    //                 // const responseExp = await xero.accountingApi.getInvoices(tenant.tenantId, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                    //                 // console.log("Expense length on company add",responseExp.body.invoices.length);
                    //                 // // console.log(response.body || response.response.statusCode)
                    //                 // // let expenseArray = JSON.parse(response.body.invoices);
                    //                 // //
                    //                 //
                    //                 // // console.log("Expense",responseExp.body.invoices);
                    //                 // // this.stop();
                    //                 // for(const Expense of responseExp.body.invoices) {
                    //                 //     if(Expense.type === "ACCPAY") {
                    //                 //         const getExpenseCountResult = await checkTenantExpense(Expense.invoiceID, getCompanyByTenantResult[0].id);
                    //                 //         if (getExpenseCountResult[0].expense_count === 0) {
                    //                 //             console.log(Expense)
                    //                 //             // console.log("Company id",getCompanyByTenantResult)
                    //                 //             console.log()
                    //                 //             let vn = await getVendorByID(Expense.contact.contactID);
                    //                 //             console.log("vendor", vn[0].name);
                    //                 //             let gdpart = null;
                    //                 //             if(Expense.lineItems[0].tracking.length>0) {
                    //                 //                 gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                    //                 //                 console.log("GETED DEPART", gdpart);
                    //                 //                 console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                    //                 //             }
                    //                 //             // expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id
                    //                 //             const addExpenseResult = await addXeroExpense(Expense.invoiceID, Expense.date, Expense.updatedDateUTC, null, vn[0].name!==undefined?vn[0].name:null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, gdpart!==null?gdpart[0].depart_id:null, Expense.lineItems[0].unitAmount, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                    //                 //         }
                    //                 //         else {
                    //                 //             let vn = await getVendorByID(Expense.contact.contactID);
                    //                 //             console.log("vendor", vn[0].name);
                    //                 //             let gdpart = null;
                    //                 //             if(Expense.lineItems[0].tracking.length>0) {
                    //                 //                 gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                    //                 //                 console.log("GETED DEPART", gdpart);
                    //                 //                 console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                    //                 //             }
                    //                 //             const updateExpenseResult = await updateXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                    //                 //         }
                    //                 //     }
                    //                 //
                    //                 //     if(Expense.hasAttachments === true) {
                    //                 //         console.log("Line item", Expense.lineItems[0])
                    //                 //         console.log("aaa");
                    //                 //         try {
                    //                 //             const responseAttachment = await xero.accountingApi.getInvoiceAttachments(tenant.tenantId, Expense.invoiceID);
                    //                 //             console.log(responseAttachment.body.attachments[0]);
                    //                 //             let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[0].attachmentID,Expense.invoiceID);
                    //                 //             if(checkAttachableResult[0].attach_count === 0) {
                    //                 //                 // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                    //                 //                 let addAttachableResult = await addAttachable(Expense.invoiceID,  getCompanyByTenantResult[0].id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                    //                 //                 console.log("attachable inserted",Expense.invoiceID,  getCompanyByTenantResult[0].id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                    //                 //             }
                    //                 //             else {
                    //                 //                 let updateAttachableResult = await updateAttachable(Expense.invoiceID, getCompanyByTenantResult[0].id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                    //                 //             }
                    //                 //             console.log("aaa1");
                    //                 //             console.log("attachment:::",responseAttachment.body.attachments)
                    //                 //         }
                    //                 //         catch (e) {
                    //                 //             console.log("Error",e);
                    //                 //         }
                    //                 //     }
                    //                 // }
                    //
                    //
                    //
                    //                 // const order = 'Code ASC';
                    //
                    //                 const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId,  null, null);
                    //
                    //                 const updateCompanyCodeResult = await updateCompanyInfo(tenant.tenantId, currencyResponse.body.currencies[0].code,tenant.tenantName);
                    //             }
                    //             else {
                    //                 //Add new company
                    //
                    //                 //Create new company on add company after login
                    //                 // const order = 'Code ASC';
                    //
                    //                 const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId,  null, null);
                    //                 // console.log(currencyResponse.body.currencies[0].code);
                    //
                    //                 const createCompanyResultt = await createCompany(tenant.tenantId,tenant.tenantName,tenant.createdDateUtc, tenant.tenantType, null, currencyResponse.body.currencies[0].code,null,null,getUserByUserEmailResult.id);
                    //                 //Create role of user company
                    //                 const createUserRoleResult = await createUserRole(getUserByUserEmailResult.id, createCompanyResultt.insertId, null, 1, null);
                    //                 console.log("register company tenant",tenant.tenantId);
                    //                 console.log("created company id ",createCompanyResultt.insertId);
                    //
                    //                 //Get Account  on company add function
                    //                 const response = await xero.accountingApi.getAccounts(tenant.tenantId, null, null, order);
                    //                 // console.log(typeof response.body.accounts);
                    //                 let res = response.body.accounts;
                    //
                    //                 for (const Account of res) {
                    //                     // console.log("Company ID:",company.id, "Account ID: ", Account.accountID);
                    //                     //get company by tenant id
                    //                     const getCompanyByTenantResult = await getCompanyByTenant(tenant.tenantId)
                    //                     console.log("company by tenant length of tenant", tenant.tenantId , " : " ,getCompanyByTenantResult.length);
                    //                     const checkTenantAccountResult = await checkTenantAccount(Account.accountID,getCompanyByTenantResult[0].id);
                    //                     // console.log("count:",checkTenantAccountResult[0].account_count);
                    //                     console.log("account id:",Account.accountID,"company id:",getCompanyByTenantResult[0].id,"count:",checkTenantAccountResult[0].account_count);
                    //                     if(checkTenantAccountResult[0].account_count === 0) {
                    //                         console.log(getCompanyByTenantResult[0].id ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
                    //                         const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, createCompanyResultt.insertId, getUserByUserEmailResult.id,"xero");
                    //                     }
                    //                 }
                    //
                    //                 //Get Departments on company add function
                    //                 const orderDep = 'Name ASC';
                    //                 const includeArchivedDep = true;
                    //                 const responseDep = await xero.accountingApi.getTrackingCategories(tenant.tenantId,  null, orderDep, includeArchivedDep);
                    //                 console.log("result:::",responseDep.body.trackingCategories.length)
                    //                 if(responseDep.body.trackingCategories.length>0) {
                    //                     for(const Department of responseDep.body.trackingCategories[0].options) {
                    //                         const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID,getCompanyByTenantResult[0].id);
                    //                         if(checkTenantDepartmentResult[0].depart_count === 0) {
                    //                             console.log("Depart id",Department.trackingOptionID);
                    //                             console.log("Name",Department.name);
                    //                             console.log("Status",Department.status);
                    //                             console.log()
                    //                             const addDepartmentResult = addDepartment(Department.trackingOptionID, Department.name,null,Department.status==="ACTIVE"?1:0,createCompanyResultt.insertId, getUserByUserEmailResult.id,0);
                    //                         }
                    //                         else {
                    //                             console.log("depart found")
                    //                             const updateDepartmentResult = updateDepartment(Department.trackingOptionID, Department.name,null,Department.status==="ACTIVE"?1:0, createCompanyResultt.insertId,0);
                    //                         }
                    //                     }
                    //                 }
                    //
                    //                 const VifModifiedSince = null;
                    //                 const Vwhere = 'ContactStatus=="ACTIVE"';
                    //                 const Vorder = null;
                    //                 const ViDs = null;
                    //                 const Vpage = 1;
                    //                 const VincludeArchived = true;
                    //                 const VsummaryOnly = false;
                    //                 const VsearchTerm = null;
                    //
                    //                 // console.log("tokenSeT",xero.readTokenSet().expired());
                    //                 // if(xero.readTokenSet().expired() === false) {
                    //                 console.log("record[0].tenant_id",tenant.tenantId);
                    //                 const responseVendor = await xero.accountingApi.getContacts(tenant.tenantId, VifModifiedSince, Vwhere, Vorder, ViDs, Vpage, VincludeArchived, VsummaryOnly, VsearchTerm);
                    //                 if(responseVendor.body.contacts.length>0) {
                    //                     for(const Contact of responseVendor.body.contacts) {
                    //                         let vendor_id = Contact.contactID;
                    //                         let name = Contact.name;
                    //                         let acct_num = Contact.accountNumber!==undefined?Contact.accountNumber:null;
                    //                         let status = Contact.contactStatus==='ACTIVE'?1:0;
                    //                         let email = Contact.emailAddress;
                    //                         let address1 =  Contact.addresses[0].addressLine1!==undefined? Contact.addresses[0].addressLine1:"";
                    //                         let address2 =  Contact.addresses[0].addressLine2!==undefined? Contact.addresses[0].addressLine2:"";
                    //                         let address3 =  Contact.addresses[0].addressLine3!==undefined? Contact.addresses[0].addressLine3:"";
                    //                         let address4 =  Contact.addresses[0].addressLine4!==undefined? Contact.addresses[0].addressLine4:"";
                    //                         let address = address1 + address2 + address3 + address4;
                    //                         let city = Contact.addresses[0].city;
                    //                         let postalCode = Contact.addresses[0].postalCode;
                    //                         let country = Contact.addresses[0].country;
                    //                         let contact = Contact.phones[1].phoneCountryCode!==undefined? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneNumber:null;
                    //                         let mobile = Contact.phones[3].phoneCountryCode!==undefined? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneNumber:null;
                    //                         let website = Contact.website!==undefined?Contact.website:null;
                    //                         let balance = Contact.balances!==undefined?Contact.balances:null;
                    //                         let date = Contact.updatedDateUTC;
                    //                         console.log(vendor_id);
                    //                         console.log(name);
                    //                         console.log(status);
                    //                         console.log(acct_num);
                    //                         console.log(email);
                    //                         console.log(address!==""?address:null);
                    //                         console.log(contact);
                    //                         console.log(mobile);
                    //                         console.log(website);
                    //                         console.log(null);
                    //                         console.log(date);
                    //                         console.log("-----------")
                    //                         const checkTenantVendorResult = await checkTenantVendor(vendor_id,getCompanyByTenantResult[0].id);
                    //                         if(checkTenantVendorResult[0].vendor_count === 0) {
                    //                             // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                    //                             // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                    //                             // console.log("address",address);
                    //                             console.log(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, null, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                    //                             const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                    //                             console.log("added");
                    //                         }
                    //                         else {
                    //                             console.log("found ",vendor_id);
                    //                             const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                    //                             console.log("updated");
                    //                         }
                    //                         // console.log(Contact);
                    //                     }
                    //                 }
                    //                 // const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
                    //                 // }
                    //
                    //
                    //                 //Get Expense on company add function
                    //                 const page = 1;
                    //                 const includeArchived = true;
                    //                 const createdByMyApp = false;
                    //                 const unitdp = 4;
                    //                 const summaryOnly = false;
                    //
                    //                 const response1 = await xero.accountingApi.getInvoices(tenant.tenantId, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                    //                 console.log(response1.body.invoices);
                    //                 for(const Expense of response1.body.invoices) {
                    //                     if(Expense.type === "ACCPAY") {
                    //                         console.log(Expense)
                    //                         // console.log("Company id",getCompanyByTenantResult)
                    //                         console.log()
                    //                         const getExpenseCountResult = await checkTenantExpense(Expense.invoiceID, createCompanyResultt.insertId);
                    //                         console.log("checking expense for ",Expense.invoiceID,' and ', createCompanyResultt.insertId);
                    //                         if(getExpenseCountResult[0].expense_count === 0) {
                    //                             console.log("expense created ",Expense.invoiceID,' and ', createCompanyResultt.insertId);
                    //                             let vn = await getVendorByID(Expense.contact.contactID);
                    //                             console.log("vendor", vn[0].name);
                    //                             let gdpart = null;
                    //                             let is_paid = "false";
                    //                             let payment_ref_number = null;
                    //                             let paid_amount = null;
                    //                             let payment_date = null;
                    //                             if (Expense.payments.length>0) {
                    //                                 is_paid = "true";
                    //                                 payment_ref_number = Expense.payments[0].reference;
                    //                                 paid_amount = Expense.payments[0].amount;
                    //                                 payment_date = Expense.payments[0].date;
                    //
                    //                                 console.log("is_paid", is_paid);
                    //                                 console.log("payment_ref_number", payment_ref_number);
                    //                                 console.log("paid_amount", paid_amount);
                    //                                 console.log("payment_date", payment_date);
                    //                             }
                    //                             if(Expense.lineItems[0].tracking.length>0) {
                    //                                 gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                    //                                 console.log("GETED DEPART", gdpart);
                    //                                 console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                    //                             }
                    //                             const addExpenseResult = await addXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null,vn[0].vendor_id!==undefined?vn[0].vendor_id:null,vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date,createCompanyResultt.insertId, getUserByUserEmailResult.id);
                    //                         }
                    //                         else {
                    //                             console.log(" Update Expense already exist:",Expense.invoiceID);
                    //                             let vn = await getVendorByID(Expense.contact.contactID);
                    //                             console.log("vendor", vn[0].name);
                    //                             let gdpart = null;
                    //                             let is_paid = "false";
                    //                             let payment_ref_number = null;
                    //                             let paid_amount = null;
                    //                             let payment_date = null;
                    //                             if (Expense.payments.length>0) {
                    //                                 is_paid = "true";
                    //                                 payment_ref_number = Expense.payments[0].reference;
                    //                                 paid_amount = Expense.payments[0].amount;
                    //                                 payment_date = Expense.payments[0].date;
                    //
                    //                                 console.log("is_paid", is_paid);
                    //                                 console.log("payment_ref_number", payment_ref_number);
                    //                                 console.log("paid_amount", paid_amount);
                    //                                 console.log("payment_date", payment_date);
                    //                             }
                    //                             if(Expense.lineItems[0].tracking.length>0) {
                    //                                 gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                    //                                 console.log("GETED DEPART", gdpart);
                    //                                 console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                    //                             }
                    //                             const updateExpenseResult = await updateXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null,vn[0].vendor_id!==undefined?vn[0].vendor_id:null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date, createCompanyResultt.insertId, getUserByUserEmailResult.id)
                    //                         }
                    //                     }
                    //
                    //                     if(Expense.hasAttachments === true) {
                    //                         console.log("Line item", Expense.lineItems[0])
                    //                         console.log("aaa");
                    //                         try {
                    //                             const responseAttachment = await xero.accountingApi.getInvoiceAttachments(tenant.tenantId, Expense.invoiceID);
                    //                             console.log(responseAttachment.body.attachments[0]);
                    //                             let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[0].attachmentID,Expense.invoiceID);
                    //                             if(checkAttachableResult[0].attach_count === 0) {
                    //                                 // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                    //                                 let addAttachableResult = await addAttachable(Expense.invoiceID,  createCompanyResultt.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                    //                                 console.log("attachable inserted",Expense.invoiceID,  createCompanyResultt.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                    //                             }
                    //                             else {
                    //                                 let updateAttachableResult = await updateAttachable(Expense.invoiceID,  createCompanyResultt.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                    //                             }
                    //                             console.log("aaa1");
                    //                             console.log("attachment:::",responseAttachment.body.attachments)
                    //                         }
                    //                         catch (e) {
                    //                             console.log("Error",e);
                    //                         }
                    //                     }
                    //                 }
                    //
                    //
                    //             }
                    //         }
                    //         // const updateCompanyTokenResult = await updateCompanyToken(jwtTokenDecode.realmid, qb_access_token, qb_refresh_token, expire_at);
                    //
                    //         //disable all active company
                    //         const disableAllCompanyResult = await disableAllCompany(getUserByUserEmailResult.id);
                    //
                    //         const getCompanyByTenantResultt = await getCompanyByTenant(tenantArray[0].tenantId);
                    //
                    //         console.log("disable all company of",getUserByUserEmailResult.id);
                    //         console.log("company data",getCompanyByTenantResultt);
                    //         // console.log("active tenant",getCompanyByTenantResultt);
                    //
                    //         //enable first existing company
                    //         const activateCompanyResult = await activateCompany(getCompanyByTenantResultt[0].id);
                    //
                    //         // console.log("token",token);
                    //         res.redirect(`${process.env.APP_URL}auth_login/`+ encodeURIComponent(email)+`/xero/1/`+ token + `/sign_in`);
                    //     }
                    // }
                    // else {
                    //     //Email exist as quickbooks
                    //     res.redirect(`${process.env.APP_URL}login/error/qb`);
                    // }
                }
                else {
                    if (login_type === "connect") {
                        // for (const tenant of tenantArray) {
                        //     const checkUserCompanyResult = await checkUserCompanyByTenant(tenant.tenantId);
                        //     console.log("Tenant",tenant.tenantId,"Company count", checkUserCompanyResult[0].count_company)
                        //     if(checkUserCompanyResult[0].count_company === 0) {
                        let consentUrl = await xero.buildConsentUrl();
                        // console.log("eerror");
                        res.redirect(consentUrl);
                        //     }
                        //     // else {
                        //     //     res.redirect(`${process.env.APP_URL}login/info/404`);
                        //     // }
                        // }
                    } else {
                        if (tenantArray.length > 0) {
                            if (getuser[0].status === 1) {
                                console.log("User Email", email);
                                console.log("User xero_userid", xero_userid);
                                console.log("User first_name", first_name);
                                console.log("User last_name", last_name);
                                console.log("User name", name);
                                console.log("direct login");
                                const token = crypto.randomBytes(48).toString('hex');
                                const updateLoginTokenResult = await updateXeroLoginToken(email, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, 1);
                                const getUserByUserEmailResult = await getUserByUserEmail(email);

                                const getCompanyResult = await getCompany(getUserByUserEmailResult.id);
                                // console.log(getCompanyResult);
                                // for (const tenant of tenantArray) {
                                //     // const getCompanyByTenantResult = await getCompanyByTenant(jwtTokenDecode.realmid)
                                //     const getCompanyByTenantResult = await getCompanyByTenant(tenant.tenantId)
                                //     //Check weather company exist or not
                                //     if(getCompanyByTenantResult.length > 0) {
                                //         //Execute if company already exist by tenant id
                                //
                                //         //Get currency
                                //         await xero.setTokenSet(tokenSet);
                                //
                                //         // const xeroTenantId = 'YOUR_XERO_TENANT_ID';
                                //         // const where = 'Code=="USD"';
                                //
                                //
                                //
                                //         // //Get all account of existing company
                                //         // const response = await xero.accountingApi.getAccounts(tenant.tenantId, null, null, order);
                                //         // // console.log(typeof response.body.accounts);
                                //         // let res = response.body.accounts;
                                //         // for (const Account of res) {
                                //         //     // console.log("Company ID:",company.id, "Account ID: ", Account.accountID);
                                //         //     //get company by tenant id
                                //         //     console.log("company by tenant length of tenant", tenant.tenantId , " : " ,getCompanyByTenantResult.length);
                                //         //     const checkTenantAccountResult = await checkTenantAccount(Account.accountID,getCompanyByTenantResult[0].id);
                                //         //     // console.log("count:",checkTenantAccountResult[0].account_count);
                                //         //     console.log("account id:",Account.accountID,"company id:",getCompanyByTenantResult[0].id,"count:",checkTenantAccountResult[0].account_count);
                                //         //     if(checkTenantAccountResult[0].account_count === 0) {
                                //         //         console.log(getCompanyByTenantResult[0].id ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
                                //         //         const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,"xero");
                                //         //     }
                                //         // }
                                //
                                //
                                //
                                //         // const VifModifiedSince = null;
                                //         // const Vwhere = 'ContactStatus=="ACTIVE"';
                                //         // const Vorder = null;
                                //         // const ViDs = null;
                                //         // const Vpage = 1;
                                //         // const VincludeArchived = true;
                                //         // const VsummaryOnly = false;
                                //         // const VsearchTerm = null;
                                //         //
                                //         // // console.log("tokenSeT",xero.readTokenSet().expired());
                                //         // // if(xero.readTokenSet().expired() === false) {
                                //         // console.log("record[0].tenant_id",tenant.tenantId);
                                //         // const responseVendor = await xero.accountingApi.getContacts(tenant.tenantId, VifModifiedSince, Vwhere, Vorder, ViDs, Vpage, VincludeArchived, VsummaryOnly, VsearchTerm);
                                //         // if(responseVendor.body.contacts.length>0) {
                                //         //     for(const Contact of responseVendor.body.contacts) {
                                //         //         let vendor_id = Contact.contactID;
                                //         //         let name = Contact.name;
                                //         //         let acct_num = Contact.accountNumber!==undefined?Contact.accountNumber:null;
                                //         //         let status = Contact.contactStatus==='ACTIVE'?1:0;
                                //         //         let email = Contact.emailAddress;
                                //         //         let address1 =  Contact.addresses[0].addressLine1!==undefined? Contact.addresses[0].addressLine1:"";
                                //         //         let address2 =  Contact.addresses[0].addressLine2!==undefined? Contact.addresses[0].addressLine2:"";
                                //         //         let address3 =  Contact.addresses[0].addressLine3!==undefined? Contact.addresses[0].addressLine3:"";
                                //         //         let address4 =  Contact.addresses[0].addressLine4!==undefined? Contact.addresses[0].addressLine4:"";
                                //         //         let address = address1 + address2 + address3 + address4;
                                //         //         let city = Contact.addresses[0].city;
                                //         //         let postalCode = Contact.addresses[0].postalCode;
                                //         //         let country = Contact.addresses[0].country;
                                //         //         let contact = Contact.phones[1].phoneCountryCode!==undefined? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneNumber:null;
                                //         //         let mobile = Contact.phones[3].phoneCountryCode!==undefined? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneNumber:null;
                                //         //         let website = Contact.website!==undefined?Contact.website:null;
                                //         //         let balance = Contact.balances!==undefined?Contact.balances:null;
                                //         //         let date = Contact.updatedDateUTC;
                                //         //         console.log(vendor_id);
                                //         //         console.log(name);
                                //         //         console.log(status);
                                //         //         console.log(acct_num);
                                //         //         console.log(email);
                                //         //         console.log(address!==""?address:null);
                                //         //         console.log(contact);
                                //         //         console.log(mobile);
                                //         //         console.log(website);
                                //         //         console.log(null);
                                //         //         console.log(date);
                                //         //         console.log("-----------")
                                //         //         const checkTenantVendorResult = await checkTenantVendor(vendor_id,getCompanyByTenantResult[0].id);
                                //         //         if(checkTenantVendorResult[0].vendor_count === 0) {
                                //         //             // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                                //         //             // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                                //         //             // console.log("address",address);
                                //         //             console.log(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, null, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                                //         //             const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                                //         //             console.log("added");
                                //         //         }
                                //         //         else {
                                //         //             console.log("found ",vendor_id);
                                //         //             const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                                //         //             console.log("updated");
                                //         //         }
                                //         //         // console.log(Contact);
                                //         //     }
                                //         // }
                                //         // // const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
                                //         // // }
                                //
                                //
                                //         // //Get Departments of existing company
                                //         // const orderDep = 'Name ASC';
                                //         // const includeArchivedDep = true;
                                //         // const responseDep = await xero.accountingApi.getTrackingCategories(tenant.tenantId,  null, orderDep, includeArchivedDep);
                                //         // console.log("result:::",responseDep.body.trackingCategories.length)
                                //         // if(responseDep.body.trackingCategories.length>0) {
                                //         //     for(let i=0;i<responseDep.body.trackingCategories.length;i++) {
                                //         //         for(const Department of responseDep.body.trackingCategories[i].options) {
                                //         //             const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID,getCompanyByTenantResult[0].id);
                                //         //             if(checkTenantDepartmentResult[0].depart_count === 0) {
                                //         //                 console.log("Depart id",Department.trackingOptionID);
                                //         //                 console.log("Name",Department.name);
                                //         //                 console.log("Status",Department.status);
                                //         //                 console.log()
                                //         //                 const addDepartmentResult = addDepartment(Department.trackingOptionID, responseDep.body.trackingCategories[i].trackingCategoryID, Department.name,null,Department.status==="ACTIVE"?1:0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,0);
                                //         //             }
                                //         //             else {
                                //         //                 console.log("depart found")
                                //         //                 const updateDepartmentResult = updateDepartment(Department.trackingOptionID, responseDep.body.trackingCategories[i].trackingCategoryID, Department.name,null,Department.status==="ACTIVE"?1:0, getCompanyByTenantResult[0].id,0);
                                //         //             }
                                //         //         }
                                //         //     }
                                //         //
                                //         // }
                                //
                                //
                                //         // //Get Expense of existing company
                                //         // const page = 1;
                                //         // const includeArchived = true;
                                //         // const createdByMyApp = false;
                                //         // const unitdp = 4;
                                //         // const summaryOnly = false;
                                //         // const responseExp = await xero.accountingApi.getInvoices(tenant.tenantId, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                                //         // console.log("Expense length on company add",responseExp.body.invoices.length);
                                //         // // console.log(response.body || response.response.statusCode)
                                //         // // let expenseArray = JSON.parse(response.body.invoices);
                                //         // //
                                //         //
                                //         // // console.log("Expense",responseExp.body.invoices);
                                //         // // this.stop();
                                //         // for(const Expense of responseExp.body.invoices) {
                                //         //     if(Expense.type === "ACCPAY") {
                                //         //         const getExpenseCountResult = await checkTenantExpense(Expense.invoiceID, getCompanyByTenantResult[0].id);
                                //         //         if (getExpenseCountResult[0].expense_count === 0) {
                                //         //             console.log(Expense)
                                //         //             // console.log("Company id",getCompanyByTenantResult)
                                //         //             console.log()
                                //         //             let vn = await getVendorByID(Expense.contact.contactID);
                                //         //             console.log("vendor", vn[0].name);
                                //         //             let gdpart = null;
                                //         //             if(Expense.lineItems[0].tracking.length>0) {
                                //         //                 gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                //         //                 console.log("GETED DEPART", gdpart);
                                //         //                 console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                                //         //             }
                                //         //             // expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id
                                //         //             const addExpenseResult = await addXeroExpense(Expense.invoiceID, Expense.date, Expense.updatedDateUTC, null, vn[0].name!==undefined?vn[0].name:null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, gdpart!==null?gdpart[0].depart_id:null, Expense.lineItems[0].unitAmount, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                //         //         }
                                //         //         else {
                                //         //             let vn = await getVendorByID(Expense.contact.contactID);
                                //         //             console.log("vendor", vn[0].name);
                                //         //             let gdpart = null;
                                //         //             if(Expense.lineItems[0].tracking.length>0) {
                                //         //                 gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                //         //                 console.log("GETED DEPART", gdpart);
                                //         //                 console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                                //         //             }
                                //         //             const updateExpenseResult = await updateXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                //         //         }
                                //         //     }
                                //         //
                                //         //     if(Expense.hasAttachments === true) {
                                //         //         console.log("Line item", Expense.lineItems[0])
                                //         //         console.log("aaa");
                                //         //         try {
                                //         //             const responseAttachment = await xero.accountingApi.getInvoiceAttachments(tenant.tenantId, Expense.invoiceID);
                                //         //             console.log(responseAttachment.body.attachments[0]);
                                //         //             let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[0].attachmentID,Expense.invoiceID);
                                //         //             if(checkAttachableResult[0].attach_count === 0) {
                                //         //                 // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                //         //                 let addAttachableResult = await addAttachable(Expense.invoiceID,  getCompanyByTenantResult[0].id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                //         //                 console.log("attachable inserted",Expense.invoiceID,  getCompanyByTenantResult[0].id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                //         //             }
                                //         //             else {
                                //         //                 let updateAttachableResult = await updateAttachable(Expense.invoiceID, getCompanyByTenantResult[0].id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                //         //             }
                                //         //             console.log("aaa1");
                                //         //             console.log("attachment:::",responseAttachment.body.attachments)
                                //         //         }
                                //         //         catch (e) {
                                //         //             console.log("Error",e);
                                //         //         }
                                //         //     }
                                //         // }
                                //
                                //
                                //
                                //         // const order = 'Code ASC';
                                //
                                //         const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId,  null, null);
                                //
                                //         const updateCompanyCodeResult = await updateCompanyInfo(tenant.tenantId, currencyResponse.body.currencies[0].code,tenant.tenantName);
                                //     }
                                //     else {
                                //         //Add new company
                                //
                                //         //Create new company on add company after login
                                //         // const order = 'Code ASC';
                                //
                                //         const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId,  null, null);
                                //         // console.log(currencyResponse.body.currencies[0].code);
                                //
                                //         const createCompanyResultt = await createCompany(tenant.tenantId,tenant.tenantName,tenant.createdDateUtc, tenant.tenantType, null, currencyResponse.body.currencies[0].code,null,null,getUserByUserEmailResult.id);
                                //         //Create role of user company
                                //         const createUserRoleResult = await createUserRole(getUserByUserEmailResult.id, createCompanyResultt.insertId, null, 1, null);
                                //         console.log("register company tenant",tenant.tenantId);
                                //         console.log("created company id ",createCompanyResultt.insertId);
                                //
                                //         //Get Account  on company add function
                                //         const response = await xero.accountingApi.getAccounts(tenant.tenantId, null, null, order);
                                //         // console.log(typeof response.body.accounts);
                                //         let res = response.body.accounts;
                                //
                                //         for (const Account of res) {
                                //             // console.log("Company ID:",company.id, "Account ID: ", Account.accountID);
                                //             //get company by tenant id
                                //             const getCompanyByTenantResult = await getCompanyByTenant(tenant.tenantId)
                                //             console.log("company by tenant length of tenant", tenant.tenantId , " : " ,getCompanyByTenantResult.length);
                                //             const checkTenantAccountResult = await checkTenantAccount(Account.accountID,getCompanyByTenantResult[0].id);
                                //             // console.log("count:",checkTenantAccountResult[0].account_count);
                                //             console.log("account id:",Account.accountID,"company id:",getCompanyByTenantResult[0].id,"count:",checkTenantAccountResult[0].account_count);
                                //             if(checkTenantAccountResult[0].account_count === 0) {
                                //                 console.log(getCompanyByTenantResult[0].id ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
                                //                 const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, createCompanyResultt.insertId, getUserByUserEmailResult.id,"xero");
                                //             }
                                //         }
                                //
                                //         //Get Departments on company add function
                                //         const orderDep = 'Name ASC';
                                //         const includeArchivedDep = true;
                                //         const responseDep = await xero.accountingApi.getTrackingCategories(tenant.tenantId,  null, orderDep, includeArchivedDep);
                                //         console.log("result:::",responseDep.body.trackingCategories.length)
                                //         if(responseDep.body.trackingCategories.length>0) {
                                //             for(const Department of responseDep.body.trackingCategories[0].options) {
                                //                 const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID,getCompanyByTenantResult[0].id);
                                //                 if(checkTenantDepartmentResult[0].depart_count === 0) {
                                //                     console.log("Depart id",Department.trackingOptionID);
                                //                     console.log("Name",Department.name);
                                //                     console.log("Status",Department.status);
                                //                     console.log()
                                //                     const addDepartmentResult = addDepartment(Department.trackingOptionID, Department.name,null,Department.status==="ACTIVE"?1:0,createCompanyResultt.insertId, getUserByUserEmailResult.id,0);
                                //                 }
                                //                 else {
                                //                     console.log("depart found")
                                //                     const updateDepartmentResult = updateDepartment(Department.trackingOptionID, Department.name,null,Department.status==="ACTIVE"?1:0, createCompanyResultt.insertId,0);
                                //                 }
                                //             }
                                //         }
                                //
                                //         const VifModifiedSince = null;
                                //         const Vwhere = 'ContactStatus=="ACTIVE"';
                                //         const Vorder = null;
                                //         const ViDs = null;
                                //         const Vpage = 1;
                                //         const VincludeArchived = true;
                                //         const VsummaryOnly = false;
                                //         const VsearchTerm = null;
                                //
                                //         // console.log("tokenSeT",xero.readTokenSet().expired());
                                //         // if(xero.readTokenSet().expired() === false) {
                                //         console.log("record[0].tenant_id",tenant.tenantId);
                                //         const responseVendor = await xero.accountingApi.getContacts(tenant.tenantId, VifModifiedSince, Vwhere, Vorder, ViDs, Vpage, VincludeArchived, VsummaryOnly, VsearchTerm);
                                //         if(responseVendor.body.contacts.length>0) {
                                //             for(const Contact of responseVendor.body.contacts) {
                                //                 let vendor_id = Contact.contactID;
                                //                 let name = Contact.name;
                                //                 let acct_num = Contact.accountNumber!==undefined?Contact.accountNumber:null;
                                //                 let status = Contact.contactStatus==='ACTIVE'?1:0;
                                //                 let email = Contact.emailAddress;
                                //                 let address1 =  Contact.addresses[0].addressLine1!==undefined? Contact.addresses[0].addressLine1:"";
                                //                 let address2 =  Contact.addresses[0].addressLine2!==undefined? Contact.addresses[0].addressLine2:"";
                                //                 let address3 =  Contact.addresses[0].addressLine3!==undefined? Contact.addresses[0].addressLine3:"";
                                //                 let address4 =  Contact.addresses[0].addressLine4!==undefined? Contact.addresses[0].addressLine4:"";
                                //                 let address = address1 + address2 + address3 + address4;
                                //                 let city = Contact.addresses[0].city;
                                //                 let postalCode = Contact.addresses[0].postalCode;
                                //                 let country = Contact.addresses[0].country;
                                //                 let contact = Contact.phones[1].phoneCountryCode!==undefined? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneNumber:null;
                                //                 let mobile = Contact.phones[3].phoneCountryCode!==undefined? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneNumber:null;
                                //                 let website = Contact.website!==undefined?Contact.website:null;
                                //                 let balance = Contact.balances!==undefined?Contact.balances:null;
                                //                 let date = Contact.updatedDateUTC;
                                //                 console.log(vendor_id);
                                //                 console.log(name);
                                //                 console.log(status);
                                //                 console.log(acct_num);
                                //                 console.log(email);
                                //                 console.log(address!==""?address:null);
                                //                 console.log(contact);
                                //                 console.log(mobile);
                                //                 console.log(website);
                                //                 console.log(null);
                                //                 console.log(date);
                                //                 console.log("-----------")
                                //                 const checkTenantVendorResult = await checkTenantVendor(vendor_id,getCompanyByTenantResult[0].id);
                                //                 if(checkTenantVendorResult[0].vendor_count === 0) {
                                //                     // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                                //                     // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                                //                     // console.log("address",address);
                                //                     console.log(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, null, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                                //                     const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                                //                     console.log("added");
                                //                 }
                                //                 else {
                                //                     console.log("found ",vendor_id);
                                //                     const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                                //                     console.log("updated");
                                //                 }
                                //                 // console.log(Contact);
                                //             }
                                //         }
                                //         // const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
                                //         // }
                                //
                                //
                                //         //Get Expense on company add function
                                //         const page = 1;
                                //         const includeArchived = true;
                                //         const createdByMyApp = false;
                                //         const unitdp = 4;
                                //         const summaryOnly = false;
                                //
                                //         const response1 = await xero.accountingApi.getInvoices(tenant.tenantId, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                                //         console.log(response1.body.invoices);
                                //         for(const Expense of response1.body.invoices) {
                                //             if(Expense.type === "ACCPAY") {
                                //                 console.log(Expense)
                                //                 // console.log("Company id",getCompanyByTenantResult)
                                //                 console.log()
                                //                 const getExpenseCountResult = await checkTenantExpense(Expense.invoiceID, createCompanyResultt.insertId);
                                //                 console.log("checking expense for ",Expense.invoiceID,' and ', createCompanyResultt.insertId);
                                //                 if(getExpenseCountResult[0].expense_count === 0) {
                                //                     console.log("expense created ",Expense.invoiceID,' and ', createCompanyResultt.insertId);
                                //                     let vn = await getVendorByID(Expense.contact.contactID);
                                //                     console.log("vendor", vn[0].name);
                                //                     let gdpart = null;
                                //                     let is_paid = "false";
                                //                     let payment_ref_number = null;
                                //                     let paid_amount = null;
                                //                     let payment_date = null;
                                //                     if (Expense.payments.length>0) {
                                //                         is_paid = "true";
                                //                         payment_ref_number = Expense.payments[0].reference;
                                //                         paid_amount = Expense.payments[0].amount;
                                //                         payment_date = Expense.payments[0].date;
                                //
                                //                         console.log("is_paid", is_paid);
                                //                         console.log("payment_ref_number", payment_ref_number);
                                //                         console.log("paid_amount", paid_amount);
                                //                         console.log("payment_date", payment_date);
                                //                     }
                                //                     if(Expense.lineItems[0].tracking.length>0) {
                                //                         gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                //                         console.log("GETED DEPART", gdpart);
                                //                         console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                                //                     }
                                //                     const addExpenseResult = await addXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null,vn[0].vendor_id!==undefined?vn[0].vendor_id:null,vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date,createCompanyResultt.insertId, getUserByUserEmailResult.id);
                                //                 }
                                //                 else {
                                //                     console.log(" Update Expense already exist:",Expense.invoiceID);
                                //                     let vn = await getVendorByID(Expense.contact.contactID);
                                //                     console.log("vendor", vn[0].name);
                                //                     let gdpart = null;
                                //                     let is_paid = "false";
                                //                     let payment_ref_number = null;
                                //                     let paid_amount = null;
                                //                     let payment_date = null;
                                //                     if (Expense.payments.length>0) {
                                //                         is_paid = "true";
                                //                         payment_ref_number = Expense.payments[0].reference;
                                //                         paid_amount = Expense.payments[0].amount;
                                //                         payment_date = Expense.payments[0].date;
                                //
                                //                         console.log("is_paid", is_paid);
                                //                         console.log("payment_ref_number", payment_ref_number);
                                //                         console.log("paid_amount", paid_amount);
                                //                         console.log("payment_date", payment_date);
                                //                     }
                                //                     if(Expense.lineItems[0].tracking.length>0) {
                                //                         gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                //                         console.log("GETED DEPART", gdpart);
                                //                         console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                                //                     }
                                //                     const updateExpenseResult = await updateXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null,vn[0].vendor_id!==undefined?vn[0].vendor_id:null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date, createCompanyResultt.insertId, getUserByUserEmailResult.id)
                                //                 }
                                //             }
                                //
                                //             if(Expense.hasAttachments === true) {
                                //                 console.log("Line item", Expense.lineItems[0])
                                //                 console.log("aaa");
                                //                 try {
                                //                     const responseAttachment = await xero.accountingApi.getInvoiceAttachments(tenant.tenantId, Expense.invoiceID);
                                //                     console.log(responseAttachment.body.attachments[0]);
                                //                     let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[0].attachmentID,Expense.invoiceID);
                                //                     if(checkAttachableResult[0].attach_count === 0) {
                                //                         // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                //                         let addAttachableResult = await addAttachable(Expense.invoiceID,  createCompanyResultt.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                //                         console.log("attachable inserted",Expense.invoiceID,  createCompanyResultt.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                //                     }
                                //                     else {
                                //                         let updateAttachableResult = await updateAttachable(Expense.invoiceID,  createCompanyResultt.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                //                     }
                                //                     console.log("aaa1");
                                //                     console.log("attachment:::",responseAttachment.body.attachments)
                                //                 }
                                //                 catch (e) {
                                //                     console.log("Error",e);
                                //                 }
                                //             }
                                //         }
                                //
                                //
                                //     }
                                // }
                                // const updateCompanyTokenResult = await updateCompanyToken(jwtTokenDecode.realmid, qb_access_token, qb_refresh_token, expire_at);


                                console.log("check tnt ", tenantArray);
                                if (tenantArray.length > 0) {
                                    //disable all active company
                                    const disableAllCompanyResult = await disableAllCompany(getUserByUserEmailResult.id);
                                    const getCompanyByTenantResultt = await getCompanyByTenant(tenantArray[0].tenantId);
                                    const updateConnectionIDResult = await updateConnectionID(getCompanyByTenantResultt[0].id, tenantArray[0].id)
                                    console.log("disable all company of", getUserByUserEmailResult.id);
                                    console.log("company data", getCompanyByTenantResultt);
                                    // console.log("active tenant",getCompanyByTenantResultt);

                                    //enable first existing company
                                    const activateCompanyResult = await activateCompany(getCompanyByTenantResultt[0].id);
                                    // console.log("token",token);
                                    res.redirect(`${process.env.APP_URL}auth_login/` + encodeURIComponent(email) + `/xero/1/` + token + `/sign_in`);
                                } else {
                                    // console.log("else disable all")
                                    // const disableAllCompanyResult = await disableAllCompany(getUserByUserEmailResult.id);
                                    // console.log("getCompanyResult[0].id",getCompanyResult[0].id)
                                    // const activateCompanyResult = await activateCompany(getCompanyResult[0].id);

                                    res.redirect(`${process.env.APP_URL}account/disconnected`);

                                    // let consentUrl = await xero.buildConsentUrl();
                                    // // console.log("eerror");
                                    // res.redirect(consentUrl);
                                }
                            }
                            else {
                                res.redirect(`${process.env.APP_URL}login/error/company_disconnected`);
                            }
                        }
                        else {
                                res.redirect(`${process.env.APP_URL}login/error/no_tenant`);
                        }
                    }
                }
        } catch (err) {
            console.log(err);
            res.redirect(`${process.env.APP_URL}login`);
        }
    },
    xero_callback_sign_up: async (req, res) => {
        try {
            // if (checkUserEmailResult[0].count_user === 0) {
            //Sign up Execution
            const tokenSet = await xero.apiCallback(req.url);
            tokenset = tokenSet;
            console.log("tokenSet", tokenSet)
            let array = JSON.parse(JSON.stringify(tokenSet));
            xero_access_token = array.access_token;
            xero_refresh_token = array.refresh_token;
            xero_id_token = array.id_token;
            xero_expire_at = array.expires_at;
            // console.log(xero_access_token);

            TS = new TokenSet({
                id_token: xero_id_token,
                access_token: xero_access_token,
                refresh_token: xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            await xero.setTokenSet(TS);

            // console.log("Token set data: ", xero.readTokenSet());
            const jwtTokenDecode = jwt.decode(xero_id_token);
            const activeTenant = await xero_get_tenant(xero_access_token);

            // await xero_get_tenant(xero_access_token);

            let email = jwtTokenDecode.email;
            let xero_userid = jwtTokenDecode.xero_userid;
            let first_name = jwtTokenDecode.given_name;
            let last_name = jwtTokenDecode.family_name;
            let name = jwtTokenDecode.name;
            const checkUserEmailResult = await checkUserEmail(email);
            const getUserData = await getUserByEmail(email);
            //Create Xero user in users table
            const token = crypto.randomBytes(48).toString('hex');
            console.log("getUserData[0].status",getUserData);
            if(login_type === "sign_up" && getUserData && getUserData[0].status === 1) {
                console.log("getUserData exist")
                const updateLoginTokenResult = await updateXeroLoginToken(email, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, 1);
                return res.redirect(`${process.env.APP_URL}auth_login/` + encodeURIComponent(email) + `/xero/1/` + token + `/sign_in`);
            }

            let company_id = null;
            let user_id;

            let tenantArray = JSON.parse(activeTenant);

            // console.log("checkUserEmailResult[0].count_user",checkUserEmailResult[0].count_user);
            // this.exit();
            // || checkUserCompanyResult[0].count_company === 0
            if (checkUserEmailResult[0].count_user === 0) {
                const createUsersResult = await xeroSignUp(first_name, last_name, email, xero_userid, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token);
                user_id = createUsersResult.insertId;
            } else {
                const updateLoginTokenResult = await updateXeroLoginToken(email, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, 1);
                const getUserByEmailResult = await getUserByEmail(email);
                user_id = getUserByEmailResult[0].id;
            }

            if (tenantArray.length > 0) {
                //get all tenants from api callback
                for (const tenant of tenantArray) {
                    console.log(tenant.tenantId);
                    console.log(tenant.tenantName);
                    console.log(tenant.tenantType);
                    console.log(tenant.createdDateUtc);
                    // const orderc = 'Code ASC';
                    const checkUserCompanyResult = await checkUserCompanyByTenant(tenant.tenantId);
                    if (checkUserCompanyResult[0].count_company === 0) {
                        const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId, null, null);
                        const createCompanyResult = await createCompany(tenant.id, tenant.tenantId, tenant.tenantName, tenant.createdDateUtc, tenant.tenantType, null, currencyResponse.body.currencies[0].code, null, null, user_id);
                        // const updateUserCompanyResult = await updateUserCompanyResult(createCompanyResult.insertId,user_id);
                        const createUserRoleResult = await createUserRole(user_id, createCompanyResult.insertId, null, 1, null);
                        company_id = createCompanyResult.insertId;
                    } else {
                        const getCompanyByTenantResult = await getCompanyByTenant(tenant.tenantId);
                        company_id = getCompanyByTenantResult[0].id;
                    }

                    //Get Accounts
                    // try {
                    //getting all account by tenant id
                    const Aorder = 'Name ASC';
                    const responseAccount = await xero.accountingApi.getAccounts(tenant.tenantId, null, null, Aorder);
                    // console.log(typeof response.body.accounts);
                    let res = responseAccount.body.accounts;
                    for (const Account of res) {
                        console.log("Company ID:", company_id, "Account ID: ", Account.accountID);

                        //Check if tenant account already exist
                        const checkTenantAccountResult = await checkTenantAccount(Account.accountID, company_id);
                        console.log("count:", checkTenantAccountResult[0].account_count);
                        if (checkTenantAccountResult[0].account_count === 0) {
                            console.log("Creating account", Account.code, Account.accountID, Account.name, Account.type, Account.status == "ACTIVE" ? 1 : 0, Account.description, Account.currencyCode == undefined ? null : Account.currencyCode, Account.updatedDateUTC, company_id, user_id, "xero");
                            const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status == "ACTIVE" ? 1 : 0, Account.description, Account.currencyCode == undefined ? null : Account.currencyCode, Account.updatedDateUTC, company_id, user_id, "xero");
                            console.log("Account Created", createTenantAccountResult.insertId);
                        } else {
                            const updateTenantAccountResult = await updateTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status == "ACTIVE" ? 1 : 0, Account.description, Account.currencyCode == undefined ? null : Account.currencyCode, Account.updatedDateUTC, company_id, user_id);
                            console.log("FOUND:", company_id, Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode == undefined ? null : Account.currencyCode, Account.updatedDateUTC);
                        }
                        // //Check if tenant account already exist
                        // const checkTenantAccountResult = await checkTenantAccount(Account.accountID,company_id);
                        // console.log("count:",checkTenantAccountResult[0].account_count);
                        // if(checkTenantAccountResult[0].account_count === 0) {
                        //     console.log(createCompanyResult.insertId ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
                        //     const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, company_id, user_id,"xero");
                        // }
                        // else {
                        //     const updateTenantAccountResult = await updateTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, company_id, user_id);
                        // }
                    }
                    // } catch (err) {
                    //     const error = JSON.stringify(err.response, null, 2)
                    //     console.log(`Status Code: ${err.response} => ${error}`);
                    // }

                    //Get Vendor

                    const VifModifiedSince = null;
                    const Vwhere = 'ContactStatus=="ACTIVE"';
                    const Vorder = null;
                    const ViDs = null;
                    const Vpage = 1;
                    const VincludeArchived = true;
                    const VsummaryOnly = false;
                    const VsearchTerm = null;

                    // console.log("tokenSeT",xero.readTokenSet().expired());
                    // if(xero.readTokenSet().expired() === false) {
                    console.log("record[0].tenant_id", tenant.tenantId);
                    const responseVendor = await xero.accountingApi.getContacts(tenant.tenantId, VifModifiedSince, Vwhere, Vorder, ViDs, Vpage, VincludeArchived, VsummaryOnly, VsearchTerm);
                    if (responseVendor.body.contacts.length > 0) {
                        for (const Contact of responseVendor.body.contacts) {
                            let vendor_id = Contact.contactID;
                            let name = Contact.name;
                            let acct_num = Contact.accountNumber !== undefined ? Contact.accountNumber : null;
                            let status = Contact.contactStatus === 'ACTIVE' ? 1 : 0;
                            let email = Contact.emailAddress;
                            let address1 = Contact.addresses[0].addressLine1 !== undefined ? Contact.addresses[0].addressLine1 : "";
                            let address2 = Contact.addresses[0].addressLine2 !== undefined ? Contact.addresses[0].addressLine2 : "";
                            let address3 = Contact.addresses[0].addressLine3 !== undefined ? Contact.addresses[0].addressLine3 : "";
                            let address4 = Contact.addresses[0].addressLine4 !== undefined ? Contact.addresses[0].addressLine4 : "";
                            let address = address1 + address2 + address3 + address4;
                            let city = Contact.addresses[0].city;
                            let postalCode = Contact.addresses[0].postalCode;
                            let region = Contact.addresses[0].region;
                            let country = Contact.addresses[0].country;
                            let contact = Contact.phones[1].phoneCountryCode !== undefined ? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneAreaCode + Contact.phones[1].phoneNumber : null;
                            let mobile = Contact.phones[3].phoneCountryCode !== undefined ? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneAreaCode + Contact.phones[3].phoneNumber : null;
                            let website = Contact.website !== undefined ? Contact.website : null;
                            let balance = Contact.balances !== undefined ? Contact.balances : null;
                            let date = Contact.updatedDateUTC;
                            console.log(vendor_id);
                            console.log(name);
                            console.log(status);
                            console.log(acct_num);
                            console.log(email);
                            console.log(address !== "" ? address : null);
                            console.log(contact);
                            console.log(mobile);
                            console.log(website);
                            console.log(null);
                            console.log(date);
                            console.log("-----------")
                            const checkTenantVendorResult = await checkTenantVendor(vendor_id, company_id);
                            if (checkTenantVendorResult[0].vendor_count === 0) {
                                // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                                // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                                // console.log("address",address);
                                console.log(vendor_id, name, contact, mobile, email, website, address !== "" ? address : null, city !== undefined ? city : null, postalCode != undefined ? postalCode : null, null, acct_num, null, status, 'xero', 'USD', user_id, date, date);
                                const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address !== "" ? address : null, city !== undefined ? city : null, region != undefined ? region : null, country != undefined ? country : null, postalCode != undefined ? postalCode : null, 0, acct_num, 'USD', status, 'xero', company_id, user_id, date, date);
                                console.log("added");
                            } else {
                                console.log("found ", vendor_id);
                                const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address !== "" ? address : null, city !== undefined ? city : null, region != undefined ? region : null, country != undefined ? country : null, postalCode != undefined ? postalCode : null, 0, acct_num, 'USD', status, 'xero', company_id, user_id, date, date);
                                console.log("updated");
                            }
                            // console.log(Contact);
                        }
                    }

                    await storeActivity("Suppliers Synced", "-", "Supplier", company_id, user_id);
                    // const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
                    // }

                    //Get Departments
                    const orderDep = 'Name ASC';
                    const includeArchivedDep = true;
                    const responseDep = await xero.accountingApi.getTrackingCategories(tenant.tenantId, null, orderDep, includeArchivedDep);
                    console.log("result:::", responseDep.body.trackingCategories.length)
                    if (responseDep.body.trackingCategories.length > 0) {
                        for (let i = 0; i < responseDep.body.trackingCategories.length; i++) {
                            for (const Department of responseDep.body.trackingCategories[i].options) {
                                const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID, company_id);
                                if (checkTenantDepartmentResult[0].depart_count === 0) {
                                    console.log("Depart id", Department.trackingOptionID);
                                    console.log("Name", Department.name);
                                    console.log("Status", Department.status);
                                    console.log()
                                    const addDepartmentResult = addDepartment(Department.trackingOptionID, responseDep.body.trackingCategories[i].trackingCategoryID, Department.name, null, Department.status === "ACTIVE" ? 1 : 0, company_id, user_id, 0);
                                } else {
                                    console.log("depart found")
                                    const updateDepartmentResult = updateDepartment(Department.trackingOptionID, responseDep.body.trackingCategories[i].trackingCategoryID, Department.name, null, Department.status === "ACTIVE" ? 1 : 0, company_id, 0);
                                }
                            }
                        }

                    }

                    await storeActivity("Categories Synced", "-", "Category", company_id, user_id);

                    //Get Expense
                    const page = 1;
                    const includeArchived = true;
                    const createdByMyApp = false;
                    const unitdp = 4;
                    const summaryOnly = false;
                    const response = await xero.accountingApi.getInvoices(tenant.tenantId, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                    console.log(response.body.invoices.length);
                    // console.log(response.body || response.response.statusCode)
                    // let expenseArray = JSON.parse(response.body.invoices);
                    //
                    for (const Expense of response.body.invoices) {
                        // if(Expense.type === "ACCPAY") {
                        //     const getExpenseCountResult = await checkTenantExpense(Expense.invoiceID, company_id);
                        //     if (getExpenseCountResult[0].expense_count === 0) {
                        //         console.log(Expense)
                        //         // console.log("Company id",getCompanyByTenantResult)
                        //         console.log()
                        //         let vn = await getVendorByID(Expense.contact.contactID);
                        //         console.log("vendor", vn[0].name);
                        //         let gdpart = null;
                        //         let is_paid = "false";
                        //         let payment_ref_number = null;
                        //         let paid_amount = null;
                        //         let payment_date = null;
                        //         if (Expense.payments.length>0) {
                        //             is_paid = "true";
                        //             payment_ref_number = Expense.payments[0].reference;
                        //             paid_amount = Expense.payments[0].amount;
                        //             payment_date = Expense.payments[0].date;
                        //
                        //             console.log("is_paid", is_paid);
                        //             console.log("payment_ref_number", payment_ref_number);
                        //             console.log("paid_amount", paid_amount);
                        //             console.log("payment_date", payment_date);
                        //         }
                        //         if(Expense.lineItems[0].tracking.length>0) {
                        //             gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                        //             console.log("GETED DEPART", gdpart);
                        //             console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                        //         }
                        //         const addExpenseResult = await addXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null,vn[0].vendor_id!==undefined?vn[0].vendor_id:null,vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                        //         // const addExpenseResult = await addXeroExpense(Expense.invoiceID, Expense.date, Expense.updatedDateUTC, null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, Expense.lineItems[0].description, null, Expense.lineItems[0].unitAmount, company_id, user_id)
                        //     }
                        //     else {
                        //         let vn = await getVendorByID(Expense.contact.contactID);
                        //         console.log("vendor", vn[0].name);
                        //         let gdpart = null;
                        //         let is_paid = "false";
                        //         let payment_ref_number = null;
                        //         let paid_amount = null;
                        //         let payment_date = null;
                        //         if (Expense.payments.length>0) {
                        //             is_paid = "true";
                        //             payment_ref_number = Expense.payments[0].reference;
                        //             paid_amount = Expense.payments[0].amount;
                        //             payment_date = Expense.payments[0].date;
                        //
                        //             console.log("is_paid", is_paid);
                        //             console.log("payment_ref_number", payment_ref_number);
                        //             console.log("paid_amount", paid_amount);
                        //             console.log("payment_date", payment_date);
                        //         }
                        //         if(Expense.lineItems[0].tracking.length>0) {
                        //             gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                        //             console.log("GETED DEPART", gdpart);
                        //             console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                        //         }
                        //         console.log("vendor", vn[0].name);
                        //         const updateExpenseResult = await updateXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null,vn[0].vendor_id!==undefined?vn[0].vendor_id:null,vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                        //     }
                        // }
                        if (Expense.type === "ACCPAY") {
                            const checkTenantExpenseResult = await checkTenantExpense(Expense.invoiceID, company_id);
                            if (checkTenantExpenseResult[0].expense_count === 0) {
                                console.log("Expense ID: ", Expense.invoiceID);
                                console.log("Expense.lineItems.length", Expense.lineItems.length);
                                console.log("Tracking id", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0].trackingCategoryID : null);
                                // addXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, total_amount, company_id, user_id)
                                if (Expense.lineItems.length === 1) {
                                    let vn = await getVendorByID(Expense.contact.contactID);
                                    console.log("vendor", vn[0].name);
                                    let gdpart = null;
                                    let is_paid = "false";
                                    let payment_ref_number = null;
                                    let paid_amount = null;
                                    let payment_date = null
                                    let category,location = null;
                                    if (Expense.lineItems[0].tracking.length > 0) {
                                        for (let x = 0; x < Expense.lineItems[0].tracking.length; x++) {
                                            if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "departments") {
                                                // category = Expense.lineItems[0].tracking[x].option;
                                                category = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                            } else if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "locations") {
                                                // location = Expense.lineItems[0].tracking[x].option;
                                                location = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                            }
                                        }
                                    }
                                    if (Expense.payments.length > 0) {
                                        is_paid = "true";
                                        payment_ref_number = Expense.payments[0].reference;
                                        paid_amount = Expense.payments[0].amount;
                                        payment_date = Expense.payments[0].date;

                                        console.log("is_paid", is_paid);
                                        console.log("payment_ref_number", payment_ref_number);
                                        console.log("paid_amount", paid_amount);
                                        console.log("payment_date", payment_date);
                                    }
                                    // if (Expense.lineItems[0].tracking.length > 0) {
                                    //     gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                    //     console.log("GETED DEPART", gdpart);
                                    //     console.log("category", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0] : null)
                                    // }
                                    let totalAmount = +Expense.lineItems[0].lineAmount + +Expense.lineItems[0].taxAmount;
                                    const addExpenseResult = await addXeroExpense(Expense.invoiceID, 1, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[0].lineAmount , Expense.lineItems[0].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                                } else {
                                    for (let i = 0; i < Expense.lineItems.length; i++) {
                                        let j = +i + +1;
                                        let vn = await getVendorByID(Expense.contact.contactID);
                                        console.log("vendor", vn[0].name);
                                        let gdpart = null;
                                        let is_paid = "false";
                                        let payment_ref_number = null;
                                        let paid_amount = null;
                                        let payment_date = null;
                                        let category,location = null;
                                        if (Expense.lineItems[0].tracking.length > 0) {
                                            for (let x = 0; x < Expense.lineItems[0].tracking.length; x++) {
                                                if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "departments") {
                                                    // category = Expense.lineItems[0].tracking[x].option;
                                                    category = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                                } else if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "locations") {
                                                    // location = Expense.lineItems[0].tracking[x].option;
                                                    location = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                                }
                                            }
                                        }
                                        if (Expense.payments.length > 0) {
                                            is_paid = "true";
                                            payment_ref_number = Expense.payments[0].reference;
                                            paid_amount = Expense.payments[0].amount;
                                            payment_date = Expense.payments[0].date;

                                            console.log("is_paid", is_paid);
                                            console.log("payment_ref_number", payment_ref_number);
                                            console.log("paid_amount", paid_amount);
                                            console.log("payment_date", payment_date);
                                        }
                                        // if (Expense.lineItems[i].tracking.length > 0) {
                                        //     gdpart = await getDepartByDepartName(Expense.lineItems[i].tracking[0].option, Expense.lineItems[i].tracking[0].trackingCategoryID);
                                        //     console.log("GETED DEPART", gdpart);
                                        //     console.log("category", Expense.lineItems[i].tracking.length > 0 ? Expense.lineItems[i].tracking[0] : null)
                                        // }
                                        let totalAmount = +Expense.lineItems[i].lineAmount + +Expense.lineItems[i].taxAmount;
                                        const addExpenseResult = await addXeroExpense(Expense.invoiceID, j, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[i].accountCode, null, Expense.lineItems[i].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[i].lineAmount , Expense.lineItems[i].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                                    }
                                }
                            }
                        }

                        if (Expense.hasAttachments === true) {
                            console.log("Line item", Expense.lineItems[0])
                            console.log("aaa");
                            try {
                                const responseAttachment = await xero.accountingApi.getInvoiceAttachments(tenant.tenantId, Expense.invoiceID);
                                // console.log(responseAttachment.body.attachments[0]);
                                for (let i = 0; i < responseAttachment.body.attachments.length; i++) {
                                    console.log("attachment", i);
                                    console.log("attachment:::", responseAttachment.body.attachments[i])
                                    let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[i].attachmentID, Expense.invoiceID);
                                    if (checkAttachableResult[0].attach_count === 0) {
                                        // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                        let addAttachableResult = await addAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                        console.log("attachable inserted", Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                    } else {
                                        let updateAttachableResult = await updateAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                    }

                                }

                            } catch (e) {
                                console.log("Error", e);
                            }
                        }
                    }

                    await storeActivity("Expenses Synced", "-", "Expense", company_id, user_id);
                }
            }
            else {
                res.redirect(`${process.env.APP_URL}login/error/no_tenant`);
            }




            const disableAllCompanyResult = await disableAllCompany(user_id);
            const getCompanyByTenantResult = await getCompanyByTenant(tenantArray[0].tenantId);
            const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);
            // const updateUserCompanyResult = await updateUserCompany(user_id, company_id);
            console.log("HEREEEEEEEEEEEE")
            if (login_type === "connect") {
                res.redirect(`${process.env.APP_URL}companies`);
                // res.redirect(`${process.env.APP_URL}auth_login/` + encodeURIComponent(email) + `/xero/0/` + token + `/sign_in`);
            } else {
                let transporter = nodemailer.createTransport({
                    host: "smtp.mail.yahoo.com",
                    port: 465,
                    auth: {
                        user: "mohsinjaved414@yahoo.com",
                        pass: "exvnhtussrqkmqcr"
                    },
                    debug: true, // show debug output
                    logger: true
                });
                let href = process.env.APP_URL+"login";
                let html = "<html><head></head><body style='background-color: #eaeaea;padding-top: 30px;padding-bottom: 30px'><div style='width: 50%;margin-left:auto;margin-right:auto;margin-top: 30px;margin-bottom: 30px;margin-top:20px;border-radius: 5px;background-color: white;height: 100%;padding-bottom: 30px;overflow: hidden'><div style='background-color: white;padding-top: 20px;padding-bottom: 20px;width: 100%;text-align: center'><img src='https://wepull.netlify.app/finalLogo.png' width='100px' style='margin: auto'/></div><hr/><p style='padding-left: 10px;padding-right: 10px'>Hi "+first_name+",<br/><br/>Great news! Your data sync with WePull is complete, and all analytics are now available.<br/><br/><a href='"+href+"' style='text-decoration: none;width: 100%'><button style='border-radius: 5px;background-color: #1a2956;color:white;border: none;margin-left: auto;margin-right: auto;padding:10px;cursor: pointer'>View Dashboard</button></a><br/><br/>Our team is always here to help. If you have any questions or need further assistance, contact us via email at support@wepull.io</p></div></body></html>"
                let mailOptions = {
                    from: 'mohsinjaved414@yahoo.com',
                    to: email,
                    subject: 'Data Pull Complete',
                    html: html
                };
                await transporter.sendMail(mailOptions);

                res.redirect(`${process.env.APP_URL}auth_login/` + encodeURIComponent(email) + `/xero/0/` + token + `/sign_up`);
            }
            // }
        } catch (err) {
            console.log(err);
            console.log("ERORRRRRRRRRRRRR")
            res.redirect(`${process.env.APP_URL}login`);
        }
    },
    xeroDisconnect: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const user = await getUserById(user_id);
            const company = await getCompanyById(company_id);

            console.log("connection_id ", company[0].connection_id);
            let uc_length = 0;
            let uc_active_company = null;
            // const company = await getCompanyByTenant(tenant_id);
            // console.log("company[0].connection_id",company[0].connection_id)
            // const response1 = await xero_get_tenant(user[0].xero_access_token);
            // console.log(response1)

            await xero_remove_connection(user[0].xero_access_token, company[0].connection_id).then(async (res) => {
                console.log("Disconnecting company", res);
                const setForeignKeyResulten = await setForeignKeyDisable('companies');
                const setForeignKeyResulten1 = await setForeignKeyDisable('users');
                await removeAccounts(company_id).then(async () => {
                    await removeActivities(company_id).then(async () => {
                        await removeUserRelations(company_id).then(async () => {
                            await removeVendors(company_id).then(async () => {
                                await removeExpenses(company_id).then(async () => {
                                    await removeAttachables(company_id).then(async () => {
                                        await removeDepartments(company_id).then(async () => {
                                            await removeUsersOfCompany(company_id).then(async () => {
                                                await removeCompany(company_id).then(async () => {
                                                    const setForeignKeyResulten = await setForeignKeyEnable('companies');
                                                    const setForeignKeyResulten1 = await setForeignKeyEnable('users');
                                                    const user_companies = await getCompany(user_id);
                                                    uc_length = user_companies.length;
                                                    uc_active_company = user_companies[0];
                                                    if (user_companies.length > 0) {
                                                        console.log("user_companies", user_companies);
                                                        const disableAllCompanyResult = await disableAllCompany(user_id);
                                                        const activateCompanyResult = await activateCompany(user_companies[0].id);
                                                    } else {
                                                        console.log("change user status to 0");
                                                        const updateUserStatusResult = await updateUserStatus(user_id, 0);
                                                        console.log("updateUserStatus");
                                                    }
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                });
            });


            return res.json({
                status: 200,
                message: company[0].company_name + " has been disconnected from WePull.",
                connection_id: company[0].connection_id,
                companies: uc_length,
                active_company: uc_active_company
            });
            // console.log("dis response",response);
            // // if (response) {
            //     const setForeignKeyCheck = await foreignKeyCheck(0);
            //
            //     if(setForeignKeyCheck) {
            //
            //
            //         // console.log("removeAccountsResult");
            //         // const removeActivitiesResult = ;
            //         // console.log("removeActivities");
            //         // const removeExpensesResult = ;
            //         // console.log("removeExpenses");
            //         // const removeAttachablesResult = ;
            //         // console.log("removeAttachables");
            //         // const removeDepartmentsResult = ;
            //         // console.log("removeDepartments");
            //         // const removeUserRelationsResult = ;
            //         // console.log("removeUserRelations");
            //         // const setForeignKeyResultdis1 = await setForeignKeyDisable('users').then(() => {
            //         //     const removeUsersOfCompanyResult = ;
            //         //     console.log("removeUsersOfCompanyResult");
            //         // });
            //         //
            //         // const setForeignKeyResultdis = await setForeignKeyDisable('companies').then(() => {
            //         //     const removeCompanyResult = ;
            //         //     console.log("removeCompany");
            //         // });
            //
            //         const setForeignKeyCheck1 = await foreignKeyCheck(1);
            //
            //         console.log("setForeignKeyCheck", setForeignKeyCheck);
            //         console.log("every thing deleted");
            //
            //     }
            //     else {
            //         console.log("forign key not set to 0");
            //     }


            // }
            // else {
            //     console.log("error while response");
            //     return res.json({
            //         status: 500,
            //         message: "Something went wrong while disconnecting, Please try again."
            //     })
            // }

        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log("errorrr", err);
            return res.json({
                status: 500,
                message: "Something went wrong while disconnecting, Please try again."
            })
        }
    },
    xero_refresh_token_function: async (req, res) => {
        const email = req.params.email;
        // const getRefreshTokenResult = await getRefreshToken(email);
        let token = await refreshToken(email);

        if (token === "Not Expired") {
            return res.json({
                status: 200,
                message: "Not Expired"
            });
        } else {
            return res.json({
                status: 200,
                tokenSet: token.validTokenSet
            });
        }

    },
    xero_get_tenants: async function(req, res) {
        //console.log("Current Access Token: ",access_token);
        let bearer = 'Bearer ' + xero_access_token;
        console.log(bearer);
        let options = {
            'method': 'GET',
            'url': 'https://api.xero.com/connections',
            'headers': {
                'Authorization': bearer,
                'Cookie': '_abck=A3EA3F813C4B0FE84B57724133558714~-1~YAAQBGswF9QJod5+AQAAlxRaBwfmz1DVCmuZ4A6y1QjxRITSajH7n8Rsy8zkUSWPnCmGRnuG5t0jm5IrFS07DKVCAPDuzP3vgZRlXREUxGkRdW1sdKq5EixBRtXdQBcb3vN8Kd4O04mAc+GS9Svuzh4VaAjWhBqgqdELaGLqPBVuiuR9F9jU0kUbCs8yguEf3d6DwGKan6KMcOCjnjjDcveea3C9qbXOM+fbuXW8vo8+LPILT11uvABeB0YXryvq3Lnv3rDyeI37u/wj5syqZOMd67M3WgKOytWvPLInEOavlpPAxso6S5S/6enkW286/xfrPRMKUnn6wMcasyauZY2Hi2c7kpAp++J0Jqiws+x1PIKwLuKXFr3Oe+46hReqMrhDxeQ=~-1~-1~-1; ak_bmsc=5767EEF35D9998B1CEE1538075B0B0BD~000000000000000000000000000000~YAAQBGswF9UJod5+AQAAlxRaBw7kQBo2Lsk7bu5f5MVp0E7aCME6bXfLfGFHuLGD/WxBqoRLIpKI7pBEmUl5nxuz1ZGiDJZAI7VPSZS8R1B+WvP9M4bWivbnzec9uliIQxwwrekuOc17HvjYsz6sN4djNrGlfZVcI7oLZobO82ywlDSTuF1G2zfdJ7w7GF0bo4Wyahk9psBbJa+jl9qHxXUgZCvNXw5uBmurhjCdq4urFKgIMe33HA/um5agV/FXA8CyWxCxcuyEgMsWoh9xDGIpdkJghyQw+AB/NIqtV6iMqxYKVpslRGNw11H0cI++Lfn//V0ZrVV2uNsbkF5u3vd26RFasCLznNjrEmcx8XhtZ2RUhXPYid919g==; bm_sv=BA6EE1536FFE5162901ED703261238D0~N9d3GimHdz48LeSQ6weNOPKA5SoSmm61fnFdPu6r+raXVSyUCIV4sr3jWol9ItHVHrR8JJcETlm7EVDgC13MsX4bFzsXDWuKOMI33+Jys4u7VEcV4NGhR4WoBiY5TbtsWwfkVT0vWM6Cou2lAJpIZA==; bm_sz=8E8439F32D362EA97CFBD0F5CD05E449~YAAQBGswF9MJod5+AQAAlhRaBw42gmhbH5f13iqoAqkBuReIVeKGHYc8r8ZnNh4eAkc2cVTxm66bvzY3By3UoUrfYsfmHXSpBwk3s4b+s0KNBZmtNqRdOHm26nR6tCYGNkPdcL1dJR1u4WIWede5FPEEc1wANmDDyKhWVA+42/qRQq932ahp90yhCcNnBA=='
            }
        };

        request(options, function(error, response) {
            if (error) throw new Error(error);
            let array = JSON.parse(response.body);
            tenantId = array[0].tenantId;
            tenantType = array[0].tenantType;
            tenantName = array[0].tenantName;
            tenantCreateDate = moment.tz(array[0].createdDateUtc, "Asia/Karachi").format("DD-MM-YYYY h:s A");
            console.log("Tenant Details");
            console.log("ID: " + tenantId);
            console.log("Name: " + tenantName);
            console.log("Type: " + tenantType);
            console.log("Created At: " + tenantCreateDate);
            // console.log(typeof response.body);
            // console.log("length : " + array.length);
            // console.log(array["tenantId"]);
            res.send(response.body);
        });



    },
    xero_login: async (req, res) => {
        try {
            const body = req.body;
            console.log(body);
            const results = await getUserByUserEmail(body.email);
            results.password = undefined;
            console.log("getuser::", results);
            const json_token = sign({
                result: results
            }, process.env.JWT_KEY);
            return res.json({
                success: 1,
                message: "login successfully",
                token: json_token,
                data: results,
                type: "xero"
                // data: results,
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Invalid email or password"
            });
        }
    },
    getAccounts: async (req, res) => {
        const company_id = req.params.company_id;
        console.log("company_id", company_id);
        const record = await getAccounts(company_id);
        return res.json({
            success: 1,
            data: record
        });
    },
    createXeroAccount: async (req, res) => {
        try {
            const body = req.body;
            console.log(body)
            // console.log(tokenset);
            await xero.setTokenSet(tokenset);
            const xeroTenantId = body.tenant;
            const Account = {
                code: body.code,
                name: body.name,
                type: body.type,
                description: body.description
            };
            console.log(Account, xeroTenantId);
            try {
                const response = await xero.accountingApi.createAccount(xeroTenantId, Account);
                console.log(response.body || response.response.statusCode)
            } catch (err) {
                const error = JSON.stringify(err.response.body, null, 2)
                console.log(`Status Code: ${err.response.statusCode} => ${error}`);
            }



            const getUserByUserEmailResult = await getUserByUserEmail(body.email);

            const activeTenant = await xero_get_tenant(getUserByUserEmailResult.xero_access_token);
            let tenantArray = JSON.parse(activeTenant);
            console.log("tenants ", tenantArray);

            const getCompanyResult = await getCompany(body.id);
            const order = 'Name ASC';
            console.log(getCompanyResult);
            for (const tenant of tenantArray) {

                //getting all account by tenant id
                const response = await xero.accountingApi.getAccounts(tenant.tenantId, null, null, order);
                // console.log(typeof response.body.accounts);
                let res = response.body.accounts;
                for (const Account of res) {
                    // console.log("Company ID:",company.id, "Account ID: ", Account.accountID);

                    //get company by tenant id
                    const getCompanyByTenantResult = await getCompanyByTenant(tenant.tenantId)
                    // console.log(getCompanyByTenantResult);
                    //Check if tenant account already exist
                    const checkTenantAccountResult = await checkTenantAccount(Account.accountID, getCompanyByTenantResult[0].id);
                    // console.log("count:",checkTenantAccountResult[0].account_count);
                    console.log("account id:", Account.accountID, "company id:", getCompanyByTenantResult[0].id, "count:", checkTenantAccountResult[0].account_count);
                    if (checkTenantAccountResult[0].account_count === 0) {
                        console.log(getCompanyByTenantResult[0].id, Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode === undefined ? null : Account.currencyCode, Account.updatedDateUTC);
                        const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status === "ACTIVE" ? 1 : 0, Account.description, Account.currencyCode === undefined ? null : Account.currencyCode, Account.updatedDateUTC, getCompanyByTenantResult[0].id, body.id, "xero");
                    }
                }
            }

            return res.json({
                success: 1,
                message: "Account created successfully"
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Something went wrong " + e.message
            });
        }
    },
    syncAccounts: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const record = await getActivateCompany(user_id);
            // const token = await refreshToken(record[0].xero_access_token,record[0].email);
            const user = await getUserById(user_id);
            console.log("tennat id", record[0].tenant_id);
            // console.log(user);

            const TS = new TokenSet({
                id_token: user[0].xero_id_token,
                access_token: user[0].xero_access_token,
                refresh_token: user[0].xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            console.log(TS);
            console.log("user id", user_id)
            console.log("company id", company_id)

            await xero.setTokenSet(TS);
            const order = 'Name ASC';
            console.log(record[0].tenant_id);
            //getting all account by tenant id
            const response = await xero.accountingApi.getAccounts(record[0].tenant_id, null, null, order);
            // console.log(typeof response.body.accounts);
            let res = response.body.accounts;
            console.log(res.body);
            for (const Account of res) {
                console.log("Company ID:", company_id, " User ID:", user_id, "Account ID: ", Account.accountID);

                //Check if tenant account already exist
                const checkTenantAccountResult = await checkTenantAccount(Account.accountID, company_id);
                console.log("count:", checkTenantAccountResult[0].account_count);
                if (checkTenantAccountResult[0].account_count === 0) {
                    console.log(company_id, Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode == undefined ? null : Account.currencyCode, Account.updatedDateUTC);
                    const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status == "ACTIVE" ? 1 : 0, Account.description, Account.currencyCode == undefined ? null : Account.currencyCode, Account.updatedDateUTC, company_id, user_id, "xero");
                } else {
                    const updateTenantAccountResult = await updateTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status == "ACTIVE" ? 1 : 0, Account.description, Account.currencyCode == undefined ? null : Account.currencyCode, Account.updatedDateUTC, company_id, user_id);
                    console.log("FOUND:", company_id, Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode == undefined ? null : Account.currencyCode, Account.updatedDateUTC);
                }
            }

        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log(err);
            return res.json({
                status: 500,
                message: "Accounts synced failed, Please try again."
            })
        }

        return res.json({
            status: 200,
            message: "Accounts synced successfully!"
        })
    },
    syncExpenses: async (req, res) => {
        try {
            //this function will get today's expenses only and insert and update the data in db according to user.
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const record = await getActivateCompany(user_id);
            const user = await getUserById(user_id);

            // let exp = await getExpense(user[0].xero_access_token, record[0].tenant_id);
            // console.log("exppppppppppp",exp);
            console.log(record);
            // console.log(user);

            const TS = new TokenSet({
                id_token: user[0].xero_id_token,
                access_token: user[0].xero_access_token,
                refresh_token: user[0].xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            console.log("TS", TS);

            await xero.setTokenSet(TS);
            await storeActivity("Expenses Synced", "-", "Expense", company_id, user_id);

            const page = 1;
            const includeArchived = true;
            const createdByMyApp = false;
            const unitdp = 4;
            const summaryOnly = false;
            const ifModifiedSince = new Date(moment(new Date()).subtract(5, 'days').toISOString());
            console.log("ifModifiedSince", ifModifiedSince);
            const responseExp = await xero.accountingApi.getInvoices(record[0].tenant_id, ifModifiedSince, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
            // const response = await xero.accountingApi.getInvoices(record[0].tenant_id, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
            console.log("Tenant", record[0].tenant_id);
            console.log("Expense", responseExp.body.invoices);
            // console.log(response.body || response.response.statusCode)
            // let expenseArray = JSON.parse(response.body.invoices);
            // console.log("Response",response.body.invoices)

            for (const Expense of responseExp.body.invoices) {
                if (Expense.type === "ACCPAY") {
                    console.log("Expensessssss", Expense);
                    const checkTenantExpenseResult = await checkTenantExpense(Expense.invoiceID, company_id);
                    if (checkTenantExpenseResult[0].expense_count === 0) {
                        console.log("Expense ID: ", Expense.invoiceID);
                        console.log("Expense.lineItems.length", Expense.lineItems.length);
                        console.log("Tracking id", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0].trackingCategoryID : null);
                        // addXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, total_amount, company_id, user_id)
                        if (Expense.lineItems.length === 1) {
                            let vn = await getVendorByID(Expense.contact.contactID);
                            console.log("vendor", vn[0].name);
                            let gdpart = null;
                            let is_paid = "false";
                            let payment_ref_number = null;
                            let paid_amount = null;
                            let payment_date = null;

                            let category = null;
                            let location = null;
                            if (Expense.lineItems[0].tracking.length > 0) {
                                for (let x = 0; x < Expense.lineItems[0].tracking.length; x++) {
                                    if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "departments") {
                                        // category = Expense.lineItems[0].tracking[x].option;
                                        category = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                    } else if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "locations") {
                                        // location = Expense.lineItems[0].tracking[x].option;
                                        location = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                    }
                                }
                            }
                            console.log("category is", category);
                            console.log("location is", location)
                            if (Expense.payments.length > 0) {
                                is_paid = "true";
                                payment_ref_number = Expense.payments[0].reference;
                                paid_amount = Expense.payments[0].amount;
                                payment_date = Expense.payments[0].date;

                                console.log("is_paid", is_paid);
                                console.log("payment_ref_number", payment_ref_number);
                                console.log("paid_amount", paid_amount);
                                console.log("payment_date", payment_date);
                            }
                            // if (Expense.lineItems[0].tracking.length > 0) {
                            //
                            //     console.log("GETED DEPART", gdpart);
                            //     console.log("category", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0] : null)
                            // }
                            let totalAmount = +Expense.lineItems[0].lineAmount + +Expense.lineItems[0].taxAmount;
                            const addExpenseResult = await addXeroExpense(Expense.invoiceID, 1, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[0].lineAmount , Expense.lineItems[0].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                        } else {
                            for (let i = 0; i < Expense.lineItems.length; i++) {
                                let j = +i + +1;
                                let vn = await getVendorByID(Expense.contact.contactID);
                                console.log("vendor", vn[0].name);
                                let gdpart = null;
                                let is_paid = "false";
                                let payment_ref_number = null;
                                let paid_amount = null;
                                let payment_date = null;
                                let category,location = null;
                                if (Expense.lineItems[i].tracking.length > 0) {
                                    for (let x = 0; x < Expense.lineItems[i].tracking.length; x++) {
                                        if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "departments") {
                                            // category = Expense.lineItems[0].tracking[x].option;
                                            category = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                        } else if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "locations") {
                                            // location = Expense.lineItems[0].tracking[x].option;
                                            location = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                        }
                                    }
                                }
                                if (Expense.payments.length > 0) {
                                    is_paid = "true";
                                    payment_ref_number = Expense.payments[0].reference;
                                    paid_amount = Expense.payments[0].amount;
                                    payment_date = Expense.payments[0].date;

                                    console.log("is_paid", is_paid);
                                    console.log("payment_ref_number", payment_ref_number);
                                    console.log("paid_amount", paid_amount);
                                    console.log("payment_date", payment_date);
                                }
                                // if (Expense.lineItems[i].tracking.length > 0) {
                                //     gdpart = await getDepartByDepartName(Expense.lineItems[i].tracking[0].option, Expense.lineItems[i].tracking[0].trackingCategoryID);
                                //     console.log("GETED DEPART", gdpart);
                                //     console.log("category", Expense.lineItems[i].tracking.length > 0 ? Expense.lineItems[i].tracking[0] : null)
                                // }
                                // let totalAmount = +Expense.lineItems[i].lineAmount + +Expense.lineItems[i].taxAmount;
                                const addExpenseResult = await addXeroExpense(Expense.invoiceID, j, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[i].accountCode, null, Expense.lineItems[i].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[i].lineAmount , Expense.lineItems[i].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                            }
                        }
                    } else {
                        console.log("FOUND-------------------update:", Expense);
                        console.log("Expense.lineItems.length update", Expense.lineItems.length);

                        if (Expense.lineItems.length === 1) {
                            let vn = await getVendorByID(Expense.contact.contactID);
                            console.log("vendor", vn[0].name);
                            let gdpart = null;
                            let is_paid = "false";
                            let payment_ref_number = null;
                            let paid_amount = null;
                            let payment_date = null;
                            let category,location = null;
                            if (Expense.lineItems[0].tracking.length > 0) {
                                for (let x = 0; x < Expense.lineItems[0].tracking.length; x++) {
                                    if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "departments") {
                                        // category = Expense.lineItems[0].tracking[x].option;
                                        category = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                    } else if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "locations") {
                                        // location = Expense.lineItems[0].tracking[x].option;
                                        location = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                    }
                                }
                            }
                            // if (Expense.lineItems[0].tracking.length > 0) {
                            //     gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                            //     console.log("GETED DEPART", gdpart);
                            //     console.log("category", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0] : null)
                            // }
                            if (Expense.payments.length > 0) {
                                is_paid = "true";
                                payment_ref_number = Expense.payments[0].reference;
                                paid_amount = Expense.payments[0].amount;
                                payment_date = Expense.payments[0].date;

                                console.log("is_paid", is_paid);
                                console.log("payment_ref_number", payment_ref_number);
                                console.log("paid_amount", paid_amount);
                                console.log("payment_date", payment_date);
                            }


                            // updateXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id)
                            let totalAmount = +Expense.lineItems[0].lineAmount + +Expense.lineItems[0].taxAmount;
                            const updateExpenseResult = await updateXeroExpense(Expense.invoiceID, 1, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[0].lineAmount , Expense.lineItems[0].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                            // console.log()
                        } else {
                            for (let i = 0; i < Expense.lineItems.length; i++) {
                                let j = +i + +1;
                                let vn = await getVendorByID(Expense.contact.contactID);
                                console.log("vendor", vn[0].name);
                                let gdpart = null;
                                let is_paid = "false";
                                let payment_ref_number = null;
                                let paid_amount = null;
                                let payment_date = null;
                                let category,location = null;
                                if (Expense.lineItems[i].tracking.length > 0) {
                                    for (let x = 0; x < Expense.lineItems[i].tracking.length; x++) {
                                        if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "departments") {
                                            // category = Expense.lineItems[0].tracking[x].option;
                                            category = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                        } else if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "locations") {
                                            // location = Expense.lineItems[0].tracking[x].option;
                                            location = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                        }
                                    }
                                }
                                // if (Expense.lineItems[i].tracking.length > 0) {
                                //     gdpart = await getDepartByDepartName(Expense.lineItems[i].tracking[0].option, Expense.lineItems[i].tracking[0].trackingCategoryID);
                                //     console.log("GETED DEPART", gdpart);
                                //     console.log("category", Expense.lineItems[i].tracking.length > 0 ? Expense.lineItems[i].tracking[0] : null)
                                // }
                                if (Expense.payments.length > 0) {
                                    is_paid = "true";
                                    payment_ref_number = Expense.payments[0].reference;
                                    paid_amount = Expense.payments[0].amount;
                                    payment_date = Expense.payments[0].date;

                                    console.log("is_paid", is_paid);
                                    console.log("payment_ref_number", payment_ref_number);
                                    console.log("paid_amount", paid_amount);
                                    console.log("payment_date", payment_date);
                                }
                                console.log("Line item ", i);
                                // console.log(Expense.invoiceID, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[i].accountCode, null, Expense.lineItems[i].description, gdpart !== null ? gdpart[0].depart_id : null, Expense.lineItems[i].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id);
                                // updateXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id)
                                let totalAmount = +Expense.lineItems[i].lineAmount + +Expense.lineItems[i].taxAmount;
                                const updateExpenseResult = await updateXeroExpense(Expense.invoiceID, j, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[i].accountCode, null, Expense.lineItems[i].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[i].lineAmount , Expense.lineItems[i].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                                // console.log()
                            }
                        }
                    }

                    if (Expense.hasAttachments === true) {
                        console.log("Line item", Expense.lineItems[0])
                        // console.log("aaa");
                        try {
                            const responseAttachment = await xero.accountingApi.getInvoiceAttachments(record[0].tenant_id, Expense.invoiceID);
                            // console.log(responseAttachment.body.attachments[0]);
                            // let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[0].attachmentID,Expense.invoiceID);
                            // if(checkAttachableResult[0].attach_count === 0) {
                            //     // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                            //     let addAttachableResult = await addAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                            //     console.log("attachable inserted",Expense.invoiceID, company_id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                            // }
                            // else {
                            //     let updateAttachableResult = await updateAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                            // }
                            // // console.log("aaa1");
                            // console.log("attachment:::",responseAttachment.body.attachments)
                            for (let i = 0; i < responseAttachment.body.attachments.length; i++) {
                                console.log("attachment", i);
                                console.log("attachment:::", responseAttachment.body.attachments[i])
                                let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[i].attachmentID, Expense.invoiceID);
                                if (checkAttachableResult[0].attach_count === 0) {
                                    // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                    let addAttachableResult = await addAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                    console.log("attachable inserted", Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                }
                                else {
                                    console.log("attachable inserted",Expense.invoiceID,  company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID,null, null);
                                    let updateAttachableResult = await updateAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID,null, null);
                                }
                            }
                        } catch (e) {
                            console.log("Error", e);
                        }
                    }
                }
            }
        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log("exxx",err);
            // res.send(err);
            if(err.response && err.response.body.Status === 403) {
                return res.json({
                    status: 500,
                    message: "You have disconnected this company from WePull"
                })
            }
            else {
                return res.json({
                    status: 500,
                    message: "Expenses synced failed, Please try again."
                })
            }
        }
        return res.json({
            status: 200,
            message: "Expenses synced successfully!"
        })

    },
    userSyncExpense: async (req, res) => {
        try {
            //this function will get today's expenses only and insert and update the data in db according to user.
            // const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const companyUser = await getUserById(req.params.user_id);
            const user = await getUserById(companyUser[0].created_by);
            const record = await getCompanyById(company_id);
            const user_id = companyUser[0].created_by;

            let token = await refreshToken(user[0].email);
            // if (token) {
                console.log("company",record);
                console.log("user id",user_id);
                console.log("user_id",user_id, "company_id",company_id, "created_by",user[0].created_by);
                const TS = new TokenSet({
                    id_token: user[0].xero_id_token,
                    access_token: user[0].xero_access_token,
                    refresh_token: user[0].xero_refresh_token,
                    token_type: "Bearer",
                    scope: scope
                });

                console.log("TS", TS);

                await xero.setTokenSet(TS);
                await storeActivity("Expenses Synced", "-", "Expense", company_id, user_id);

                const page = 1;
                const includeArchived = true;
                const createdByMyApp = false;
                const unitdp = 4;
                const summaryOnly = false;
                const ifModifiedSince = new Date(moment(new Date()).subtract(5, 'days').toISOString());
                console.log("ifModifiedSince", ifModifiedSince);
                const responseExp = await xero.accountingApi.getInvoices(record[0].tenant_id, ifModifiedSince, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                // const response = await xero.accountingApi.getInvoices(record[0].tenant_id, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                console.log("Tenant", record[0].tenant_id);
                console.log("Expense", responseExp.body.invoices);
                // console.log(response.body || response.response.statusCode)
                // let expenseArray = JSON.parse(response.body.invoices);
                // console.log("Response",response.body.invoices)

                for (const Expense of responseExp.body.invoices) {
                    if (Expense.type === "ACCPAY") {
                        console.log("Expensessssss", Expense);
                        const checkTenantExpenseResult = await checkTenantExpense(Expense.invoiceID, company_id);
                        if (checkTenantExpenseResult[0].expense_count === 0) {
                            console.log("Expense ID: ", Expense.invoiceID);
                            console.log("Expense.lineItems.length", Expense.lineItems.length);
                            console.log("Tracking id", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0].trackingCategoryID : null);
                            // addXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, total_amount, company_id, user_id)
                            if (Expense.lineItems.length === 1) {
                                let vn = await getVendorByID(Expense.contact.contactID);
                                console.log("vendor", vn[0].name);
                                let gdpart = null;
                                let is_paid = "false";
                                let payment_ref_number = null;
                                let paid_amount = null;
                                let payment_date = null;

                                let category,location = null;
                                if (Expense.lineItems[0].tracking.length > 0) {
                                    for (let x = 0; x < Expense.lineItems[0].tracking.length; x++) {
                                        if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "departments") {
                                            // category = Expense.lineItems[0].tracking[x].option;
                                            category = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                        } else if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "locations") {
                                            // location = Expense.lineItems[0].tracking[x].option;
                                            location = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                        }
                                    }
                                }
                                console.log("category is", category);
                                console.log("location is", location)
                                if (Expense.payments.length > 0) {
                                    is_paid = "true";
                                    payment_ref_number = Expense.payments[0].reference;
                                    paid_amount = Expense.payments[0].amount;
                                    payment_date = Expense.payments[0].date;

                                    console.log("is_paid", is_paid);
                                    console.log("payment_ref_number", payment_ref_number);
                                    console.log("paid_amount", paid_amount);
                                    console.log("payment_date", payment_date);
                                }
                                // if (Expense.lineItems[0].tracking.length > 0) {
                                //
                                //     console.log("GETED DEPART", gdpart);
                                //     console.log("category", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0] : null)
                                // }
                                let totalAmount = +Expense.lineItems[0].lineAmount + +Expense.lineItems[0].taxAmount;
                                const addExpenseResult = await addXeroExpense(Expense.invoiceID, 1, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[0].lineAmount , Expense.lineItems[0].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                            } else {
                                for (let i = 0; i < Expense.lineItems.length; i++) {
                                    let j = +i + +1;
                                    let vn = await getVendorByID(Expense.contact.contactID);
                                    console.log("vendor", vn[0].name);
                                    let gdpart = null;
                                    let is_paid = "false";
                                    let payment_ref_number = null;
                                    let paid_amount = null;
                                    let payment_date = null;
                                    let category,location = null;
                                    if (Expense.lineItems[i].tracking.length > 0) {
                                        for (let x = 0; x < Expense.lineItems[i].tracking.length; x++) {
                                            if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "departments") {
                                                // category = Expense.lineItems[0].tracking[x].option;
                                                category = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                            } else if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "locations") {
                                                // location = Expense.lineItems[0].tracking[x].option;
                                                location = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                            }
                                        }
                                    }
                                    if (Expense.payments.length > 0) {
                                        is_paid = "true";
                                        payment_ref_number = Expense.payments[0].reference;
                                        paid_amount = Expense.payments[0].amount;
                                        payment_date = Expense.payments[0].date;

                                        console.log("is_paid", is_paid);
                                        console.log("payment_ref_number", payment_ref_number);
                                        console.log("paid_amount", paid_amount);
                                        console.log("payment_date", payment_date);
                                    }
                                    // if (Expense.lineItems[i].tracking.length > 0) {
                                    //     gdpart = await getDepartByDepartName(Expense.lineItems[i].tracking[0].option, Expense.lineItems[i].tracking[0].trackingCategoryID);
                                    //     console.log("GETED DEPART", gdpart);
                                    //     console.log("category", Expense.lineItems[i].tracking.length > 0 ? Expense.lineItems[i].tracking[0] : null)
                                    // }
                                    // let totalAmount = +Expense.lineItems[i].lineAmount + +Expense.lineItems[i].taxAmount;
                                    const addExpenseResult = await addXeroExpense(Expense.invoiceID, j, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[i].accountCode, null, Expense.lineItems[i].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[i].lineAmount , Expense.lineItems[i].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                                }
                            }
                        } else {
                            console.log("FOUND-------------------update:", Expense);
                            console.log("Expense.lineItems.length update", Expense.lineItems.length);

                            if (Expense.lineItems.length === 1) {
                                let vn = await getVendorByID(Expense.contact.contactID);
                                console.log("vendor", vn[0].name);
                                let gdpart = null;
                                let is_paid = "false";
                                let payment_ref_number = null;
                                let paid_amount = null;
                                let payment_date = null;
                                let category,location = null;
                                if (Expense.lineItems[0].tracking.length > 0) {
                                    for (let x = 0; x < Expense.lineItems[0].tracking.length; x++) {
                                        if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "departments") {
                                            // category = Expense.lineItems[0].tracking[x].option;
                                            category = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                        } else if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "locations") {
                                            // location = Expense.lineItems[0].tracking[x].option;
                                            location = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                        }
                                    }
                                }
                                // if (Expense.lineItems[0].tracking.length > 0) {
                                //     gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                //     console.log("GETED DEPART", gdpart);
                                //     console.log("category", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0] : null)
                                // }
                                if (Expense.payments.length > 0) {
                                    is_paid = "true";
                                    payment_ref_number = Expense.payments[0].reference;
                                    paid_amount = Expense.payments[0].amount;
                                    payment_date = Expense.payments[0].date;

                                    console.log("is_paid", is_paid);
                                    console.log("payment_ref_number", payment_ref_number);
                                    console.log("paid_amount", paid_amount);
                                    console.log("payment_date", payment_date);
                                }


                                // updateXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id)
                                let totalAmount = +Expense.lineItems[0].lineAmount + +Expense.lineItems[0].taxAmount;
                                const updateExpenseResult = await updateXeroExpense(Expense.invoiceID, 1, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[0].lineAmount , Expense.lineItems[0].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                                // console.log()
                            } else {
                                for (let i = 0; i < Expense.lineItems.length; i++) {
                                    let j = +i + +1;
                                    let vn = await getVendorByID(Expense.contact.contactID);
                                    console.log("vendor", vn[0].name);
                                    let gdpart = null;
                                    let is_paid = "false";
                                    let payment_ref_number = null;
                                    let paid_amount = null;
                                    let payment_date = null;
                                    let category,location = null;
                                    if (Expense.lineItems[i].tracking.length > 0) {
                                        for (let x = 0; x < Expense.lineItems[i].tracking.length; x++) {
                                            if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "departments") {
                                                // category = Expense.lineItems[0].tracking[x].option;
                                                category = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                            } else if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "locations") {
                                                // location = Expense.lineItems[0].tracking[x].option;
                                                location = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                            }
                                        }
                                    }
                                    // if (Expense.lineItems[i].tracking.length > 0) {
                                    //     gdpart = await getDepartByDepartName(Expense.lineItems[i].tracking[0].option, Expense.lineItems[i].tracking[0].trackingCategoryID);
                                    //     console.log("GETED DEPART", gdpart);
                                    //     console.log("category", Expense.lineItems[i].tracking.length > 0 ? Expense.lineItems[i].tracking[0] : null)
                                    // }
                                    if (Expense.payments.length > 0) {
                                        is_paid = "true";
                                        payment_ref_number = Expense.payments[0].reference;
                                        paid_amount = Expense.payments[0].amount;
                                        payment_date = Expense.payments[0].date;

                                        console.log("is_paid", is_paid);
                                        console.log("payment_ref_number", payment_ref_number);
                                        console.log("paid_amount", paid_amount);
                                        console.log("payment_date", payment_date);
                                    }
                                    console.log("Line item ", i);
                                    // console.log(Expense.invoiceID, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[i].accountCode, null, Expense.lineItems[i].description, gdpart !== null ? gdpart[0].depart_id : null, Expense.lineItems[i].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id);
                                    // updateXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id)
                                    let totalAmount = +Expense.lineItems[i].lineAmount + +Expense.lineItems[i].taxAmount;
                                    const updateExpenseResult = await updateXeroExpense(Expense.invoiceID, j, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[i].accountCode, null, Expense.lineItems[i].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[i].lineAmount , Expense.lineItems[i].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                                    // console.log()
                                }
                            }
                        }

                        if (Expense.hasAttachments === true) {
                            console.log("Line item", Expense.lineItems[0])
                            // console.log("aaa");
                            try {
                                const responseAttachment = await xero.accountingApi.getInvoiceAttachments(record[0].tenant_id, Expense.invoiceID);
                                // console.log(responseAttachment.body.attachments[0]);
                                // let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[0].attachmentID,Expense.invoiceID);
                                // if(checkAttachableResult[0].attach_count === 0) {
                                //     // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                //     let addAttachableResult = await addAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                //     console.log("attachable inserted",Expense.invoiceID, company_id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                // }
                                // else {
                                //     let updateAttachableResult = await updateAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                // }
                                // // console.log("aaa1");
                                // console.log("attachment:::",responseAttachment.body.attachments)
                                for (let i = 0; i < responseAttachment.body.attachments.length; i++) {
                                    console.log("attachment", i);
                                    console.log("attachment:::", responseAttachment.body.attachments[i])
                                    let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[i].attachmentID, Expense.invoiceID);
                                    if (checkAttachableResult[0].attach_count === 0) {
                                        // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                        let addAttachableResult = await addAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                        console.log("attachable inserted", Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                    }
                                    else {
                                        console.log("attachable inserted",Expense.invoiceID,  company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID,null, null);
                                        let updateAttachableResult = await updateAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID,null, null);
                                    }
                                }
                            } catch (e) {
                                console.log("Error", e);
                            }
                        }
                    // }
                }
            }


        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log("exxx",err);
            // res.send(err);
            if(err.response && err.response.body.Status === 403) {
                return res.json({
                    status: 500,
                    message: "You have disconnected this company from WePull"
                })
            }
            else {
                return res.json({
                    status: 500,
                    message: "Expenses synced failed, Please try again."
                })
            }
        }
        return res.json({
            status: 200,
            message: "Expenses synced successfully!"
        })

    },
    xeroUpdateAllData: async (req, res) => {
        try {
            //this function will get all expenses and insert and update the data in db according to user.
            console.log("update Expense")
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const record = await getActivateCompany(user_id);
            const user = await getUserById(user_id);
            console.log(record);
            // console.log(user);

            const TS = new TokenSet({
                id_token: user[0].xero_id_token,
                access_token: user[0].xero_access_token,
                refresh_token: user[0].xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            console.log("TS", TS);



            const page = 1;
            const includeArchived = true;
            const createdByMyApp = false;
            const unitdp = 4;
            const summaryOnly = false;
            // console.log("Date...",ifModifiedSince);
            let token = await refreshToken(user[0].email);

            if (token === "Not Expired") {
                console.log("not expired all");
                await xero.setTokenSet(TS);
                console.log("current TS", token.TS);
            } else {
                console.log("expired");
                await xero.setTokenSet(token.TS);
                console.log("new TS", token.TS);
            }

            console.log("tokenSeT", xero.readTokenSet().expired());
            if (xero.readTokenSet().expired() === false) {
                //For Suppliers
                await storeActivity("Suppliers Synced", "-", "Supplier", company_id, user_id);
                const response = await xero.accountingApi.getContacts(record[0].tenant_id, null, null, null, null, page, includeArchived, summaryOnly, null);
                if (response.body.contacts.length > 0) {
                    for (const Contact of response.body.contacts) {

                        let vendor_id = Contact.contactID;
                        let name = Contact.name;
                        let acct_num = Contact.accountNumber !== undefined ? Contact.accountNumber : null;
                        let status = Contact.contactStatus === 'ACTIVE' ? 1 : 0;
                        let email = Contact.emailAddress;
                        let address1 = Contact.addresses[0].addressLine1 !== undefined ? Contact.addresses[0].addressLine1 : "";
                        let address2 = Contact.addresses[0].addressLine2 !== undefined ? Contact.addresses[0].addressLine2 : "";
                        let address3 = Contact.addresses[0].addressLine3 !== undefined ? Contact.addresses[0].addressLine3 : "";
                        let address4 = Contact.addresses[0].addressLine4 !== undefined ? Contact.addresses[0].addressLine4 : "";
                        let address = address1 + address2 + address3 + address4;
                        let city = Contact.addresses[0].city;
                        let postalCode = Contact.addresses[0].postalCode;
                        let region = Contact.addresses[0].region;
                        let country = Contact.addresses[0].country;
                        let contact = null;
                        let mobile = null;
                        // if(Contact.contactNumber === undefined) {
                        //     contact = Contact.phones[1].phoneCountryCode!==undefined? Contact.phones[1].phoneAreaCode + Contact.phones[1].phoneNumber:null;
                        //     mobile = Contact.phones[3].phoneCountryCode!==undefined? Contact.phones[3].phoneAreaCode + Contact.phones[3].phoneNumber:null;
                        // }
                        // else {
                        contact = Contact.phones[1].phoneCountryCode !== undefined ? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneAreaCode + Contact.phones[1].phoneNumber : null;
                        mobile = Contact.phones[3].phoneCountryCode !== undefined ? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneAreaCode + Contact.phones[3].phoneNumber : null;
                        // }

                        let website = Contact.website !== undefined ? Contact.website : null;
                        let balance = Contact.balances !== undefined ? Contact.balances : null;
                        let date = Contact.updatedDateUTC;
                        console.log(Contact)
                        console.log(vendor_id);
                        console.log(name);
                        console.log(status);
                        console.log(acct_num);
                        console.log(email);
                        console.log(address !== "" ? address + " " + city + " " + postalCode : null);
                        console.log(contact);
                        console.log("Contact", Contact.phones[1])
                        console.log(mobile);
                        console.log("Mobile", Contact.phones[3])
                        console.log(website);
                        console.log(null);
                        console.log(date);
                        console.log("-----------")
                        const checkTenantVendorResult = await checkTenantVendor(vendor_id, company_id);
                        if (checkTenantVendorResult[0].vendor_count === 0) {
                            // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                            // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                            // console.log("address",address);
                            console.log(vendor_id, name, contact, mobile, email, website, address !== "" ? address : null, city !== undefined ? city : null, region != undefined ? region : null, country != undefined ? country : null, postalCode != undefined ? postalCode : null, null, acct_num, record[0].currency, status, 'xero', company_id, user_id, date, date);
                            const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address !== "" ? address : null, city !== undefined ? city : null, region != undefined ? region : null, country != undefined ? country : null, postalCode != undefined ? postalCode : null, 0, acct_num, record[0].currency, status, 'xero', company_id, user_id, date, date);
                            console.log("added");
                        } else {
                            console.log("found ", vendor_id);
                            const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address !== "" ? address : null, city !== undefined ? city : null, region != undefined ? region : null, country != undefined ? country : null, postalCode != undefined ? postalCode : null, 0, acct_num, record[0].currency, status, 'xero', company_id, user_id, date, date);
                            console.log("updated");
                        }
                        // console.log(Contact);
                    }
                }


                //For Categories
                await storeActivity("Categories Synced", "-", "Category", company_id, user_id);
                const order = 'Name ASC';
                await setAllDepartStatusToZero(company_id);
                const responseCat = await xero.accountingApi.getTrackingCategories(record[0].tenant_id, null, order, includeArchived);
                // console.log("result:::",response.body.trackingCategories[0].options)
                if (responseCat.body.trackingCategories.length > 0) {

                    for (let i = 0; i < responseCat.body.trackingCategories.length; i++) {
                        console.log("categories", i, ":::", responseCat.body.trackingCategories[i])
                        for (const Department of responseCat.body.trackingCategories[i].options) {
                            console.log("Department.trackingOptionID", Department);
                            // this.stop();
                            const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID, company_id);
                            if (checkTenantDepartmentResult[0].depart_count === 0) {
                                console.log("Depart id", Department.trackingOptionID);
                                console.log("Name", Department.name);
                                console.log("Status", Department.status);
                                console.log()

                                const addDepartmentResult = addDepartment(Department.trackingOptionID, responseCat.body.trackingCategories[i].trackingCategoryID, Department.name, null, Department.status.toString() === "ACTIVE" ? 1 : 0, company_id, user_id, 0);
                            } else {
                                console.log("depart found")
                                console.log("main category", responseCat.body.trackingCategories[i].trackingCategoryID);
                                const updateDepartmentResult = updateDepartment(Department.trackingOptionID, responseCat.body.trackingCategories[i].trackingCategoryID.toString(), Department.name, null, Department.status.toString() === "ACTIVE" ? 1 : 0, company_id, 0);
                            }

                        }
                    }

                }



                //For Expenses
                await storeActivity("Expenses Synced", "-", "Expense", company_id, user_id);
                const responseExp = await xero.accountingApi.getInvoices(record[0].tenant_id, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                // const response = await xero.accountingApi.getInvoices(record[0].tenant_id, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                for (const Expense of responseExp.body.invoices) {
                    console.log("Expensessssss", Expense);
                    if (Expense.type === "ACCPAY") {
                        const checkTenantExpenseResult = await checkTenantExpense(Expense.invoiceID, company_id);
                        if (checkTenantExpenseResult[0].expense_count === 0) {
                            console.log("Expense ID: ", Expense.invoiceID);
                            console.log("Expense.lineItems.length", Expense.lineItems.length);
                            console.log("Tracking id", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0].trackingCategoryID : null);
                            // addXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, total_amount, company_id, user_id)
                            if (Expense.lineItems.length === 1) {
                                let vn = await getVendorByID(Expense.contact.contactID);
                                console.log("vendor", vn[0].name);
                                let gdpart = null;
                                let is_paid = "false";
                                let payment_ref_number = null;
                                let paid_amount = null;
                                let payment_date = null;
                                let category,location = null;
                                if (Expense.lineItems[0].tracking.length > 0) {
                                    for (let x = 0; x < Expense.lineItems[0].tracking.length; x++) {
                                        if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "departments") {
                                            // category = Expense.lineItems[0].tracking[x].option;
                                            category = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                        } else if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "locations") {
                                            // location = Expense.lineItems[0].tracking[x].option;
                                            location = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                        }
                                    }
                                }
                                if (Expense.payments.length > 0) {
                                    is_paid = "true";
                                    payment_ref_number = Expense.payments[0].reference;
                                    paid_amount = Expense.payments[0].amount;
                                    payment_date = Expense.payments[0].date;

                                    console.log("is_paid", is_paid);
                                    console.log("payment_ref_number", payment_ref_number);
                                    console.log("paid_amount", paid_amount);
                                    console.log("payment_date", payment_date);
                                }
                                // if (Expense.lineItems[0].tracking.length > 0) {
                                //     gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                //     console.log("GETED DEPART", gdpart);
                                //     console.log("category", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0] : null)
                                // }

                                let totalAmount = +Expense.lineItems[0].lineAmount + +Expense.lineItems[0].taxAmount;
                                const addExpenseResult = await addXeroExpense(Expense.invoiceID, 1, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[0].lineAmount , Expense.lineItems[0].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                            } else {
                                for (let i = 0; i < Expense.lineItems.length; i++) {
                                    let j = +i + +1;
                                    let vn = await getVendorByID(Expense.contact.contactID);
                                    console.log("vendor", vn[0].name);
                                    let gdpart = null;
                                    let is_paid = "false";
                                    let payment_ref_number = null;
                                    let paid_amount = null;
                                    let payment_date = null;
                                    let category,location = null;
                                    if (Expense.lineItems[i].tracking.length > 0) {
                                        for (let x = 0; x < Expense.lineItems[i].tracking.length; x++) {
                                            if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "departments") {
                                                // category = Expense.lineItems[0].tracking[x].option;
                                                category = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                            } else if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "locations") {
                                                // location = Expense.lineItems[0].tracking[x].option;
                                                location = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                            }
                                        }
                                    }
                                    if (Expense.payments.length > 0) {
                                        is_paid = "true";
                                        payment_ref_number = Expense.payments[0].reference;
                                        paid_amount = Expense.payments[0].amount;
                                        payment_date = Expense.payments[0].date;

                                        console.log("is_paid", is_paid);
                                        console.log("payment_ref_number", payment_ref_number);
                                        console.log("paid_amount", paid_amount);
                                        console.log("payment_date", payment_date);
                                    }
                                    // if (Expense.lineItems[i].tracking.length > 0) {
                                    //     gdpart = await getDepartByDepartName(Expense.lineItems[i].tracking[0].option, Expense.lineItems[i].tracking[0].trackingCategoryID);
                                    //     console.log("GETED DEPART", gdpart);
                                    //     console.log("category", Expense.lineItems[i].tracking.length > 0 ? Expense.lineItems[i].tracking[0] : null)
                                    // }
                                    let totalAmount = +Expense.lineItems[i].lineAmount + +Expense.lineItems[i].taxAmount;
                                    const addExpenseResult = await addXeroExpense(Expense.invoiceID, j, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[i].accountCode, null, Expense.lineItems[i].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, totalAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                                }
                            }
                        } else {
                            console.log("FOUND-------------------update:", Expense);
                            console.log("Expense.lineItems.length update", Expense.lineItems.length);

                            if (Expense.lineItems.length === 1) {
                                let vn = await getVendorByID(Expense.contact.contactID);
                                console.log("vendor", vn[0].name);
                                let gdpart = null;
                                let is_paid = "false";
                                let payment_ref_number = null;
                                let paid_amount = null;
                                let payment_date = null;
                                let category,location = null;
                                if (Expense.lineItems[0].tracking.length > 0) {
                                    for (let x = 0; x < Expense.lineItems[0].tracking.length; x++) {
                                        if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "departments") {
                                            // category = Expense.lineItems[0].tracking[x].option;
                                            category = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                        } else if (Expense.lineItems[0].tracking[x].name.toString().toLowerCase() === "locations") {
                                            // location = Expense.lineItems[0].tracking[x].option;
                                            location = await getDepartByDepartName(Expense.lineItems[0].tracking[x].option, Expense.lineItems[0].tracking[x].trackingCategoryID);
                                        }
                                    }
                                }
                                // if (Expense.lineItems[0].tracking.length > 0) {
                                //     console.log("Expense.lineItems[0].tracking[0]", Expense.lineItems[0].tracking[0]);
                                //     gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                //     console.log("GETED DEPART", gdpart);
                                //     console.log("category", Expense.lineItems[0].tracking.length > 0 ? Expense.lineItems[0].tracking[0] : null)
                                // }
                                if (Expense.payments.length > 0) {
                                    is_paid = "true";
                                    payment_ref_number = Expense.payments[0].reference;
                                    paid_amount = Expense.payments[0].amount;
                                    payment_date = Expense.payments[0].date;

                                    console.log("is_paid", is_paid);
                                    console.log("payment_ref_number", payment_ref_number);
                                    console.log("paid_amount", paid_amount);
                                    console.log("payment_date", payment_date);
                                }

                                // console.log(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null,vn[0].vendor_id!==undefined?vn[0].vendor_id:null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[i].accountCode,null,Expense.lineItems[i].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[i].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date,company_id, user_id);
                                // updateXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id)
                                let totalAmount = +Expense.lineItems[0].lineAmount + +Expense.lineItems[0].taxAmount;
                                const updateExpenseResult = await updateXeroExpense(Expense.invoiceID, 1, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[0].lineAmount , Expense.lineItems[0].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                                // console.log()
                            } else {
                                for (let i = 0; i < Expense.lineItems.length; i++) {
                                    let j = +i + +1;
                                    let vn = await getVendorByID(Expense.contact.contactID);
                                    console.log("vendor", vn[0].name);
                                    let gdpart = null;
                                    let is_paid = "false";
                                    let payment_ref_number = null;
                                    let paid_amount = null;
                                    let payment_date = null;
                                    let category,location = null;
                                    if (Expense.lineItems[i].tracking.length > 0) {
                                        for (let x = 0; x < Expense.lineItems[i].tracking.length; x++) {
                                            if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "departments") {
                                                // category = Expense.lineItems[0].tracking[x].option;
                                                category = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                                category = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                            } else if (Expense.lineItems[i].tracking[x].name.toString().toLowerCase() === "locations") {
                                                // location = Expense.lineItems[0].tracking[x].option;
                                                location = await getDepartByDepartName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID);
                                            }
                                        }
                                    }
                                    // if (Expense.lineItems[i].tracking.length > 0) {
                                    //     console.log("Expense.lineItems[0].tracking[0]", Expense.lineItems[0].tracking[0]);
                                    //     gdpart = await getDepartByDepartName(Expense.lineItems[i].tracking[0].option, Expense.lineItems[i].tracking[0].trackingCategoryID);
                                    //     console.log("GETED DEPART", gdpart);
                                    //     console.log("category", Expense.lineItems[i].tracking.length > 0 ? Expense.lineItems[i].tracking[0] : null)
                                    // }
                                    if (Expense.payments.length > 0) {
                                        is_paid = "true";
                                        payment_ref_number = Expense.payments[0].reference;
                                        paid_amount = Expense.payments[0].amount;
                                        payment_date = Expense.payments[0].date;

                                        console.log("is_paid", is_paid);
                                        console.log("payment_ref_number", payment_ref_number);
                                        console.log("paid_amount", paid_amount);
                                        console.log("payment_date", payment_date);
                                    }
                                    console.log("Line item ", i);
                                    // console.log(Expense.invoiceID, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[i].accountCode, null, Expense.lineItems[i].description, gdpart !== null ? gdpart[0].depart_id : null, Expense.lineItems[i].unitAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id);
                                    // updateXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id)
                                    let totalAmount = +Expense.lineItems[i].lineAmount + +Expense.lineItems[i].taxAmount;
                                    const updateExpenseResult = await updateXeroExpense(Expense.invoiceID, j, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[i].accountCode, null, Expense.lineItems[i].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[i].lineAmount , Expense.lineItems[i].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                                    // console.log()
                                }
                            }
                        }

                        if (Expense.hasAttachments === true) {
                            console.log("Line item", Expense.lineItems[0])
                            // console.log("aaa");
                            try {
                                const responseAttachment = await xero.accountingApi.getInvoiceAttachments(record[0].tenant_id, Expense.invoiceID);
                                for (let i = 0; i < responseAttachment.body.attachments.length; i++) {
                                    console.log("attachment", i);
                                    console.log("attachment:::", responseAttachment.body.attachments[i])
                                    let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[i].attachmentID, Expense.invoiceID);
                                    if (checkAttachableResult[0].attach_count === 0) {
                                        // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                        let addAttachableResult = await addAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                        console.log("attachable inserted", Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                    } else {
                                        console.log("attachable inserted", Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                        let updateAttachableResult = await updateAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[i].fileName, responseAttachment.body.attachments[i].url, responseAttachment.body.attachments[i].contentLength, responseAttachment.body.attachments[i].attachmentID, null, null);
                                    }

                                }
                            } catch (e) {
                                console.log("Error", e);
                            }
                        }
                    }
                }
            } else {
                return res.json({
                    status: 200,
                    message: "Xero Token Expired."
                })
            }

            return res.json({
                status: 200,
                message: "All Data synced successfully!",
                user: user,
                company: record
            })
        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log(err);
            return res.json({
                status: 500,
                message: "Error while syncing all data, Please try again."
            })
            // return false;
        }

        // return true;


    },
    syncDepartments: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const record = await getActivateCompany(user_id);
            const user = await getUserById(user_id);
            console.log("recordrecord", record);
            // console.log(user);

            const TS = new TokenSet({
                id_token: user[0].xero_id_token,
                access_token: user[0].xero_access_token,
                refresh_token: user[0].xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            console.log("token set:", TS);
            await storeActivity("Categories Synced", "-", "Category", company_id, user_id);
            await xero.setTokenSet(TS);

            // const xeroTenantId = 'YOUR_XERO_TENANT_ID';
            // const where = 'Status=="ACTIVE"';
            const order = 'Name ASC';
            const includeArchived = true;

            await setAllDepartStatusToZero(company_id);
            const response = await xero.accountingApi.getTrackingCategories(record[0].tenant_id, null, order, includeArchived);
            // console.log("result:::",response.body.trackingCategories[0].options)
            // console.log("response.body.trackingCategories.length",response.body.trackingCategories.length);
            if (response.body.trackingCategories.length > 0) {

                for (let i = 0; i < response.body.trackingCategories.length; i++) {
                    console.log("categories", i, ":::", response.body.trackingCategories[i])
                    for (const Department of response.body.trackingCategories[i].options) {
                        console.log("Department.trackingOptionID", Department);
                        // this.stop();
                        const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID, company_id);
                        if (checkTenantDepartmentResult[0].depart_count === 0) {
                            console.log("Depart id", Department.trackingOptionID);
                            console.log("Name", Department.name);
                            console.log("Status", Department.status);
                            console.log()

                            const addDepartmentResult = addDepartment(Department.trackingOptionID, response.body.trackingCategories[i].trackingCategoryID, Department.name, null, Department.status.toString() === "ACTIVE" ? 1 : 0, company_id, user_id, 0);
                        } else {
                            console.log("depart found")
                            console.log("main category", response.body.trackingCategories[i].trackingCategoryID);
                            const updateDepartmentResult = updateDepartment(Department.trackingOptionID, response.body.trackingCategories[i].trackingCategoryID.toString(), Department.name, null, Department.status.toString() === "ACTIVE" ? 1 : 0, company_id, 0);
                        }

                    }
                }

            } else {
                return res.json({
                    status: 200,
                    message: "No category found."
                })
            }

        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log(err);
            return res.json({
                status: 500,
                message: "Categories synced failed, Please try again."
            })
        }

        return res.json({
            status: 200,
            message: "Categories synced successfully!"
        })

    },
    viewAttachment: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const attach_id = req.params.attach_id;
            console.log("attach_id", attach_id);
            console.log("user_id", user_id);
            // const company_id = req.params.company_id;

            const userData = await getUserById(user_id);
            let record;
            let userFortoken;

            console.log("")
            if (userData[0].role_id === 1) {
                userFortoken = await getUserById(user_id);
                record = await getActivateCompany(user_id);
            } else {
                record = await getCompanyById(userData[0].company_id);
                userFortoken = await getUserById(userData[0].created_by);
            }

            const token = refreshToken(userFortoken[0].email);

            const user = await getUserById(userFortoken[0].id);


            console.log("userData", userData)
            console.log("user", user)
            console.log("record", record)

            const attachment = await getAttachment(attach_id);
            console.log("record",record);
            console.log("attachment",attachment);
            // console.log(user);

            const TS = new TokenSet({
                id_token: user[0].xero_id_token,
                access_token: user[0].xero_access_token,
                refresh_token: user[0].xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            console.log(TS);
            await xero.setTokenSet(TS);

            const contentType = 'image/jpg';
            console.log(record[0].tenant_id, attachment[0].expense_id, attach_id, contentType);
            const response = await xero.accountingApi.getInvoiceAttachmentById(record[0].tenant_id, attachment[0].expense_id, attach_id, contentType);
            console.log("statusCode",response.response.statusCode);
            console.log("image", response.body);
            return res.json({
                arrayBuffer: response.body
            });
        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log(err);
            return res.json({
                status: 500,
                message: "Loading attachment failed"
            })
        }
    },
    syncVendors: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const record = await getActivateCompany(user_id);
            const user = await getUserById(user_id);
            console.log("record", record);
            console.log("user", user);
            // console.log(user);

            const TS = new TokenSet({
                id_token: user[0].xero_id_token,
                access_token: user[0].xero_access_token,
                refresh_token: user[0].xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            console.log("token set:", TS);
            await storeActivity("Suppliers Synced", "-", "Supplier", company_id, user_id);
            await xero.setTokenSet(TS);
            //
            // // const xeroTenantId = 'YOUR_XERO_TENANT_ID';
            // // const where = 'Status=="ACTIVE"';
            const ifModifiedSince = new Date(moment(new Date()).subtract(1, 'days').toISOString());
            const where = 'ContactStatus=="ACTIVE"';
            const order = null;
            const iDs = null;
            const page = 1;
            const includeArchived = true;
            const summaryOnly = false;
            const searchTerm = null;

            console.log("tokenSeT", xero.readTokenSet().expired());
            if (xero.readTokenSet().expired() === false) {
                console.log("record[0].tenant_id", record[0].tenant_id);
                const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
                if (response.body.contacts.length > 0) {
                    for (const Contact of response.body.contacts) {

                        let vendor_id = Contact.contactID;
                        let name = Contact.name;
                        let acct_num = Contact.accountNumber !== undefined ? Contact.accountNumber : null;
                        let status = Contact.contactStatus === 'ACTIVE' ? 1 : 0;
                        let email = Contact.emailAddress;
                        let address1 = Contact.addresses[0].addressLine1 !== undefined ? Contact.addresses[0].addressLine1 : "";
                        let address2 = Contact.addresses[0].addressLine2 !== undefined ? Contact.addresses[0].addressLine2 : "";
                        let address3 = Contact.addresses[0].addressLine3 !== undefined ? Contact.addresses[0].addressLine3 : "";
                        let address4 = Contact.addresses[0].addressLine4 !== undefined ? Contact.addresses[0].addressLine4 : "";
                        let address = address1 + address2 + address3 + address4;
                        let city = Contact.addresses[0].city;
                        let postalCode = Contact.addresses[0].postalCode;
                        let region = Contact.addresses[0].region;
                        let country = Contact.addresses[0].country;
                        let contact = null;
                        let mobile = null;
                        // if(Contact.contactNumber === undefined) {
                        //     contact = Contact.phones[1].phoneCountryCode!==undefined? Contact.phones[1].phoneAreaCode + Contact.phones[1].phoneNumber:null;
                        //     mobile = Contact.phones[3].phoneCountryCode!==undefined? Contact.phones[3].phoneAreaCode + Contact.phones[3].phoneNumber:null;
                        // }
                        // else {
                        contact = Contact.phones[1].phoneCountryCode !== undefined ? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneAreaCode + Contact.phones[1].phoneNumber : null;
                        mobile = Contact.phones[3].phoneCountryCode !== undefined ? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneAreaCode + Contact.phones[3].phoneNumber : null;
                        // }

                        let website = Contact.website !== undefined ? Contact.website : null;
                        let balance = Contact.balances !== undefined ? Contact.balances : null;
                        let date = Contact.updatedDateUTC;
                        console.log(Contact)
                        console.log(vendor_id);
                        console.log(name);
                        console.log(status);
                        console.log(acct_num);
                        console.log(email);
                        console.log(address !== "" ? address + " " + city + " " + postalCode : null);
                        console.log(contact);
                        console.log("Contact", Contact.phones[1])
                        console.log(mobile);
                        console.log("Mobile", Contact.phones[3])
                        console.log(website);
                        console.log(null);
                        console.log(date);
                        console.log("-----------")
                        const checkTenantVendorResult = await checkTenantVendor(vendor_id, company_id);
                        if (checkTenantVendorResult[0].vendor_count === 0) {
                            // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                            // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                            // console.log("address",address);
                            console.log(vendor_id, name, contact, mobile, email, website, address !== "" ? address : null, city !== undefined ? city : null, region != undefined ? region : null, country != undefined ? country : null, postalCode != undefined ? postalCode : null, null, acct_num, record[0].currency, status, 'xero', company_id, user_id, date, date);
                            const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address !== "" ? address : null, city !== undefined ? city : null, region != undefined ? region : null, country != undefined ? country : null, postalCode != undefined ? postalCode : null, 0, acct_num, record[0].currency, status, 'xero', company_id, user_id, date, date);
                            console.log("added");
                        } else {
                            console.log("found ", vendor_id);
                            const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address !== "" ? address : null, city !== undefined ? city : null, region != undefined ? region : null, country != undefined ? country : null, postalCode != undefined ? postalCode : null, 0, acct_num, record[0].currency, status, 'xero', company_id, user_id, date, date);
                            console.log("updated");
                        }
                        // console.log(Contact);
                    }
                }
                // const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
            }

        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log(err);
            return res.json({
                status: 500,
                message: "Suppliers synced failed, Please try again."
            })
        }

        return res.json({
            status: 200,
            message: "Suppliers synced successfully!"
        })

    },
};