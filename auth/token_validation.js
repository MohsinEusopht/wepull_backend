const jwt = require("jsonwebtoken");
module.exports = {
    checkToken: (req, res, next) => {
        let token = req.get("authorization");
        if (token) {
            // Remove Bearer from string
            token = token.slice(7);
            var port = req.app.settings.port || cfg.port;
            res.locals.requested_url = req.protocol + '://' + req.host + (port === 80 || port === 443 ? '' : ':' + port) + req.path;
            console.log(req);

            jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                if (err) {
                    return res.json({
                        success: 0,
                        message: "Invalid Token..."
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            return res.json({
                success: 0,
                message: "Access Denied! Unauthorized User"
            });
        }
    }
};