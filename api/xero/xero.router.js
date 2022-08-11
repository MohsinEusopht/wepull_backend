const {validateAdminPermission} = require("../../permissions/admin_permission");
const {validateUserPermission} = require("../../permissions/user_permission");
const router = require("express").Router();
const {
    xero_url,
    xero_callback,
    xero_refresh_token_function,
    xero_get_tenants,
    xero_login,
    getAccounts,
    createXeroAccount,
    syncAccounts,
    syncExpenses,
    xeroUpdateAllData,
    syncDepartments,
    viewAttachment,
    syncVendors,
    xero_callback_sign_up,
    xero_url_sign_up,
    xeroDisconnect,
    activateCompany,
    userSyncExpense
} = require("./xero.controller");

// router.get("/xero_check_login",xero_check_login);

router.post('/activateCompany', activateCompany);

router.get("/xero_url/:login_type",xero_url);
router.get("/xero_url_sign_up",xero_url_sign_up);
// router.get("")
router.get("/xero_callback", xero_callback);
router.get("/xero_callback_sign_up", xero_callback_sign_up);

router.get("/disconnect/:user_id/:company_id", xeroDisconnect);

router.get("/xero_refresh_token/:email", xero_refresh_token_function);
router.get('/xero_get_tenants',validateAdminPermission, xero_get_tenants);
router.post("/xero_login", xero_login);
router.get('/getAccounts/:company_id', getAccounts);
router.post('/createXeroAccount',validateAdminPermission, createXeroAccount);

router.get('/viewAttachment/:user_id/:attach_id', viewAttachment);

router.get('/syncAccounts/:user_id/:company_id',validateAdminPermission, syncAccounts);
router.get('/syncExpenses/:user_id/:company_id',validateAdminPermission, syncExpenses);
router.get('/syncDepartments/:user_id/:company_id',validateAdminPermission, syncDepartments);
router.get('/syncVendors/:user_id/:company_id',validateAdminPermission, syncVendors);

//Route for fetch all data
router.get('/xeroUpdateAllData/:user_id/:company_id', xeroUpdateAllData);

router.get('/userSyncExpense/:user_id/:company_id',validateUserPermission, userSyncExpense);

module.exports = router;