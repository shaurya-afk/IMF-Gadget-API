# Phoenix: IMF Gadget API Development Challenge

This project is for the BD-Intern at Upraised. It is an API for managing IMF gadgets and user authentication.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Gadgets](#gadgets)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shaurya-afk/IMF-Gadget-API.git
   ```
2. Navigate to the project directory:
   ```bash
   cd app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the application in development mode:
   ```bash
   npm run dev
   ```
2. The API will be running on `http://localhost:5000`.

## Environment Variables

The application requires the following environment variables, which should be defined in a `.env` file:

```plaintext
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=imf_gadget
DB_PASSWORD=password
DB_PORT=5432
JWT_SECRET=phoenix_imf_gadget
```

## API Endpoints

### Authentication

- **POST /auth/signup**  
  Register a new user.  
  **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
  **Response:**
  ```json
  {
    "token": "string",
    "message": "User registered successfully"
  }
  ```

- **POST /auth/login**  
  Log in an existing user.  
  **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
  **Response:**
  ```json
  {
    "token": "string"
  }
  ```

### Gadgets

- **GET /gadgets**  
  Retrieve all gadgets with their mission success probabilities.  
  **Response:**
  ```json
  [
    {
      "id": "uuid",
      "name": "string",
      "status": "string",
      "mission_success_probability": "string"
    }
  ]
  ```

- **POST /gadgets**  
  Add a new gadget.  
  **Request Body:**
  ```json
  {
    "status": "Available | Deployed | Destroyed | Decommissioned"
  }
  ```
  **Response:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "status": "string"
  }
  ```

- **PATCH /gadgets/:id**  
  Update a gadget's name or status.  
  **Request Body:**
  ```json
  {
    "name": "string",
    "status": "Available | Deployed | Destroyed | Decommissioned"
  }
  ```
  **Response:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "status": "string"
  }
  ```

- **DELETE /gadgets/:id**  
  Decommission a gadget.  
  **Response:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "status": "Decommissioned",
    "decommissioned_at": "timestamp"
  }
  ```

- **POST /gadgets/:id/self-destruct**  
  Trigger the self-destruct sequence for a gadget.  
  **Response:**
  ```json
  {
    "message": "Self-destruct sequence triggered.",
    "confirmationCode": "string",
    "gadget": {
      "id": "uuid",
      "name": "string",
      "status": "Destroyed"
    }
  }
  ```