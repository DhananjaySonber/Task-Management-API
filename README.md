# Task Management API

This is a Task Management API built with Node.js, Express, and MongoDB. The API provides user authentication and role-based authorization for managing products. The available roles are admin, manager, and staff, each with specific permissions.

## Features

- User registration and login with role-based access control.
- CRUD operations for products, accessible based on user roles.
- JWT authentication for secure API access.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/task-management-api.git
cd task-management-api
Install dependencies:
bash
Copy code
npm install
Set up environment variables:
Create a .env file in the root directory and add the following variables:

env
Copy code
Mon_Usm=your_mongodb_username
Mon_Pwd=your_mongodb_password
JWT_SECRET=your_jwt_secret
Start the server:
bash
Copy code
node index.js
The server will start on port 3000.

API Endpoints
Register
URL: POST /register

Description: Register a new user.

Body:

json
Copy code
{
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "admin|manager|staff"
}
Responses:

201: User created successfully.
400: Invalid role.
401: User already exists.
500: Internal server error.
Login
URL: POST /login

Description: Login a user and get a JWT token.

Body:

json
Copy code
{
    "email": "string",
    "password": "string"
}
Responses:

200: Success, returns JWT token.
401: User not found or incorrect password.
500: Internal server error.
Create Product
URL: POST /products

Description: Create a new product. (Admin only)

Headers:

http
Copy code
Authorization: Bearer <JWT_TOKEN>
Body:

json
Copy code
{
    "title": "string",
    "description": "string",
    "inventoryCount": "number"
}
Responses:

201: Product created successfully.
403: Access forbidden: Insufficient permissions.
500: Internal server error.
Get All Products
URL: GET /products

Description: Get all products. (Admin, Manager only)

Headers:

http
Copy code
Authorization: Bearer <JWT_TOKEN>
Responses:

200: Success, returns list of products.
403: Access forbidden: Insufficient permissions.
500: Internal server error.
Get Product by ID
URL: GET /products/:productId

Description: Get a product by ID. (Admin, Manager only)

Headers:

http
Copy code
Authorization: Bearer <JWT_TOKEN>
Responses:

200: Success, returns product data.
403: Access forbidden: Insufficient permissions.
404: Product not found.
500: Internal server error.
Update Product
URL: PUT /products/:productId

Description: Update a product. (Admin, Manager only)

Headers:

http
Copy code
Authorization: Bearer <JWT_TOKEN>
Body:

json
Copy code
{
    "title": "string",
    "description": "string",
    "inventoryCount": "number"
}
Responses:

200: Product updated successfully.
403: Access forbidden: Insufficient permissions.
404: Product not found or not authorized.
500: Internal server error.
Delete Product
URL: DELETE /products/:productId

Description: Delete a product. (Admin only)

Headers:

http
Copy code
Authorization: Bearer <JWT_TOKEN>
Responses:

200: Product deleted successfully.
403: Access forbidden: Insufficient permissions.
404: Product not found or not authorized.
500: Internal server error.
Running Tests
To run tests, use the following command:

bash
Copy code
npm test

Contributing
Contributions are welcome! Please fork the repository and create a pull request.
