const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const path = require("path");

// ✅ Resolve file path correctly
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

// ✅ Initialize only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ Proper export
module.exports = admin;
