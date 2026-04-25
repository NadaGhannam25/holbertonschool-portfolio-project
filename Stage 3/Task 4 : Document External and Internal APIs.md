# Document External and Internal APIs

This section documents the external APIs and libraries integrated into the Subscriptions Organiser Platform, and defines the platform's own internal REST API endpoints with full input and output specifications.

---

## 4.1 External APIs

| API / Library | Provider | Method | URL / Usage | Purpose | Reason for Selection |
|---|---|---|---|---|---|
| Resend Email API | Resend | POST | api.resend.com/emails | Send automated renewal reminder emails 3 days before each subscription renews. | Reliable transactional delivery, free tier 100 emails/day, simple REST API. Directly enables the 3-day reminder SMART objective. |
| JWT (jsonwebtoken) | npm / Auth0 | Library | jwt.sign() / jwt.verify() | Stateless user session auth and secure API route protection. | Eliminates server-side sessions. Widely adopted. Mitigates Auth Security risk (Project Charter Risk #1). |
| bcrypt (bcryptjs) | npm library | Library | bcrypt.hash() / bcrypt.compare() | Secure password hashing before storing credentials in PostgreSQL. | Gold-standard adaptive hashing. Protects against database breaches. Recommended in Project Charter risk mitigation. |
| node-cron | npm library | Library | cron.schedule('0 8 * * *') | Schedule daily jobs to check upcoming renewals and trigger email sending. | Runs inside Node.js process, no extra infrastructure. Timezone-aware. Mitigates Reminder Reliability risk (Risk #2). |
| jsPDF | npm library | Library | new jsPDF() client-side | Generate monthly spending reports as downloadable PDF files from the dashboard. | Lightweight client-side PDF generation. No external API calls required. |

---

## 4.2 Internal API Endpoints

All endpoints use JSON for data exchange. Protected endpoints require a valid JWT in the Authorization header as Bearer token.

### Authentication Endpoints

| Method | URL Path | Description | Input | Output |
|---|---|---|---|---|
| POST | /api/auth/register | Register new user | name, email, password | message, token, userId |
| POST | /api/auth/login | Authenticate user | email, password | token, userId, name |
| POST | /api/auth/logout | End session | Bearer token header | message |
| GET | /api/auth/profile | Get user profile | Bearer token header | userId, name, email, createdAt |

### Subscription Endpoints

| Method | URL Path | Description | Input | Output |
|---|---|---|---|---|
| GET | /api/subscriptions | List all subscriptions | Bearer token header | subscriptions array with id, name, category, amount, renewalDate, status |
| POST | /api/subscriptions | Add subscription | name, categoryId, amount, currency, billingCycle, renewalDate | message, subscription object |
| GET | /api/subscriptions/:id | Get one subscription | URL param id + Bearer token | id, name, category, amount, renewalDate, notes, status |
| PUT | /api/subscriptions/:id | Update subscription | URL param id + JSON body fields | message, updated subscription object |
| DELETE | /api/subscriptions/:id | Delete subscription | URL param id + Bearer token | message: Subscription deleted |

### Dashboard and Analytics Endpoints

| Method | URL Path | Description | Input | Output |
|---|---|---|---|---|
| GET | /api/dashboard/summary | Monthly spend summary | Bearer token header | totalMonthlySpend, activeCount, upcomingRenewals array |
| GET | /api/dashboard/categories | Spend by category | Bearer token header | categories array with name, totalSpend, count |

### Reminders Endpoint

| Method | URL Path | Description | Input | Output |
|---|---|---|---|---|
| GET | /api/reminders/upcoming | Upcoming renewals, includes cancel URL in the reminder email | Query ?days=3 + Bearer token | reminders array with subscriptionId, name, renewalDate, amount, cancelUrl |

### Cancellation Endpoint

| Method | URL Path | Description | Input | Output |
|---|---|---|---|---|
| PATCH | /api/subscriptions/:id/cancel | Cancel a subscription via email link. No login required, token validated via cancelToken query param | URL param id + Query ?cancelToken=token | message: Subscription cancelled successfully, subscriptionId, status: cancelled |

---

## 4.3 Sample Request and Response

### POST /api/subscriptions

Request Body:

```json
{
  "name": "Netflix",
  "categoryId": 1,
  "amount": 49.99,
  "currency": "SAR",
  "billingCycle": "monthly",
  "renewalDate": "2025-05-15"
}
```

Success Response 201:

```json
{
  "message": "Subscription added successfully",
  "subscription": {
    "id": 42,
    "name": "Netflix",
    "category": "Entertainment",
    "amount": 49.99,
    "renewalDate": "2025-05-15",
    "status": "active"
  }
}
```

Error Response 400:

```json
{
  "error": "Validation failed",
  "details": "renewalDate is required and must be a valid date."
}
```
