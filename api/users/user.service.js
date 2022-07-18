const e = require("express");
const pool = require("../../config/database");

const AppError = require("../../utils/appError");
const json = require("body-parser/lib/types/json");


module.exports = {
    signUp: (first_name, last_name, email, password, contact) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO users(first_name,last_name,email,password,contact,role_id) VALUES (? ,? ,? ,? ,?, 1)`, [first_name, last_name, email, password, contact],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    setTokenForFirstTimeLogin: (email, token) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET login_token = ? WHERE email = ?`, [token, email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkSetupAccount: (token, email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'count' FROM users WHERE login_token = ? AND email = ?`, [token, email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateXeroAccountEmail: (id, email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET email = ? WHERE id = ?`, [email, id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateSetupAccount: (email, first_name, last_name, contact, password) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET first_name = ?, last_name = ?, contact = ?, password = ?, login_token = NULL WHERE email = ?`, [first_name, last_name, contact, password, email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    createCompany: (connection_id, tenantId,company_name,createdDate,type , company_number, currency, company_type, industry_type, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO companies(connection_id, tenant_id, company_name,company_number, currency, company_type, industry_type,create_date, type, user_id) VALUES (?, ? ,? ,?, ?, ?, ?, ?, ?, ?)`, [connection_id ,tenantId ,company_name, company_number, currency, company_type, industry_type, createdDate, type, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateUserCompanyResult: (company_id, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET company_id = ? WHERE id = ?`, [company_id ,user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    createUserRole: (user_id ,company_id, depart_id,role_id ,created_by) => {
        return new Promise((resolov, reject) => {
            console.log("create role log: ",user_id, company_id, role_id, created_by);
            pool.query(
                `INSERT INTO user_relations(user_id,company_id,depart_id,role_id,created_by) VALUES (?, ?, ?, ?, ?)`, [user_id, company_id, depart_id, role_id, created_by],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateUserCompany: (user_id, company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET company_id = ? WHERE id = ?`, [company_id, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getUserByUserEmail: (email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `select * from users where email = ? and status = 1`, [email],
                (error, results, fields) => {
                    if (error) {
                        reject(error);
                    }
                    if (results)
                        return resolov(results[0]);
                    else
                        return resolov(null);
                }
            );
        })
    },
    getUser: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT *
                FROM users
                WHERE id = ? AND status = 1`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getUserRoles: () => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT *
                FROM roles`, [],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    createUser: (first_name, last_name, email, password, contact, company_id, depart_id, role_id, created_by, type) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO users(first_name,last_name,email,password,contact,role_id,company_id,depart_id,created_by,user_type) VALUES (? ,? ,? ,? ,?, ?, ?, ?, ?, ?)`, [first_name, last_name, email, password, contact, role_id, company_id, depart_id, created_by, type],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getDeparts: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT *
                FROM departments where company_id = ? and depart_status = 1`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getDepartOfUser: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT d.*,ur.is_active FROM user_relations ur JOIN departments d ON d.id=ur.depart_id WHERE ur.user_id = ? and ur.role_id!=1`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getDepartByID: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM departments where id = ?`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getDepartByDepartName: (depart_name, main_category) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM departments where depart_name = ? and main_category = ?`, [depart_name, main_category],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    changePassword: (id, password) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET password = ? WHERE id = ?`, [password, id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getUsers: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                // `SELECT u.id,u.first_name,u.last_name,u.email,u.contact,r.name as 'role',d.depart_name FROM user_relations ur JOIN users u ON u.id=ur.user_id JOIN roles r ON r.id=ur.role_id LEFT JOIN departments d ON ur.depart_id=d.id WHERE ur.company_id = ? and ur.role_id!=1 and u.status = 1`, [id],
                `SELECT DISTINCT(u.id),u.first_name,u.last_name,u.email,u.contact,r.name as 'role',u.depart_id FROM user_relations ur JOIN users u ON u.id=ur.user_id JOIN roles r ON r.id=ur.role_id WHERE ur.company_id = ? and ur.role_id!=1 and u.status = 1`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getUserCategory: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                // `SELECT u.id,u.first_name,u.last_name,u.email,u.contact,r.name as 'role',d.depart_name FROM user_relations ur JOIN users u ON u.id=ur.user_id JOIN roles r ON r.id=ur.role_id LEFT JOIN departments d ON ur.depart_id=d.id WHERE ur.company_id = ? and ur.role_id!=1 and u.status = 1`, [id],
                `select u.user_id,d.depart_name from user_relations u join departments d on u.depart_id = d.id where u.company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyVendors: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                // `SELECT u.id,u.first_name,u.last_name,u.email,u.contact,r.name as 'role',d.depart_name FROM user_relations ur JOIN users u ON u.id=ur.user_id JOIN roles r ON r.id=ur.role_id LEFT JOIN departments d ON ur.depart_id=d.id WHERE ur.company_id = ? and ur.role_id!=1 and u.status = 1`, [id],
                `select * from vendors where company_id = ? and status = 1`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getDepartmentUsers: (depart_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT u.id,u.first_name,u.last_name,u.email,u.contact,r.name as 'role',d.depart_name FROM user_relations ur JOIN users u ON u.id=ur.user_id JOIN roles r ON r.id=ur.role_id JOIN departments d ON u.depart_id=d.id WHERE ur.depart_id = ? and ur.role_id=3 and u.status = 1`, [depart_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkUserEmail: (email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count_user FROM users where email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkUserXero:(email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count_xero FROM users where email = ? and xero_user_id IS NOT NULL`, [email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkUserQuickbook:(email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count_quickbook FROM users where email = ? and quickbook_access_token IS NOT NULL`, [email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkUserCompany: (company_name) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count_company FROM companies where company_name = ?`, [company_name],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkUserCompanyByTenant: (tenant_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count_company FROM companies where tenant_id = ?`, [tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    deleteUser: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET status = 0 WHERE id = ?`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    editUser: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * from users WHERE id = ?`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    deleteAllUserRelation: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM user_relations WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        // console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateUser: (user_id, first_name, last_name, contact, depart_id, role_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET first_name = ?, last_name = ?, contact = ?, depart_id = ?, role_id = ? WHERE id = ?`, [first_name,last_name,contact,depart_id,role_id,user_id],
                (error, results, fields) => {
                    if (error) {
                        // console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateUserProfile: (user_id, first_name, last_name, contact) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET first_name = ?, last_name = ?, contact = ? WHERE id = ?`, [first_name,last_name,contact,user_id],
                (error, results, fields) => {
                    if (error) {
                        // console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateUserAsManager: (user_id, first_name, last_name, contact) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET first_name = ?, last_name = ?, contact = ? WHERE id = ?`, [first_name,last_name,contact,user_id],
                (error, results, fields) => {
                    if (error) {
                        // console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateUserRole: (user_id, depart_id, role_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE user_relations SET depart_id = ?, role_id = ? WHERE user_id = ?`, [depart_id,role_id,user_id],
                (error, results, fields) => {
                    if (error) {
                        // console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompany: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT *
                FROM companies where user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyByID: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT *
                FROM companies where id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getActiveCompany: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT *
                FROM companies where user_id = ? and active_status = 1`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyManagementUsers: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT u.id,u.first_name,u.last_name,u.email,u.contact,r.name as 'role' FROM user_relations ur JOIN users u ON u.id=ur.user_id JOIN roles r ON r.id=ur.role_id WHERE ur.company_id = ? and ur.role_id=4 and u.status = 1`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyDeparts: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                // `SELECT d.id,d.depart_name,d.budget,IF(p.depart_name!='', p.depart_name, "-") as 'parent_depart',a.name,a.accountID FROM departments AS d LEFT JOIN departments AS p ON d.parent_depart=p.depart_id LEFT JOIN accounts AS a ON d.account_id=a.id WHERE d.company_id = ? and d.depart_status=1`, [id],
                `SELECT d.id,d.depart_name,d.budget,a.name,a.accountID FROM departments AS d LEFT JOIN accounts AS a ON d.account_id=a.id WHERE d.company_id = ? and d.depart_status=1`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getParentDeparts: () => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM main_departs`, [],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    createDepart: (depart_id,parent_id, depart_name, budget, company_id, manager_id, account_id, created_by, description) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO departments(depart_id,depart_name,parent_depart,budget,company_id,manager_id, account_id,created_by,description) VALUES (?, ? ,? ,?, ?, ?, ?, ?, ?)`, [depart_id,depart_name, parent_id, budget, company_id, manager_id, account_id, created_by, description],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    deleteDepart: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE departments SET depart_status = 0 WHERE id = ?`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    editDepart: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM departments WHERE id = ?`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateDepart: (parent_id,depart_name,budget, manager_id, account_id, description, id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE departments SET parent_depart = ?, depart_name = ?, budget = ?, manager_id = ?, account_id = ?, description = ? WHERE id = ?`, [parent_id,depart_name,budget,manager_id, account_id,description,id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolov(results);
                }
            );
        })
    },
    checkUser: (email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT COUNT(*) as count FROM users WHERE email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolov(results);
                }
            );
        })
    },
    passwordReset: (email, token) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO reset_password(email, token) VALUES (?, ?)`, [email, token],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolov(results);
                }
            );
        })
    },
    checkPasswordResetToken: (token) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT COUNT(*) as count FROM reset_password WHERE token = ?`, [token],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolov(results);
                }
            );
        })
    },
    updatePassword: (email, password) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET password = ? WHERE email = ?`, [password, email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolov(results);
                }
            );
        })
    },
    deleteResetPasswordToken: (email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM reset_password WHERE email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolov(results);
                }
            );
        })
    },
    updateXeroLoginToken: (email, token, xero_id_token,xero_access_token, xero_refresh_token, xero_expire_at, status) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET login_token = ?, xero_id_token = ?,xero_access_token = ?,xero_refresh_token = ?,xero_expire_at = ?, status = ? WHERE email = ?`, [token, xero_id_token,xero_access_token, xero_refresh_token, xero_expire_at, status, email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateQuickbookLoginToken: (email, token, qb_access_token, qb_refresh_token, qb_expire_at) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET login_token = ?,quickbook_access_token = ?,quickbook_refresh_token = ?,quickbook_exipre_at = ? WHERE email = ?`, [token, qb_access_token, qb_refresh_token, qb_expire_at, email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getLoginToken: (email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT login_token FROM users WHERE email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkTenantAccount: (accountID, company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'account_count' FROM accounts WHERE accountID = ? and company_id = ?`, [accountID, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    createTenantAccount: (code, accountID, name, type, status, description, currencyCode, updatedDateUTC, company_id, user_id, company_type) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO accounts (code, accountID, name, type, status, description, currencyCode, updatedDateUTC, company_id, user_id, company_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [code, accountID, name, type, status, description, currencyCode, updatedDateUTC, company_id, user_id, company_type],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateTenantAccount: (code, accountID, name, type, status, description, currencyCode, updatedDateUTC, company_id, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE accounts SET code = ?, accountID = ?, name = ?, type = ?, status = ?, description = ?, currencyCode = ?, updatedDateUTC = ? where company_id = ? and accountID = ?`, [code, accountID, name, type, status, description, currencyCode, updatedDateUTC, company_id, accountID],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getAccounts: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT 
                        a.code,
                        a.name,
                        a.accountID,
                        a.type,
                        a.status,
                        a.description,
                        a.currencyCode,
                        a.updatedDateUTC,
                        c.company_name FROM accounts a JOIN companies c ON a.company_id = c.id WHERE a.company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyByTenant: (tenant_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT *
                FROM companies where tenant_id = ?`, [tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyAccount: (user_id) => {
    return new Promise((resolov, reject) => {
        pool.query(
            `SELECT a.*
                FROM accounts a JOIN companies c ON a.company_id=c.id where a.user_id = ? and c.active_status=1 and a.status = 1`, [user_id],
            (error, results, fields) => {
                if (error) {
                    return reject(error);
                }
                return resolov(results);
            }
        );
    })
    },
    disableAllCompany: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE companies SET active_status = 0 WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    activateCompany: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE companies SET active_status = 1 WHERE id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    activateDepart: (depart_id, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE user_relations SET is_active = 1 WHERE user_id = ? and depart_id = ?`, [user_id, depart_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    disableAllDepart: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE user_relations SET is_active = 0 WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getQuickbookExpenses: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT DISTINCT(e.expense_id),e.txn_date as 'created_at',e.updated_at,e.txn_date,e.currency,e.description,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type, d.depart_name,cl.depart_name as 'class',e.total_amount,c.company_name from expenses e LEFT JOIN accounts a ON e.account_number=a.accountID join companies c ON e.company_id = c.id LEFT JOIN departments d ON d.depart_id=e.department_id and d.company_id=e.company_id LEFT JOIN departments cl ON cl.depart_id=e.class_id and d.company_id=e.company_id WHERE e.company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getQuickbookExpensesForUser: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT DISTINCT(e.expense_id),e.txn_date as 'created_at',e.updated_at,e.txn_date,e.currency,e.description,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type, d.depart_name,cl.depart_name as 'class',e.total_amount,c.company_name from expenses e LEFT JOIN accounts a ON e.account_number=a.accountID join companies c ON e.company_id = c.id JOIN departments d ON d.depart_id=e.department_id and d.company_id=e.company_id LEFT JOIN departments cl ON cl.depart_id=e.class_id and d.company_id=e.company_id WHERE e.company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getQuickbookExpenseAttachment: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM attachables WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getXeroExpenses: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT DISTINCT(e.expense_id),e.created_at,e.updated_at,e.txn_date,e.description,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,e.is_paid,e.payment_ref_number, e.paid_amount, e.payment_date,c.company_name,d.depart_name,cl.depart_name as 'class' from expenses e left join accounts a on e.account_number=a.code AND a.company_id = ? JOIN companies c on c.id=e.company_id LEFT JOIN departments d ON d.depart_id=e.department_id and d.company_id=e.company_id LEFT JOIN departments cl ON cl.depart_id=e.class_id and d.company_id=e.company_id WHERE e.company_id = ?`, [company_id, company_id],
                // `SELECT e.expense_id,e.created_at,e.txn_date,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name from expenses e left join accounts a on e.account_number=a.code join companies c ON e.company_id = c.id where e.company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getXeroExpensesForUser: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT DISTINCT(e.expense_id),e.created_at,e.updated_at,e.txn_date,e.description,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,e.is_paid,e.payment_ref_number, e.paid_amount, e.payment_date,c.company_name,d.depart_name,cl.depart_name as 'class' from expenses e left join accounts a on e.account_number=a.code AND a.company_id = ? JOIN companies c on c.id=e.company_id JOIN departments d ON d.depart_id=e.department_id and d.company_id=e.company_id LEFT JOIN departments cl ON cl.depart_id=e.class_id and d.company_id=e.company_id WHERE e.company_id = ?`, [company_id, company_id],
                // `SELECT e.expense_id,e.created_at,e.txn_date,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name from expenses e left join accounts a on e.account_number=a.code join companies c ON e.company_id = c.id where e.company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getActivateCompany: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM companies WHERE user_id = ? and active_status = 1`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getQuickbooksExpenseByAccount: (account_id, company_id) => {
        // let q= `SELECT e.expense_id,e.created_at,e.txn_date,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name from expenses e left join accounts a on e.account_number=a.accountID join companies c ON e.company_id = c.id where e.company_id = ${company_id} and e.account_number = ${account_id}`;
        // console.log("query",q);
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.created_at,e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.accountID and e.company_id=a.company_id join companies c ON e.company_id = c.id LEFT JOIN departments d ON d.depart_id = e.department_id where e.company_id = ? and e.account_number = ? ORDER BY e.created_at ASC`, [company_id, account_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getQuickbookExpenseByCategory: (company_id, category_id) => {
        // let q= `SELECT e.expense_id,e.created_at,e.txn_date,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name from expenses e left join accounts a on e.account_number=a.accountID join companies c ON e.company_id = c.id where e.company_id = ${company_id} and e.account_number = ${account_id}`;
        // console.log("query",q);
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.txn_date as 'created_at',e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.accountID and e.company_id=a.company_id join companies c ON e.company_id = c.id LEFT JOIN departments d ON d.depart_id = e.department_id where e.company_id = ? and e.department_id = ? ORDER BY e.created_at ASC`, [company_id, category_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getQuickbookExpenseByCategoryAndVendor: (company_id, category_id, vendor_id) => {
        // let q= `SELECT e.expense_id,e.created_at,e.txn_date,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name from expenses e left join accounts a on e.account_number=a.accountID join companies c ON e.company_id = c.id where e.company_id = ${company_id} and e.account_number = ${account_id}`;
        // console.log("query",q);
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.txn_date as 'created_at',e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.accountID and e.company_id=a.company_id join companies c ON e.company_id = c.id LEFT JOIN departments d ON d.depart_id = e.department_id where e.company_id = ? and e.department_id = ? and e.entity_ref_number = ? ORDER BY e.created_at ASC`, [company_id, category_id, vendor_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getQuickbookExpenseByCategoryAndVendorForUser: (company_id, category_id, vendor_id) => {
        // let q= `SELECT e.expense_id,e.created_at,e.txn_date,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name from expenses e left join accounts a on e.account_number=a.accountID join companies c ON e.company_id = c.id where e.company_id = ${company_id} and e.account_number = ${account_id}`;
        // console.log("query",q);
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.txn_date as 'created_at',e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.accountID and e.company_id=a.company_id join companies c ON e.company_id = c.id JOIN departments d ON d.depart_id = e.department_id where e.company_id = ? and e.department_id = ? and e.entity_ref_number = ? ORDER BY e.created_at ASC`, [company_id, category_id, vendor_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getQuickbookExpenseByVendor: (company_id, vendor_id) => {
        // let q= `SELECT e.expense_id,e.created_at,e.txn_date,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name from expenses e left join accounts a on e.account_number=a.accountID join companies c ON e.company_id = c.id where e.company_id = ${company_id} and e.account_number = ${account_id}`;
        // console.log("query",q);
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.txn_date as 'created_at',e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.accountID and e.company_id=a.company_id join companies c ON e.company_id = c.id LEFT JOIN departments d ON d.depart_id = e.department_id where e.company_id = ? and e.entity_ref_number = ? ORDER BY e.created_at ASC`, [company_id, vendor_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getQuickbookExpenseByVendorForUser: (company_id, vendor_id) => {
        // let q= `SELECT e.expense_id,e.created_at,e.txn_date,e.currency,e.payment_type,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name from expenses e left join accounts a on e.account_number=a.accountID join companies c ON e.company_id = c.id where e.company_id = ${company_id} and e.account_number = ${account_id}`;
        // console.log("query",q);
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.txn_date as 'created_at',e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.accountID and e.company_id=a.company_id join companies c ON e.company_id = c.id JOIN departments d ON d.depart_id = e.department_id where e.company_id = ? and e.entity_ref_number = ? ORDER BY e.created_at ASC`, [company_id, vendor_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getXeroExpenseByAccount: (account_id ,company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.created_at,e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,c.company_name from expenses e left join accounts a on e.account_number=a.code and e.company_id=a.company_id join companies c ON e.company_id = c.id where e.company_id = ? and e.account_number = ? ORDER BY e.created_at ASC`, [company_id, account_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getXeroExpenseByCategory: (company_id, category_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.created_at,e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,e.is_paid,e.payment_ref_number, e.paid_amount, e.payment_date,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.code and e.company_id=a.company_id join companies c ON e.company_id = c.id LEFT JOIN departments d ON d.depart_id = e.department_id  where e.company_id = ? and e.department_id = ? ORDER BY e.created_at ASC`, [company_id, category_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getXeroExpenseByCategoryAndVendor: (company_id, category_id, vendor_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.created_at,e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,e.is_paid,e.payment_ref_number, e.paid_amount, e.payment_date,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.code and e.company_id=a.company_id join companies c ON e.company_id = c.id LEFT JOIN departments d ON d.depart_id = e.department_id where e.company_id = ? and e.department_id = ? and e.entity_ref_number = ? ORDER BY e.created_at ASC`, [company_id, category_id, vendor_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getXeroExpenseByCategoryAndVendorForUser: (company_id, category_id, vendor_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.created_at,e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,e.is_paid,e.payment_ref_number, e.paid_amount, e.payment_date,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.code and e.company_id=a.company_id join companies c ON e.company_id = c.id JOIN departments d ON d.depart_id = e.department_id where e.company_id = ? and e.department_id = ? and e.entity_ref_number = ? ORDER BY e.created_at ASC`, [company_id, category_id, vendor_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getXeroExpenseByVendor: (company_id, vendor_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.created_at,e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,e.is_paid,e.payment_ref_number, e.paid_amount, e.payment_date,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.code and e.company_id=a.company_id join companies c ON e.company_id = c.id LEFT JOIN departments d ON d.depart_id = e.department_id where e.company_id = ? and e.entity_ref_number = ? ORDER BY e.created_at ASC`, [company_id, vendor_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getXeroExpenseByVendorForUser: (company_id, vendor_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.created_at,e.updated_at,e.txn_date,e.currency,e.payment_type,e.description,e.account_number,a.name as 'account_name',e.credit,e.entity_ref_number,e.entity_ref_name,e.entity_ref_type,e.total_amount,e.is_paid,e.payment_ref_number, e.paid_amount, e.payment_date,c.company_name,d.depart_name from expenses e left join accounts a on e.account_number=a.code and e.company_id=a.company_id join companies c ON e.company_id = c.id JOIN departments d ON d.depart_id = e.department_id where e.company_id = ? and e.entity_ref_number = ? ORDER BY e.created_at ASC`, [company_id, vendor_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getAccountByID: (account_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM accounts WHERE id = ?`, [account_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getAllCompanies: ()=> {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM companies`, [],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyCount: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count FROM companies WHERE id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    departmentCount: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count FROM departments WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    userCount: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count FROM users WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    userCountForAccountant: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count FROM users WHERE company_id = ? and role_id!=1`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    accountCount: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count FROM accounts WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    accountCountForAccountant: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count FROM accounts WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    expenseCount: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT sum(total_amount) as count FROM expenses WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    supplierCount: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as count FROM vendors WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    expenseCountForAccountant: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT sum(total_amount) as count FROM expenses WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getUserById: (id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM users WHERE id = ?`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getUserByEmail: (email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM users WHERE email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateCompanyInfo: (tenant_id,currency,name,company_type, industry_type) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE companies SET currency = ?, company_name = ?, company_type = ?, industry_type = ?  WHERE tenant_id = ?`, [currency, name,company_type,industry_type, tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyById: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `select * from companies where id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkAttachable: (attach_id, expense_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'attach_count' FROM attachables WHERE expense_id = ? and attach_id = ?`, [expense_id, attach_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    deleteAccountOfDepart:(depart_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM department_accounts WHERE depart_id = ?`, [depart_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateAccountOfDepart:(depart_id, account_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO department_accounts (depart_id, account_id) VALUES (?, ?)`, [depart_id, account_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getQuickbookVendors: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM vendors WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getVendorByID: (vendor_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM vendors WHERE vendor_id = ?`, [vendor_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    storeActivity:(title, description, type, company_id, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO activities(title, description, type, company_id, user_id) VALUES (?, ?, ?, ?, ?)`, [title, description, type, company_id, user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getLastSyncedActivity: (company_id, user_id, type) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM activities WHERE company_id = ? and user_id = ? and type = ? ORDER BY id DESC LIMIT 1`, [company_id, user_id, type],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    foreignKeyCheck: (data) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SET foreign_key_checks = ?;`, [data],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeAccounts: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM accounts WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeActivities: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM activities WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeExpenses: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM expenses WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeAttachables: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM attachables WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeDepartments: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM departments WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeUserRelations: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM user_relations WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeVendors: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM vendors WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeCompany: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM companies WHERE id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeUsersOfCompany: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM users WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateUserStatus: (user_id, status) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET status = ? WHERE id = ?`, [status, user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    setForeignKeyDisable: (table) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `ALTER TABLE ${table} DISABLE KEYS;`, [],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        });
    },
    setForeignKeyEnable: (table) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `ALTER TABLE ${table} ENABLE KEYS;`, [],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        });
    }

};