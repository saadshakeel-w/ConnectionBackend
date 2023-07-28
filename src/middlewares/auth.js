const Users = require("../models/usersModel");
const jwt = require("jsonwebtoken");

async function auth(req, res, next) {
  const token = req.header("Authorization")?.split("Bearer ")[1];
  if (!token) {
    return res.status(401).send("Access denied , no token provided");
  }
  try {
    const decoded = jwt.verify(token, "privateKey");
    let result = await Users.findById(decoded.userId);
    if (result) {
      req.user = result;
      next();
    } else {
      next();
    }
  } catch (ex) {
    next();
  }
}

module.exports = {
  auth,
};
