const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./db");
const propertyRoutes = require("./routes/propertyRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// routes

app.get('/', (req, res) => {
    res.send('Welcome to API')
})
app.use("/api/properties", propertyRoutes);

// start server
app.listen(port, async () => {
    await connectDB();
    console.log(`🚀 Server running on port ${port}`);
});
