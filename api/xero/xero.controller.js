const {TokenSet} = require("openid-client");
const {hashSync,genSaltSync,compareSync} = require("bcrypt");
const crypto = require('crypto');
const strtotime = require('strtotime');

const{
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
    getAttachment
} = require("./xero.service");

const {
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
    updateUserCompanyResult
} = require("../users/user.service");

const {XeroClient} = require("xero-node");
const jwt = require('jsonwebtoken');
const request = require('request');
const moment = require('moment-timezone');
const {getDepartByDepartName} = require("../users/user.service");
const {getDepartByDepartID} = require("../users/user.service");
const {getVendorByID} = require("../users/user.service");
const {updateVendor} = require("../quickbook/quickbook.service");
const {addVendor} = require("../quickbook/quickbook.service");
const {checkTenantVendor} = require("../quickbook/quickbook.service");
const {updateAttachable} = require("../quickbook/quickbook.service");
const {addAttachable} = require("../quickbook/quickbook.service");
const {getCompany} = require("../users/user.service");
const {sign} = require("jsonwebtoken");
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

let xero_clintid= process.env.XERO_CLIENT_ID;
let xero_secretid = process.env.XERO_SECRET_ID;
let scope = 'openid profile email accounting.transactions offline_access accounting.settings accounting.attachments accounting.contacts'.split(" ");

let callbackurl="http://localhost:3000/api/xero/xero_callback";
//let callbackurl="https://wepullbackend.herokuapp.com/api/xero/xero_callback";
const xero = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_SECRET_ID,
    redirectUris: [process.env.XERO_REDIRECT_URI],
    scopes: scope,
    state: 'returnPage=my-sweet-dashboard', // custom params (optional)
    httpTimeout: 100000 // ms (optional)
});

async function xero_get_tenant(access_token){
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

    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
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

async function getExpense(access_token, tenantID) {
    //
    try{
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

        return new Promise(function (resolve, reject) {
            request(options, function (error, res, body) {
                if (!error && res.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });    }
    catch (e) {
        console.log("Error")
        console.log(e.message);
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

module.exports = {
    xero_url: async (req, res) => {
        let consentUrl = await xero.buildConsentUrl();
        // console.log("eerror");
        res.redirect(consentUrl);
    },
    xero_callback: async (req, res) => {
        // await xero.initialize();
        try {
            const tokenSet = await xero.apiCallback(req.url);
            tokenset = tokenSet;
            console.log("tokenSet",tokenSet)
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

            let tenantArray = JSON.parse(activeTenant);
            // console.log("tenants ", tenantArray);

            const checkUserEmailResult = await checkUserEmail(email);
            const checkUserCompanyResult = await checkUserCompany(tenantName);
            const checkUserQuickbookResult = await checkUserQuickbook(email);

            const order = 'Name ASC';
            //Check if email exist as quickbooks account
            if(checkUserQuickbookResult[0].count_quickbook==0) {
                //Good to go
                if (checkUserEmailResult[0].count_user === 0) {
                    //Sign up Execution

                    //Create Xero user in users table
                    const token = crypto.randomBytes(48).toString('hex');
                    const createUsersResult = await xeroSignUp(first_name,last_name, email,xero_userid, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token);

                    //get all tenants from api callback
                    for (const tenant of tenantArray) {
                        console.log(tenant.tenantId);
                        console.log(tenant.tenantName);
                        console.log(tenant.tenantType);
                        console.log(tenant.createdDateUtc);
                        // const orderc = 'Code ASC';

                        const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId,  null, null);

                        const createCompanyResult = await createCompany(tenant.tenantId,tenant.tenantName,tenant.createdDateUtc, tenant.tenantType, null, currencyResponse.body.currencies[0].code,null,null,createUsersResult.insertId);
                        // const updateUserCompanyResult = await updateUserCompanyResult(createCompanyResult.insertId,createUsersResult.insertId);
                        const createUserRoleResult = await createUserRole(createUsersResult.insertId, createCompanyResult.insertId, null, 1, null);

                        //Get Accounts
                        try {
                            //getting all account by tenant id
                            const response = await xero.accountingApi.getAccounts(tenant.tenantId, null, null, order);
                            // console.log(typeof response.body.accounts);
                            let res = response.body.accounts;
                            for (const Account of res) {
                                console.log("Company ID:",createCompanyResult.insertId, "Account ID: ", Account.accountID);

                                //Check if tenant account already exist
                                const checkTenantAccountResult = await checkTenantAccount(Account.accountID,createCompanyResult.insertId);
                                console.log("count:",checkTenantAccountResult[0].account_count);
                                if(checkTenantAccountResult[0].account_count === 0) {
                                    console.log(createCompanyResult.insertId ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
                                    const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, createCompanyResult.insertId, createUsersResult.insertId,"xero");
                                }
                            }
                        } catch (err) {
                            const error = JSON.stringify(err.response, null, 2)
                            console.log(`Status Code: ${err.response} => ${error}`);
                        }

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
                            console.log("record[0].tenant_id",tenant.tenantId);
                            const responseVendor = await xero.accountingApi.getContacts(tenant.tenantId, VifModifiedSince, Vwhere, Vorder, ViDs, Vpage, VincludeArchived, VsummaryOnly, VsearchTerm);
                            if(responseVendor.body.contacts.length>0) {
                                for(const Contact of responseVendor.body.contacts) {
                                    let vendor_id = Contact.contactID;
                                    let name = Contact.name;
                                    let acct_num = Contact.accountNumber!==undefined?Contact.accountNumber:null;
                                    let status = Contact.contactStatus==='ACTIVE'?1:0;
                                    let email = Contact.emailAddress;
                                    let address1 =  Contact.addresses[0].addressLine1!==undefined? Contact.addresses[0].addressLine1:"";
                                    let address2 =  Contact.addresses[0].addressLine2!==undefined? Contact.addresses[0].addressLine2:"";
                                    let address3 =  Contact.addresses[0].addressLine3!==undefined? Contact.addresses[0].addressLine3:"";
                                    let address4 =  Contact.addresses[0].addressLine4!==undefined? Contact.addresses[0].addressLine4:"";
                                    let address = address1 + address2 + address3 + address4;
                                    let city = Contact.addresses[0].city;
                                    let postalCode = Contact.addresses[0].postalCode;
                                    let country = Contact.addresses[0].country;
                                    let contact = Contact.phones[1].phoneCountryCode!==undefined? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneNumber:null;
                                    let mobile = Contact.phones[3].phoneCountryCode!==undefined? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneNumber:null;
                                    let website = Contact.website!==undefined?Contact.website:null;
                                    let balance = Contact.balances!==undefined?Contact.balances:null;
                                    let date = Contact.updatedDateUTC;
                                    console.log(vendor_id);
                                    console.log(name);
                                    console.log(status);
                                    console.log(acct_num);
                                    console.log(email);
                                    console.log(address!==""?address:null);
                                    console.log(contact);
                                    console.log(mobile);
                                    console.log(website);
                                    console.log(null);
                                    console.log(date);
                                    console.log("-----------")
                                    const checkTenantVendorResult = await checkTenantVendor(vendor_id,company_id);
                                    if(checkTenantVendorResult[0].vendor_count === 0) {
                                        // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                                        // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                                        // console.log("address",address);
                                        console.log(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, null, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', 'USD', createUsersResult.insertId, date, date);
                                        const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, 'USD', status, 'xero', createCompanyResult.insertId, createUsersResult.insertId, date, date);
                                        console.log("added");
                                    }
                                    else {
                                        console.log("found ",vendor_id);
                                        const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, 'USD', status, 'xero', createCompanyResult.insertId, createUsersResult.insertId, date, date);
                                        console.log("updated");
                                    }
                                    // console.log(Contact);
                                }
                            }
                            // const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
                        // }

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
                        for(const Expense of response.body.invoices) {
                            if(Expense.type === "ACCPAY") {
                                const getExpenseCountResult = await checkTenantExpense(Expense.invoiceID, createCompanyResult.insertId);
                                if (getExpenseCountResult[0].expense_count === 0) {
                                    console.log(Expense)
                                    // console.log("Company id",getCompanyByTenantResult)
                                    console.log()
                                    let vn = await getVendorByID(Expense.contact.contactID);
                                    console.log("vendor", vn[0].name);
                                    const addExpenseResult = await addXeroExpense(Expense.invoiceID, Expense.date, Expense.updatedDateUTC, null, vn[0].name!==undefined?vn[0].name:null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0].trackingCategoryID:null, Expense.lineItems[0].unitAmount, createCompanyResult.insertId, createUsersResult.insertId)
                                    // const addExpenseResult = await addXeroExpense(Expense.invoiceID, Expense.date, Expense.updatedDateUTC, null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, Expense.lineItems[0].description, null, Expense.lineItems[0].unitAmount, createCompanyResult.insertId, createUsersResult.insertId)
                                }
                                else {
                                    let vn = await getVendorByID(Expense.contact.contactID);
                                    console.log("vendor", vn[0].name);
                                    const updateExpenseResult = await updateXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0].trackingCategoryID:null,Expense.lineItems[0].unitAmount, createCompanyResult.insertId, createUsersResult.insertId)
                                }
                            }

                            if(Expense.hasAttachments === true) {
                                console.log("Line item", Expense.lineItems[0])
                                console.log("aaa");
                                try {
                                    const responseAttachment = await xero.accountingApi.getInvoiceAttachments(tenant.tenantId, Expense.invoiceID);
                                    console.log(responseAttachment.body.attachments[0]);
                                    let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[0].attachmentID,Expense.invoiceID);
                                    if(checkAttachableResult[0].attach_count === 0) {
                                        // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                        let addAttachableResult = await addAttachable(Expense.invoiceID,  createCompanyResult.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                        console.log("attachable inserted",Expense.invoiceID,  createCompanyResult.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                    }
                                    else {
                                        let updateAttachableResult = await updateAttachable(Expense.invoiceID, createCompanyResult.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                    }
                                    console.log("aaa1");
                                    console.log("attachment:::",responseAttachment.body.attachments)
                                }
                                catch (e) {
                                    console.log("Error",e);
                                }
                            }
                        }

                        //Get Departments
                        const orderDep = 'Name ASC';
                        const includeArchivedDep = true;
                        const responseDep = await xero.accountingApi.getTrackingCategories(tenant.tenantId,  null, orderDep, includeArchivedDep);
                        console.log("result:::",responseDep.body.trackingCategories.length)
                        if(responseDep.body.trackingCategories.length>0) {
                            for(const Department of responseDep.body.trackingCategories[0].options) {
                                const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID,createCompanyResult.insertId);
                                if(checkTenantDepartmentResult[0].depart_count === 0) {
                                    console.log("Depart id",Department.trackingOptionID);
                                    console.log("Name",Department.name);
                                    console.log("Status",Department.status);
                                    console.log()
                                    const addDepartmentResult = addDepartment(Department.trackingOptionID, Department.name,null,Department.status==="ACTIVE"?1:0, createCompanyResult.insertId, createUsersResult.insertId,0);
                                }
                                else {
                                    console.log("depart found")
                                    const updateDepartmentResult = updateDepartment(Department.trackingOptionID, Department.name,null,Department.status==="ACTIVE"?1:0, createCompanyResult.insertId,0);
                                }
                            }
                        }
                    }

                    // const disableAllCompanyResult = await disableAllCompany(getUserByUserEmailResult.id);
                    const getCompanyByTenantResult = await getCompanyByTenant(tenantArray[0].tenantId)
                    const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);
                    // const updateUserCompanyResult = await updateUserCompany(createUsersResult.insertId, createCompanyResult.insertId);
                    res.redirect(`${process.env.APP_URL}auth_login/`+ encodeURIComponent(email)+`/xero/0/`+ token);
                }
                else {
                    //Login Execution
                    const token = crypto.randomBytes(48).toString('hex');
                    const updateLoginTokenResult = await updateXeroLoginToken(email, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at);
                    const getUserByUserEmailResult = await getUserByUserEmail(email);

                    const getCompanyResult = await getCompany(getUserByUserEmailResult.id);
                    // console.log(getCompanyResult);
                    for (const tenant of tenantArray) {
                        const getCompanyByTenantResult = await getCompanyByTenant(tenant.tenantId)
                        //Check weather company exist or not
                        if(getCompanyByTenantResult.length > 0) {
                            //Execute if company already exist by tenant id

                            //Get currency
                            await xero.setTokenSet(tokenSet);

                            // const xeroTenantId = 'YOUR_XERO_TENANT_ID';
                            // const where = 'Code=="USD"';



                            //Get all account of existing company
                            const response = await xero.accountingApi.getAccounts(tenant.tenantId, null, null, order);
                            // console.log(typeof response.body.accounts);
                            let res = response.body.accounts;
                            for (const Account of res) {
                                // console.log("Company ID:",company.id, "Account ID: ", Account.accountID);
                                //get company by tenant id
                                console.log("company by tenant length of tenant", tenant.tenantId , " : " ,getCompanyByTenantResult.length);
                                const checkTenantAccountResult = await checkTenantAccount(Account.accountID,getCompanyByTenantResult[0].id);
                                // console.log("count:",checkTenantAccountResult[0].account_count);
                                console.log("account id:",Account.accountID,"company id:",getCompanyByTenantResult[0].id,"count:",checkTenantAccountResult[0].account_count);
                                if(checkTenantAccountResult[0].account_count === 0) {
                                    console.log(getCompanyByTenantResult[0].id ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
                                    const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,"xero");
                                }
                            }



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
                            console.log("record[0].tenant_id",tenant.tenantId);
                            const responseVendor = await xero.accountingApi.getContacts(tenant.tenantId, VifModifiedSince, Vwhere, Vorder, ViDs, Vpage, VincludeArchived, VsummaryOnly, VsearchTerm);
                            if(responseVendor.body.contacts.length>0) {
                                for(const Contact of responseVendor.body.contacts) {
                                    let vendor_id = Contact.contactID;
                                    let name = Contact.name;
                                    let acct_num = Contact.accountNumber!==undefined?Contact.accountNumber:null;
                                    let status = Contact.contactStatus==='ACTIVE'?1:0;
                                    let email = Contact.emailAddress;
                                    let address1 =  Contact.addresses[0].addressLine1!==undefined? Contact.addresses[0].addressLine1:"";
                                    let address2 =  Contact.addresses[0].addressLine2!==undefined? Contact.addresses[0].addressLine2:"";
                                    let address3 =  Contact.addresses[0].addressLine3!==undefined? Contact.addresses[0].addressLine3:"";
                                    let address4 =  Contact.addresses[0].addressLine4!==undefined? Contact.addresses[0].addressLine4:"";
                                    let address = address1 + address2 + address3 + address4;
                                    let city = Contact.addresses[0].city;
                                    let postalCode = Contact.addresses[0].postalCode;
                                    let country = Contact.addresses[0].country;
                                    let contact = Contact.phones[1].phoneCountryCode!==undefined? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneNumber:null;
                                    let mobile = Contact.phones[3].phoneCountryCode!==undefined? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneNumber:null;
                                    let website = Contact.website!==undefined?Contact.website:null;
                                    let balance = Contact.balances!==undefined?Contact.balances:null;
                                    let date = Contact.updatedDateUTC;
                                    console.log(vendor_id);
                                    console.log(name);
                                    console.log(status);
                                    console.log(acct_num);
                                    console.log(email);
                                    console.log(address!==""?address:null);
                                    console.log(contact);
                                    console.log(mobile);
                                    console.log(website);
                                    console.log(null);
                                    console.log(date);
                                    console.log("-----------")
                                    const checkTenantVendorResult = await checkTenantVendor(vendor_id,getCompanyByTenantResult[0].id);
                                    if(checkTenantVendorResult[0].vendor_count === 0) {
                                        // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                                        // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                                        // console.log("address",address);
                                        console.log(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, null, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                                        const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                                        console.log("added");
                                    }
                                    else {
                                        console.log("found ",vendor_id);
                                        const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, getCompanyByTenantResult[0].currency, status, 'xero', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, date, date);
                                        console.log("updated");
                                    }
                                    // console.log(Contact);
                                }
                            }
                            // const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
                            // }

                            //Get Expense of existing company
                            const page = 1;
                            const includeArchived = true;
                            const createdByMyApp = false;
                            const unitdp = 4;
                            const summaryOnly = false;
                            const responseExp = await xero.accountingApi.getInvoices(tenant.tenantId, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                            console.log("Expense length on company add",responseExp.body.invoices.length);
                            // console.log(response.body || response.response.statusCode)
                            // let expenseArray = JSON.parse(response.body.invoices);
                            //

                            // console.log("Expense",responseExp.body.invoices);
                            // this.stop();
                            for(const Expense of responseExp.body.invoices) {
                                if(Expense.type === "ACCPAY") {
                                    const getExpenseCountResult = await checkTenantExpense(Expense.invoiceID, getCompanyByTenantResult[0].id);
                                    if (getExpenseCountResult[0].expense_count === 0) {
                                        console.log(Expense)
                                        // console.log("Company id",getCompanyByTenantResult)
                                        console.log()
                                        let vn = await getVendorByID(Expense.contact.contactID);
                                        console.log("vendor", vn[0].name);
                                        let gdpart = null;
                                        if(Expense.lineItems[0].tracking.length>0) {
                                            gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                            console.log("GETED DEPART", gdpart);
                                            console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                                        }
                                        // expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id
                                        const addExpenseResult = await addXeroExpense(Expense.invoiceID, Expense.date, Expense.updatedDateUTC, null, vn[0].name!==undefined?vn[0].name:null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, gdpart!==null?gdpart[0].depart_id:null, Expense.lineItems[0].unitAmount, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                    }
                                    else {
                                        let vn = await getVendorByID(Expense.contact.contactID);
                                        console.log("vendor", vn[0].name);
                                        let gdpart = null;
                                        if(Expense.lineItems[0].tracking.length>0) {
                                            gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                            console.log("GETED DEPART", gdpart);
                                            console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                                        }
                                        const updateExpenseResult = await updateXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                    }
                                }

                                if(Expense.hasAttachments === true) {
                                    console.log("Line item", Expense.lineItems[0])
                                    console.log("aaa");
                                    try {
                                        const responseAttachment = await xero.accountingApi.getInvoiceAttachments(tenant.tenantId, Expense.invoiceID);
                                        console.log(responseAttachment.body.attachments[0]);
                                        let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[0].attachmentID,Expense.invoiceID);
                                        if(checkAttachableResult[0].attach_count === 0) {
                                            // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                            let addAttachableResult = await addAttachable(Expense.invoiceID,  getCompanyByTenantResult[0].id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                            console.log("attachable inserted",Expense.invoiceID,  getCompanyByTenantResult[0].id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                        }
                                        else {
                                            let updateAttachableResult = await updateAttachable(Expense.invoiceID, getCompanyByTenantResult[0].id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                        }
                                        console.log("aaa1");
                                        console.log("attachment:::",responseAttachment.body.attachments)
                                    }
                                    catch (e) {
                                        console.log("Error",e);
                                    }
                                }
                            }

                            //Get Departments of existing company
                            const orderDep = 'Name ASC';
                            const includeArchivedDep = true;
                            const responseDep = await xero.accountingApi.getTrackingCategories(tenant.tenantId,  null, orderDep, includeArchivedDep);
                            console.log("result:::",responseDep.body.trackingCategories.length)
                            if(responseDep.body.trackingCategories.length>0) {
                                for(const Department of responseDep.body.trackingCategories[0].options) {
                                    const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID,getCompanyByTenantResult[0].id);
                                    if(checkTenantDepartmentResult[0].depart_count === 0) {
                                        console.log("Depart id",Department.trackingOptionID);
                                        console.log("Name",Department.name);
                                        console.log("Status",Department.status);
                                        console.log()
                                        const addDepartmentResult = addDepartment(Department.trackingOptionID, Department.name,null,Department.status==="ACTIVE"?1:0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,0);
                                    }
                                    else {
                                        console.log("depart found")
                                        const updateDepartmentResult = updateDepartment(Department.trackingOptionID, Department.name,null,Department.status==="ACTIVE"?1:0, getCompanyByTenantResult[0].id,0);
                                    }
                                }
                            }

                            // const order = 'Code ASC';

                            const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId,  null, null);

                            const updateCompanyCodeResult = await updateCompanyInfo(tenant.tenantId, currencyResponse.body.currencies[0].code,tenant.tenantName);
                        }
                        else {
                            //Add new company

                            //Create new company on add company after login
                            // const order = 'Code ASC';

                            const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId,  null, null);
                            // console.log(currencyResponse.body.currencies[0].code);

                            const createCompanyResultt = await createCompany(tenant.tenantId,tenant.tenantName,tenant.createdDateUtc, tenant.tenantType, null, currencyResponse.body.currencies[0].code,null,null,getUserByUserEmailResult.id);
                            //Create role of user company
                            const createUserRoleResult = await createUserRole(getUserByUserEmailResult.id, createCompanyResultt.insertId, null, 1, null);
                            console.log("register company tenant",tenant.tenantId);
                            console.log("created company id ",createCompanyResultt.insertId);

                            //Get Account  on company add function
                            const response = await xero.accountingApi.getAccounts(tenant.tenantId, null, null, order);
                            // console.log(typeof response.body.accounts);
                            let res = response.body.accounts;

                            for (const Account of res) {
                                // console.log("Company ID:",company.id, "Account ID: ", Account.accountID);
                                //get company by tenant id
                                const getCompanyByTenantResult = await getCompanyByTenant(tenant.tenantId)
                                console.log("company by tenant length of tenant", tenant.tenantId , " : " ,getCompanyByTenantResult.length);
                                const checkTenantAccountResult = await checkTenantAccount(Account.accountID,getCompanyByTenantResult[0].id);
                                // console.log("count:",checkTenantAccountResult[0].account_count);
                                console.log("account id:",Account.accountID,"company id:",getCompanyByTenantResult[0].id,"count:",checkTenantAccountResult[0].account_count);
                                if(checkTenantAccountResult[0].account_count === 0) {
                                    console.log(getCompanyByTenantResult[0].id ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
                                    const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, createCompanyResultt.insertId, getUserByUserEmailResult.id,"xero");
                                }
                            }


                            //Get Expense on company add function
                            const page = 1;
                            const includeArchived = true;
                            const createdByMyApp = false;
                            const unitdp = 4;
                            const summaryOnly = false;

                            const response1 = await xero.accountingApi.getInvoices(tenant.tenantId, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
                            console.log(response1.body.invoices);
                            for(const Expense of response1.body.invoices) {
                                if(Expense.type === "ACCPAY") {
                                    console.log(Expense)
                                    // console.log("Company id",getCompanyByTenantResult)
                                    console.log()
                                    const getExpenseCountResult = await checkTenantExpense(Expense.invoiceID, createCompanyResultt.insertId);
                                    console.log("checking expense for ",Expense.invoiceID,' and ', createCompanyResultt.insertId);
                                    if(getExpenseCountResult[0].expense_count === 0) {
                                        console.log("expense created ",Expense.invoiceID,' and ', createCompanyResultt.insertId);
                                        let vn = await getVendorByID(Expense.contact.contactID);
                                        console.log("vendor", vn[0].name);
                                        let gdpart = null;
                                        if(Expense.lineItems[0].tracking.length>0) {
                                            gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                            console.log("GETED DEPART", gdpart);
                                            console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                                        }
                                        const addExpenseResult = await addXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount,createCompanyResultt.insertId, getUserByUserEmailResult.id);
                                    }
                                    else {
                                        console.log(" Update Expense already exist:",Expense.invoiceID);
                                        let vn = await getVendorByID(Expense.contact.contactID);
                                        console.log("vendor", vn[0].name);
                                        let gdpart = null;
                                        if(Expense.lineItems[0].tracking.length>0) {
                                            gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                                            console.log("GETED DEPART", gdpart);
                                            console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                                        }
                                        const updateExpenseResult = await updateXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null, createCompanyResultt.insertId, getUserByUserEmailResult.id)
                                    }
                                }

                                if(Expense.hasAttachments === true) {
                                    console.log("Line item", Expense.lineItems[0])
                                    console.log("aaa");
                                    try {
                                        const responseAttachment = await xero.accountingApi.getInvoiceAttachments(tenant.tenantId, Expense.invoiceID);
                                        console.log(responseAttachment.body.attachments[0]);
                                        let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[0].attachmentID,Expense.invoiceID);
                                        if(checkAttachableResult[0].attach_count === 0) {
                                            // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                            let addAttachableResult = await addAttachable(Expense.invoiceID,  createCompanyResultt.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                            console.log("attachable inserted",Expense.invoiceID,  createCompanyResultt.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                        }
                                        else {
                                            let updateAttachableResult = await updateAttachable(Expense.invoiceID,  createCompanyResultt.insertId, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                        }
                                        console.log("aaa1");
                                        console.log("attachment:::",responseAttachment.body.attachments)
                                    }
                                    catch (e) {
                                        console.log("Error",e);
                                    }
                                }
                            }

                            //Get Departments on company add function
                            const orderDep = 'Name ASC';
                            const includeArchivedDep = true;
                            const responseDep = await xero.accountingApi.getTrackingCategories(tenant.tenantId,  null, orderDep, includeArchivedDep);
                            console.log("result:::",responseDep.body.trackingCategories.length)
                            if(responseDep.body.trackingCategories.length>0) {
                                for(const Department of responseDep.body.trackingCategories[0].options) {
                                    const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID,getCompanyByTenantResult[0].id);
                                    if(checkTenantDepartmentResult[0].depart_count === 0) {
                                        console.log("Depart id",Department.trackingOptionID);
                                        console.log("Name",Department.name);
                                        console.log("Status",Department.status);
                                        console.log()
                                        const addDepartmentResult = addDepartment(Department.trackingOptionID, Department.name,null,Department.status==="ACTIVE"?1:0,createCompanyResultt.insertId, getUserByUserEmailResult.id,0);
                                    }
                                    else {
                                        console.log("depart found")
                                        const updateDepartmentResult = updateDepartment(Department.trackingOptionID, Department.name,null,Department.status==="ACTIVE"?1:0, createCompanyResultt.insertId,0);
                                    }
                                }
                            }
                        }
                    }
                    // const updateCompanyTokenResult = await updateCompanyToken(jwtTokenDecode.realmid, qb_access_token, qb_refresh_token, expire_at);

                    //disable all active company
                    const disableAllCompanyResult = await disableAllCompany(getUserByUserEmailResult.id);

                    const getCompanyByTenantResultt = await getCompanyByTenant(tenantArray[0].tenantId);

                    console.log("disable all company of",getUserByUserEmailResult.id);
                    console.log("company data",getCompanyByTenantResultt);
                    // console.log("active tenant",getCompanyByTenantResultt);

                    //enable first existing company
                    const activateCompanyResult = await activateCompany(getCompanyByTenantResultt[0].id);

                    // console.log("token",token);
                    res.redirect(`${process.env.APP_URL}auth_login/`+ encodeURIComponent(email)+`/xero/1/`+ token);
                }
            }
            else {
                //Email exist as quickbooks
                res.redirect(`${process.env.APP_URL}login/error/qb`);
            }
        }
        catch (err) {
            console.log(err);
            res.redirect(`${process.env.APP_URL}login`);
        }

    },
    xero_refresh_token_function: async (req, res) => {
        const email = req.params.email;
        // const getRefreshTokenResult = await getRefreshToken(email);
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
            return res.json({
               status:200,
               tokenSet: validTokenSet
            });
        }
        else {
            console.log("Not Expired");
            return res.json({
                status:200,
                message: "Not Expired"
            });
        }
    },
    xero_get_tenants: async function (req, res) {
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



    },
    xero_login: async (req, res) => {
        try {
            const body = req.body;
            console.log(body);
            const results = await getUserByUserEmail(body.email);
            results.password = undefined;
            console.log("getuser::",results);
            const json_token = sign({ result: results }, process.env.JWT_KEY);
            return res.json({
                success: 1,
                message: "login successfully",
                token: json_token,
                data: results,
                type: "xero"
                    // data: results,
            });
        }
        catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Invalid email or password"
            });
        }
    },
    getAccounts: async (req, res) => {
        const company_id = req.params.company_id;
        console.log("company_id",company_id);
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
            console.log(Account , xeroTenantId);
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
                    const checkTenantAccountResult = await checkTenantAccount(Account.accountID,getCompanyByTenantResult[0].id);
                    // console.log("count:",checkTenantAccountResult[0].account_count);
                    console.log("account id:",Account.accountID,"company id:",getCompanyByTenantResult[0].id,"count:",checkTenantAccountResult[0].account_count);
                    if(checkTenantAccountResult[0].account_count === 0) {
                        console.log(getCompanyByTenantResult[0].id ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode===undefined?null:Account.currencyCode, Account.updatedDateUTC);
                        const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status==="ACTIVE"?1:0, Account.description, Account.currencyCode===undefined?null:Account.currencyCode, Account.updatedDateUTC, getCompanyByTenantResult[0].id, body.id,"xero");
                    }
                }
            }

            return res.json({
                success: 1,
                message: "Account created successfully"
            });
        }
        catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Something went wrong "+ e.message
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
            console.log("tennat id",record[0].tenant_id);
            // console.log(user);

            const TS = new TokenSet({
                id_token: user[0].xero_id_token,
                access_token: user[0].xero_access_token,
                refresh_token: user[0].xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            console.log(TS);
            console.log("user id",user_id)
            console.log("company id",company_id)

            await xero.setTokenSet(TS);
            const order = 'Name ASC';
            console.log(record[0].tenant_id);
            //getting all account by tenant id
            const response = await xero.accountingApi.getAccounts(record[0].tenant_id, null, null, order);
            // console.log(typeof response.body.accounts);
            let res = response.body.accounts;
            console.log(res);
            for (const Account of res) {
                console.log("Company ID:",company_id," User ID:", user_id, "Account ID: ", Account.accountID);

                //Check if tenant account already exist
                const checkTenantAccountResult = await checkTenantAccount(Account.accountID,company_id);
                console.log("count:",checkTenantAccountResult[0].account_count);
                if(checkTenantAccountResult[0].account_count === 0) {
                    console.log(company_id ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
                   const createTenantAccountResult = await createTenantAccount(Account.code, Account.accountID, Account.name, Account.type, Account.status=="ACTIVE"?1:0, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC, company_id, user_id,"xero");
                }
                else {
                    console.log("FOUND:",company_id ,Account.code, Account.accountID, Account.name, Account.type, Account.status, Account.description, Account.currencyCode==undefined?null:Account.currencyCode, Account.updatedDateUTC);
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

            console.log("TS",TS);

            await xero.setTokenSet(TS);


            const page = 1;
            const includeArchived = true;
            const createdByMyApp = false;
            const unitdp = 4;
            const summaryOnly = false;
            const responseExp = await xero.accountingApi.getInvoices(record[0].tenant_id, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
            // const response = await xero.accountingApi.getInvoices(record[0].tenant_id, null, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
            console.log("Tenant",record[0].tenant_id);
            console.log("Expense",responseExp.body.invoices);
            // console.log(response.body || response.response.statusCode)
            // let expenseArray = JSON.parse(response.body.invoices);
            // console.log("Response",response.body.invoices)

            for(const Expense of responseExp.body.invoices) {
                if(Expense.type === "ACCPAY") {
                    const checkTenantExpenseResult = await checkTenantExpense(Expense.invoiceID,company_id);
                    if(checkTenantExpenseResult[0].expense_count === 0) {
                        console.log("Expense ID: ", Expense.invoiceID);
                        console.log("Tracking", Expense.lineItems[0])
                        console.log("Tracking id", Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0].trackingCategoryID:null);
                        // addXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, total_amount, company_id, user_id)
                        let vn = await getVendorByID(Expense.contact.contactID);
                        console.log("vendor", vn[0].name);
                        let gdpart = null;
                        if(Expense.lineItems[0].tracking.length>0) {
                            gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                            console.log("GETED DEPART", gdpart);
                            console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                        }
                        const addExpenseResult = await addXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount,company_id, user_id)
                    }
                    else {
                        console.log("FOUND-------------------update:",Expense);
                        let vn = await getVendorByID(Expense.contact.contactID);
                        console.log("vendor", vn[0].name);
                        let gdpart = null;
                        if(Expense.lineItems[0].tracking.length>0) {
                            gdpart = await getDepartByDepartName(Expense.lineItems[0].tracking[0].option, Expense.lineItems[0].tracking[0].trackingCategoryID);
                            console.log("GETED DEPART", gdpart);
                            console.log("category",Expense.lineItems[0].tracking.length>0?Expense.lineItems[0].tracking[0]:null)
                        }
                        // updateXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id)
                        const updateExpenseResult = await updateXeroExpense(Expense.invoiceID,Expense.date,Expense.updatedDateUTC,null, vn[0].name!==undefined?vn[0].name:null,Expense.currencyCode,Expense.type,Expense.lineItems[0].accountCode,null,Expense.lineItems[0].description,gdpart!==null?gdpart[0].depart_id:null,Expense.lineItems[0].unitAmount,company_id, user_id)
                        // console.log()
                    }

                    if(Expense.hasAttachments === true) {
                        console.log("Line item", Expense.lineItems[0])
                        // console.log("aaa");
                        try {
                            const responseAttachment = await xero.accountingApi.getInvoiceAttachments(record[0].tenant_id, Expense.invoiceID);
                            console.log(responseAttachment.body.attachments[0]);
                            let checkAttachableResult = await checkAttachable(responseAttachment.body.attachments[0].attachmentID,Expense.invoiceID);
                            if(checkAttachableResult[0].attach_count === 0) {
                                // expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at
                                let addAttachableResult = await addAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                                console.log("attachable inserted",Expense.invoiceID, company_id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                            }
                            else {
                                let updateAttachableResult = await updateAttachable(Expense.invoiceID, company_id, responseAttachment.body.attachments[0].fileName, responseAttachment.body.attachments[0].url, responseAttachment.body.attachments[0].contentLength, responseAttachment.body.attachments[0].attachmentID,null, null);
                            }
                            // console.log("aaa1");
                            console.log("attachment:::",responseAttachment.body.attachments)
                        }
                        catch (e) {
                            console.log("Error",e);
                        }
                    }
                }
            }
        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log(err);
            return res.json({
                status: 500,
                message: "Expenses synced failed, Please try again."
            })
        }
        return res.json({
            status: 200,
            message: "Expenses synced successfully!"
        })

    },
    syncDepartments: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const record = await getActivateCompany(user_id);
            const user = await getUserById(user_id);
            console.log("recordrecord",record);
            // console.log(user);

            const TS = new TokenSet({
                id_token: user[0].xero_id_token,
                access_token: user[0].xero_access_token,
                refresh_token: user[0].xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            console.log("token set:",TS);

            await xero.setTokenSet(TS);

            // const xeroTenantId = 'YOUR_XERO_TENANT_ID';
            // const where = 'Status=="ACTIVE"';
            const order = 'Name ASC';
            const includeArchived = true;


            const response = await xero.accountingApi.getTrackingCategories(record[0].tenant_id,  null, order, includeArchived);
            console.log("result:::",response.body.trackingCategories[0].options)

            if(response.body.trackingCategories.length>0) {

                for(let i=0;i<response.body.trackingCategories.length;i++) {
                    console.log("categories",i,":::",response.body.trackingCategories[i])
                    for(const Department of response.body.trackingCategories[i].options) {
                        console.log("Department.trackingOptionID",Department);
                        // this.stop();
                        const checkTenantDepartmentResult = await checkTenantDepartment(Department.trackingOptionID,company_id);
                        if(checkTenantDepartmentResult[0].depart_count === 0) {
                            console.log("Depart id",Department.trackingOptionID);
                            console.log("Name",Department.name);
                            console.log("Status",Department.status);
                            console.log()

                            const addDepartmentResult = addDepartment(Department.trackingOptionID, response.body.trackingCategories[i].trackingCategoryID, Department.name,null,Department.status==="ACTIVE"?1:0, company_id, user_id,0);
                        }
                        else {
                            console.log("depart found")
                            console.log("main category", response.body.trackingCategories[i].trackingCategoryID);
                            const updateDepartmentResult = updateDepartment(Department.trackingOptionID, response.body.trackingCategories[i].trackingCategoryID.toString(), Department.name,null,Department.status==="ACTIVE"?1:0, company_id,0);
                        }

                    }
                }

            }
            else {
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
    viewAttachment:async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const attach_id = req.params.attach_id;
            console.log("attach_id",attach_id);
            console.log("user_id",user_id);
            // const company_id = req.params.company_id;
            const record = await getActivateCompany(user_id);
            const user = await getUserById(user_id);
            const attachment = await getAttachment(attach_id);
            console.log(record);
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
            const response = await xero.accountingApi.getInvoiceAttachmentByFileName(record[0].tenant_id, attachment[0].expense_id, attachment[0].file_name, contentType);
            console.log("image",response.body, response.response.statusCode);
            return res.json({
                arrayBuffer:response.body
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
            console.log("record",record);
            console.log("user",user);
            // console.log(user);

            const TS = new TokenSet({
                id_token: user[0].xero_id_token,
                access_token: user[0].xero_access_token,
                refresh_token: user[0].xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            console.log("token set:",TS);

            await xero.setTokenSet(TS);
            //
            // // const xeroTenantId = 'YOUR_XERO_TENANT_ID';
            // // const where = 'Status=="ACTIVE"';
            const ifModifiedSince = null;
            const where = 'ContactStatus=="ACTIVE"';
            const order = null;
            const iDs = null;
            const page = 1;
            const includeArchived = true;
            const summaryOnly = false;
            const searchTerm = null;

            console.log("tokenSeT",xero.readTokenSet().expired());
            if(xero.readTokenSet().expired() === false) {
                console.log("record[0].tenant_id",record[0].tenant_id);
                const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
                if(response.body.contacts.length>0) {
                    for(const Contact of response.body.contacts) {

                        let vendor_id = Contact.contactID;
                        let name = Contact.name;
                        let acct_num = Contact.accountNumber!==undefined?Contact.accountNumber:null;
                        let status = Contact.contactStatus==='ACTIVE'?1:0;
                        let email = Contact.emailAddress;
                        let address1 =  Contact.addresses[0].addressLine1!==undefined? Contact.addresses[0].addressLine1:"";
                        let address2 =  Contact.addresses[0].addressLine2!==undefined? Contact.addresses[0].addressLine2:"";
                        let address3 =  Contact.addresses[0].addressLine3!==undefined? Contact.addresses[0].addressLine3:"";
                        let address4 =  Contact.addresses[0].addressLine4!==undefined? Contact.addresses[0].addressLine4:"";
                        let address = address1 + address2 + address3 + address4;
                        let city = Contact.addresses[0].city;
                        let postalCode = Contact.addresses[0].postalCode;
                        let country = Contact.addresses[0].country;
                        let contact = Contact.phones[1].phoneCountryCode!==undefined? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneNumber:null;
                        let mobile = Contact.phones[3].phoneCountryCode!==undefined? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneNumber:null;
                        let website = Contact.website!==undefined?Contact.website:null;
                        let balance = Contact.balances!==undefined?Contact.balances:null;
                        let date = Contact.updatedDateUTC;
                        console.log(vendor_id);
                        console.log(name);
                        console.log(status);
                        console.log(acct_num);
                        console.log(email);
                        console.log(address!==""?address:null);
                        console.log(contact);
                        console.log(mobile);
                        console.log(website);
                        console.log(null);
                        console.log(date);
                        console.log("-----------")
                        const checkTenantVendorResult = await checkTenantVendor(vendor_id,company_id);
                        if(checkTenantVendorResult[0].vendor_count === 0) {
                            // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                            // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                            // console.log("address",address);
                            console.log(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, null, acct_num, record[0].currency, status, 'xero', company_id, user_id, date, date);
                            const addVendorResult = await addVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, record[0].currency, status, 'xero', company_id, user_id, date, date);
                            console.log("added");
                        }
                        else {
                            console.log("found ",vendor_id);
                            const addVendorResult = await updateVendor(vendor_id, name, contact, mobile, email, website, address!==""?address:null, city!==undefined?city:null, postalCode!=undefined?postalCode:null, 0, acct_num, record[0].currency, status, 'xero', company_id, user_id, date, date);
                            console.log("updated");
                        }
                        // console.log(Contact);
                    }
                }
                // const response = await xero.accountingApi.getContacts(record[0].tenant_id, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
            }
            //
            //
            //


            // console.log("DDDD");
            // console.log("results:::",response.body)


            // else {
            //     return res.json({
            //         status: 200,
            //         message: "No category found."
            //     })
            // }

        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log(err);
            return res.json({
                status: 500,
                message: "Vendors synced failed, Please try again."
            })
        }

        return res.json({
            status: 200,
            message: "Vendors synced successfully!"
        })

    },
};