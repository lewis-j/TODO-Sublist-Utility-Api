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
      console.log(
        "Microsoft authentication response:",
        JSON.stringify(response, null, 2)
      );
      req.session.accessToken = response.accessToken;
      req.session.userId = response.account.homeAccountId;
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Error saving session" });
        }
        console.log(
          "Session after setting:",
          JSON.stringify(req.session, null, 2)
        );
        res.redirect(process.env.FRONTEND_URL);
      });
    })
    .catch((error) => {
      console.error("Error in Microsoft authentication:", error);
      res.status(500).json({ message: "Authentication failed" });
    });
});

module.exports = router;
