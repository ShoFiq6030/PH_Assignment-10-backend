const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./db");
const propertyRoutes = require("./routes/propertyRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes")

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
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes)

// start server
app.listen(port, async () => {
    await connectDB();

    console.log(`🚀 Server running on port ${port}`);
});
