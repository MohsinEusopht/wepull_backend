const jwt = require("jsonwebtoken");
const { getUserPermissions } = require("./user_permission.service");
module.exports = {
    validateUserPermission: (req, res, next) => {
        let token = req.get("authorization");
        if (token) {
            // Remove Bearer from string
            token = token.slice(7);
            console.log("token", token);
            jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        success: 0,
                        message: "Invalid Token..."
                    });
                } else {
                    req.user = decoded;
                    getUserPermissions(req.user.result.id, (err, results) => {
                        if (err) {
                            console.log(err);
                        }
                        if (!results) {
                            return res.json({
                                success: 0,
                                data: "error"
                            });
                        }
                        console.log(results);
                        next();

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