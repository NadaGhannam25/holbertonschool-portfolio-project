<div align="center">

<table>
  <tr>
    <td align="center">
      <img width="260" height="130" alt="Dierha Logo" src="https://github.com/user-attachments/assets/f345f392-e131-4a1b-a323-0eaa7a6cd449" />
    </td>
    <td align="center">
      <img width="260" height="130" alt="Holberton School Logo" src="https://github.com/user-attachments/assets/ce8db7c1-030d-46e6-b263-81a4ae6fadd1" />
    </td>
  </tr>
</table>

### Stage 4: Implementation

#### Turning the planned MVP into a working full-stack web application.

**Developed as part of the Holberton School Portfolio Project**

</div>

---

## Overview

This README focuses on **Stage 4: Implementation** of the Dierha project.
Dierha is an Arabic-first subscription management web application that helps users organize their digital subscriptions, track renewal dates, and understand their spending without connecting a bank
account.
In Stage 4, the team moved from planning and technical documentation into actual development. The main goal was to implement the core MVP features by building the frontend interface, developing backend services, connecting the database, and integrating the main user flows.


---

## Stage 4 Objective

The objective of Stage 4 was to transform the technical documentation prepared in the previous stage into a functional web application.

This stage focused on:

- Building the frontend screens and user interface.
- Developing backend APIs.
- Implementing authentication.
- Connecting the application to the database.
- Integrating frontend and backend functionality.
- Testing the main user flows.
- Preparing the MVP for demonstration.

---

## Implementation Scope

The implementation focused on the core MVP features required for the Subscriptions Organiser Platform.

### Main MVP Features Implemented

| Feature | Description |
|---|---|
| User Authentication | Allows users to register, log in, and log out. |
| Dashboard Interface | Displays the main overview of the user’s subscriptions and spending. |
| Subscription Management | Supports adding, viewing, editing, and deleting subscriptions. |
| Categories | Organizes subscriptions by category such as work, entertainment, education, health, and others. |
| Spending Analysis | Displays subscription spending insights using charts and summaries. |
| Renewal Tracking | Helps users track upcoming renewal dates. |
| Database Storage | Stores user and subscription data in the database. |
| API Integration | Connects frontend pages with backend endpoints. |

---

## Frontend Implementation

The frontend was developed to provide a clean, simple, and Arabic-first user experience.

The main focus was to create an interface that allows users to manage their subscriptions easily and understand their recurring expenses without complexity.

### Frontend Technologies

| Technology | Purpose |
|---|---|
| React | Building reusable UI components. |
| Vite | Providing a fast development environment. |
| TypeScript | Improving code structure and reducing runtime errors. |
| CSS | Styling the interface and applying the visual identity. |
| Recharts | Displaying spending analysis and category charts. |

---

## Frontend Features

### Authentication Screens

The frontend includes login and registration pages that allow users to access the platform.

These screens include:

- Login form.
- Register form.
- Input validation for required fields.
- Navigation between login, register, and home pages.
- Temporary handling of authentication state during integration.

### Dashboard Page

The dashboard provides users with a clear overview of their subscription activity.

It includes:

- Total spending summary.
- Monthly or yearly spending view.
- Category-based spending analysis.
- Subscription status overview.
- Quick access to subscription management features.

### Subscription Management Interface

The subscription pages allow users to manage their recurring services.

Users can:

- Add a new subscription.
- View subscription details.
- Edit subscription information.
- Delete a subscription.
- Track renewal dates.
- Categorize each subscription.

### User Interface Design

The user interface was designed to be:

- Arabic-first.
- Simple and clear.
- Dashboard-based.
- Easy to understand for non-technical users.
- Consistent in colors, spacing, typography, and layout.

The design focuses on helping users quickly understand their subscriptions and take action before renewal dates.

---

## Backend Implementation

The backend was developed to handle the main business logic of the application.

It manages authentication, user data, subscription data, and the communication between the frontend and database.

### Backend Technologies

| Technology | Purpose |
|---|---|
| NestJS | Backend framework used to build scalable and organized server-side applications. |
| TypeScript | Main programming language used to improve code structure and maintainability. |
| PostgreSQL | Relational database used to store users, subscriptions, categories, and related data. |
| Drizzle ORM | Used to define the database schema and manage database queries. |
| JWT | Used for authentication and protected API access. |
| bcrypt | Used to securely hash user passwords. |
| Resend | Email API service used to send subscription reminder emails and system notifications. |
| Puppeteer | Used to generate PDFs or automate browser-based tasks such as exporting reports. |
| cron | Used to schedule automated backend tasks, such as checking renewal dates and sending reminders. |

---

## Backend Features

### Authentication API

The backend includes authentication endpoints that allow users to register and log in securely.

The authentication flow includes:

- Receiving user credentials from the frontend.
- Validating user input.
- Checking whether the email already exists.
- Hashing passwords before storing them.
- Comparing hashed passwords during login.
- Generating a JWT token after successful login.
- Returning authentication status to the frontend.

### User Management

The backend stores and manages user information such as:

- User name.
- Email address.
- Hashed password.
- Account creation date.

This ensures that each user has a separate account and can manage their own subscriptions independently.

### Subscription API

The backend provides API endpoints for managing subscription data.

The subscription API supports:

- Creating a subscription.
- Reading user subscriptions.
- Updating subscription details.
- Deleting a subscription.
- Filtering subscriptions by user.
- Storing renewal dates, prices, categories, and status.

### Database Connection

The backend connects to a PostgreSQL database to store persistent data.

The database supports the main entities needed for the MVP, including:

- Users.
- Subscriptions.
- Categories.
- Renewal dates.
- Reminder settings.

This allows the application to save real user data instead of relying only on temporary frontend state.

---

## Frontend and Backend Integration

A major part of Stage 4 was connecting the frontend with the backend through API requests.

The integration allows the frontend to send user actions to the backend and receive real responses.

### Integration Flow

1. The user interacts with the frontend interface.
2. The frontend sends an API request to the backend.
3. The backend validates the request.
4. The backend communicates with the database.
5. The database stores or retrieves the required data.
6. The backend sends a response back to the frontend.
7. The frontend updates the interface based on the response.

### Example: Login Flow

1. The user enters email and password.
2. The frontend sends the login request to the backend.
3. The backend checks the email and password.
4. If the credentials are valid, the backend generates a JWT token.
5. The token is returned to the frontend.
6. The frontend stores the token temporarily.
7. The user is redirected to the dashboard.

### Example: Add Subscription Flow

1. The user fills in subscription details.
2. The frontend sends the subscription data to the backend.
3. The backend validates the data.
4. The backend saves the subscription in the database.
5. The backend returns a success response.
6. The frontend updates the subscription list.

---

## Database Design

The database was designed to support the main functionality of the MVP.

### Main Data Entities

| Entity | Description |
|---|---|
| Users | Stores user account information. |
| Subscriptions | Stores subscription details for each user. |
| Categories | Organizes subscriptions into groups. |
| Reminders | Stores reminder-related information. |

### Subscription Data Example

Each subscription may include:

- Subscription name.
- Price.
- Billing cycle.
- Renewal date.
- Category.
- Status.
- Cancellation link.
- User ID.

This structure helps connect every subscription to its owner and supports future expansion.

---

## Testing and Validation

During Stage 4, the team tested the main features to ensure the application works as expected.

### Tested Areas

| Area | What Was Tested |
|---|---|
| Authentication | Sign up, login, logout, and error handling. |
| Frontend Forms | Required fields, input behavior, and navigation. |
| API Requests | Correct request and response handling. |
| Database | Data creation, retrieval, update, and deletion. |
| Subscription Flow | Adding, editing, viewing, and deleting subscriptions. |
| UI Behavior | Dashboard display, charts, and layout consistency. |

Testing helped the team identify issues, improve the user experience, and make the MVP more stable.

---

## Challenges Faced

During implementation, the team faced several challenges related to full-stack development and integration.

### Main Challenges

- Connecting the frontend and backend correctly.
- Managing authentication state on the frontend.
- Handling JWT tokens securely.
- Ensuring the database connection works properly.
- Keeping the Arabic interface consistent.
- Organizing frontend components and backend routes.
- Testing API requests and fixing integration errors.
- Improving the dashboard layout and data visualization.



These challenges helped the team gain practical experience in building a full-stack web application.

---

## Current Stage 4 Outcome

By the end of Stage 4, the team had built a functional MVP version of Dierha.

The implementation included:

- A working frontend interface.
- Authentication screens.
- Backend API structure.
- Database connection.
- Subscription management functionality.
- Dashboard layout.
- Spending analysis sections.
- Basic integration between frontend and backend.


  
Stage 4 allowed the team to apply the technical documentation from Stage 3 in a real development environment and move the project from design into a working product.


---

## Project Structure

The following diagrams show the frontend and backend structure used during Stage 4 implementation.
## Project Structure

The following diagrams show the frontend and backend structure used during Stage 4 implementation.

<div align="center">

<table>
  <tr>
    <td align="center" width="50%">
      <h3>Frontend Structure</h3>
      <img width="480" alt="Dierha Frontend Project Structure" src="https://github.com/user-attachments/assets/a4d65fde-205e-48db-8b9f-a4d91d745eb7" />
    </td>
    <td align="center" width="50%">
      <h3>Backend Structure</h3>
      <img width="480" alt="Dierha Backend Project Structure" src="https://github.com/user-attachments/assets/3924b22c-9707-4457-9bce-e0cbb9123a74" />
    </td>
  </tr>
</table>

</div>

---

## Conclusion

Stage 4 represents the point where Dierha moved from planning and documentation into real full-stack implementation. During this stage, the team worked on building the frontend interface, developing the backend structure, connecting the database, and integrating the main user flows required for the MVP.

The implementation helped transform the project idea into a functional web application that supports authentication, subscription management, dashboard views, spending analysis, and basic frontend-backend communication.

Overall, Stage 4 allowed the team to apply the technical decisions made in the previous stages and gain practical experience in developing, testing, and improving a full-stack web application. This stage also created a strong foundation for future enhancements, deployment, and further feature expansion.

Overall, Stage 4 allowed the team to apply the technical decisions made in the previous stages and gain practical experience in developing, testing, and improving a full-stack web application. This stage also created a strong foundation for future enhancements, deployment, and further feature expansion.
