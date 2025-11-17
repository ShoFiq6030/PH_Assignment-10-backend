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

// 404 API
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Not Found - ${req.originalUrl}`,
        error: {
            status: 404,
            method: req.method
        }
    });
});

// start server
const startServer = async () => {
    try {
        await connectDB(); 
        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
};

startServer();
