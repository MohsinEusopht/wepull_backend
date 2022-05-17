const {validateAdminPermission} = require("../../permissions/admin_permission");
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
    syncDepartments,
    viewAttachment,
    syncVendors
} = require("./xero.controller");

router.get("/xero_url",xero_url);
router.get("/xero_callback", xero_callback);
router.get("/xero_refresh_token/:email", xero_refresh_token_function);
router.get('/xero_get_tenants',validateAdminPermission, xero_get_tenants);
router.post("/xero_login", xero_login);
router.get('/getAccounts/:company_id',validateAdminPermission, getAccounts);
router.post('/createXeroAccount',validateAdminPermission, createXeroAccount);

router.get('/viewAttachment/:user_id/:attach_id', viewAttachment);

router.get('/syncAccounts/:user_id/:company_id',validateAdminPermission, syncAccounts);
router.get('/syncExpenses/:user_id/:company_id',validateAdminPermission, syncExpenses);
router.get('/syncDepartments/:user_id/:company_id',validateAdminPermission, syncDepartments);
router.get('/syncVendors/:user_id/:company_id',validateAdminPermission, syncVendors);


module.exports = router;