const jwt = require("jsonwebtoken");
const { getUserPermissions } = require("./user_permission.service");
module.exports = {
    validateAdminPermission: async (req, res, next) => {
        let token = req.get("Authorization");
        console.log("token before", req);
        if (token) {
            // Remove Bearer from string
            token = token.slice(7);
            console.log("token", token);
            jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        success: 0,
                        message: "Invalid Token..."
                    });
                } else {
                    req.user = decoded;
                    await getUserPermissions(req.user.result.id, (err, results) => {
                        if (err) {
                            console.log(err);
                        }
                        if (!results) {
                            return res.json({
                                success: 0,
                                data: "error"
                            });
                        }
                        console.log("id",req.user.result.id);
                        console.log("result",results[0].role_id);
                        if(results[0].role_id === 1) {
                            next();
                        }
                        else {
                            return res.json({
                                success: 0,
                                data: "Only admin can access this API"
                            });
                        }
                        // if (req.baseUrl === '/api/videos' && req.method === 'GET') {
                        //     if (typeof results.find(o => o.role === 'admin') === 'undefined') {
                        //         return res.status(403).json({
                        //             success: 0,
                        //             message: "Access Denied! Unauthorized User"
                        //         });
                        //     }
                        // }

                        // if (req.baseUrl === '/api/videos' && req.method === 'POST') {
                        //     if (typeof results.find(o => o.name === 'Admin') === 'undefined' && req.url === "/add") {
                        //         return res.status(403).json({
                        //             success: 0,
                        //             message: "Access Denied! Unauthorized User"
                        //         });
                        //     }
                        // }


                    });
                }
            });
        } else {
            return res.status(401).json({
                success: 0,
                message: "Access Denied! Unauthorized User"
            });
        }
    }
};