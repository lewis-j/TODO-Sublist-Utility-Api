const express = require("express");
const msal = require("@azure/msal-node");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    authority: process.env.MICROSOFT_AUTHORITY,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  },
};

const msalClient = new msal.ConfidentialClientApplication(msalConfig);

router.get("/login", (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read", "tasks.readwrite"],
    redirectUri: process.env.MICROSOFT_REDIRECT_URI,
  };

  msalClient
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((url) => {
      console.log("redirect url", url);
      res.redirect(url);
    })
    .catch((error) => console.log(JSON.stringify(error)));
});

router.get("/callback", (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ["user.read", "tasks.readwrite"],
    redirectUri: process.env.MICROSOFT_REDIRECT_URI,
  };

  msalClient
    .acquireTokenByCode(tokenRequest)
    .then((response) => {
      console.log("response", response);
      req.session.accessToken = response.accessToken;
      res.redirect(process.env.FRONTEND_URL);
    })
    .catch((error) => console.log(JSON.stringify(error)));
});

module.exports = router;
