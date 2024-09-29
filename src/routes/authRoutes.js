const express = require("express");
const msal = require("@azure/msal-node");
const router = express.Router();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
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
      const token = jwt.sign(
        {
          accessToken: response.accessToken,
          userId: response.account.homeAccountId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "14d" }
      );
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      });
      res.redirect(process.env.FRONTEND_URL);
    })
    .catch((error) => {
      console.error("Error in Microsoft authentication:", error);
      res.status(500).json({ message: "Authentication failed" });
    });
});

module.exports = router;
