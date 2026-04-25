# Task 2 : Components, Classes, and Database Design.md


---

## 1. Class Diagram

The following UML class diagram illustrates the five core backend classes, their attributes, methods, and relationships.

<img width="642" height="646" alt="class-diagram-f drawio" src="https://github.com/user-attachments/assets/693d4346-742a-44b0-b39c-b40bd592639f" />

---

## 2. Backend Class Definitions

Each class encapsulates the data and behaviour for one domain entity.

---

### 2.1 User

| Attribute / Method | Description |
|-------------------|------------|
| id : int | Auto-incremented primary key |
| name : string | Full name of the user |
| email : string | Unique email used for login and reminders |
| password_hash : string | Password stored as a bcrypt hash |
| created_at : datetime | Timestamp when the account was created |
| register(name, email, password) | Creates a new user account with hashed password |
| login(email, password) : JWT | Validates credentials and returns a signed JWT token |
| getProfile(id) : User | Returns the full profile of the user |

---

### 2.2 Subscription

| Attribute / Method | Description |
|-------------------|------------|
| id : int | Auto-incremented primary key |
| user_id : int | Foreign key linking to the owning User |
| name : string | Name of the subscribed service (e.g., Netflix) |
| price : decimal | Current monthly or yearly price |
| category_id : int | Foreign key linking to a Category |
| renewal_date : date | Next billing date |
| billing_cycle : string | Frequency: monthly, yearly, etc. |
| notes : string | Optional user notes (nullable) |
| created_at : datetime | Timestamp when the record was created |
| status : string |  |
| cancel_url : string |  |
| create(data) : Subscription | Adds a new subscription and records initial price in PriceHistory |
| cancel(id) : void | Updates subscription status to cancelled and redirects/uses cancel_url |
| getAll(user_id) : List | Returns all subscriptions belonging to a user |
| update(id, data) : Subscription | Updates subscription fields and logs price change if price differs |
| delete(id) : void | Removes a subscription record from the database |

---

### 2.3 Category

| Attribute / Method | Description |
|-------------------|------------|
| id : int | Auto-incremented primary key |
| name : string | Category label (e.g., Entertainment, Productivity) |
| getAll() : List<Category> | Returns the full list of available categories |

---

### 2.4 PriceHistory

| Attribute / Method | Description |
|-------------------|------------|
| id : int | Auto-incremented primary key |
| subscription_id : int | Foreign key linking to the related Subscription |
| old_price : decimal | Price before the change (null for the initial entry) |
| new_price : decimal | Price at the time of this record |
| effective_from : date | The date from which this price applies |
| changed_at : datetime | Timestamp when this record was created |
| record(sub_id, old, new, date) | Logs a price entry |
| getHistory(sub_id) : List | Returns all price records in chronological order |

---

### 2.5 Reminder

| Attribute / Method | Description |
|-------------------|------------|
| id : int | Auto-incremented primary key |
| subscription_id : int | Foreign key linking to the related Subscription |
| remind_at : datetime | Scheduled date and time to send the reminder email |
| sent : boolean | Flag indicating whether the reminder has been sent |
| schedule(sub_id, remind_at) | Creates a new scheduled reminder |
| markSent(id) : void | Marks a reminder as sent |
| getPending() : List<Reminder> | Returns all unsent reminders |

---

## 3. Entity Relationship Diagram (ERD)

The database consists of five related tables.

<img width="722" height="621" alt="er-diagram-final drawio" src="https://github.com/user-attachments/assets/25e13ce0-b4e1-442d-864c-0f23816dca2d" />

---

## 4. Database Schema

### 4.1 users

| Column | Type | Constraint | Description |
|--------|------|-----------|------------|
| id | INT | PK, AUTO | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Full name of the user |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email for login and reminders |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt-hashed password |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

---

### 4.2 categories

| Column | Type | Constraint | Description |
|--------|------|-----------|------------|
| id | INT | PK, AUTO | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Category label |

---

### 4.3 subscriptions

| Column | Type | Constraint | Description |
|--------|------|-----------|------------|
| id | INT | PK, AUTO | Unique identifier |
| user_id | INT | FK → users.id | Owner of this subscription |
| name | VARCHAR(150) | NOT NULL | Service name |
| price | DECIMAL(10,2) | NOT NULL | Current price |
| category_id | INT | FK → categories.id | Linked category |
| renewal_date | DATE | NOT NULL | Next billing date |
| billing_cycle | VARCHAR(20) | NOT NULL | monthly, yearly, etc. |
| notes | TEXT | NULLABLE | Optional user notes |
| status | VARCHAR(20) | DEFAULT 'active' | active or cancelled |
| cancel_url | VARCHAR(255) | NULLABLE | Link to cancellation page |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

---

### 4.4 price_history

| Column | Type | Constraint | Description |
|--------|------|-----------|------------|
| id | INT | PK, AUTO | Unique identifier |
| subscription_id | INT | FK → subscriptions.id | Linked subscription |
| old_price | DECIMAL(10,2) | NULLABLE | Previous price |
| new_price | DECIMAL(10,2) | NOT NULL | New price |
| effective_from | DATE | NOT NULL | Effective date |
| changed_at | TIMESTAMP | DEFAULT NOW() | Timestamp |

---

### 4.5 reminders

| Column | Type | Constraint | Description |
|--------|------|-----------|------------|
| id | INT | PK, AUTO | Unique identifier |
| subscription_id | INT | FK → subscriptions.id | Linked subscription |
| remind_at | TIMESTAMP | NOT NULL | Reminder time |
| sent | BOOLEAN | DEFAULT FALSE | Status |

---

## 5. Frontend Component Structure

| Component | Location / Page | Responsibility |
|----------|----------------|----------------|
| Navbar | Global | Top navigation bar |
| LoginForm | /login | Handles login |
| RegisterForm | /register | Handles registration |
| Dashboard | / | Overview |
| SubscriptionCard | /subscriptions | Displays subscription info |
| AddSubscriptionForm | /subscriptions/new | Add new subscription |
| EditSubscriptionForm | /subscriptions/:id/edit | Edit subscription |
| MonthlyChart | /reports | Monthly spending chart |
| CategoryPieChart | /reports | Category breakdown |
| BillingCalendar | /calendar | Renewal dates |
| PriceHistoryView | /subscriptions/:id | Price history |
| ReminderAlert | Dashboard / Global | Renewal alert |
| PDFExportButton | /reports | Export PDF |

---
