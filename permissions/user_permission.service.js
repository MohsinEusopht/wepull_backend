const pool = require("../config/database");

module.exports = {
    getUserPermissions: async(id, callBack) => {
        pool.query(
            `SELECT
            * from users where id = ?`, [id],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                console.log(results[0])
                return callBack(null, results);
            }
        );
    },
};