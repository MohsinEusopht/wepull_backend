const {hashSync,genSaltSync,compareSync} = require("bcrypt");
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const {
    createCompany,
    signUp,
    createUserRole,
    getUserByUserEmail,
    getUser,
    updateUserCompany,
    getUserRoles,
    createUser,
    checkUserEmail,
    checkUserCompany,
    getDeparts,
    getDepartOfUser,
    getUsers,
    deleteUser,
    editUser,
    updateUser,
    updateUserRole,
    getCompany,
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
    deleteResetPasswordToken,
    getLoginToken,
    getCompanyByTenant,
    getCompanyAccount,
    disableAllCompany,
    activateCompany,
    getActiveCompany,
    getQuickbookExpenses,
    getActivateCompany,
    getXeroExpenses,
    getCompanyByID,
    getQuickbooksExpenseByAccount,
    getAccountByID,
    getXeroExpenseByAccount,
    getCompanyCount,
    departmentCount,
    userCount,
    accountCount,
    expenseCount,
    getDepartmentUsers,
    userCountForAccountant,
    accountCountForAccountant,
    expenseCountForAccountant,
    getQuickbookExpenseAttachment,
    updateUserAsManager,
    deleteAllUserRelation,
    disableAllDepart,
    activateDepart,
    setTokenForFirstTimeLogin,
    checkSetupAccount,
    updateSetupAccount,
    updateUserProfile,
    getDepartByID,
    changePassword,
    updateAccountOfDepart,
    deleteAccountOfDepart,
    getQuickbookVendors
} = require("./user.service");
const { sign } = require("jsonwebtoken");

// async function createDepartApi(access_token, companyID) {
//     // const url =
//     //     oauthClient.environment == 'sandbox'
//     //         ? OAuthClient.environment.sandbox
//     //         : OAuthClient.environment.production;
//     //
//     // let bearer = 'Bearer ' + access_token;
//     // let query = 'select * from Department';
//     // // console.log(bearer);
//     // let options = {
//     //     'method': 'GET',
//     //     'Accept': 'application/json',
//     //     'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
//     //     'headers': {
//     //         'Authorization': bearer,
//     //     }
//     // };
//     // // console.log("option:",options);
//     // let array = [];
//     // // console.log("result","fafa");
//     // return new Promise(function (resolve, reject) {
//     //     request(options, function (error, res, body) {
//     //         if (!error && res.statusCode == 200) {
//     //             let result = convert.xml2json(body, {compact: true, spaces: 4});
//     //             // console.log("Departments",result)
//     //             resolve(result);
//     //         } else {
//     //             // console.log("result",error)
//     //             reject(error);
//     //         }
//     //     });
//     // });
// }
module.exports = {
    defaultFun: async (req, res) => {
        return res.json({
            status: "200",
            message: "Api is working"
        });
    },
    signUp: async(req, res) => {
        try {
            const body = req.body;
            // console.log(body);
            //
            const salt = genSaltSync(10);
            let bycrpyt_password = hashSync(body.password, salt);
            // // body.type = body.type;
            const checkUserEmailResult = await checkUserEmail(body.email);
            const checkUserCompanyResult = await checkUserCompany(body.company_name);
            console.log("Check email");
            console.log(checkUserEmailResult[0].count_user);
            console.log("Check company");
            console.log(checkUserCompanyResult[0].count_company);
            if (checkUserEmailResult[0].count_user === 0) {
                if(checkUserCompanyResult[0].count_company === 0) {
                    const createUsersResult = await signUp(body.first_name,body.last_name, body.email, bycrpyt_password, body.contact);
                    const createCompanyResult = await createCompany(body.company_name, body.company_number);
                    const createUserRoleResult = await createUserRole(createUsersResult.insertId, createCompanyResult.insertId, null, 1, null);
                    const updateUserCompanyResult = await updateUserCompany(createUsersResult.insertId, createCompanyResult.insertId);
                    return res.json({
                        "status": "200",
                        "message": "Account created successfully"
                    });
                }
                else {
                    return res.json({
                        "status": "200",
                        "message": "Same company is already exist"
                    });
                }
            }
            else {
                return res.json({
                    "status": "200",
                    "message": "Email already registered."
                });
            }
            // console.log("User ID::", createUsers.insertId);
            // console.log("Company ID::", createCompany.insertId);
            // const createUserRole = await createUserRole();
            // const uid = await updateUser({"uid": `user${results.insertId+100}`}, results.insertId);
            // const record = await getUser(results.insertId);

        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    login: async (req, res) => {
        try {
            const body = req.body;
            const results = await getUserByUserEmail(body.email);

            results.password = results.password.replace(/^\$2y(.+)$/i, '$2a$1');
            const result = compareSync(body.password, results.password);

            if (result) {
                results.password = undefined;
                // const startTime = await setUserStartTime(results.id);
                const record = await getUser(results.id);

                const depart = await getDepartOfUser(results.id);

                const disableAllCompanyResult = await disableAllDepart(results.id);
                console.log("disableAllCompanyResult",disableAllCompanyResult);
                console.log("depart",depart[0]);
                const activateCompanyResult = await activateDepart(depart[0].id, results.id);


                record[0].password = undefined;
                console.log("getuser::",record[0]);
                const json_token = sign({ result: results }, process.env.JWT_KEY);
                return res.json({
                    success: 1,
                    message: "login successfully",
                    token: json_token,
                    data: record[0],
                    // data: results,
                });
            } else {
                return res.status(404).json({
                    success: 0,
                    message: "Invalid email or password"
                });
            }
        }
        catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Invalid email or password"
            });
        }
    },
    getRoles: async (req, res) => {
        try {
            const result = await getUserRoles();
            return res.status(200).json({
                success: 0,
                roles: result
            });
        }
        catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Something Went Wrong."
            });
        }
    },
    createUser: async  (req, res) => {
        try {
            const body = req.body;
            console.log(body);

            // const salt = genSaltSync(10);
            // let bycrpyt_password = hashSync(body.password, salt);
            const checkUserResult = await checkUser(body.email);
            console.log("checkUserResult[0].count",checkUserResult[0].count);
            // return res.json({
            //     "status": "200",
            //     "message": "User created successfully"
            // });
            // this.stop();
            if(checkUserResult[0].count === 0) {
                const createUsersResult = await createUser(body.first_name,body.last_name, body.email, body.password, body.contact, body.company_id, body.depart_id.toString(), body.role_id, body.created_by, body.type);
                for (let depart of body.depart_id){
                    console.log(depart);
                    const createUserRoleResult = await createUserRole(createUsersResult.insertId, body.company_id, depart, body.role_id, body.created_by);
                }

                const token = crypto.randomBytes(48).toString('hex');

                console.log("token", token);
                const result = setTokenForFirstTimeLogin(body.email, token);

                let testAccount = await nodemailer.createTestAccount();
                // let transporter = nodemailer.createTransport({
                //     service: 'Gmail',
                //     auth: {
                //         user: 'mohjav031010@gmail.com',
                //         pass: 'Javed@0348'
                //     }
                // });

                let transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: testAccount.user, // generated ethereal user
                        pass: testAccount.pass, // generated ethereal password
                    },
                });

                // send mail with defined transport object
                let info = await transporter.sendMail({
                    from: '"We Pull" <wepull@support.com>', // sender address
                    to: body.email, // list of receivers
                    subject: "WePull, Setup Account Email", // Subject line
                    html: "Setup your account at url: <a href="+ process.env.APP_URL+"setupAccount/"+body.email+"/"+token +">" + process.env.APP_URL+"setupAccount/"+body.email+"/"+token + "</a>", // html body
                });

                console.log("Message sent: %s", info.messageId);

                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));


                return res.json({
                    "status": "200",
                    "message": "User created successfully",
                    "data": createUsersResult,
                    "url": nodemailer.getTestMessageUrl(info)
                });
            }
            else {
                return res.json({
                    "status": "200",
                    "message": "User with given email already exist."
                });
            }

        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    checkSetupAccount: async(req, res) => {
        try {
            const email = req.params.email;
            const token = req.params.token;
            const record = await checkSetupAccount(token, email);
            return res.json({
                success: 1,
                data: record[0].count
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    checkUserPassword: async (req, res) => {
        try {
            const email = req.params.email;
            const password = req.params.password;
            const results = await getUserByUserEmail(email);

            results.password = results.password.replace(/^\$2y(.+)$/i, '$2a$1');
            const result = compareSync(password, results.password);

            if (result) {
                return res.json({
                    success: 1,
                    data: "Password matched"
                });
            }
            else {
                return res.json({
                    success: 0,
                    data: "Current password do not match"
                });
            }

        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    changePassword: async  (req, res) => {
    try {
        const body = req.body;
        console.log("stup",body);
        const salt = genSaltSync(10);
        let bycrpyt_password = hashSync(body.password, salt);
        const changePasswordResult = await changePassword(body.id,bycrpyt_password);

        return res.json({
            "status": "200",
            "message": "Password changed successfully",
        });
    } catch (e) {
        console.log(e.message);
        return res.status(404).json({
            message: "Error: " + e.message,
        });
    }
},
    updateSetupAccount: async  (req, res) => {
        try {
            const body = req.body;
            console.log("stup",body);
            const salt = genSaltSync(10);
            let bycrpyt_password = hashSync(body.password, salt);
            const updateSetupAccountResult = await updateSetupAccount(body.email,body.first_name,body.last_name, body.contact, bycrpyt_password);

            return res.json({
                "status": "200",
                "message": "Account setup completed! We're redirecting you to login page to login your account.",
            });
        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    getDeparts: async(req, res) => {
        try {
            const id = req.params.id;
            const record = await getDeparts(id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getDepartOfUser: async(req, res) => {
        try {
            const id = req.params.id;
            const record = await getDepartOfUser(id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getDepartByID: async(req, res) => {
        try {
            const id = req.params.id;
            const record = await getDepartByID(id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getUsers: async(req, res) => {
        try {
            const id = req.params.id;
            const record = await getUsers(id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    deleteUser: async(req, res) => {
        try {
            const id = req.params.id;
            const record = await deleteUser(id);
            return res.json({
                success: 1,
                deleted_user: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    editUser: async (req, res) => {
        try {
            console.log("working");
            const id = req.params.id;
            const record = await editUser(id);
            console.log("edit user",id,"data",record);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    updateUser: async  (req, res) => {
        try {
            const body = req.body;
            console.log(body);
            const record = await editUser(body.user_id);
            console.log("user",body.user_id,"data",record);
            const updateUsersResult = await updateUser(body.user_id,body.first_name,body.last_name, body.contact, body.depart_id.toString(), body.role_id);
            const deleteAllUserRelationResult = await deleteAllUserRelation(body.user_id);
            console.log("Delete result = ", deleteAllUserRelationResult);
            for (let depart of body.depart_id){
                console.log(depart);
                const createUserRoleResult = await createUserRole(body.user_id, record[0].company_id, depart, body.role_id, record[0].created_by);
            }
            // const updateUserRoleResult = await updateUserRole(body.user_id, body.depart_id, body.role_id);
            return res.json({
                "status": "200",
                "message": "User updated successfully",
            });
        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    updateUserProfile: async  (req, res) => {
        try {
            const body = req.body;
            console.log(body);
            const updateUserProfileResult = await updateUserProfile(body.user_id,body.first_name,body.last_name, body.contact);
            console.log("rrr", updateUserProfileResult)
            // const updateUserRoleResult = await updateUserRole(body.user_id, body.depart_id, body.role_id);
            return res.json({
                "status": "200",
                "message": "Profile updated successfully",
            });
        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    updateUserAsManager: async  (req, res) => {
        try {
            const body = req.body;
            console.log(body);
            const updateUsersResult = await updateUserAsManager(body.user_id,body.first_name,body.last_name, body.contact);
            // const updateUserRoleResult = await updateUserRoleManager(body.user_id, body.depart_id, body.role_id);
            return res.json({
                "status": "200",
                "message": "User updated successfully",
            });
        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    getCompany: async(req, res) => {
        try {
            const user_id = req.params.user_id;
            console.log(user_id);
            const record = await getCompany(user_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getCompanyByID: async(req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log(company_id);
            const record = await getCompanyByID(company_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getQuickbooksExpenseByAccount: async(req, res) => {
        try {
            const account_id = req.params.account_id;
            const company_id = req.params.company_id;
            console.log("account_id",account_id);
            console.log("company_id",company_id);
            const record = await getQuickbooksExpenseByAccount(account_id,company_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getXeroExpenseByAccount: async(req, res) => {
        try {
            const account_id = req.params.account_id;
            const company_id = req.params.company_id;
            console.log("account_id",account_id);
            console.log("company_id",company_id);
            console.log(`SELECT e.expense_id,e.created_at,e.updated_at,e.txn_date,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name from expenses e left join accounts a on e.account_number=a.code and e.company_id=a.company_id join companies c ON e.company_id = c.id where e.company_id = ${company_id} and e.account_number = ${account_id}`)
            const record = await getXeroExpenseByAccount(account_id,company_id);
            console.log(record);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getAccountByID: async(req, res) => {
    try {
        const account_id = req.params.account_id;
        console.log(account_id);
        const record = await getAccountByID(account_id);
        return res.json({
            success: 1,
            data: record
        });
    } catch (e) {
        return res.status(404).json({
            success: 0,
            message: "Error :" + e.message,
        });
    }
},
    getActiveCompany: async(req, res) => {
        try {
            const user_id = req.params.user_id;
            const record = await getActiveCompany(user_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getCompanyManagementUsers: async(req, res) => {
        try {
            const id = req.params.id;
            const record = await getCompanyManagementUsers(id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getCompanyDeparts: async(req, res) => {
        try {
            const id = req.params.id;
            const record = await getCompanyDeparts(id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getParentDeparts: async (req, res) => {
        try {
            const record = await getParentDeparts();
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    createDepart: async  (req, res) => {
        try {
            const body = req.body;
            console.log(body);
            let parent_id = body.parent_id;
            let depart_name = body.depart_name;
            let budget = body.budget;
            let company_id = body.company_id;
            let manager_id = body.manager_id;
            let created_by =  body.created_by;
            let description = body.description;
            let account_id = body.account_id;
            let depart_id = body.depart_id;
            // const record = await getActivateCompany(body.created_by);
            // const createDepartApi = await createDepartApi(record[0].access_token, record[0].tenant_id);
            const createDepartResult = await createDepart(depart_id,parent_id, depart_name, budget, company_id, manager_id, account_id, created_by, description);

            return res.json({
                "status": "200",
                "message": "Depart created successfully"
            });
        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    deleteDepart: async(req, res) => {
        try {
            const id = req.params.id;
            const record = await deleteDepart(id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    editDepart: async(req, res) => {
        try {
            const id = req.params.id;
            const record = await editDepart(id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    updateDepart: async  (req, res) => {
        try {
            const body = req.body;
            console.log(body);
            const deleteAccountOfDepartResult = deleteAccountOfDepart(body.id);
            for (let account of body.account_id){
                console.log(account);
                const updateAccountOfDepartResult = updateAccountOfDepart(body.id, account);
            }
            const updateDepartResult = await updateDepart(body.parent_id,body.depart_name,body.budget, body.manager_id, body.account_id.toString(), body.description,body.id);
            return res.json({
                "status": "200",
                "message": "Department updated successfully",
            });
        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    checkUser: async(req, res) => {
        try {
            const email = req.params.email;
            // const company_id = req.params.company_id;

            const record = await checkUser(email);
            console.log("r",record);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    passwordReset: async  (req, res) => {
        try {
            const body = req.body;
            console.log(body.email);
            const token = crypto.randomBytes(48).toString('hex');
            const result = passwordReset(body.email, token);

            let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"We Pull" <wepull@support.com>', // sender address
                to: body.email, // list of receivers
                subject: "WePull, Password Reset Email", // Subject line
                html: "Password reset url: <a href="+ process.env.APP_URL+"passwordReset/"+body.email+"/"+token +">" + process.env.APP_URL+"passwordReset/"+body.email+"/"+token + "</a>", // html body
            });

            console.log("Message sent: %s", info.messageId);

            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

            return res.json({
                "status": "200",
                "message": "Email sent successfully",
                "token": token
            });
        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    checkPasswordResetToken: async(req, res) => {
        try {
            const token = req.params.token;
            const record = await checkPasswordResetToken(token);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    updatePassword: async  (req, res) => {
        try {
            const body = req.body;
            console.log(body);
            const salt = genSaltSync(10);
            let bycrpyt_password = hashSync(body.password, salt);
            const updatePasswordResult = await updatePassword(body.email,bycrpyt_password);
            const deleteTokenResult = await deleteResetPasswordToken(body.email);
            return res.json({
                "status": "200",
                "message": "Password Reset Successfully",
            });
        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    getLoginToken: async(req, res) => {
        try {
            const email = req.params.email;
            const record = await getLoginToken(email);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getCompanyByTenant: async(req, res) => {
        try {
            const tenant_id = req.params.tenant_id;
            const record = await getCompanyByTenant(tenant_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getCompanyAccount: async(req, res) => {
        try {
            const user_id = req.params.user_id;
            const record = await getCompanyAccount(user_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    activateCompany: async  (req, res) => {
        try {
            const body = req.body;
            const disableAllCompanyResult = await disableAllCompany(body.user_id);
            const activateCompanyResult = await activateCompany(body.selectedCompany);

            // const company = await getActivateCompany(body.user_id);
            //
            // console.log(company);
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
    activateDepart: async  (req, res) => {
        try {
            const body = req.body;
            console.log("bod",body);
            const disableAllCompanyResult = await disableAllDepart(body.user_id);
            console.log("disableAllCompanyResult",disableAllCompanyResult);
            const activateCompanyResult = await activateDepart(body.selectedDepart, body.user_id);

            // const company = await getActivateCompany(body.user_id);
            //
            // console.log(company);
            return res.json({
                success: 1,
                message: "Depart Activated Successfully"
            });
        } catch (e) {
            console.log(e.message);
            return res.status(404).json({
                message: "Error: " + e.message,
            });
        }
    },
    getQuickbookExpenses: async(req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log(company_id);
            const record = await getQuickbookExpenses(company_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getQuickbookExpenseAttachment: async(req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log(company_id);
            const record = await getQuickbookExpenseAttachment(company_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getXeroExpenses: async(req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log("company id ",company_id);
            const record = await getXeroExpenses(company_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getQuickbookVendors: async(req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log("company id ",company_id);
            const record = await getQuickbookVendors(company_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getActivateCompany: async(req, res) => {
        try {
            const user_id = req.params.user_id;
            console.log(user_id);
            const record = await getActivateCompany(user_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getCounts: async(req, res) => {
        try {
            console.log("working");
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            console.log(user_id);
            console.log(company_id);
            // const company_count = await getCompanyCount(user_id);
            // const depart_count = await departmentCount(user_id);
            // const user_count = await userCount(user_id);
            // const account_count = await accountCount(user_id);
            // const expense_count = await expenseCount(user_id);

            const company_count = await getCompanyCount(user_id, company_id);
            const depart_count = await departmentCount(user_id, company_id);
            const user_count = await userCount(user_id, company_id);
            const account_count = await accountCount(user_id, company_id);
            const expense_count = await expenseCount(user_id, company_id);


            // // const record = await getActivateCompany(user_id);
            return res.json({
                success: 1,
                company_count: company_count,
                depart_count: depart_count,
                user_count: user_count,
                account_count: account_count,
                expense_count: expense_count
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getCountsForAccountant: async(req, res) => {
        try {
            console.log("working");
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            console.log(user_id);
            console.log(company_id);
            // const depart_count = await departmentCountForAccountant(user_id);
            const user_count = await userCountForAccountant(company_id);
            const account_count = await accountCountForAccountant(company_id);
            const expense_count = await expenseCountForAccountant(company_id);
            // // const record = await getActivateCompany(user_id);
            return res.json({
                success: 1,
                user_count: user_count,
                account_count: account_count,
                expense_count: expense_count
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
    getDepartmentUsers: async(req, res) => {
        try {
            const depart_id = req.params.depart_id;
            console.log(depart_id);
            const record = await getDepartmentUsers(depart_id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.status(404).json({
                success: 0,
                message: "Error :" + e.message,
            });
        }
    },
};