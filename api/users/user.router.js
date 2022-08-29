const router = require("express").Router();
const { validateUserPermission } = require("../../permissions/user_permission");
const { validateAdminPermission } = require("../../permissions/admin_permission");
const {
    defaultFun,
    signUp,
    login,
    getRoles,
    createUser,
    getDeparts,
    getUsers,
    getAdminById,
    inactivateUser,
    activateUser,
    hardDeleteUser,
    editUser,
    updateUser,
    getCompany,
    getDepartOfUser,
    getCompanyManagementUsers,
    getCompanyDeparts,
    getParentDeparts,
    createDepart,
    deleteDepart,
    editDepart,
    updateDepart,
    checkUser,
    passwordReset,
    checkPasswordResetToken,
    updatePassword,
    getLoginToken,
    getCompanyByTenant,
    getCompanyAccount,
    activateCompany,
    getActiveCompany,
    getQuickbookExpenses,
    getActivateCompany,
    getXeroExpenses,
    getCompanyByID,
    getQuickbooksExpenseByAccount,
    getAccountByID,
    getXeroExpenseByAccount,
    getCounts,
    getDepartmentUsers,
    getCountsForAccountant,
    getQuickbookExpenseAttachment,
    updateUserAsManager,
    activateDepart,
    checkSetupAccount,
    updateSetupAccount,
    updateUserProfile,
    getDepartByID,
    checkUserPassword,
    changePassword,
    getQuickbookVendors,
    getUserCategory,
    getCompanyVendors,
    getQuickbookExpenseByCategory,
    getXeroExpenseByCategory,
    getQuickbookExpenseByCategoryAndVendor,
    getQuickbookExpenseByCategoryAndVendorForUser,
    getXeroExpenseByCategoryAndVendor,
    getXeroExpenseByCategoryAndVendorForUser,
    getQuickbookExpenseByVendor,
    getXeroExpenseByVendor,
    getQuickbookExpenseByVendorForUser,
    getXeroExpenseByVendorForUser,
    getAllCompanies,
    getQuickbookExpensesForUser,
    getXeroExpensesForUser,
    getLastSyncedActivity,
    get_checkout_url
} = require("./user.controller");

router.get("/", defaultFun);

//Sign up
router.post("/signUp", signUp);

//Login
router.post("/login", login);

//Get user login token
router.get("/getLoginToken/:email", getLoginToken);

//Get all roles from database
router.get("/getRoles",validateAdminPermission, getRoles);

//Get depart of company
router.get("/getDeparts/:id",validateUserPermission, getDeparts);
router.get("/getDepartOfUser/:id",validateUserPermission, getDepartOfUser);
router.post('/activateDepart', activateDepart);
router.get('/getDepartByID/:id', getDepartByID);

//Get company Data
router.get('/getCompany/:user_id',validateUserPermission, getCompany);
router.get('/getCompanyByID/:company_id', getCompanyByID);
router.get('/getActiveCompany/:user_id', getActiveCompany);
router.get('/getCompanyByTenant/:tenant_id',validateUserPermission, getCompanyByTenant);
router.get('/getCompanyAccount/:user_id',validateAdminPermission, getCompanyAccount);
router.get('/getActivateCompany/:user_id', getActivateCompany);

//User apis
router.post("/createUser",validateAdminPermission, createUser);
router.get("/get_checkout_url/:email/:categories/:plan", validateAdminPermission, get_checkout_url);
router.get("/checkSetupAccount/:email/:token", checkSetupAccount);
router.post('/updateSetupAccount', updateSetupAccount);
router.get("/getCompanyManagementUsers/:id",validateAdminPermission, getCompanyManagementUsers);
router.get("/checkUserPassword/:email/:password", checkUserPassword)
router.post("/changePassword", changePassword);

//Edit user
router.get('/editUser/:id', editUser);
router.post('/updateUser', updateUser);
router.post('/updateUserProfile', updateUserProfile);
router.post('/updateUserAsManager', updateUserAsManager);

//Get Company Users
router.get('/getUsers/:id',validateAdminPermission, getUsers);
router.get('/getAdminById/:id', getAdminById);

//Soft delete user
router.get('/inactivateUser/:id',validateAdminPermission, inactivateUser);
router.get('/activateUser/:id',validateAdminPermission, activateUser);
router.get('/hardDeleteUser/:id',validateAdminPermission, hardDeleteUser);

//Check user by email
router.get('/checkUser/:email', checkUser);

//Password reset email
router.post('/passwordReset', passwordReset);
router.get('/checkPasswordResetToken/:token', checkPasswordResetToken);
router.post('/updatePassword', updatePassword);

//departs
router.get('/getCompanyDeparts/:id',validateAdminPermission, getCompanyDeparts);
router.get('/getParentDeparts',validateAdminPermission, getParentDeparts);
router.post('/createDepart',validateAdminPermission, createDepart);
router.get('/deleteDepart/:id',validateAdminPermission, deleteDepart);
router.get('/editDepart/:id',validateAdminPermission, editDepart);
router.post('/updateDepart',validateAdminPermission, updateDepart);

router.get('/getUserCategory/:company_id', getUserCategory);

router.get('/getQuickbookExpenses/:company_id', getQuickbookExpenses);
router.get('/getXeroExpenses/:company_id', getXeroExpenses);

router.get('/getQuickbookExpensesForUser/:company_id', getQuickbookExpensesForUser);
router.get('/getXeroExpensesForUser/:company_id', getXeroExpensesForUser);


router.get('/getQuickbookVendors/:company_id', getQuickbookVendors);
// router.get('/getXeroExpenses/:company_id', getXeroExpenses);


router.get('/getQuickbookExpenseAttachment/:company_id', getQuickbookExpenseAttachment);

router.get('/getQuickbooksExpenseByAccount/:account_id/:company_id', getQuickbooksExpenseByAccount);
router.get('/getXeroExpenseByAccount/:account_id/:company_id', getXeroExpenseByAccount);

router.get('/getAccountByID/:account_id', getAccountByID);

router.get('/getCounts/:company_id', getCounts);
router.get('/getCountsForAccountant/:user_id/:company_id', getCountsForAccountant);

router.get('/getDepartmentUsers/:depart_id', getDepartmentUsers);

router.get('/getCompanyVendors/:company_id',getCompanyVendors);

router.get('/getQuickbookExpenseByCategory/:company_id/:category_id', getQuickbookExpenseByCategory);
router.get('/getXeroExpenseByCategory/:company_id/:category_id', getXeroExpenseByCategory);

router.get('/getQuickbookExpenseByCategoryAndVendor/:company_id/:category_id/:vendor_id', getQuickbookExpenseByCategoryAndVendor);
router.get('/getXeroExpenseByCategoryAndVendor/:company_id/:category_id/:vendor_id', getXeroExpenseByCategoryAndVendor);

router.get('/getQuickbookExpenseByCategoryAndVendorForUser/:company_id/:category_id/:vendor_id', getQuickbookExpenseByCategoryAndVendorForUser);
router.get('/getXeroExpenseByCategoryAndVendorForUser/:company_id/:category_id/:vendor_id', getXeroExpenseByCategoryAndVendorForUser);

router.get('/getQuickbookExpenseByVendor/:company_id/:vendor_id', getQuickbookExpenseByVendor);
router.get('/getXeroExpenseByVendor/:company_id/:vendor_id', getXeroExpenseByVendor);

router.get('/getQuickbookExpenseByVendorForUser/:company_id/:vendor_id', getQuickbookExpenseByVendorForUser);
router.get('/getXeroExpenseByVendorForUser/:company_id/:vendor_id', getXeroExpenseByVendorForUser);
// router.get('/getAccounts/:company_id', getAccounts);


router.get('/getAllCompanies',getAllCompanies);

router.get('/getLastSyncedActivity/:company_id/:type', getLastSyncedActivity);

module.exports = router;