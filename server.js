const express = require('express');
const { ObjectId, MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config(); 


const app = express();
app.use(express.json());
app.use(cors());



let client;

const initializeDBAndServer = async () => {
    
    const username = encodeURIComponent(process.env.Mon_Usm);
    const password = encodeURIComponent(process.env.Mon_Pwd);

 
    const uri = `mongodb+srv://${username}:${password}@cluster0.ui5whmx.mongodb.net/`;


    client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB");
        app.listen(3000, () => {
            console.log('Server running on port: 3000');
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

initializeDBAndServer();


// Middleware to authenticate JWT token 
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(400).send("Token not provided");

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) return res.status(401).send("Invalid JWT Token");

        req.user = payload;
        next();
    });
};

// Middleware to authorize roles 
const authorizeRoles = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).send("Access forbidden: Insufficient permissions");
    }
    next();
};

// Endpoint to register a new user
app.post('/register', async (req, res) => {
    try {
        const collection = client.db('task').collection('users');
        const { username, email, password, role } = req.body;

        if (!['admin', 'manager', 'staff'].includes(role)) {
            return res.status(400).send({ errorMsg: 'Invalid role' });
        }

        const userExist = await collection.findOne({ email });
        if (userExist) return res.status(401).send({ errorMsg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await collection.insertOne({ username, email, password: hashedPassword, role });

        res.status(201).send({ message: "User created successfully" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send({ "Internal server error": error });
    }
});

app.post('/login', async (req, res) => {
    try {
        const collection = client.db('task').collection('users');
        const { email, password } = req.body;

        const user = await collection.findOne({ email });
        if (!user) return res.status(401).send({ errorMsg: "User not found" });

        const passwordMatched = await bcrypt.compare(password, user.password);
        if (!passwordMatched) return res.status(401).send({ errorMsg: "Incorrect password" });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
        res.status(200).send({ jwtToken: token, userId: user._id });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send({ "Internal server error": error });
    }
});

app.post('/products', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
    try {
        const collection = client.db('task').collection('products');
        const { title, description, inventoryCount } = req.body;

        const newProduct = {
            title,
            description,
            inventoryCount,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(newProduct);
        res.status(201).send({ productId: result.insertedId, message: 'Product created successfully' });
    } catch (error) {
        console.error("Error during product creation:", error);
        res.status(500).send({ "Internal server error": error });
    }
});

// Endpoint to get all products (Admin, Manager only)
app.get('/products', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res) => {
    try {
        const collection = client.db('task').collection('products');
        const products = await collection.find().toArray();
        res.status(200).send(products);
    } catch (error) {
        console.error("Error during fetching products:", error);
        res.status(500).send({ "Internal server error": error });
    }
});

// Endpoint to get a product by ID (Admin, Manager only)
app.get('/products/:productId', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res) => {
    try {
        const collection = client.db('task').collection('products');
        const product = await collection.findOne({ _id: new ObjectId(req.params.productId) });

        if (!product) return res.status(404).send({ errorMsg: "Product not found" });
        res.status(200).send(product);
    } catch (error) {
        console.error("Error during fetching product:", error);
        res.status(500).send({ "Internal server error": error });
    }
});

// Endpoint to update a product (Admin, Manager only)
app.put('/products/:productId', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res) => {
    try {
        const collection = client.db('task').collection('products');
        const { title, description, inventoryCount } = req.body;

        const updatedProduct = {
            $set: {
                title,
                description,
                inventoryCount,
                updatedAt: new Date()
            }
        };

        const result = await collection.updateOne({ _id: new ObjectId(req.params.productId) }, updatedProduct);
        
        if (result.modifiedCount === 0) return res.status(404).send({ errorMsg: "Product not found or not authorized" });
        res.status(200).send({ message: 'Product updated successfully' });
    } catch (error) {
        console.error("Error during updating product:", error);
        res.status(500).send({ "Internal server error": error });
    }
});

// Endpoint to delete a product (Admin only)
app.delete('/products/:productId', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
    try {
        const collection = client.db('task').collection('products');
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.productId) });

        if (result.deletedCount === 0) return res.status(404).send({ errorMsg: "Product not found or not authorized" });
        res.status(200).send({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error("Error during deleting product:", error);
        res.status(500).send({ "Internal server error": error });
    }
});

module.exports = app;