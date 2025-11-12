const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const path = require("path");

// ✅ Resolve file path correctly
const serviceAccountPath = path.resolve(__dirname, "./ph-assignment-10-firebase-.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

// ✅ Initialize only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ Proper export
module.exports = admin;
