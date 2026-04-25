# Task 3: Create High-Level Sequence Diagrams

## Introduction

This section presents the high-level sequence diagrams for the Subscriptions Organiser Platform. The purpose of these diagrams is to show how the main system components interact with each other during critical use cases in the MVP.

Sequence diagrams help explain the dynamic behaviour of the system by showing the order of communication between the user, front-end interface, back-end services, database, and other supporting components.

For this task, three critical use cases were selected because they represent core functionality in the platform:

1. User Login
2. Add Subscription
3. Send Renewal Reminder

---

## Purpose of the Sequence Diagrams

The purpose of creating high-level sequence diagrams is to:

- Show how users interact with the system.
- Explain how the front-end communicates with the back-end.
- Clarify how the database is used to store and retrieve information.
- Represent the flow of data between system components.
- Support the technical design before implementation.

These diagrams provide a clear view of the main interactions required for the MVP and help the development team understand how each use case should work.

---

## Key Use Cases

### 1. Login Sequence Diagram

The login process is one of the most important use cases in the platform because users need secure access to their accounts before managing their subscriptions.

This sequence diagram shows how the user enters their login credentials, how the front-end sends the request to the back-end, how the authentication service validates the credentials, and how the database confirms whether the user exists.

<img width="1122" height="1402" alt="Login_Sequence Diagram" src="https://github.com/user-attachments/assets/25f47ba9-41b2-407c-a1ad-12aa71486ab4" />

#### Description

In this sequence:

1. The user enters their email and password.
2. The front-end sends the login request to the back-end.
3. The back-end validates the credentials through the authentication service.
4. The authentication service checks the user information in the database.
5. If the credentials are valid, the system returns a successful login response.
6. The user is redirected to the dashboard.

This diagram helps ensure that the authentication flow is clear, secure, and aligned with the platform’s user access requirements.

---

### 2. Add Subscription Sequence Diagram

Adding a subscription is a core function of the Subscriptions Organiser Platform. This use case allows users to store important subscription details such as subscription name, price, billing cycle, renewal date, category, and reminder preferences.

<img width="1086" height="1448" alt="Add Subscription_Sequence Diagram" src="https://github.com/user-attachments/assets/76b444aa-d36e-4cb5-8625-dc7e04566314" />

#### Description

In this sequence:

1. The user opens the Add Subscription page.
2. The user enters the required subscription details.
3. The front-end validates the form input.
4. The front-end sends the subscription data to the back-end.
5. The back-end processes the request and prepares the subscription record.
6. The database stores the new subscription.
7. The back-end returns a success response.
8. The front-end updates the user interface and confirms that the subscription has been added.

This diagram shows how a new record is saved in the system and how the front-end, back-end, and database work together to complete the process.

---

### 3. Send Reminder Sequence Diagram

The reminder feature is important because it helps users avoid missing renewal dates for their subscriptions. This use case shows how the system checks upcoming renewals and sends reminders to users.

<img width="1086" height="1448" alt="Send Reminder_Sequence Diagram" src="https://github.com/user-attachments/assets/48b4af45-c988-46e7-ad0d-f6e70f4014d9" />


#### Description

In this sequence:

1. The reminder scheduler runs automatically at a scheduled time.
2. The scheduler requests upcoming renewal data from the back-end.
3. The back-end queries the database for subscriptions with upcoming renewal dates.
4. The database returns the matching subscription records.
5. The back-end prepares reminder messages.
6. The notification service sends the reminder to the user.
7. The system confirms that the reminder has been sent.

This diagram explains how the platform supports proactive subscription management by notifying users before payment deadlines.

---

## System Components Involved

The sequence diagrams include the main components of the Subscriptions Organiser Platform:

| Component | Role |
|---|---|
| User | Interacts with the platform through the interface. |
| Front-end | Displays screens, collects user input, and sends requests to the back-end. |
| Back-end | Handles business logic, validates requests, and communicates with the database. |
| Authentication Service | Verifies user credentials during login. |
| Database | Stores user accounts, subscription records, and renewal data. |
| Reminder Scheduler | Automatically checks for upcoming subscription renewals. |
| Notification Service | Sends reminder notifications to users. |

---

## Deliverables

The deliverables for this task include the following sequence diagrams:

1. Login Sequence Diagram
2. Add Subscription Sequence Diagram
3. Send Reminder Sequence Diagram

These diagrams represent key interactions between the main system components and support the technical documentation of the MVP.

---

## Conclusion

Task 3 provides a high-level view of how the main components of the Subscriptions Organiser Platform interact during important system operations. The selected use cases cover authentication, subscription creation, and renewal reminders, which are essential features of the MVP.

The sequence diagrams help the development team understand the expected flow of communication between the user interface, back-end services, database, and notification-related components. This improves clarity before implementation and supports better planning for the next development stages.
