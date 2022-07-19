const e = require("express");
const pool = require("../../config/database");

const AppError = require("../../utils/appError");
const json = require("body-parser/lib/types/json");

module.exports = {

    qbSignUp: (first_name, last_name, email, phoneNumber, quickbook_access_token, quickbook_refresh_token, quickbook_exipre_at, token) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO users(first_name, last_name, email, contact, quickbook_access_token, quickbook_refresh_token, quickbook_exipre_at, login_token, role_id) VALUES (? ,? ,? ,? ,? ,?, ?, ?, 1)`, [first_name, last_name, email, phoneNumber, quickbook_access_token,quickbook_refresh_token,quickbook_exipre_at, token],
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
    updateRefreshToken: (email, qb_access_token, qb_refresh_token, qb_expire_at) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET quickbook_access_token = ?, quickbook_refresh_token = ?,quickbook_exipre_at = ? WHERE email = ?`, [qb_access_token, qb_refresh_token, qb_expire_at,email],
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
    activeQuickbookAccount:(tenant_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE companies SET active_status = 1 WHERE tenant_id = ?`, [tenant_id],
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
    disableAllQuickbookAccounts:(user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE companies SET active_status = 0 WHERE user_id = ?`, [user_id],
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
    addQuickbookExpense: (expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, class_id, total_amount, company_id, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO expenses(expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, class_id, total_amount, company_id, user_id, company_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'quickbooks')`, [expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, class_id, total_amount, company_id, user_id],
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
    updateQuickbookExpense: (expense_id, created_at, updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type, department_id, class_id, total_amount, company_id, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE expenses SET updated_at = ?, txn_date = ?, currency = ?, payment_type = ?, account_number = ?, description = ?, credit = ?, entity_ref_number = ?, entity_ref_name = ?, entity_ref_type = ?, department_id = ?, class_id = ?, total_amount = ? WHERE expense_id = ? and company_type = 'quickbooks'`, [updated_at, txn_date, currency, payment_type, account_number, description, credit, entity_ref_number, entity_ref_name, entity_ref_type,department_id, class_id, total_amount, expense_id],
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
    checkTenantExpense: (account_id ,company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'expense_count' FROM expenses WHERE expense_id = ? and company_id = ?`, [account_id, company_id],
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
    checkTenantVendor: (vendor_id ,company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'vendor_count' FROM vendors WHERE vendor_id = ? and company_id = ?`, [vendor_id, company_id],
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
    updateCompanyToken: (tenant_id, id_token, qb_access_token, qb_refresh_token, qb_expire_at) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE companies SET id_token = ?, access_token = ?, refresh_token = ?,expire_at = ? WHERE tenant_id = ?`, [id_token ,qb_access_token, qb_refresh_token, qb_expire_at,tenant_id],
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
    addDepartment: (depart_id, depart_name,parent_depart,depart_status, company_id, created_by, is_class,created_at,updated_at) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO departments(depart_id, depart_name, parent_depart, depart_status, company_id, created_by, is_class, created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [depart_id, depart_name,parent_depart,depart_status, company_id, created_by, is_class,created_at,updated_at],
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
    updateDepartment: (depart_id, depart_name,parent_depart,depart_status, company_id, created_by ,created_at,updated_at) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE departments SET depart_name = ?, parent_depart = ?, depart_status = ?,updated_at = ? WHERE depart_id = ? AND company_id = ?`, [depart_name,parent_depart,depart_status,updated_at, depart_id, company_id],
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
    addVendor: (vendor_id, name, phone, mobile, email, web, address, city, region, country, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO vendors(vendor_id, name, phone, mobile, email, web, address, city, region, country, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [vendor_id, name, phone, mobile, email, web, address, city, region, country, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at],
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
    updateVendor: (vendor_id, name, phone, mobile, email, web, address, city, region, country, postal_code, balance, acct_num, currency, status, type, company_id, user_id, created_at, updated_at) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE vendors SET name = ?, phone = ?, mobile = ?, email = ?, web = ?, address = ?, city = ?, region = ?, country = ?, postal_code = ?, balance = ?, acct_num = ?, currency = ?, status = ?, type = ?, updated_at = ? WHERE vendor_id = ? and company_id = ?`, [name, phone, mobile, email, web, address, city, region, country, postal_code, balance, acct_num, currency, status, type, updated_at, vendor_id, company_id],
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
    addAttachable: (expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO attachables(expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at],
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
    updateAttachable: (expense_id, company_id, file_name, download_url, file_size, attach_id, created_at, updated_at) => {
    return new Promise((resolov, reject) => {
        pool.query(
            `UPDATE attachables SET file_name = ?, download_url = ?, file_size = ?, attach_id = ?, created_at = ?, updated_at = ? WHERE expense_id = ? and company_id = ? and attach_id = ?`, [file_name, download_url, file_size, attach_id, created_at, updated_at, expense_id, company_id, attach_id],
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
    qbgetCompanyById: (company_id) => {
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
};