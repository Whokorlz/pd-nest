
# NEST REST API
Use case of the NEST technology.

API REST for managing the support ticket lifecycle, built with **NestJS**, **TypeORM (PostgreSQL)**, **JWT** authentication, and documented with **Swagger**.

---

## 👤 Coder Information

|  |  |
| :--- | :--- |
| **Coder Name** | [Keshia Lambis] |
| **Clan / Group** | [Node / NEST.JS] |

---

## 📋 Requirements and Technologies

This project implements the technical requirements of the Node.js Module Performance Test (M6.2), including:

* **Framework:** NestJS (Node.js)
* **Database:** PostgreSQL
* **ORM:** TypeORM
* **Authentication:** JSON Web Tokens (JWT)
* **Validation:** `class-validator` and Global `ValidationPipe`
* **Authorization:** Custom **Guards** for Role-Based Access Control (RBAC) (`Administrator`, `Technician`, `Client`).
* **Initial Data:** Automatic **Seeders** executed upon application startup.
* **Error Handling:** Global **`AllExceptionsFilter`** to standardize API error responses.
* **Testing:** **Unit Tests** for core business logic (Ticket Creation and Status Change).

---

## 📦 Installation and Setup

### 1. Clone the Repository

    bash
    git clone [https://github.com/Whokorlz/pd-nest]
    cd [app] 


### 2. Dependencies installation

Install all required Node.js dependencies:

    Bash

    npm install

### 3. Environment Configuration (.env)Create a file named .env in the project root and configure your PostgreSQL connection and JWT secrets.Example .env File 

    DATABASE CONFIGURATION
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=kesh_db
    DB_PASSWORD=db_k***
    DB_DATABASE=db_pd_nest_kesh
    DB_SYNCHRONIZE=true # Warning: Set to 'false' in production environments
    DB_LOGGING=true

    JWT CONFIGURATION
    WT_SECRET=SUPER_SECRET_KEY_FOR_PRODUCTION_USE
    JWT_EXPIRATION_TIME=3600s # 1 hour



### 4. Project Execution
Ensure your PostgreSQL instance is running. The application will automatically create the schema and run the seeders if the database is empty.

    Bash
    npm run start:dev

The API will be available at:

    http://localhost:3000.🗺️ 


### 5. Code Navigation and Modular Structure

The project follows the standard NestJS modular architecture and SOLID principles:

    | Folder   |Purpose  | Main entities 
    |src/auth  | Authentication module | User, Role, Permission
    |src/users | User management module | Client, Technician, Administrator
    |src/categories| Category management module | Category
    |src/tickets| Ticket management module | Ticket
    |src/seeder| Seeder module | Client, Technician, Administrator,Category, Ticket




### 6. 🌐 API Documentation (Swagger)
All interactive API endpoints, schemas, and security requirements are documented via Swagger UI at the following

    URL:👉 Swagger URL: http://localhost:3000/api/docs


### 7. Typical Testing Flow 

* #### 1. Login:
    Obtain a JWT token using POST /auth/login with one of the test credentials.
* #### 2. Authorization: 
    Click the "Authorize" button in Swagger and paste the JWT token (e.g., Bearer eyJhbGci...).

* #### 3. Client Action: 
    Use the CLIENT token to create a ticket (POST /tickets).

* ### 4. Admin/Tech Action: 
    Use the ADMINISTRATOR token to list all tickets (GET /tickets) and assign a technician (PATCH /tickets/:id).

* #### 5. Status Update: 
    Use the TECHNICIAN token to change the ticket status (PATCH /tickets/:id/status).

### ✅ Unit Tests and Coverage

Unit tests are implemented using Jest to meet the mandatory requirement of testing ticket creation and status change logic.

To run the tests and generate the coverage report:

    Bash
    #Run all tests
    npm run test

    # Run tests and generate coverage report (Required minimum 40% coverage)

    npm run test:cov

## 💾 Database Dump

As part of the deliverables, a database dump (.sql file) containing the initial seeded data will be provided separately.


