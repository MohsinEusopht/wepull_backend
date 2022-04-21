const {hashSync,genSaltSync,compareSync} = require("bcrypt");
const crypto = require('crypto');
const{
    qbSignUp,
    updateRefreshToken,
    activeQuickbookAccount,
    disableAllQuickbookAccounts,
    addQuickbookExpense,
    checkTenantExpense,
    updateCompanyToken,
    updateQuickbookExpense,
    addDepartment,
    checkTenantDepartment,
    updateDepartment,
    addAttachable,
    updateAttachable,
    checkTenantVendor,
    addVendor,
    updateVendor
} = require("./quickbook.service");

const {
    checkUserEmail,
    checkUserCompany,
    updateUserCompany,
    createUserRole,
    createCompany,
    getUserByUserEmail,
    checkUserXero,
    updateQuickbookLoginToken,
    checkTenantAccount,
    createTenantAccount,
    getAccounts,
    getCompanyByTenant,
    getActivateCompany,
    editUser,
    disableAllCompany,
    activateCompany,
    updateCompanyInfo,
    checkAttachable,
    updateUserCompanyResult
} = require("../users/user.service");

const jwt = require('jsonwebtoken');
const convert = require('xml-js');
const request = require('request');
const moment = require('moment-timezone');
const {sign} = require("jsonwebtoken");
const OAuthClient = require('intuit-oauth');
const parseString = require('xml2js').parseString;
// const httpProxy = require('http-proxy');
// const proxy = httpProxy.createServer({});
// const {createCompany} = require("../users/user.service");
// const {createUserRole} = require("../users/user.service");
// const {updateUserCompany} = require("../users/user.service");


let oauth2_token_json = null;
let redirectUri = '';

let qb_access_token = null;
let qb_refresh_token = null;
let qb_id_token = null;
let qb_expire_at = null;
let callbackurl="http://localhost:3000/api/quickbook/quickbooks_callback";
//let callbackurl="https://wepullbackend.herokuapp.com/api/quickbook/quickbooks_callback";

let oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOK_CLIENT_ID,            // enter the apps `clientId`
    clientSecret: process.env.QUICKBOOK_SECRET_ID,    // enter the apps `clientSecret`
    environment: 'sandbox',     // enter either `sandbox` or `production`
    redirectUri: process.env.QUICKBOOK_REDIRECT_URI,    // enter the redirectUri
    // logging: true                               // by default the value is `false`
});


async function get_user(access_token){
    let bearer = 'Bearer ' + access_token;
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'url': "https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo",
        'headers': {
            'Authorization': bearer,
        }
    };
    let array = [];

    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                // console.log("response:", res);
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}
async function get_company(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}v3/company/${companyID}/companyinfo/${companyID}`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    let array = [];

    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                //console.log(result);
                resolve(result);
            } else {
                reject(error);
            }
        });
    });

}
async function get_accounts(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = 'select * from Account where Active = true';
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    // let array = [];
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                console.log("account result" ,result);
                resolve(result);
            } else {
                reject(error);
            }
        });
    });

}
async function getPurchases(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = 'select * from Purchase';
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    let array = [];
    // console.log("result","fafa");
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                // console.log("result",result)
                resolve(result);
            } else {
                // console.log("result",error)
                reject(error);
            }
        });
    });
}
async function getBills(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = 'select * from bill';
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    let array = [];

    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                // console.log("account result" ,result);
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}
async function getDepartments(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = 'select * from Department WHERE Active IN (true,false)';
    console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    console.log("option:",options);
    let array = [];
    // console.log("result","fafa");
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                console.log("Departments",result)
                resolve(result);
            } else {
                console.log("result",error)
                reject(error);
            }
        });
    });
}
async function getClasses(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = 'select  * from Class WHERE Active IN (true,false)';
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    let array = [];
    // console.log("result","fafa");
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                // console.log("Departments",result)
                resolve(result);
            } else {
                // console.log("result",error)
                reject(error);
            }
        });
    });
}
async function getVendors(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = 'select * from vendor WHERE Active IN (true,false)';
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    let array = [];
    // console.log("result","fafa");
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                // console.log("Departments",result)
                resolve(result);
            } else {
                // console.log("result",error)
                reject(error);
            }
        });
    });
}
async function getAttachable(access_token, companyID, expense_id) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = `select * from attachable where AttachableRef.EntityRef.value = '${expense_id}'`;
    // console.log(query);
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("attachable option:",options);
    let array = [];
    // console.log("result","fafa");
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}



module.exports = {
    quickbooks_url: async (req, res) => {
        let authUri = oauthClient.authorizeUri({
            scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId,OAuthClient.scopes.Email,OAuthClient.scopes.Profile, OAuthClient.scopes.Address, OAuthClient.scopes.Phone],
            state:'testState'
        });

        // can be an array of multiple scopes ex : {scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId]}
        res.redirect(authUri);
    },
    quickbooks_callback: async (req, res) => {
        oauthClient
            .createToken(req.url)
            .then(async function (authResponse) {
                oauth2_token_json = JSON.stringify(authResponse.getJson())
                // console.log(oauth2_token_json);
                let array = JSON.parse(oauth2_token_json);
                qb_access_token = array.access_token;
                qb_refresh_token = array.refresh_token;
                qb_id_token = array.id_token;
                qb_expire_at = array.x_refresh_token_expires_in;
                const jwtTokenDecode = jwt.decode(qb_id_token);
                // console.log("realmid: ",jwtTokenDecode.realmid);

                // console.log("ID TOKEN AFTER:",jwtTokenDecode);
                let authToken = oauthClient.getToken().getToken();
                oauthClient.setToken(authToken);
                let resp = await get_user(qb_access_token);

                let company = await get_company(qb_access_token, jwtTokenDecode.realmid);
                let accounts = await get_accounts(qb_access_token, jwtTokenDecode.realmid);
                let purchases = await getPurchases(qb_access_token, jwtTokenDecode.realmid);
                let bills = await getBills(qb_access_token, jwtTokenDecode.realmid);
                let departments = await getDepartments(qb_access_token, jwtTokenDecode.realmid);
                let vendors = await getVendors(qb_access_token, jwtTokenDecode.realmid);
                let classes = await getClasses(qb_access_token, jwtTokenDecode.realmid);




                let userArray = JSON.parse(resp);
                let companyArray = JSON.parse(company);
                let accountArray = JSON.parse(accounts);
                let purchaseArray = JSON.parse(purchases);
                let billArray = JSON.parse(bills);
                let departmentArray = JSON.parse(departments);
                let vendorArray = JSON.parse(vendors);
                let classArray = JSON.parse(classes);

                const checkUserEmailResult = await checkUserEmail(userArray.email);

                const checkUserXeroResult = await checkUserXero(userArray.email);

                console.log("company ID: ",jwtTokenDecode.realmid);
                console.log(jwtTokenDecode.realmid,companyArray.IntuitResponse.CompanyInfo.CompanyName._text,companyArray.IntuitResponse.CompanyInfo.MetaData.CreateTime._text, companyArray.IntuitResponse.CompanyInfo._attributes.domain, null);


                let now = new Date();
                let time = now.getTime();
                time += 3600 * 1000;
                let expire_at = time.toString().substring(0,10);
                // document.write();

                if(checkUserXeroResult[0].count_xero==0) {
                    if(checkUserEmailResult[0].count_user==0) {

                        let NameValue = companyArray.IntuitResponse.CompanyInfo.NameValue;

                        let IndustryType = NameValue.filter(el => el.Name._text === 'IndustryType');
                        let CompanyType = NameValue.filter(el => el.Name._text === 'CompanyType');

                        const token = crypto.randomBytes(48).toString('hex');
                        const createUsersResult = await qbSignUp(userArray.givenName, userArray.familyName, userArray.email,userArray.phoneNumber, qb_access_token, qb_refresh_token, expire_at, token);
                        const createCompanyResult = await createCompany(jwtTokenDecode.realmid,companyArray.IntuitResponse.CompanyInfo.CompanyName._text,companyArray.IntuitResponse.CompanyInfo.MetaData.CreateTime._text, companyArray.IntuitResponse.CompanyInfo._attributes.domain, null,'USD',CompanyType[0].Value._text!=undefined||null?CompanyType[0].Value._text:null,IndustryType[0].Value._text!=undefined||null?IndustryType[0].Value._text:null,createUsersResult.insertId);
                        // const updateUserCompanyResult = await updateUserCompanyResult(createCompanyResult.insertId,createUsersResult.insertId);
                        const createUserRoleResult = await createUserRole(createUsersResult.insertId, createCompanyResult.insertId, null, 1, null);
                        // const updateUserCompanyResult =
                        const getUserByUserEmailResult = await getUserByUserEmail(userArray.email);
                        const getCompanyByTenantResult = await getCompanyByTenant(jwtTokenDecode.realmid)
                        //Get Accounts of tenant
                        try {
                            for (const Account of accountArray.IntuitResponse.QueryResponse.Account) {
                                const checkTenantAccountResult = await checkTenantAccount(Account.Id._text,getCompanyByTenantResult[0].id);
                                console.log("account id:",Account.accountID,"company id:",getCompanyByTenantResult[0].id,"count:",checkTenantAccountResult[0].account_count);
                                if(checkTenantAccountResult[0].account_count === 0) {
                                     console.log(null, Account.Id._text, Account.Name._text, Account.Classification._text, Account.Active._text=="true"?1:0, null, Account.CurrencyRef._text, Account.MetaData.CreateTime._text, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,"quickbooks");
                                     const createTenantAccountResult = await createTenantAccount(null, Account.Id._text, Account.Name._text, Account.Classification._text, Account.Active._text=="true"?1:0, null, Account.CurrencyRef._text, Account.MetaData.CreateTime._text, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,"quickbooks");
                                }
                            }
                        } catch (err) {
                            const error = JSON.stringify(err.response, null, 2)
                            console.log(`Status Code: ${err.response} => ${error}`);
                        }
                        //Get Expense of tenant

                        const Attachables = [];
                                                                                    // expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, total_amount, company_id, user_id
                        for (const Expense of purchaseArray.IntuitResponse.QueryResponse.Purchase) {
                            if(Expense.Line.length===undefined) {
                                let d = Expense.Line.Description?Expense.Line.Description._text.toString():"No description";
                                let c = Expense.Line.AccountBasedExpenseLineDetail?Expense.Line.AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                let com = c + " - " + d;
                                console.log("Expense",Expense.Id._text, " Description", com, "Length is ",Expense.Line.length);
                                if (Expense.PaymentType._text === "CreditCard") {
                                    const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                    console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                }
                                else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                    const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                    console.log("Expenses Added Cash: ", Expense.Id._text)
                                }
                            }
                            else{
                                for (let i=0;i<Expense.Line.length;i++) {
                                    // console.log(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name + "-" + Expense.Line[i].Description?Expense.Line[i].Description._text:"-");
                                    let d = Expense.Line[i].Description?Expense.Line[i].Description._text.toString():"No description";
                                    let c = Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                    let com = c + " - " + d;

                                    console.log("Expense",Expense.Id._text, " Description", com, "Length",Expense.Line.length);
                                    // console.log(Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"-")
                                    if (Expense.PaymentType._text === "CreditCard") {
                                        // expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, total_amount, company_id, user_id
                                        const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                        console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                    }
                                    else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                        const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                        console.log("Expenses Added Cash: ", Expense.Id._text)
                                    }
                                }
                            }

                            const getAttachableResult = await getAttachable(qb_access_token, jwtTokenDecode.realmid, Expense.Id._text);
                            const attachableArray = JSON.parse(getAttachableResult);
                            // console.log("attachable", attachableArray.IntuitResponse.QueryResponse.Attachable!==undefined?attachableArray.IntuitResponse.QueryResponse.Attachable:"undefined");
                            if(attachableArray.IntuitResponse.QueryResponse.Attachable!==undefined) {
                                // console.log("attachable",attachableArray.IntuitResponse.QueryResponse.Attachable);
                                Attachables.push(attachableArray.IntuitResponse.QueryResponse.Attachable);

                            }
                            else {
                                console.log("attachable is undefined");
                            }

                        }

                        for (const Attachable of Attachables) {
                            console.log("attachable", Attachable.AttachableRef.EntityRef._text, getCompanyByTenantResult[0].id, Attachable.FileName._text, Attachable.TempDownloadUri._text, Attachable.Size._text, Attachable.Id._text,Attachable.MetaData.CreateTime._text,Attachable.MetaData.LastUpdatedTime._text);
                            let checkAttachableResult = await checkAttachable(Attachable.Id._text,Attachable.AttachableRef.EntityRef._text);
                            if(checkAttachableResult[0].attach_count === 0) {
                                let addAttachableResult = await addAttachable(Attachable.AttachableRef.EntityRef._text, getCompanyByTenantResult[0].id, Attachable.FileName._text, Attachable.TempDownloadUri._text, Attachable.Size._text, Attachable.Id._text,Attachable.MetaData.CreateTime._text,Attachable.MetaData.LastUpdatedTime._text);
                                console.log("attachable inserted",Attachable.AttachableRef.EntityRef._text, Attachable.Id._text);
                            }
                            else {
                                let updateAttachableResult = await updateAttachable(Attachable.AttachableRef.EntityRef._text, getCompanyByTenantResult[0].id, Attachable.FileName._text, Attachable.TempDownloadUri._text, Attachable.Size._text, Attachable.Id._text,Attachable.MetaData.CreateTime._text,Attachable.MetaData.LastUpdatedTime._text);
                            }
                        }

                        //Get Departments
                        if(departmentArray.IntuitResponse.QueryResponse.Department!=undefined) {
                            for (const Department of departmentArray.IntuitResponse.QueryResponse.Department) {
                                if (Department.SubDepartment._text.toString() === "true") {
                                    const addDepartmentResult = await addDepartment(Department.Id._text, Department.Name._text, Department.ParentRef._text, Department.Active._text === "true" ? 1 : 0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Department.MetaData.CreateTime._text, Department.MetaData.LastUpdatedTime._text);
                                    console.log("New Department with sub depart created, ", Department.Id._text, Department.Name._text, Department.ParentRef.value, Department.Active._text === "true" ? 1 : 0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id);
                                } else {
                                    const addDepartmentResult = await addDepartment(Department.Id._text, Department.Name._text, null, Department.Active._text === "true" ? 1 : 0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Department.MetaData.CreateTime._text, Department.MetaData.LastUpdatedTime._text);
                                    console.log("New Department created, ", Department.Id._text, Department.Name._text, null, Department.Active._text === "true" ? 1 : 0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id);
                                }
                            }
                            if(classArray.IntuitResponse.QueryResponse.Class!=undefined) {
                                for(const Class of classArray.IntuitResponse.QueryResponse.Class) {
                                    // const checkTenantDepartmentResult = await checkTenantDepartment(Class.Id._text,company_id);
                                    // if(checkTenantDepartmentResult[0].depart_count === 0) {
                                        if(Class.SubClass._text.toString() === "true") {
                                            const addDepartmentResult = await addDepartment(Class.Id._text, Class.Name._text, Class.ParentRef._text, Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                            console.log("New Class with sub class created, ",Class.Id._text, Class.Name._text, Class.ParentRef.value,Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id);
                                        }
                                        else {
                                            const addDepartmentResult = await addDepartment(Class.Id._text, Class.Name._text, null, Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                            console.log("New Class created, ",Class.Id._text, Class.Name._text, null,Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id);
                                        }
                                    // }
                                    // else {
                                    //     console.log("Found:", Class.Id._text)
                                    //     if(Class.SubClass._text.toString() === "true") {
                                    //         const updateDepartmentResult = await updateDepartment(Class.Id._text, Class.Name._text, Class.ParentRef._text, Class.Active._text==="true"?1:0, company_id,user_id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                    //         console.log("New Class with sub Class updated, ",Class.Id._text, Class.Name._text, Class.ParentRef._text,Class.Active._text==="true"?1:0, company_id,user_id);
                                    //     }
                                    //     else {
                                    //         const updateDepartmentResult = await updateDepartment(Class.Id._text, Class.Name._text, null, Class.Active._text==="true"?1:0, company_id,user_id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                    //         console.log("New Class updated, ",Class.Id._text, Class.Name._text, null,Class.Active._text==="true"?1:0, company_id,user_id);
                                    //     }
                                    // }
                                }
                            }
                        }

                        //Get vendors
                        if(vendorArray.IntuitResponse.QueryResponse.Vendor!=undefined) {
                            for(const Vendor of vendorArray.IntuitResponse.QueryResponse.Vendor) {
                                // const checkTenantVendorResult = await checkTenantVendor(Vendor.Id._text,getCompanyByTenantResult[0].id);
                                // if(checkTenantVendorResult[0].vendor_count === 0) {
                                    // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                                    // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                                    // console.log("address",address);
                                    console.log(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                                    const addVendorResult = await addVendor(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                                    console.log("added");
                                // }
                                // else {
                                //     console.log("found ",Vendor.Id._text);
                                //     const addVendorResult = await updateVendor(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', company_id, user_id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                                //     console.log("updated");
                                // }
                            }
                        }

                        const updateCompanyTokenResult = await updateCompanyToken(jwtTokenDecode.realmid, qb_access_token, qb_refresh_token, expire_at);

                        await disableAllQuickbookAccounts(getUserByUserEmailResult.id);
                        await activeQuickbookAccount(jwtTokenDecode.realmid);

                        console.log("Sign up Working");
                        res.redirect(`${process.env.APP_URL}xero_login/`+ encodeURIComponent(userArray.email)+`/quickbooks/0/`+ token);
                    }
                    else {

                        //Login execution
                        const token = crypto.randomBytes(48).toString('hex');
                        const updateLoginTokenResult = await updateQuickbookLoginToken(userArray.email, token, qb_access_token, qb_refresh_token, expire_at);
                            const getUserByUserEmailResult = await getUserByUserEmail(userArray.email);
                            const getCompanyByTenantResult = await getCompanyByTenant(jwtTokenDecode.realmid)
                            console.log("compny lenght:",getCompanyByTenantResult.length);
                            console.log("compny:",getCompanyByTenantResult);

                        // {
                        //     "Name": "IndustryType",
                        //     "Value": "Electronic computer manufacturing"
                        // },
                        // {
                        //     "Name": "CompanyType",
                        //     "Value": "Sole Proprietor"
                        // }
                        let NameValue = companyArray.IntuitResponse.CompanyInfo.NameValue;

                        let IndustryType = NameValue.filter(el => el.Name._text === 'IndustryType');
                        let CompanyType = NameValue.filter(el => el.Name._text === 'CompanyType');
                        console.log("IndustryType",IndustryType);
                        console.log("CompanyType",CompanyType);
                        console.log("CompanyType",CompanyType[0].Value._text);
                            //IF Company do not exist
                            if(getCompanyByTenantResult.length===0) {
                                //Create company if not exist

                                const createCompanyResult = await createCompany(jwtTokenDecode.realmid,companyArray.IntuitResponse.CompanyInfo.CompanyName._text,companyArray.IntuitResponse.CompanyInfo.MetaData.CreateTime._text, companyArray.IntuitResponse.CompanyInfo._attributes.domain, null, 'USD',CompanyType[0].Value._text!=undefined||null?CompanyType[0].Value._text:null,IndustryType[0].Value._text!=undefined||null?IndustryType[0].Value._text:null,getUserByUserEmailResult.id);
                                // const updateUserCompanyResult = await updateUserCompanyResult(createCompanyResult.insertId,createUsersResult.insertId);
                                const createUserRoleResult = await createUserRole(getUserByUserEmailResult.id, createCompanyResult.insertId, null, 1, null);
                                console.log("Created new company as ", createCompanyResult.insertId);
                                //Get Accounts
                                for (const Account of accountArray.IntuitResponse.QueryResponse.Account) {
                                    const checkTenantAccountResult = await checkTenantAccount(Account.Id._text,createCompanyResult.insertId);
                                    console.log("account id:",Account.Id._text,"company id:",createCompanyResult.insertId,"count:",checkTenantAccountResult[0].account_count);
                                    if(checkTenantAccountResult[0].account_count === 0) {
                                        console.log(null, Account.Id._text, Account.Name._text, Account.Classification._text, Account.Active._text=="true"?1:0, null, Account.CurrencyRef._text, Account.MetaData.CreateTime._text, createCompanyResult.insertId, getUserByUserEmailResult.id,"quickbooks");
                                        const createTenantAccountResult = await createTenantAccount(null, Account.Id._text, Account.Name._text, Account.Classification._text, Account.Active._text=="true"?1:0, null, Account.CurrencyRef._text, Account.MetaData.CreateTime._text, createCompanyResult.insertId, getUserByUserEmailResult.id,"quickbooks");
                                    }
                                }
                                //Get Expenses

                                for (const Expense of purchaseArray.IntuitResponse.QueryResponse.Purchase) {
                                    const checkTenantExpenseResult = await checkTenantExpense(Expense.Id._text,createCompanyResult.insertId);
                                    if(checkTenantExpenseResult[0].expense_count === 0) {
                                        if(Expense.Line.length===undefined) {
                                            let d = Expense.Line.Description?Expense.Line.Description._text.toString():"No description";
                                            let c = Expense.Line.AccountBasedExpenseLineDetail?Expense.Line.AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                            let com = c + " - " + d;
                                            console.log("Expense",Expense.Id._text, " Description", com, "Length is ",Expense.Line.length);
                                            if (Expense.PaymentType._text === "CreditCard") {
                                                const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text, createCompanyResult.insertId, getUserByUserEmailResult.id)
                                                console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                            }
                                            else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                                const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                                console.log("Expenses Added Cash: ", Expense.Id._text)
                                            }
                                        }
                                        else{
                                            for (let i=0;i<Expense.Line.length;i++) {
                                                // console.log(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name + "-" + Expense.Line[i].Description?Expense.Line[i].Description._text:"-");
                                                let d = Expense.Line[i].Description?Expense.Line[i].Description._text.toString():"No description";
                                                let c = Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                                let com = c + " - " + d;

                                                console.log("Expense",Expense.Id._text, " Description", com, "Length",Expense.Line.length);
                                                // console.log(Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"-")
                                                if (Expense.PaymentType._text === "CreditCard") {
                                                    // expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, total_amount, company_id, user_id
                                                    const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                                    console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                                }
                                                else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                                    const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                                    console.log("Expenses Added Cash: ", Expense.Id._text)
                                                }
                                            }
                                        }

                                        const getAttachableResult = await getAttachable(qb_access_token, jwtTokenDecode.realmid, Expense.Id._text);
                                        const attachableArray = JSON.parse(getAttachableResult);
                                        // console.log("attachable", attachableArray.IntuitResponse.QueryResponse.Attachable!==undefined?attachableArray.IntuitResponse.QueryResponse.Attachable:"undefined");
                                        if(attachableArray.IntuitResponse.QueryResponse.Attachable!==undefined) {
                                            // console.log("attachable",attachableArray.IntuitResponse.QueryResponse.Attachable);
                                            Attachables.push(attachableArray.IntuitResponse.QueryResponse.Attachable);

                                        }
                                        else {
                                            console.log("attachable is undefined");
                                        }
                                    }
                                }
                                // for (const Expense of purchaseArray.IntuitResponse.QueryResponse.Purchase) {
                                //     // console.log("Dpt id",Expense.DepartmentRef?Expense.DepartmentRef._text:null);
                                //     const checkTenantExpenseResult = await checkTenantExpense(Expense.Id._text,createCompanyResult.insertId);
                                //     if(checkTenantExpenseResult[0].expense_count === 0) {
                                //         if(Expense.Line.length===undefined) {
                                //             let d = Expense.Line.Description?Expense.Line.Description._text.toString():"No description";
                                //             let c = Expense.Line.AccountBasedExpenseLineDetail?Expense.Line.AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //             let com = c + " - " + d;
                                //             console.log("Expense",Expense.Id._text, " Description", com, "Length is ",Expense.Line.length);
                                //             if (Expense.PaymentType._text === "CreditCard") {
                                //                 const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text, createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //                 console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                //             }
                                //             else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                 const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //                 console.log("Expenses Added Cash: ", Expense.Id._text)
                                //             }
                                //         }
                                //         else{
                                //             for (let i=0;i<Expense.Line.length;i++) {
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name + "-" + Expense.Line[i].Description?Expense.Line[i].Description._text:"-");
                                //                 let d = Expense.Line[i].Description?Expense.Line[i].Description._text.toString():"No description";
                                //                 let c = Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //                 let com = c + " - " + d;
                                //
                                //                 console.log("Expense",Expense.Id._text, " Description", com, "Length",Expense.Line.length);
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"-")
                                //                 if (Expense.PaymentType._text === "CreditCard") {
                                //                     // expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, total_amount, company_id, user_id
                                //                     const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //                     console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                //                 }
                                //                 else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                     const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //                     console.log("Expenses Added Cash: ", Expense.Id._text)
                                //                 }
                                //             }
                                //         }
                                //         // if (Expense.PaymentType._text === "CreditCard") {
                                //         //     const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,Expense.Line.Description?Expense.Line.Description._text:null,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //         //     console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                //         // }
                                //         // else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //         //     const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,Expense.Line.Description?Expense.Line.Description._text:null,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //         //     console.log("Expenses Added Cash: ", Expense.Id._text)
                                //         // }
                                //     }
                                //     else {
                                //         console.log("Found:", Expense.Id._text)
                                //         if(Expense.Line.length===undefined) {
                                //             let d = Expense.Line.Description?Expense.Line.Description._text.toString():"No description";
                                //             let c = Expense.Line.AccountBasedExpenseLineDetail?Expense.Line.AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //             let com = c + " - " + d;
                                //             console.log("Expense",Expense.Id._text, " Description", com, "Length is ",Expense.Line.length);
                                //             if (Expense.PaymentType._text === "CreditCard") {
                                //                 const updateExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //                 console.log("Expenses Updated Credit Card: ", Expense.Id._text)
                                //             }
                                //             else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                 const addExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //                 console.log("Expenses Updated Cash: ", Expense.Id._text)
                                //             }
                                //         }
                                //         else {
                                //             for (let i=0;i<Expense.Line.length;i++) {
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name + "-" + Expense.Line[i].Description?Expense.Line[i].Description._text:"-");
                                //                 let d = Expense.Line[i].Description?Expense.Line[i].Description._text.toString():"No description";
                                //                 let c = Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //                 let com = c + " - " + d;
                                //
                                //                 console.log("Expense",Expense.Id._text, " Description", com, "Length",Expense.Line.length);
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"-")
                                //                 if (Expense.PaymentType._text === "CreditCard") {
                                //                     const updateExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //                     console.log("Expenses Updated Credit Card: ", Expense.Id._text)
                                //                 }
                                //                 else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                     const addExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //                     console.log("Expenses Updated Cash: ", Expense.Id._text)
                                //                 }
                                //             }
                                //         }
                                //         // if (Expense.PaymentType._text === "CreditCard") {
                                //         //     const updateExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,Expense.Line.Description?Expense.Line.Description._text:null,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //         //     console.log("Expenses Updated Credit Card: ", Expense.Id._text)
                                //         // }
                                //         // else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //         //     const addExpenseResult = await updateQuickbookExpense(Expense.Id._text ,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,Expense.Line.Description?Expense.Line.Description._text:null,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,createCompanyResult.insertId, getUserByUserEmailResult.id)
                                //         //     console.log("Expenses Updated Cash: ", Expense.Id._text)
                                //         // }
                                //     }
                                // }


                                //Get Departments
                                if(departmentArray.IntuitResponse.QueryResponse.Department!=undefined) {
                                    for(const Department of departmentArray.IntuitResponse.QueryResponse.Department) {
                                        const checkTenantDepartmentResult = await checkTenantDepartment(Department.Id._text,createCompanyResult.insertId);
                                        if(checkTenantDepartmentResult[0].depart_count === 0) {
                                            if(Department.SubDepartment._text.toString() === "true") {
                                                const addDepartmentResult = await addDepartment(Department.Id._text, Department.Name._text, Department.ParentRef._text, Department.Active._text==="true"?1:0, createCompanyResult.insertId, getUserByUserEmailResult.id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                                                console.log("New Department with sub depart created, ",Department.Id._text, Department.Name._text, Department.ParentRef.value,Department.Active._text==="true"?1:0, createCompanyResult.insertId, getUserByUserEmailResult.id);
                                            }
                                            else {
                                                const addDepartmentResult = await addDepartment(Department.Id._text, Department.Name._text, null, Department.Active._text==="true"?1:0, createCompanyResult.insertId, getUserByUserEmailResult.id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                                                console.log("New Department created, ",Department.Id._text, Department.Name._text, null,Department.Active._text==="true"?1:0, createCompanyResult.insertId, getUserByUserEmailResult.id);
                                            }
                                        }
                                        else {
                                            console.log("Found:", Department.Id._text)
                                            if(Department.SubDepartment._text.toString() === "true") {
                                                const updateDepartmentResult = await updateDepartment(Department.Id._text, Department.Name._text, Department.ParentRef._text, Department.Active._text==="true"?1:0, createCompanyResult.insertId, getUserByUserEmailResult.id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                                                console.log("New Department with sub depart updated, ",Department.Id._text, Department.Name._text, Department.ParentRef._text,Department.Active._text==="true"?1:0, createCompanyResult.insertId, getUserByUserEmailResult.id);
                                            }
                                            else {
                                                const updateDepartmentResult = await updateDepartment(Department.Id._text, Department.Name._text, null, Department.Active._text==="true"?1:0, createCompanyResult.insertId, getUserByUserEmailResult.id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                                                console.log("New Department updated, ",Department.Id._text, Department.Name._text, null,Department.Active._text==="true"?1:0, createCompanyResult.insertId, getUserByUserEmailResult.id);
                                            }
                                        }
                                    }
                                    if(classArray.IntuitResponse.QueryResponse.Class!=undefined) {
                                        for(const Class of classArray.IntuitResponse.QueryResponse.Class) {
                                            const checkTenantDepartmentResult = await checkTenantDepartment(Class.Id._text,createCompanyResult.insertId);
                                            if(checkTenantDepartmentResult[0].depart_count === 0) {
                                                if(Class.SubClass._text.toString() === "true") {
                                                    const addDepartmentResult = await addDepartment(Class.Id._text, Class.Name._text, Class.ParentRef._text, Class.Active._text==="true"?1:0, createCompanyResult.insertId,getUserByUserEmailResult.id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                                    console.log("New Class with sub class created, ",Class.Id._text, Class.Name._text, Class.ParentRef.value,Class.Active._text==="true"?1:0, createCompanyResult.insertId,getUserByUserEmailResult.id);
                                                }
                                                else {
                                                    const addDepartmentResult = await addDepartment(Class.Id._text, Class.Name._text, null, Class.Active._text==="true"?1:0, createCompanyResult.insertId,getUserByUserEmailResult.id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                                    console.log("New Class created, ",Class.Id._text, Class.Name._text, null,Class.Active._text==="true"?1:0, createCompanyResult.insertId,getUserByUserEmailResult.id);
                                                }
                                            }
                                            else {
                                                console.log("Found:", Class.Id._text)
                                                if(Class.SubClass._text.toString() === "true") {
                                                    const updateDepartmentResult = await updateDepartment(Class.Id._text, Class.Name._text, Class.ParentRef._text, Class.Active._text==="true"?1:0, createCompanyResult.insertId,getUserByUserEmailResult.id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                                    console.log("New Class with sub Class updated, ",Class.Id._text, Class.Name._text, Class.ParentRef._text,Class.Active._text==="true"?1:0, createCompanyResult.insertId,getUserByUserEmailResult.id);
                                                }
                                                else {
                                                    const updateDepartmentResult = await updateDepartment(Class.Id._text, Class.Name._text, null, Class.Active._text==="true"?1:0, createCompanyResult.insertId,getUserByUserEmailResult.id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                                    console.log("New Class updated, ",Class.Id._text, Class.Name._text, null,Class.Active._text==="true"?1:0, createCompanyResult.insertId,getUserByUserEmailResult.id);
                                                }
                                            }
                                        }
                                    }
                                }
                                //Get vendors
                                if(vendorArray.IntuitResponse.QueryResponse.Vendor!=undefined) {
                                    for(const Vendor of vendorArray.IntuitResponse.QueryResponse.Vendor) {
                                        const checkTenantVendorResult = await checkTenantVendor(Vendor.Id._text,createCompanyResult.insertId);
                                        if(checkTenantVendorResult[0].vendor_count === 0) {
                                            // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                                            // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                                            // console.log("address",address);
                                            console.log(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', createCompanyResult.insertId, getUserByUserEmailResult.id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                                            const addVendorResult = await addVendor(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', createCompanyResult.insertId, getUserByUserEmailResult.id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                                            console.log("added");
                                        }
                                        else {
                                            console.log("found ",Vendor.Id._text);
                                            const addVendorResult = await updateVendor(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', createCompanyResult.insertId, getUserByUserEmailResult.id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                                            console.log("updated");
                                        }
                                    }
                                }
                                // for(const Department of departmentArray.IntuitResponse.QueryResponse.Department) {
                                //     if(Department.SubDepartment._text.toString() === "true") {
                                //         const addDepartmentResult = await addDepartment(Department.Id._text, Department.Name._text, Department.ParentRef._text, Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                                //         console.log("New Department with sub depart created, ",Department.Id._text, Department.Name._text, Department.ParentRef.value,Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id);
                                //     }
                                //     else {
                                //         const addDepartmentResult = await addDepartment(Department.Id._text, Department.Name._text, null, Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                                //         console.log("New Department created, ",Department.Id._text, Department.Name._text, null,Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id);
                                //     }
                                // }
                            }
                            else {
                                //update all data while login
                                console.log("Login as ", getCompanyByTenantResult[0].id);
                                //Get Accounts
                                for (const Account of accountArray.IntuitResponse.QueryResponse.Account) {
                                    const checkTenantAccountResult = await checkTenantAccount(Account.Id._text,getCompanyByTenantResult[0].id);
                                    // console.log("account id:",Account.Id._text,"company id:",createCompanyResult.insertId,"count:",checkTenantAccountResult[0].account_count);
                                    if(checkTenantAccountResult[0].account_count === 0) {
                                        console.log(null, Account.Id._text, Account.Name._text, Account.Classification._text, Account.Active._text=="true"?1:0, null, Account.CurrencyRef._text, Account.MetaData.CreateTime._text, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,"quickbooks");
                                        const createTenantAccountResult = await createTenantAccount(null, Account.Id._text, Account.Name._text, Account.Classification._text, Account.Active._text=="true"?1:0, null, Account.CurrencyRef._text, Account.MetaData.CreateTime._text, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,"quickbooks");
                                    }
                                }

                                const Attachables = [];
                                //Get Expenses
//Comment
                                // for (const Expense of purchaseArray.IntuitResponse.QueryResponse.Purchase) {
                                //     // console.log("Dpt id",Expense.DepartmentRef?Expense.DepartmentRef._text:null);
                                //     // console.log(Expense.Line.AccountBasedExpenseLineDetail.length);
                                //     if(Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef) {
                                //         console.log("ClassRef",Expense.Line.AccountBasedExpenseLineDetail);
                                //     }
                                //     const checkTenantExpenseResult = await checkTenantExpense(Expense.Id._text,getCompanyByTenantResult[0].id);
                                //     if(checkTenantExpenseResult[0].expense_count === 0) {
                                //
                                //         if(Expense.Line.length===undefined) {
                                //             let d = Expense.Line.Description?Expense.Line.Description._text.toString():"No description";
                                //             let c = Expense.Line.AccountBasedExpenseLineDetail?Expense.Line.AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //             let com = c + " - " + d;
                                //             console.log("Expense",Expense.Id._text, " Description", com, "Length is ",Expense.Line.length);
                                //             if (Expense.PaymentType._text === "CreditCard") {
                                //                 const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id,getUserByUserEmailResult.id)
                                //                 console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                //             }
                                //             else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                 const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id,getUserByUserEmailResult.id)
                                //                 console.log("Expenses Added Cash: ", Expense.Id._text)
                                //             }
                                //         }
                                //         else{
                                //             for (let i=0;i<Expense.Line.length;i++) {
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name + "-" + Expense.Line[i].Description?Expense.Line[i].Description._text:"-");
                                //                 let d = Expense.Line[i].Description?Expense.Line[i].Description._text.toString():"No description";
                                //                 let c = Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //                 let com = c + " - " + d;
                                //
                                //                 console.log("Expense",Expense.Id._text, " Description", com, "Length",Expense.Line.length);
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"-")
                                //                 if (Expense.PaymentType._text === "CreditCard") {
                                //                     // expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, total_amount, company_id, user_id
                                //                     const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id,getUserByUserEmailResult.id)
                                //                     console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                //                 }
                                //                 else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                     const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id,getUserByUserEmailResult.id)
                                //                     console.log("Expenses Added Cash: ", Expense.Id._text)
                                //                 }
                                //             }
                                //         }
                                //         // if (Expense.PaymentType._text === "CreditCard") {
                                //         //     const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,Expense.Line.AccountBasedExpenseLineDetail.AccountRef.name._text + " - " + Expense.Line.Description?Expense.Line.Description._text:null,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                                //         //     console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                //         // }
                                //         // else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //         //     const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,Expense.Line.AccountBasedExpenseLineDetail.AccountRef.name._text + " - " + Expense.Line.Description?Expense.Line.Description._text:null,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                                //         //     console.log("Expenses Added Cash: ", Expense.Id._text)
                                //         // }
                                //     }
                                //     else {
                                //         console.log("Found:", Expense.Id._text)
                                //         // console.log(Expense.Line[0].AccountBasedExpenseLineDetail.AccountRef._attributes.name);
                                //         // this.stop();
                                //         if(Expense.Line.length===undefined) {
                                //
                                //             let d = Expense.Line.Description?Expense.Line.Description._text.toString():"No description";
                                //             let c = Expense.Line.AccountBasedExpenseLineDetail?Expense.Line.AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //             let com = c + " - " + d;
                                //             console.log("Expense",Expense.Id._text, " Description", com, "Length is ",Expense.Line.length);
                                //             if (Expense.PaymentType._text === "CreditCard") {
                                //                 const updateExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id,getUserByUserEmailResult.id)
                                //                 console.log("Expenses Updated Credit Card: ", Expense.Id._text)
                                //             }
                                //             else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                 const addExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id,getUserByUserEmailResult.id)
                                //                 console.log("Expenses Updated Cash: ", Expense.Id._text)
                                //             }
                                //         }
                                //         else {
                                //             for (let i=0;i<Expense.Line.length;i++) {
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name + "-" + Expense.Line[i].Description?Expense.Line[i].Description._text:"-");
                                //                 let d = Expense.Line[i].Description?Expense.Line[i].Description._text.toString():"No description";
                                //                 let c = Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //                 let com = c + " - " + d;
                                //
                                //                 console.log("Expense",Expense.Id._text, " Description", com, "Length",Expense.Line.length);
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"-")
                                //                 if (Expense.PaymentType._text === "CreditCard") {
                                //                     const updateExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id,getUserByUserEmailResult.id)
                                //                     console.log("Expenses Updated Credit Card: ", Expense.Id._text)
                                //                 }
                                //                 else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                     const addExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id,getUserByUserEmailResult.id)
                                //                     console.log("Expenses Updated Cash: ", Expense.Id._text)
                                //                 }
                                //             }
                                //         }
                                //
                                //         // this.stop();
                                //     }
                                //
                                //     //Fetch attachable of expense
                                //     const getAttachableResult = await getAttachable(qb_access_token, jwtTokenDecode.realmid , Expense.Id._text);
                                //     const attachableArray = JSON.parse(getAttachableResult);
                                //     // console.log("attachable", attachableArray.IntuitResponse.QueryResponse.Attachable!==undefined?attachableArray.IntuitResponse.QueryResponse.Attachable:"undefined");
                                //     if(attachableArray.IntuitResponse.QueryResponse.Attachable!==undefined) {
                                //         // console.log("attachable",attachableArray.IntuitResponse.QueryResponse.Attachable);
                                //         Attachables.push(attachableArray.IntuitResponse.QueryResponse.Attachable);
                                //     }
                                //     else {
                                //         console.log("attachable is undefined");
                                //     }
                                // }


                                // for (const Expense of purchaseArray.IntuitResponse.QueryResponse.Purchase) {
                                //     // console.log("Dpt id",Expense.DepartmentRef?Expense.DepartmentRef._text:null);
                                //
                                //
                                //     const checkTenantExpenseResult = await checkTenantExpense(Expense.Id._text,getCompanyByTenantResult[0].id);
                                //     if(checkTenantExpenseResult[0].expense_count === 0) {
                                //         if(Expense.Line.length===undefined) {
                                //             let d = Expense.Line.Description?Expense.Line.Description._text.toString():"No description";
                                //             let c = Expense.Line.AccountBasedExpenseLineDetail?Expense.Line.AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //             let com = c + " - " + d;
                                //             console.log("Expense",Expense.Id._text, " Description", com, "Length is ",Expense.Line.length);
                                //             if (Expense.PaymentType._text === "CreditCard") {
                                //                 const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                //                 console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                //             }
                                //             else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                 const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                //                 console.log("Expenses Added Cash: ", Expense.Id._text)
                                //             }
                                //         }
                                //         else {
                                //             for (let i = 0; i < Expense.Line.length; i++) {
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name + "-" + Expense.Line[i].Description?Expense.Line[i].Description._text:"-");
                                //                 let d = Expense.Line[i].Description ? Expense.Line[i].Description._text.toString() : "No description";
                                //                 let c = Expense.Line[i].AccountBasedExpenseLineDetail ? Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString() : "No category";
                                //                 let com = c + " - " + d;
                                //
                                //                 console.log("Expense", Expense.Id._text, " Description", com, "Length", Expense.Line.length);
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"-")
                                //                 if (Expense.PaymentType._text === "CreditCard") {
                                //                     // expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, total_amount, company_id, user_id
                                //                     const updateExpenseResult = await addQuickbookExpense(Expense.Id._text, Expense.MetaData.CreateTime._text, Expense.MetaData.LastUpdatedTime._text, Expense.TxnDate._text, Expense.CurrencyRef._text, Expense.PaymentType._text, Expense.AccountRef ? Expense.AccountRef._text : null, com, Expense.Credit._text, null, null, null, Expense.DepartmentRef ? Expense.DepartmentRef._text : null, Expense.TotalAmt._text, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                //                     console.log("Expenses Added Credit Card: ", Expense.Id._text)
                                //                 } else if (Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                     const addExpenseResult = await addQuickbookExpense(Expense.Id._text, Expense.MetaData.CreateTime._text, Expense.MetaData.LastUpdatedTime._text, Expense.TxnDate._text, Expense.CurrencyRef._text, Expense.PaymentType._text, Expense.AccountRef ? Expense.AccountRef._text : null, com, null, Expense.EntityRef ? Expense.EntityRef._text : null, Expense.EntityRef ? Expense.EntityRef._attributes.name : null, Expense.EntityRef ? Expense.EntityRef._attributes.type : null, Expense.DepartmentRef ? Expense.DepartmentRef._text : null, Expense.TotalAmt._text, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                //                     console.log("Expenses Added Cash: ", Expense.Id._text)
                                //                 }
                                //             }
                                //         }
                                //     }
                                //     else {
                                //         console.log("Found:", Expense.Id._text)
                                //         if(Expense.Line.length===undefined) {
                                //             let d = Expense.Line.Description?Expense.Line.Description._text.toString():"No description";
                                //             let c = Expense.Line.AccountBasedExpenseLineDetail?Expense.Line.AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //             let com = c + " - " + d;
                                //             console.log("Expense",Expense.Id._text, " Description", com, "Length is ",Expense.Line.length);
                                //             if (Expense.PaymentType._text === "CreditCard") {
                                //                 const updateExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                //                 console.log("Expenses Updated Credit Card: ", Expense.Id._text)
                                //             }
                                //             else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                 const addExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                //                 console.log("Expenses Updated Cash: ", Expense.Id._text)
                                //             }
                                //         }
                                //         else {
                                //             for (let i=0;i<Expense.Line.length;i++) {
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name + "-" + Expense.Line[i].Description?Expense.Line[i].Description._text:"-");
                                //                 let d = Expense.Line[i].Description?Expense.Line[i].Description._text.toString():"No description";
                                //                 let c = Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                                //                 let com = c + " - " + d;
                                //
                                //                 console.log("Expense",Expense.Id._text, " Description", com, "Length",Expense.Line.length);
                                //                 // console.log(Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"-")
                                //                 if (Expense.PaymentType._text === "CreditCard") {
                                //                     const updateExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                //                     console.log("Expenses Updated Credit Card: ", Expense.Id._text)
                                //                 }
                                //                 else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                //                     const addExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,getCompanyByTenantResult[0].id, getUserByUserEmailResult.id)
                                //                     console.log("Expenses Updated Cash: ", Expense.Id._text)
                                //                 }
                                //             }
                                //         }
                                //     }
                                //
                                //     //Fetch attachable of expense
                                //     const getAttachableResult = await getAttachable(qb_access_token, jwtTokenDecode.realmid, Expense.Id._text);
                                //     const attachableArray = JSON.parse(getAttachableResult);
                                //     // console.log("attachable", attachableArray.IntuitResponse.QueryResponse.Attachable!==undefined?attachableArray.IntuitResponse.QueryResponse.Attachable:"undefined");
                                //     if(attachableArray.IntuitResponse.QueryResponse.Attachable!==undefined) {
                                //         // console.log("attachable",attachableArray.IntuitResponse.QueryResponse.Attachable);
                                //         Attachables.push(attachableArray.IntuitResponse.QueryResponse.Attachable);
                                //
                                //     }
                                //     else {
                                //         console.log("attachable is undefined");
                                //     }
                                // }
//Comment
                                // for (const Attachable of Attachables) {
                                //     console.log("attachable", Attachable.AttachableRef.EntityRef._text, getCompanyByTenantResult[0].id, Attachable.FileName._text, Attachable.TempDownloadUri._text, Attachable.Size._text, Attachable.Id._text,Attachable.MetaData.CreateTime._text,Attachable.MetaData.LastUpdatedTime._text);
                                //     let checkAttachableResult = await checkAttachable(Attachable.Id._text,Attachable.AttachableRef.EntityRef._text);
                                //     if(checkAttachableResult[0].attach_count === 0) {
                                //         let addAttachableResult = await addAttachable(Attachable.AttachableRef.EntityRef._text, getCompanyByTenantResult[0].id, Attachable.FileName._text, Attachable.TempDownloadUri._text, Attachable.Size._text, Attachable.Id._text,Attachable.MetaData.CreateTime._text,Attachable.MetaData.LastUpdatedTime._text);
                                //         console.log("attachable inserted",Attachable.AttachableRef.EntityRef._text, Attachable.Id._text);
                                //     }
                                //     else {
                                //         let updateAttachableResult = await updateAttachable(Attachable.AttachableRef.EntityRef._text, getCompanyByTenantResult[0].id, Attachable.FileName._text, Attachable.TempDownloadUri._text, Attachable.Size._text, Attachable.Id._text,Attachable.MetaData.CreateTime._text,Attachable.MetaData.LastUpdatedTime._text);
                                //     }
                                // }

                                // console.log("attachables",Attachables);



                                //Get Departments

                                //Comment
                                console.log("Departemnt check",departmentArray.IntuitResponse.QueryResponse.Department);
                                // if(departmentArray.IntuitResponse.QueryResponse.Department!=undefined) {
                                //     for(const Department of departmentArray.IntuitResponse.QueryResponse.Department) {
                                //         const checkTenantDepartmentResult = await checkTenantDepartment(Department.Id._text,getCompanyByTenantResult[0].id);
                                //         if(checkTenantDepartmentResult[0].depart_count === 0) {
                                //             if(Department.SubDepartment._text.toString() === "true") {
                                //                 const addDepartmentResult = await addDepartment(Department.Id._text, Department.Name._text, Department.ParentRef._text, Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                                //                 console.log("New Department with sub depart created, ",Department.Id._text, Department.Name._text, Department.ParentRef.value,Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id);
                                //             }
                                //             else {
                                //                 const addDepartmentResult = await addDepartment(Department.Id._text, Department.Name._text, null, Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                                //                 console.log("New Department created, ",Department.Id._text, Department.Name._text, null,Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id);
                                //             }
                                //         }
                                //         else {
                                //             console.log("Found:", Department.Id._text)
                                //             if(Department.SubDepartment._text.toString() === "true") {
                                //                 const updateDepartmentResult = await updateDepartment(Department.Id._text, Department.Name._text, Department.ParentRef._text, Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                                //                 console.log("New Department with sub depart updated, ",Department.Id._text, Department.Name._text, Department.ParentRef._text,Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id);
                                //             }
                                //             else {
                                //                 const updateDepartmentResult = await updateDepartment(Department.Id._text, Department.Name._text, null, Department.Active._text==="true"?1:0, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                                //                 console.log("New Department updated, ",Department.Id._text, Department.Name._text, null,Department.Active._text==="true"?1:0,getCompanyByTenantResult[0].id, getUserByUserEmailResult.id);
                                //             }
                                //         }
                                //     }
                                // }
                                // if(classArray.IntuitResponse.QueryResponse.Class!=undefined) {
                                //     for(const Class of classArray.IntuitResponse.QueryResponse.Class) {
                                //         const checkTenantDepartmentResult = await checkTenantDepartment(Class.Id._text,getCompanyByTenantResult[0].id);
                                //         if(checkTenantDepartmentResult[0].depart_count === 0) {
                                //             if(Class.SubClass._text.toString() === "true") {
                                //                 const addDepartmentResult = await addDepartment(Class.Id._text, Class.Name._text, Class.ParentRef._text, Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                //                 console.log("New Class with sub class created, ",Class.Id._text, Class.Name._text, Class.ParentRef.value,Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id);
                                //             }
                                //             else {
                                //                 const addDepartmentResult = await addDepartment(Class.Id._text, Class.Name._text, null, Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                //                 console.log("New Class created, ",Class.Id._text, Class.Name._text, null,Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id);
                                //             }
                                //         }
                                //         else {
                                //             console.log("Found:", Class.Id._text)
                                //             if(Class.SubClass._text.toString() === "true") {
                                //                 const updateDepartmentResult = await updateDepartment(Class.Id._text, Class.Name._text, Class.ParentRef._text, Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                //                 console.log("New Class with sub Class updated, ",Class.Id._text, Class.Name._text, Class.ParentRef._text,Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id);
                                //             }
                                //             else {
                                //                 const updateDepartmentResult = await updateDepartment(Class.Id._text, Class.Name._text, null, Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                                //                 console.log("New Class updated, ",Class.Id._text, Class.Name._text, null,Class.Active._text==="true"?1:0, getCompanyByTenantResult[0].id,getUserByUserEmailResult.id);
                                //             }
                                //         }
                                //     }
                                // }


                                //Get vendors
                                //Comment
                                // if(vendorArray.IntuitResponse.QueryResponse.Vendor!=undefined) {
                                //     for(const Vendor of vendorArray.IntuitResponse.QueryResponse.Vendor) {
                                //         const checkTenantVendorResult = await checkTenantVendor(Vendor.Id._text,getCompanyByTenantResult[0].id);
                                //         if(checkTenantVendorResult[0].vendor_count === 0) {
                                //             // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                                //             // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                                //             // console.log("address",address);
                                //             console.log(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                                //             const addVendorResult = await addVendor(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                                //             console.log("added");
                                //         }
                                //         else {
                                //             console.log("found ",Vendor.Id._text);
                                //             const addVendorResult = await updateVendor(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', getCompanyByTenantResult[0].id, getUserByUserEmailResult.id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                                //             console.log("updated");
                                //         }
                                //     }
                                // }

                                // const updateCompanyCodeResult = await updateCompanyInfo(jwtTokenDecode.realmid, 'USD',companyArray.IntuitResponse.CompanyInfo.CompanyName._text,CompanyType[0].Value._text!=undefined||null?CompanyType[0].Value._text:null,IndustryType[0].Value._text!=undefined||null?IndustryType[0].Value._text:null);
                                // console.log("UPDATE WHILE LOGIN:",jwtTokenDecode.realmid, 'USD',companyArray.IntuitResponse.CompanyInfo.CompanyName._text);
                            }
                            const updateCompanyTokenResult = await updateCompanyToken(jwtTokenDecode.realmid, qb_access_token, qb_refresh_token, expire_at);
                            await disableAllQuickbookAccounts(getUserByUserEmailResult.id);
                            await activeQuickbookAccount(jwtTokenDecode.realmid);
                        console.log("updateCompanyTokenResult");
                        console.log("Login Working");
                        res.redirect(`${process.env.APP_URL}xero_login/`+ encodeURIComponent(userArray.email)+`/quickbooks/1/`+ token);
                    }
                }
                else {
                    return res.redirect(`${process.env.APP_URL}login/error/xr`);
                }
            })
            .catch(function (e) {
                console.error(e);
                return res.send('error');
            });
    },
    quickbook_refresh_token: async (req, res) => {
        const email = req.params.email;
        // const getRefreshTokenResult = await getRefreshToken(email);
        const getUserByUserEmailResult = await getUserByUserEmail(email);
        const record = await getActivateCompany(getUserByUserEmailResult.id);
        console.log("active Company", record[0]);
        let expire_at = record[0].expire_at;
        let ts = Number(expire_at); // cast it to a Number
        // console.log("exipre_at",record[0].expire_at);
        // console.log("Ts",ts);
        const unixTimestamp = ts;
        const milliseconds = unixTimestamp * 1000 // 1575909015000
        const expire = new Date(milliseconds).toLocaleString();
        let current_date = new Date().toLocaleString();
        // console.log(ts);
        // console.log(expire_at);
        console.log("expire date", expire);
        console.log("current_date", current_date);
        if (current_date > expire) {
            console.log("Expired");
            await oauthClient
                .refreshUsingToken(record[0].refresh_token)
                .then(async function (authResponse) {
                    console.log(`The Refresh Token is  ${JSON.stringify(authResponse.getJson())}`);
                    oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
                    let array = JSON.parse(oauth2_token_json);
                    qb_access_token = array.access_token;
                    qb_refresh_token = array.refresh_token;
                    qb_id_token = array.id_token;
                    qb_expire_at = array.x_refresh_token_expires_in;

                    let now = new Date();
                    let time = now.getTime();
                    time += 3600 * 1000;
                    let expire_at = time.toString().substring(0,10);

                    const updateRefreshTokenResult = await updateRefreshToken(email, qb_access_token, qb_refresh_token, expire_at);
                    const updateCompanyTokenResult = await updateCompanyToken(record[0].tenant_id, qb_access_token, qb_refresh_token, expire_at);
                    console.log(updateRefreshTokenResult);
                    return res.json({
                        status:200,
                        tokenSet: array
                    });
                    // res.send(oauth2_token_json);
                })
                .catch(function (e) {
                    console.error(e);
                    return res.json({
                        status:400,
                        message: "Something went wrong"
                    });
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
    syncAccounts: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const record = await getActivateCompany(user_id);
            const user = await editUser(user_id);
            console.log(record);
            console.log("tenant:", record[0].tenant_id,record[0].access_token)
            let accounts = await get_accounts(record[0].access_token, record[0].tenant_id);
            let accountArray = JSON.parse(accounts);
            console.log("Account:",accounts);
            for (const Account of accountArray.IntuitResponse.QueryResponse.Account) {
                const checkTenantAccountResult = await checkTenantAccount(Account.Id._text,company_id);
                console.log("account id:",Account.Id._text,"company id:",company_id,"count:",checkTenantAccountResult[0].account_count);
                if(checkTenantAccountResult[0].account_count === 0) {
                    console.log(null, Account.Id._text, Account.Name._text, Account.Classification._text, Account.Active._text=="true"?1:0, null, Account.CurrencyRef._text, Account.MetaData.CreateTime._text, company_id, user_id,"quickbooks");
                    const createTenantAccountResult = await createTenantAccount(null, Account.Id._text, Account.Name._text, Account.Classification._text, Account.Active._text=="true"?1:0, null, Account.CurrencyRef._text, Account.MetaData.CreateTime._text, company_id, user_id,"quickbooks");
                }
                else{
                    console.log("Found",null, Account.Id._text, Account.Name._text, Account.Classification._text, Account.Active._text=="true"?1:0, null, Account.CurrencyRef._text, Account.MetaData.CreateTime._text, company_id, user_id,"quickbooks");
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
            const user = await editUser(user_id);

            const Attachables = [];
            console.log("tenant:", record[0].tenant_id, record[0].access_token);
            let purchases = await getPurchases(record[0].access_token, record[0].tenant_id);
            let purchaseArray = JSON.parse(purchases);
            console.log("purchase",purchaseArray);
            for (const Expense of purchaseArray.IntuitResponse.QueryResponse.Purchase) {
                // console.log("Dpt id",Expense.DepartmentRef?Expense.DepartmentRef._text:null);
                // console.log(Expense.Line.AccountBasedExpenseLineDetail.length);
                if(Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef) {
                    console.log("ClassRef",Expense.Line.AccountBasedExpenseLineDetail);
                }
                const checkTenantExpenseResult = await checkTenantExpense(Expense.Id._text,company_id);
                if(checkTenantExpenseResult[0].expense_count === 0) {

                    if(Expense.Line.length===undefined) {
                        let d = Expense.Line.Description?Expense.Line.Description._text.toString():"No description";
                        let c = Expense.Line.AccountBasedExpenseLineDetail?Expense.Line.AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                        let com = c + " - " + d;
                        console.log("Expense",Expense.Id._text, " Description", com, "Length is ",Expense.Line.length);
                        if (Expense.PaymentType._text === "CreditCard") {
                            const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                            console.log("Expenses Added Credit Card: ", Expense.Id._text)
                        }
                        else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                            const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                            console.log("Expenses Added Cash: ", Expense.Id._text)
                        }
                    }
                    else{
                        for (let i=0;i<Expense.Line.length;i++) {
                            // console.log(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name + "-" + Expense.Line[i].Description?Expense.Line[i].Description._text:"-");
                            let d = Expense.Line[i].Description?Expense.Line[i].Description._text.toString():"No description";
                            let c = Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                            let com = c + " - " + d;

                            console.log("Expense",Expense.Id._text, " Description", com, "Length",Expense.Line.length);
                            // console.log(Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"-")
                            if (Expense.PaymentType._text === "CreditCard") {
                                                                                                                    // expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, total_amount, company_id, user_id
                                const updateExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                                console.log("Expenses Added Credit Card: ", Expense.Id._text)
                            }
                            else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                                console.log("Expenses Added Cash: ", Expense.Id._text)
                            }
                        }
                    }
                    // if (Expense.PaymentType._text === "CreditCard") {
                    //     const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,Expense.Line.AccountBasedExpenseLineDetail.AccountRef.name._text + " - " + Expense.Line.Description?Expense.Line.Description._text:null,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                    //     console.log("Expenses Added Credit Card: ", Expense.Id._text)
                    // }
                    // else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                    //     const addExpenseResult = await addQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,Expense.Line.AccountBasedExpenseLineDetail.AccountRef.name._text + " - " + Expense.Line.Description?Expense.Line.Description._text:null,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                    //     console.log("Expenses Added Cash: ", Expense.Id._text)
                    // }
                }
                else {
                    console.log("Found:", Expense.Id._text)
                    // console.log(Expense.Line[0].AccountBasedExpenseLineDetail.AccountRef._attributes.name);
                    // this.stop();
                    if(Expense.Line.length===undefined) {

                        let d = Expense.Line.Description?Expense.Line.Description._text.toString():"No description";
                        let c = Expense.Line.AccountBasedExpenseLineDetail?Expense.Line.AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                        let com = c + " - " + d;
                        console.log("Expense",Expense.Id._text, " Description", com, "Length is ",Expense.Line.length);
                        if (Expense.PaymentType._text === "CreditCard") {
                            const updateExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                            console.log("Expenses Updated Credit Card: ", Expense.Id._text)
                        }
                        else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                            const addExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                            console.log("Expenses Updated Cash: ", Expense.Id._text)
                        }
                    }
                    else {
                        for (let i=0;i<Expense.Line.length;i++) {
                            // console.log(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name + "-" + Expense.Line[i].Description?Expense.Line[i].Description._text:"-");
                            let d = Expense.Line[i].Description?Expense.Line[i].Description._text.toString():"No description";
                            let c = Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"No category";
                            let com = c + " - " + d;

                            console.log("Expense",Expense.Id._text, " Description", com, "Length",Expense.Line.length);
                            // console.log(Expense.Line[i].AccountBasedExpenseLineDetail?Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._attributes.name.toString():"-")
                            if (Expense.PaymentType._text === "CreditCard") {
                                const updateExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,Expense.Credit._text,null,null,null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                                console.log("Expenses Updated Credit Card: ", Expense.Id._text)
                            }
                            else if(Expense.PaymentType._text === "Cash" || Expense.PaymentType._text === "Check") {
                                const addExpenseResult = await updateQuickbookExpense(Expense.Id._text,Expense.MetaData.CreateTime._text,Expense.MetaData.LastUpdatedTime._text,Expense.TxnDate._text,Expense.CurrencyRef._text,Expense.PaymentType._text,Expense.AccountRef?Expense.AccountRef._text:null,com,null,Expense.EntityRef?Expense.EntityRef._text:null,Expense.EntityRef?Expense.EntityRef._attributes.name:null,Expense.EntityRef?Expense.EntityRef._attributes.type:null,Expense.DepartmentRef?Expense.DepartmentRef._text:null,Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null,Expense.TotalAmt._text,company_id,user_id)
                                console.log("Expenses Updated Cash: ", Expense.Id._text)
                            }
                        }
                    }

                    // this.stop();
                }

                //Fetch attachable of expense
                const getAttachableResult = await getAttachable(record[0].access_token, record[0].tenant_id , Expense.Id._text);
                const attachableArray = JSON.parse(getAttachableResult);
                // console.log("attachable", attachableArray.IntuitResponse.QueryResponse.Attachable!==undefined?attachableArray.IntuitResponse.QueryResponse.Attachable:"undefined");
                if(attachableArray.IntuitResponse.QueryResponse.Attachable!==undefined) {
                    // console.log("attachable",attachableArray.IntuitResponse.QueryResponse.Attachable);
                    Attachables.push(attachableArray.IntuitResponse.QueryResponse.Attachable);
                }
                else {
                    console.log("attachable is undefined");
                }
            }

            for (const Attachable of Attachables) {
                // console.log("attachable", Attachable.AttachableRef.EntityRef._text, company_id, Attachable.FileName._text, Attachable.TempDownloadUri._text, Attachable.Size._text, Attachable.Id._text,Attachable.MetaData.CreateTime._text,Attachable.MetaData.LastUpdatedTime._text);
                let checkAttachableResult = await checkAttachable(Attachable.Id._text,Attachable.AttachableRef.EntityRef._text);
                if(checkAttachableResult[0].attach_count === 0) {
                    let addAttachableResult = await addAttachable(Attachable.AttachableRef.EntityRef._text, company_id, Attachable.FileName._text, Attachable.TempDownloadUri._text, Attachable.Size._text, Attachable.Id._text,Attachable.MetaData.CreateTime._text,Attachable.MetaData.LastUpdatedTime._text);
                    console.log("attachable inserted",Attachable.AttachableRef.EntityRef._text, Attachable.Id._text);
                }
                else {
                    let updateAttachableResult = await updateAttachable(Attachable.AttachableRef.EntityRef._text, company_id, Attachable.FileName._text, Attachable.TempDownloadUri._text, Attachable.Size._text, Attachable.Id._text,Attachable.MetaData.CreateTime._text,Attachable.MetaData.LastUpdatedTime._text);
                    console.log("attachable updated",Attachable.AttachableRef.EntityRef._text, Attachable.Id._text);
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
    activateCompany: async  (req, res) => {
        try {
            const body = req.body;
            console.log("body:",body.user_id);
            console.log("body:",body.selectedCompany);
            const disableAllCompanyResult = await disableAllCompany(body.user_id);
            const activateCompanyResult = await activateCompany(body.selectedCompany);

            const company = await getActivateCompany(body.user_id);

             console.log(company[0].expire_at);

             if(company[0].expire_at!== null) {
                 let expire_at = company[0].expire_at;
                 let ts = Number(expire_at); // cast it to a Number
                 const unixTimestamp = ts;
                 const milliseconds = unixTimestamp * 1000 // 1575909015000
                 const expire = new Date(milliseconds).toLocaleString();
                 let current_date = new Date().toLocaleString();
                 console.log(ts);
                 console.log(expire_at);
                 console.log("exipre date", expire);
                 console.log("current_date", current_date);
                 if (current_date > expire) {
                     console.log("Expired");
                     oauthClient
                         .refreshUsingToken(company[0].refresh_token)
                         .then(async function (authResponse) {
                             console.log(`The Refresh Token is  ${JSON.stringify(authResponse.getJson())}`);
                             oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
                             let array = JSON.parse(oauth2_token_json);
                             qb_access_token = array.access_token;
                             qb_refresh_token = array.refresh_token;
                             qb_id_token = array.id_token;
                             qb_expire_at = array.x_refresh_token_expires_in;

                             let now = new Date();
                             let time = now.getTime();
                             time += 3600 * 1000;
                             let expire_at = time.toString().substring(0,10);

                             // const updateRefreshTokenResult = await updateRefreshToken(email, qb_access_token, qb_refresh_token, expire_at);
                             const updateCompanyTokenResult = await updateCompanyToken(company[0].tenant_id, qb_access_token, qb_refresh_token, expire_at);
                             console.log(updateCompanyTokenResult);
                             // return res.json({
                             //     status:200,
                             //     tokenSet: array
                             // });
                             // res.send(oauth2_token_json);
                         })
                         .catch(function (e) {
                             console.error(e);
                         });
                 }
                 else {
                     console.log("Not Expired");
                 }
             }
             else {
                 console.log("Null");
                 oauthClient
                     .refreshUsingToken(company[0].refresh_token)
                     .then(async function (authResponse) {
                         console.log(`The Refresh Token is  ${JSON.stringify(authResponse.getJson())}`);
                         oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
                         let array = JSON.parse(oauth2_token_json);
                         qb_access_token = array.access_token;
                         qb_refresh_token = array.refresh_token;
                         qb_id_token = array.id_token;
                         qb_expire_at = array.x_refresh_token_expires_in;

                         let now = new Date();
                         let time = now.getTime();
                         time += 3600 * 1000;
                         let expire_at = time.toString().substring(0,10);

                         // const updateRefreshTokenResult = await updateRefreshToken(email, qb_access_token, qb_refresh_token, expire_at);
                         const updateCompanyTokenResult = await updateCompanyToken(company[0].tenant_id, qb_access_token, qb_refresh_token, expire_at);
                         console.log(updateCompanyTokenResult);
                         // return res.json({
                         //     status:200,
                         //     tokenSet: array
                         // });
                         // res.send(oauth2_token_json);
                     })
                     .catch(function (e) {
                         console.error(e);
                     });
             }

            return res.json({
                success: 1,
                message: "Company Activated Successfully"
            });
        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    syncDepartments: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const record = await getActivateCompany(user_id);
            const user = await editUser(user_id);
            console.log("tenant:", record[0].tenant_id, record[0].access_token);
            let departments = await getDepartments(record[0].access_token, record[0].tenant_id);
            let classes = await getClasses(record[0].access_token, record[0].tenant_id);

            let departmentArray = JSON.parse(departments);
            let classArray = JSON.parse(classes);

            console.log("departments",departmentArray);
            console.log("classes", classArray.IntuitResponse.QueryResponse.Class);
            if(departmentArray.IntuitResponse.QueryResponse.Department!=undefined || classArray.IntuitResponse.QueryResponse.Class!=undefined) {
                for(const Department of departmentArray.IntuitResponse.QueryResponse.Department) {
                    const checkTenantDepartmentResult = await checkTenantDepartment(Department.Id._text,company_id);
                    if(checkTenantDepartmentResult[0].depart_count === 0) {
                        if(Department.SubDepartment._text.toString() === "true") {
                            const addDepartmentResult = await addDepartment(Department.Id._text, Department.Name._text, Department.ParentRef._text, Department.Active._text==="true"?1:0, company_id,user_id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                            console.log("New Department with sub depart created, ",Department.Id._text, Department.Name._text, Department.ParentRef.value,Department.Active._text==="true"?1:0, company_id,user_id);
                        }
                        else {
                            const addDepartmentResult = await addDepartment(Department.Id._text, Department.Name._text, null, Department.Active._text==="true"?1:0, company_id,user_id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                            console.log("New Department created, ",Department.Id._text, Department.Name._text, null,Department.Active._text==="true"?1:0, company_id,user_id);
                        }
                    }
                    else {
                        console.log("Found:", Department.Id._text)
                        if(Department.SubDepartment._text.toString() === "true") {
                            const updateDepartmentResult = await updateDepartment(Department.Id._text, Department.Name._text, Department.ParentRef._text, Department.Active._text==="true"?1:0, company_id,user_id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                            console.log("New Department with sub depart updated, ",Department.Id._text, Department.Name._text, Department.ParentRef._text,Department.Active._text==="true"?1:0, company_id,user_id);
                        }
                        else {
                            const updateDepartmentResult = await updateDepartment(Department.Id._text, Department.Name._text, null, Department.Active._text==="true"?1:0, company_id,user_id, Department.MetaData.CreateTime._text,Department.MetaData.LastUpdatedTime._text);
                            console.log("New Department updated, ",Department.Id._text, Department.Name._text, null,Department.Active._text==="true"?1:0, company_id,user_id);
                        }
                    }
                }
            }
            else if(classArray.IntuitResponse.QueryResponse.Class!=undefined) {
                for(const Class of classArray.IntuitResponse.QueryResponse.Class) {
                    const checkTenantDepartmentResult = await checkTenantDepartment(Class.Id._text,company_id);
                    if(checkTenantDepartmentResult[0].depart_count === 0) {
                        if(Class.SubClass._text.toString() === "true") {
                            const addDepartmentResult = await addDepartment(Class.Id._text, Class.Name._text, Class.ParentRef._text, Class.Active._text==="true"?1:0, company_id,user_id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                            console.log("New Class with sub class created, ",Class.Id._text, Class.Name._text, Class.ParentRef.value,Class.Active._text==="true"?1:0, company_id,user_id);
                        }
                        else {
                            const addDepartmentResult = await addDepartment(Class.Id._text, Class.Name._text, null, Class.Active._text==="true"?1:0, company_id,user_id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                            console.log("New Class created, ",Class.Id._text, Class.Name._text, null,Class.Active._text==="true"?1:0, company_id,user_id);
                        }
                    }
                    else {
                        console.log("Found:", Class.Id._text)
                        if(Class.SubClass._text.toString() === "true") {
                            const updateDepartmentResult = await updateDepartment(Class.Id._text, Class.Name._text, Class.ParentRef._text, Class.Active._text==="true"?1:0, company_id,user_id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                            console.log("New Class with sub Class updated, ",Class.Id._text, Class.Name._text, Class.ParentRef._text,Class.Active._text==="true"?1:0, company_id,user_id);
                        }
                        else {
                            const updateDepartmentResult = await updateDepartment(Class.Id._text, Class.Name._text, null, Class.Active._text==="true"?1:0, company_id,user_id, Class.MetaData.CreateTime._text,Class.MetaData.LastUpdatedTime._text);
                            console.log("New Class updated, ",Class.Id._text, Class.Name._text, null,Class.Active._text==="true"?1:0, company_id,user_id);
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
    syncVendors: async (req, res) => {
        const user_id = req.params.user_id;
        const company_id = req.params.company_id;
        const record = await getActivateCompany(user_id);
        const user = await editUser(user_id);
        console.log("tenant:", record[0].tenant_id, record[0].access_token);
        let vendors = await getVendors(record[0].access_token, record[0].tenant_id);
        let vendorArray = JSON.parse(vendors);
        console.log("departments",vendorArray.IntuitResponse.QueryResponse.Vendor);
        if(vendorArray.IntuitResponse.QueryResponse.Vendor!=undefined) {
            for(const Vendor of vendorArray.IntuitResponse.QueryResponse.Vendor) {
                const checkTenantVendorResult = await checkTenantVendor(Vendor.Id._text,company_id);
                if(checkTenantVendorResult[0].vendor_count === 0) {
                                                            // vendor_id, name, V4IDPseudonym, phone, mobile, email, web, address, city, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at,
                    // let address = Vendor.BillAddr!=undefined?Vendor.BillAddr:null;
                    // console.log("address",address);
                    console.log(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', company_id, user_id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                    const addVendorResult = await addVendor(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', company_id, user_id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                    console.log("added");
                }
                else {
                    console.log("found ",Vendor.Id._text);
                    const addVendorResult = await updateVendor(Vendor.Id._text, Vendor.DisplayName._text, Vendor.V4IDPseudonym._text, Vendor.PrimaryPhone!=null?Vendor.PrimaryPhone.FreeFormNumber._text:null, Vendor.Mobile!=null?Vendor.Mobile.FreeFormNumber._text:null, Vendor.PrimaryEmailAddr!=null?Vendor.PrimaryEmailAddr.Address._text:null, Vendor.WebAddr!=null?Vendor.WebAddr.URI._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.Line1._text:null,Vendor.BillAddr!=undefined?Vendor.BillAddr.City._text:null, Vendor.BillAddr!=undefined?Vendor.BillAddr.PostalCode._text:null, Vendor.Balance._text, Vendor.AcctNum!=null?Vendor.AcctNum._text:null, Vendor.CurrencyRef._text, Vendor.Active._text==true?1:0, 'quickbooks', company_id, user_id, Vendor.MetaData.CreateTime._text,Vendor.MetaData.LastUpdatedTime._text);
                    console.log("updated");
                }
            }
        }
        else {
            return res.json({
                status: 200,
                message: "No Vendor Found!"
            })
        }

        return res.json({
            status: 200,
            message: "Vendors synced successfully!"
        })
    }
};