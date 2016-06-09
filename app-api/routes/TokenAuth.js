var jwt = require("jsonwebtoken");

module.exports = {
    generateToken: function (payload) {
        return jwt.sign({_id: payload}, "secret-key");
    },
    verifyToken: function (token, verified) {
        return jwt.verify(token, "secret-key", {}, verified);
    }
}
