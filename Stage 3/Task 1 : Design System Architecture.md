# Task 1 : System Architecture
---

## 1. System Architecture Overview

The Subscription Organiser Platform follows a three-tier client-server architecture. The system is divided into a Client Layer, a Backend Layer, and a Database Layer, each with well-defined responsibilities and communication protocols.

<img width="1480" height="867" alt="system-arch" src="https://github.com/user-attachments/assets/beff4d5e-390b-4869-8322-dd691e7b27e8" />

---

## 2. Layer Descriptions

### 2.1 Client Layer
**Technology:** React + Vite  

The client layer runs entirely in the user's browser. It is responsible for rendering the user interface, managing client-side state, and communicating with the backend via HTTP/REST requests. Data visualisations (monthly spending charts, billing calendar) are rendered using Chart.js and Recharts.

---

### 2.2 Backend Layer
**Technology:** Node.js + Express  

The backend is a RESTful API server built with Node.js and Express. It handles all business logic and exposes endpoints consumed by the client. The backend is organized into five functional modules:

| Module | Technology | Responsibility |
|--------|-----------|---------------|
| Auth | JWT + bcrypt | Handles user registration, login, and token-based authentication. Passwords are hashed with bcrypt before storage. |
| Subscriptions | Express Router | Provides CRUD endpoints for managing user subscriptions (create, read, update, delete, filter, categorise). |
| Reports | jsPDF | Generates monthly spending analysis reports and exports them as downloadable PDF files. |
| Reminders | node-cron | Runs scheduled background jobs to detect upcoming subscription renewals and trigger reminder notifications. |
| Email | Nodemailer + Resend | Sends renewal reminder emails to users via the Resend transactional email API, with Cancel link redirects to the subscription website. |

---

### 2.3 Database Layer
**Technology:** PostgreSQL  

All persistent data is stored in a PostgreSQL relational database. The schema consists of five core tables: users, subscriptions, categories, price_history, and reminders. The backend communicates with the database using raw SQL queries.

---

## 3. Data Flow

Communication between layers follows this sequence:

1. The user interacts with the React frontend (e.g., adds a subscription).  
2. The frontend sends an HTTP request to the appropriate Express API endpoint.  
3. The backend validates the JWT token, processes the business logic, and executes a SQL query against PostgreSQL.  
4. PostgreSQL returns the result, the backend formats a JSON response, and the frontend updates the UI accordingly.  
5. For reminders: node-cron runs a scheduled job, queries upcoming renewals from the database, and triggers Nodemailer to send emails via Resend.  

---

## 4. Technical Justification

All technology choices are justified based on project requirements, team familiarity, and non-functional requirements such as performance and maintainability.

| Technology | Requirement | Justification |
|------------|------------|---------------|
| React + Vite | Responsive UI, RTL Arabic support | Component-based architecture simplifies UI development; Vite provides fast hot-reload. RTL layout is natively supported. |
| Chart.js / Recharts | Spending visualizations | Lightweight charting libraries with minimal setup, suitable for bar, line, and pie charts needed for the dashboard. |
| Node.js + Express | Fast API development | JavaScript across the full stack reduces context switching. Express is minimal and well-suited for REST APIs. |
| PostgreSQL | Relational data with integrity | Subscription data has clear relationships (user → subscriptions → categories). PostgreSQL enforces referential integrity via foreign keys. |
| JWT + bcrypt | Secure authentication | Stateless JWT authentication eliminates server-side session storage. bcrypt provides adaptive password hashing. |
| node-cron | Scheduled reminders | Runs inside the existing Node.js process with no additional infrastructure. Suitable for the MVP scope. |
| Nodemailer + Resend | Transactional email delivery | Nodemailer provides a familiar API; Resend is a reliable email delivery service with a generous free tier. |
| Postman | API testing (QA) | Industry-standard tool for manual and automated API endpoint testing during development. |

---
