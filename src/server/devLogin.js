// src/server/devLogin.js
const devLogin = (req, res, next) => {
  if (req.header('Authorization') === 'Basic ZGVtbzpkZW1v') { // "demo:demo" encoded in base64
    req.user = { 
      userId: '659b6e5e7f6a1a9b8e9b1f4d',
      username: 'demo' 
    };
  }
  next();
};

module.exports = devLogin;