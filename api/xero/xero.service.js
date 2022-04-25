const e = require("express");
const pool = require("../../config/database");

const AppError = require("../../utils/appError");
const json = require("body-parser/lib/types/json");

module.exports = {

    xeroSignUp: (first_name,last_name, email,xero_userid, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO users(first_name, last_name, email, xero_user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, login_token, role_id) VALUES (? ,? ,?, ? ,? ,?, ?, ?, ?, 1)`, [first_name, last_name, email, xero_userid, xero_id_token, xero_access_token,xero_refresh_token,xero_expire_at, token],
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
    getRefreshToken: (email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT xero_refresh_token FROM users WHERE email = ?`, [email],
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
    updateRefreshToken: (email, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET xero_id_token = ?,xero_access_token = ?, xero_refresh_token = ?,xero_expire_at = ? WHERE email = ?`, [xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at,email],
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
    addXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO expenses(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id, company_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'xero')`, [expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id],
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
    updateXeroExpense:(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, company_id, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE expenses SET updated_at = ?, txn_date = ?, currency = ?, payment_type = ?, account_number = ?, credit = ?, description = ?, department_id = ?, total_amount = ? WHERE expense_id = ? and company_type = 'xero'`, [updated_at, txn_date, currency, payment_type, account_number, credit, description, department_id, total_amount, expense_id],
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
    checkTenantExpense: (invoice_id, company_id) => {
        console.log(`SELECT count(*) as 'expense_count' FROM expenses WHERE expense_id = ${invoice_id} and company_id = ${company_id}`)
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'expense_count' FROM expenses WHERE expense_id = ? and company_id = ?`, [invoice_id, company_id],
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
    addDepartment: (depart_id, depart_name,parent_depart,depart_status, company_id, created_by, is_class) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO departments(depart_id, depart_name, parent_depart, depart_status, company_id, created_by, is_class) VALUES (?, ?, ?, ?, ?, ?, ?)`, [depart_id, depart_name,parent_depart,depart_status, company_id, created_by, is_class],
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
    updateDepartment: (depart_id, depart_name,parent_depart,depart_status, company_id, is_class) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE departments SET depart_name = ?, parent_depart = ?, depart_status = ?, is_class = ? WHERE depart_id = ? AND company_id = ?`, [depart_name,parent_depart,depart_status, depart_id, company_id, is_class],
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
    checkTenantDepartment: (depart_id ,company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'depart_count' FROM departments WHERE depart_id = ? and company_id = ?`, [depart_id, company_id],
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
    getAttachment: (attach_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM attachables WHERE attach_id = ?`, [attach_id],
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
    // createXeroAccount:(code, accountID, name, type, status, description, currencyCode, updatedDateUTC, company_id, user_id, company_type)
};