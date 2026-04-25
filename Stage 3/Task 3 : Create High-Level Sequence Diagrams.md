# Task 3 : Create High-Level Sequence Diagrams.md

## 1. Login Sequence Diagram

<img width="1148" height="1370" alt="Image" src="https://github.com/user-attachments/assets/8fd1ecec-0870-4da2-9ce1-36fa7fd0e6fe" />

This sequence diagram illustrates the login process in the system. The process begins when the user submits their email and password through a login request to the API. The API then calls the Business Logic layer to validate the user data, while the Business Logic queries the database using the provided email address.

If the credentials are valid, the password is verified, a JWT token is generated, and returned to the API. The user then receives a **200 OK** response along with the token.

If the credentials are invalid, the system returns a **401 Unauthorized** response.

The diagram clearly represents both the successful authentication flow and the failure scenario.

---

## 2. Add Subscription Sequence Diagram

<img width="1178" height="1335" alt="Image" src="https://github.com/user-attachments/assets/0fcacdb3-9975-4776-8774-1c90dd253db4" />

This sequence diagram shows how a user adds a new subscription in the platform. The process starts when the user enters subscription details through the web interface, which sends the data to the API via a **POST /subscriptions** request.

The API validates the input and forwards the request to the Business Logic layer to create the subscription. The Business Logic stores the subscription in the database and saves any associated reminder information.

Upon successful creation, the system returns a **201 Created** response and displays a success message to the user.

The diagram also includes failure scenarios:

- **400 Bad Request** — if input validation fails  
- **500 Internal Server Error** — if a database error occurs

---

## 3. Send Reminder Sequence Diagram

<img width="1178" height="1335" alt="Image" src="https://github.com/user-attachments/assets/6145fc87-dd07-48be-8fd9-030b8eb699d3" />

This sequence diagram explains the automated subscription reminder process. The process begins when **node-cron** triggers the scheduled reminder job.

The Business Logic layer retrieves pending reminders from the database, then fetches the related user and subscription details for each reminder. Reminder emails are sent through the email service.

If delivery succeeds, the reminder status in the database is updated to **sent**, and the task completes successfully.

If sending fails, the system records the error, marks the reminder as **failed**, and ends the task with an error state.

The diagram clearly represents both the success and failure paths of the automated reminder process.
