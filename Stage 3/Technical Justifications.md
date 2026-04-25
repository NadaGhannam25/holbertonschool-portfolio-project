# Technical Documentation  
## Technical Justifications: Rationales for Chosen Technologies  

---

## 1. Technology Stack Summary

The following table summarises every technology chosen for the Subscription Organiser web platform and the primary reason for each choice.

| Technology            | Layer      | Requirement            | Justification |
|----------------------|-----------|------------------------|--------------|
| React + Vite         | Frontend  | Responsive UI          | Component-based architecture simplifies building reusable UI elements. Vite provides fast hot-reload during development. React has native RTL support for Arabic layout. |
| Chart.js / Recharts  | Frontend  | Data visualisation     | Lightweight libraries with minimal configuration for bar, line, and pie charts required in the Dashboard and Reports pages. |
| Node.js + Express    | Backend   | REST API server        | JavaScript across the full stack reduces context switching for the team. Express is minimal and well-suited for building RESTful APIs quickly. |
| PostgreSQL           | Database  | Relational data        | Subscription data has clear relationships. PostgreSQL enforces referential integrity via foreign keys and supports complex queries. |
| JWT + bcrypt         | Auth      | Secure authentication  | Stateless JWT eliminates server-side session storage. bcrypt provides adaptive password hashing. |
| node-cron            | Scheduler | Automated reminders    | Runs scheduled background jobs inside the Node.js process with no additional infrastructure. |
| Nodemailer + Resend  | Email     | Transactional email    | Nodemailer provides a familiar SMTP API. Resend offers reliable delivery and a generous free tier. |
| jsPDF                | Reports   | PDF export             | Generates PDF files client-side without server dependency. |
| Postman              | QA        | API testing            | Industry-standard tool for manual and automated API endpoint testing. |

---

## 2. Frontend Justifications

### 2.1 React + Vite

**Functional requirement:**  
The platform requires a dynamic, multi-page interface with shared state across components.

**Non-functional requirement:**  
Fast development cycle and maintainable codebase.

React's component model allows each UI section (e.g., `SubscriptionCard`, `MonthlyChart`, `BillingCalendar`) to be built and tested in isolation.  
Vite provides near-instant hot-reload, reducing development friction.  
React also supports RTL layout direction, essential for Arabic interfaces.

---

### 2.2 Chart.js and Recharts

**Functional requirement:**  
Visualisation of spending data using bar, pie, and line charts.

Both libraries are lightweight and have React integrations (`react-chartjs-2`, `recharts`).  
Chart.js is used for simpler charts, while Recharts supports more complex compositions.

---

## 3. Backend Justifications

### 3.1 Node.js + Express

**Functional requirement:**  
Provide a REST API for frontend communication.

**Non-functional requirement:**  
Reduce context switching by using JavaScript across the stack.

Express is minimal and flexible, allowing modular API design.  
Node.js supports non-blocking I/O, making it efficient for concurrent requests.

---

### 3.2 JWT + bcrypt

**Functional requirement:**  
Secure authentication for users.

**Security requirement:**  
Passwords must not be stored in plain text.

JWT enables stateless authentication and scalability.  
bcrypt ensures secure password hashing with adaptive cost.

---

### 3.3 node-cron

**Functional requirement:**  
Automate reminder scheduling.

Runs scheduled jobs using cron syntax directly within Node.js.  
Eliminates the need for external job queue systems for MVP.

---

### 3.4 Nodemailer + Resend

**Functional requirement:**  
Send reminder emails.

Nodemailer provides SMTP abstraction.  
Resend offers reliable delivery with a simple setup and free tier.

---

### 3.5 jsPDF

**Functional requirement:**  
Export reports as PDF.

Generates PDFs on the client side, reducing backend load and complexity.

---

## 4. Database Justification

### 4.1 PostgreSQL

**Functional requirement:**  
Store structured relational data (users, subscriptions, categories, etc.).

**Non-functional requirement:**  
Ensure data integrity.

PostgreSQL enforces relationships via foreign keys and supports complex queries.  
The relational model fits the system naturally.

A document database (e.g., MongoDB) was considered but rejected due to manual relationship handling requirements.

---

## 5. QA Tool Justification

### 5.1 Postman

**Functional requirement:**  
Test API endpoints.

Postman allows sending requests, validating responses, and managing environments.  
Supports JWT testing and simplifies debugging during development.

---
