const {validateAdminPermission} = require("../../permissions/admin_permission");
const router = require("express").Router();
const {
    quickbooks_url,
    quickbooks_callback,
    quickbook_refresh_token,
    syncAccounts,
    syncExpenses,
    quickbookUpdateAllData,
    activateCompany,
    syncDepartments,
    syncVendors,
    syncAttachable,
    quickbookDisconnect
} = require("./quickbook.controller");
router.get("/quickbooks_url/:login_type",quickbooks_url);
router.get("/quickbooks_callback", quickbooks_callback);
router.get("/quickbook_refresh_token/:email", quickbook_refresh_token);
// router.get('/quickbook_company_info', quickbook_company_info);
// router.post("/xero_login", xero_login);
router.post('/activateCompany',validateAdminPermission, activateCompany);
router.get('/disconnect/:user_id/:company_id', quickbookDisconnect);

router.get('/syncAccounts/:user_id/:company_id',validateAdminPermission, syncAccounts);
router.get('/syncExpenses/:user_id/:company_id',validateAdminPermission, syncExpenses);
router.get('/syncDepartments/:user_id/:company_id',validateAdminPermission, syncDepartments);
router.get('/syncVendors/:user_id/:company_id',validateAdminPermission, syncVendors);
router.get('/syncAttachable/:user_id/:company_id', syncAttachable);

//Route for fetch all data
router.get('/quickbookUpdateAllData/:user_id/:company_id', quickbookUpdateAllData);


module.exports = router;