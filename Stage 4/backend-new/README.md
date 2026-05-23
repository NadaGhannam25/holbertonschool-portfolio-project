<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<h1 align="center">Dierha Backend</h1>

<p align="center">
  Backend API for the Dierha Subscription Management Platform
</p>

<p align="center">
  A NestJS-based backend service responsible for authentication, subscription management, categories, analytics, database operations, and API communication for the Dierha full-stack application.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank">
    <img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank">
    <img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" />
  </a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank">
    <img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" />
  </a>
  <img src="https://img.shields.io/badge/Framework-NestJS-red" alt="NestJS" />
  <img src="https://img.shields.io/badge/Language-TypeScript-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Stage-4%20Implementation-purple" alt="Stage 4" />
</p>

---

## Overview

This repository contains the backend implementation for **Dierha**, an Arabic-first subscription management platform.

The backend handles the main server-side logic of the application. It connects the frontend with the database, manages user authentication, processes subscription data, organizes categories, and provides analytics needed for the dashboard and spending insights.

This backend was developed as part of **Stage 4: Implementation**, where the project moved from planning and technical documentation into a working full-stack web application.

---

## Backend Role in Dierha

The backend acts as the main communication layer between the frontend interface and the database.

It is responsible for:

- Receiving API requests from the frontend.
- Validating user input before processing requests.
- Handling user authentication and secure access.
- Managing user and subscription data.
- Connecting the application to the PostgreSQL database.
- Organizing subscriptions into categories.
- Providing analytics data for spending insights.
- Returning structured responses to support frontend updates.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| NestJS | Backend framework used to build scalable and organized server-side applications. |
| TypeScript | Main programming language used to improve code structure and maintainability. |
| PostgreSQL | Relational database used to store users, subscriptions, categories, and related data. |
| Drizzle ORM | Used to define the database schema and manage database queries. |
| JWT | Used for authentication and protected API access. |
| bcrypt | Used to securely hash user passwords. |
| Node.js | Runtime environment used to run the backend server. |
| Resend | Email API service used to send subscription reminder emails and system notifications. |
| Puppeteer | Used to generate PDFs or automate browser-based tasks such as exporting reports. |
| cron | Used to schedule automated backend tasks, such as checking renewal dates and sending reminders. |

---

## Main Backend Modules

### Authentication Module

The authentication module manages user access to the platform.

It includes:

- User registration.
- User login.
- Password hashing.
- JWT token generation.
- Protected route support.
- Authentication guards.

---

### Subscriptions Module

The subscriptions module manages the main functionality of the platform.

It supports:

- Creating new subscriptions.
- Retrieving user subscriptions.
- Updating subscription details.
- Deleting subscriptions.
- Tracking renewal dates.
- Connecting each subscription to the correct user.

---

### Categories Module

The categories module helps organize subscriptions into clear and meaningful groups.

Examples of categories include:

- Entertainment.
- Work.
- Education.
- Health.
- Other.

This allows users to better understand how their recurring payments are distributed across different areas.

---

### Analytics Module

The analytics module provides the data needed for dashboard insights and spending summaries.

It supports:

- Total spending overview.
- Category-based spending analysis.
- Subscription summaries.
- Data prepared for frontend charts and statistics.

---

### Database Module

The database module manages the connection between the backend and PostgreSQL.

It includes:

- Database schema definition.
- Database connection setup.
- Seed data support.
- Schema synchronization.
- Drizzle configuration.

---

## API Functionality

The backend provides API functionality required for the main MVP features.

| Area | Description |
|---|---|
| Authentication | Handles user registration, login, password hashing, and JWT generation. |
| Subscriptions | Allows users to create, view, update, and delete subscriptions. |
| Categories | Organizes subscriptions by category. |
| Analytics | Provides spending summaries and dashboard insights. |
| Database | Stores and retrieves users, subscriptions, categories, and related data. |

---

## Authentication Flow

The authentication flow works as follows:

1. The frontend sends the user email and password to the backend.
2. The backend validates the request data.
3. During registration, the backend checks whether the email already exists.
4. The password is hashed before being stored in the database.
5. During login, the backend compares the entered password with the stored hashed password.
6. If the credentials are valid, the backend generates a JWT token.
7. The token is returned to the frontend.
8. The frontend uses the token for authenticated requests.

---

## Database Design

The backend database supports the main MVP entities required for Dierha.

### Main Entities

| Entity | Purpose |
|---|---|
| Users | Stores user account information. |
| Subscriptions | Stores subscription details for each user. |
| Categories | Stores subscription categories. |
| Analytics Data | Supports dashboard summaries and spending insights. |

### Subscription Data

Each subscription may include:

- Subscription name.
- Price.
- Billing cycle.
- Renewal date.
- Category.
- Status.
- User ID.
- Cancellation link.

This structure helps ensure that each subscription is connected to the correct user and can be displayed, updated, analyzed, or deleted when needed.

---

## Environment Variables

Create a `.env` file in the backend root folder.

Example:

```env
DATABASE_URL=your_database_connection_url
JWT_SECRET=your_jwt_secret
PORT=4000
```

### Installation
Install the project dependencies:

## backend:
```
cd backend-new
npm install drizzle-kit@latest --save-dev
npx drizzle-kit --version
npx drizzle-kit generate
npx drizzle-kit migrate
npm run start:dev

```
---

### Stage 4 Backend Outcome

By the end of Stage 4, the backend provided the main foundation required for the Dierha MVP.

The backend implementation included:

- A structured NestJS backend application.
- Authentication logic.
- JWT-based access handling.
- Database connection.
- User and subscription data management.
- Category organization.
- Analytics support.
- API communication with the frontend.

This backend helped transform Dierha from a planned system into a working full-stack web application.
---

### Future Improvements

Future backend improvements may include:

- More advanced reminder scheduling.
- Improved validation and error handling.
- Deployment optimization.
- More detailed analytics.
- Additional security enhancements.
- Expanded automated testing.
- More advanced role-based access control.

---

## Conclusion

The Dierha backend represents the core server-side foundation of the platform. It provides the main services needed to support user authentication, subscription management, category organization, analytics, and database communication.

Through this backend implementation, the project became more connected, structured, and ready to support the frontend application with real data and secure API operations. It also helped transform Dierha from a planned MVP into a functional full-stack system.

Overall, this backend provides a strong base for future development, including improved reminders, enhanced analytics, stronger validation, deployment readiness, and additional security improvements.
