const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.headers["x-access-token"]; // can be set up to use Authorization: Bearer instead

  if (!token) {
    return res.status(403).send("Missing Token");
  }
  try {
    const verification = jwt.verify(token, config.TOKEN_KEY);
    req.user = verification;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;