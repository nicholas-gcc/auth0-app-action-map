const express = require('express');
const createProxies = require('./proxy/createProxies');
const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');

const app = express();

app.use(cors());

// Create proxies for the auth service and the report service
const { reportServiceProxy } = createProxies();

// Add JWT validation middleware
app.use(authMiddleware);

// Route /report requests to the report service
app.use('/report', reportServiceProxy);

app.listen(3000, () => {
    console.log("API gateway server started on port 3000");
});

/**
 * You can extend the API gateway to serve as the entry point as you 
 * continue to integrate more APIs into the business logic
 */