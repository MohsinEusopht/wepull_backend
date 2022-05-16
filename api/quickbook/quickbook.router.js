const {validateAdminPermission} = require("../../permissions/admin_permission");
const router = require("express").Router();
const {
    quickbooks_url,
    quickbooks_callback,
    quickbook_refresh_token,
    syncAccounts,
    syncExpenses,
    activateCompany,
    syncDepartments,
    syncVendors,
    syncAttachable
} = require("./quickbook.controller");
router.get("/quickbooks_url",quickbooks_url);
router.get("/quickbooks_callback", quickbooks_callback);
router.get("/quickbook_refresh_token/:email", quickbook_refresh_token);
// router.get('/quickbook_company_info', quickbook_company_info);
// router.post("/xero_login", xero_login);
router.post('/activateCompany',validateAdminPermission, activateCompany);

router.get('/syncAccounts/:user_id/:company_id',validateAdminPermission, syncAccounts);
router.get('/syncExpenses/:user_id/:company_id',validateAdminPermission, syncExpenses);
router.get('/syncDepartments/:user_id/:company_id',validateAdminPermission, syncDepartments);
router.get('/syncVendors/:user_id/:company_id',validateAdminPermission, syncVendors);
router.get('/syncAttachable/:expense_id/:company_id/:user_id', syncAttachable);




module.exports = router;