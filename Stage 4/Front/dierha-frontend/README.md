<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="90" alt="React Logo" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="90" alt="TypeScript Logo" />
  &nbsp;&nbsp;&nbsp;


<h1 align="center">Dierha Frontend</h1>

<p align="center">
  Frontend Interface for the Dierha Subscription Management Platform
</p>

<p align="center">
  A React and TypeScript-based frontend application responsible for the user interface, authentication screens, dashboard views, subscription management pages, spending analysis, and API communication with the Dierha backend.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Library-React-61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Build%20Tool-Vite-646CFF" alt="Vite" />
  <img src="https://img.shields.io/badge/Styling-CSS-1572B6" alt="CSS" />
  <img src="https://img.shields.io/badge/Charts-Recharts-8884D8" alt="Recharts" />
  <img src="https://img.shields.io/badge/Stage-4%20Implementation-purple" alt="Stage 4" />
</p>

---

## Overview

This repository contains the frontend implementation for **Dierha**, an Arabic-first subscription management platform.

The frontend is responsible for presenting the user interface of the application. It allows users to register, log in, view their dashboard, manage subscriptions, track renewal dates, and understand their spending through clear visual summaries.

This frontend was developed as part of **Stage 4: Implementation**, where the project moved from planning and technical documentation into a working full-stack web application.

---

## Frontend Role in Dierha

The frontend acts as the main interaction layer between the user and the Dierha system.

It is responsible for:

- Displaying the application pages and interface.
- Providing login and registration forms.
- Managing user interactions and navigation.
- Showing subscription data in a clear dashboard.
- Allowing users to add, edit, view, and delete subscriptions.
- Displaying spending analysis and category-based summaries.
- Sending API requests to the backend.
- Updating the interface based on backend responses.
- Supporting an Arabic-first user experience.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Used to build reusable and interactive user interface components. |
| TypeScript | Used to improve code quality, structure, and maintainability. |
| Vite | Used as a fast frontend development and build tool. |
| CSS | Used to style the interface and apply the visual identity of Dierha. |
| Recharts | Used to display spending analysis and category charts. |
| Axios / Fetch | Used to send API requests to the backend. |
| Local Storage | Used to temporarily store authentication-related data such as tokens. |

---

## Main Frontend Pages

### Authentication Pages

The authentication pages allow users to access the platform securely.

They include:

- Login page.
- Register page.
- Forgot password page.
- Reset password page.
- Required field validation.
- Navigation between authentication screens.
- Handling login and registration responses from the backend.

---

### Home Page

The home page introduces the Dierha platform and gives users a clear first impression of the system.

It may include:

- Platform introduction.
- Main value proposition.
- Feature highlights.
- Navigation to login or registration.
- Visual identity and branding elements.

---

### Dashboard Page

The dashboard provides users with a summarized view of their subscription activity.

It includes:

- Total spending overview.
- Monthly and yearly spending summaries.
- Category-based analysis.
- Subscription status overview.
- Quick access to subscription actions.
- Visual charts and statistics.

---

### Subscriptions Page

The subscriptions page allows users to view and manage their recurring services.

It supports:

- Displaying all user subscriptions.
- Viewing subscription details.
- Editing subscription information.
- Deleting subscriptions.
- Categorizing subscriptions.
- Tracking renewal dates and subscription status.

---

### Add Subscription Page

The add subscription page allows users to enter a new subscription into the system.

It includes fields such as:

- Subscription name.
- Price.
- Billing cycle.
- Renewal date.
- Category.
- Status.
- Cancellation link.

---

## Main Frontend Components

### TopLogo Component

Displays the Dierha logo in the interface and supports the visual identity of the application.

### Footer Component

Provides a consistent footer section across the application.

### SettingsDropdown Component

Allows users to access settings-related actions from the interface.

### ToastMessage Component

Displays short feedback messages to users after actions such as saving, deleting, or updating data.

### EditSubscriptionModal Component

Allows users to edit subscription information in a focused modal window.

### CancelSubscriptionModal Component

Provides a confirmation interface before deleting or canceling a subscription action.

---

## Frontend Services

The frontend includes service files to organize API communication and authentication logic.

| Service | Purpose |
|---|---|
| api.ts | Defines the main API configuration and backend connection setup. |
| authService.ts | Handles authentication-related logic such as saving and reading tokens or user data. |
| subscriptionService.ts | Handles subscription-related API requests such as creating, updating, reading, and deleting subscriptions. |

This separation helps keep the frontend code organized and easier to maintain.

---

## Frontend and Backend Integration

The frontend communicates with the backend through API requests.

The general integration flow works as follows:

1. The user performs an action in the frontend interface.
2. The frontend sends an API request to the backend.
3. The backend validates and processes the request.
4. The backend communicates with the database if needed.
5. The backend returns a response to the frontend.
6. The frontend updates the user interface based on the response.

---

## Authentication Flow

The authentication flow works as follows:

1. The user enters their email and password in the login form.
2. The frontend sends the login request to the backend.
3. The backend validates the credentials.
4. If the login is successful, the backend returns a JWT token.
5. The frontend stores the token temporarily.
6. The user is redirected to the dashboard.
7. The token is used for future authenticated requests.

---

## Subscription Management Flow

The subscription management flow works as follows:

1. The user opens the subscription management page.
2. The frontend requests the user’s subscriptions from the backend.
3. The backend retrieves the subscriptions from the database.
4. The frontend displays the subscriptions in the interface.
5. The user can add, edit, or delete subscriptions.
6. The frontend sends the selected action to the backend.
7. The interface updates after receiving the backend response.

---

## User Interface Design

The frontend design focuses on clarity, simplicity, and usability.

The interface was designed to be:

- Arabic-first.
- Clean and organized.
- Easy to understand.
- Suitable for non-technical users.
- Consistent in colors, spacing, and typography.
- Dashboard-based to make subscription data easy to read.
- Supportive of quick decision-making before renewal dates.

---

## Environment Variables

Create a `.env` file in the frontend root folder if the project requires environment variables.

Example:

```env
VITE_API_URL=http://localhost:4000
```

---

### Installation

Install the project dependencies:

```
npm install
```

### Running the Frontend

#### Run the frontend in development mode:

```
npm run dev
```

#### The application will usually run on:

```
http://localhost:5173
Building the Project
```

#### Create a production build:

```
npm run build
```

##### Preview the production build locally:

```
npm run preview
```

## Stage 4 Frontend Outcome

By the end of Stage 4, the frontend provided the main user-facing experience required for the Dierha MVP.

The frontend implementation included:

- A React and TypeScript frontend application.
- Authentication pages.
- Dashboard interface.
- Subscription management pages.
- Add subscription flow.
- Reusable UI components.
- API service files.
- Spending analysis sections.
- Integration with backend endpoints.
- Arabic-first user interface.

This frontend helped transform Dierha from a planned concept into a functional web application that users can interact with directly.

---

### Future Improvements

Future frontend improvements may include:

- Enhancing responsive design for more screen sizes.
- Improving form validation and user feedback.
- Adding more advanced dashboard filters.
- Improving charts and spending visualizations.
- Supporting more personalization options.
- Improving accessibility.
- Adding full bilingual support.
- Enhancing loading states and error handling.
- Preparing the interface for production deployment.

---

## Conclusion

The Dierha frontend represents the main user-facing layer of the platform. It allows users to interact with the system, manage their subscriptions, view spending insights, and communicate with the backend through clear and organized interfaces.
Through this frontend implementation, the project became more usable, visual, and ready to support the full subscription management experience. It also helped connect the technical backend logic with a practical interface that users can understand and use.
Overall, this frontend provides a strong foundation for future development, including improved design, more advanced analytics, better responsiveness, full deployment, and expanded user experience features.
