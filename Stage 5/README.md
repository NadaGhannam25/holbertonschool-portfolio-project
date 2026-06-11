# Stage 5: Final Report

**Results Summary · Lessons Learned · Team Retrospective**

### Team Members

| Team Member       | Role                                |
| ----------------- | ----------------------------------- |
| Sondos Al-Rubaish | Project Manager / Backend Developer |
| Shaden Al-Alwani  | Backend Developer                   |
| Nada Al-Mutairi   | Frontend Developer                  |
| Rahaf Al-Harthi   | Frontend Developer                  |
| Rinad Al-Zuaybir  | Frontend Developer                  |

---

# 1. Results Summary

## 1.1 Project Overview

Dierha is an Arabic web platform that helps users manage their digital subscriptions from a single dashboard, without linking a bank account.

The platform enables users to:

* Add subscriptions
* Categorize subscriptions
* Track subscriptions
* Receive automated email reminders before renewal dates
* Analyze monthly and yearly spending patterns

---

## 1.2 MVP Feature Completion

| Feature                                                      | Planned | Delivered | Status   |
| ------------------------------------------------------------ | ------- | --------- | -------- |
| User Registration & Login                                    | Yes     | Yes       | Complete |
| Dashboard Overview                                           | Yes     | Yes       | Complete |
| Add / Edit / Delete Subscriptions                            | Yes     | Yes       | Complete |
| Category Tagging (Work / Entertainment / Education / Health / other) | Yes     | Yes       | Complete |
| Spending Analysis & Charts                                   | Yes     | Yes       | Complete |
| Renewal Date Tracking                                        | Yes     | Yes       | Complete |
| Automated Email Reminders (Resend API)                       | Yes     | Yes       | Complete |
| Cancellation Redirect Button                                 | Yes     | Yes       | Complete |
| PDF Report Export                                            | Yes     | Yes       | Complete |

---

## 1.3 SMART Objectives - Evaluation

| Objective             | Target                                                                                                 | Result                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| User Management       | 80% of users can register and log in within 1 minutes                                                  | Auth flow is smooth and straightforward; registration and login tested successfully during development               |
| Subscription Tracking | Full CRUD functionality available by end of Stage 4                                                    | Create, Read, Update, and Delete are all fully functional with category support                                      |
| Reminders & Insights  | Automated email reminders 1,3 ,and 7 days before renewal; monthly,yearly spending summary on dashboard | Reminder emails implemented via Resend API with Riyadh timezone correction; monthly analytics displayed on dashboard |

---

## 1.4 Technical Stack Delivered

| Layer      | Technology                | Purpose                                                           |
| ---------- | ------------------------- | ----------------------------------------------------------------- |
| Frontend   | React + Vite + TypeScript | Responsive Arabic-first UI with reusable components               |
| Frontend   | Recharts                  | Spending charts and category breakdowns on dashboard              |
| Backend    | NestJS + TypeScript       | Scalable REST API with modular service architecture               |
| Database   | PostgreSQL via Supabase   | Relational storage for users, subscriptions, categories           |
| ORM        | Drizzle ORM               | Type-safe schema definition and database queries                  |
| Auth       | JWT + bcrypt              | Stateless token-based authentication with secure password hashing |
| Email      | Resend API                | Transactional renewal reminder emails                             |
| Scheduler  | @nestjs/schedule (cron)   | Automated background jobs for renewal checks                      |
| PDF Export | Puppeteer                 | Server-side report generation                                     |

---

# 2. Lessons Learned

## 2.1 What Went Well

### Solid Technical Foundation from Stage 3

The technical documentation produced in Stage 3: including architecture diagrams, ER diagrams, sequence diagrams, and API specifications, proved extremely valuable during implementation. It reduced ambiguity and enabled confident decision making throughout development.

### Clean Backend Architecture with NestJS

Choosing NestJS over a plain Express setup provided a clear modular structure. Separating concerns into modules such as:

* Authentication
* Subscriptions
* Reminders
* Analytics

made parallel development easier and improved maintainability.

### Effective Use of Supabase for Database Hosting

Using Supabase as a managed PostgreSQL solution reduced infrastructure overhead and allowed the team to focus on schema design and query implementation.

Drizzle ORM added strong type safety and helped identify schema mismatches during development.

### Frontend-Backend Integration

The React frontend and NestJS backend integrated successfully once:

* CORS configuration was completed
* API service layers were centralized
* Authentication tokens were managed consistently

Dedicated service files improved code organization and maintainability.

### Team Communication

Discord was used consistently for:

* Daily updates
* Reporting blockers
* Technical discussions
* Quick decision making

Weekly check-ins helped keep the team aligned.

---

## 2.2 Challenges and How They Were Addressed

### Challenge 1: Timezone Bug in Reminder Cron Job

The reminder system initially relied on UTC time, causing reminders to trigger incorrectly for Riyadh users.

#### Solution

All date comparisons were converted to the Asia/Riyadh timezone before processing reminders.

#### Lesson Learned

Always plan timezone handling from the beginning when building scheduling systems.

---

### Challenge 2: Task Distribution and Parallel Development

Some tasks were not clearly assigned, leading to:

* Duplicate work
* Merge conflicts
* Short development delays

#### Solution

Better ownership and coordination practices were introduced.Use management tools such as GitHub Project make different.

#### Lesson Learned

Every task should have a clearly assigned owner.

---

### Challenge 3: Frontend RTL Behavior in JSX

The Arabic-first design required RTL support, but JSX element ordering created unexpected visual layouts.

#### Solution

The team standardized RTL practices and adjusted component ordering.

#### Lesson Learned

RTL behavior should be tested from the first component and documented for the entire team.

---

### Challenge 4: Analytics Query Correctness

Initial analytics calculations included inactive and expired subscriptions, resulting in inaccurate spending totals.

#### Solution

Queries were separated into:

* Active subscriptions for current spending
* Historical subscriptions for trend analysis

#### Lesson Learned

Analytics requirements must define filtering logic and reporting scope precisely.

---

## 2.3 Recommendations for Future Projects

* Define task ownership explicitly at the beginning of every sprint.
* Use GitHub Projects or Trello for task tracking.
* Test all third-party integrations during the first development week.
* Adopt a consistent timezone strategy across the application.
* Reserve a dedicated testing phase before final delivery.
* Document RTL standards early for Arabic-first projects.
* Add end-to-end testing using Playwright or Cypress.
* Automate regression testing for critical user workflows.

---

# 3. Team Retrospective

The team conducted a retrospective session at the end of Stage 4 to evaluate the project experience and identify areas for future improvement.

---

## 3.1 What Worked Well as a Team

* Discord served as an effective communication platform.
* Pair programming accelerated learning and improved code quality.
* Stage 3 architectural decisions remained valid throughout development.
* Clear API contracts enabled parallel frontend and backend work.
* The team maintained a positive and collaborative working environment.

---

## 3.2 What We Would Do Differently

* Allocate additional time for user testing and feedback collection to further refine the user experience and validate feature priorities.
* Allocate more time to refining UI/UX details and accessibility considerations.
* Explore advanced analytics and personalized insights earlier in the development process to provide greater value to users.


Database schema design using Drizzle ORM, Supabase configuration, subscription CRUD functionality, category management 
---

## 3.3 Individual Contributions

| Member            | Primary Contributions                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sondos Al-Rubaish | Project coordination, Database schema design using Drizzle ORM, Supabase configuration, subscription CRUD functionality, category management                       |
| Shaden Al-Alwani  | authentication module, subscription API, reminder cron job, analytics endpoints, timezone bug fix, email integration fix , Postman testing                         |
| Nada Al-Mutairi   | dierha logo, home screens, subscription screens, Dashboard layout , date/ search filters, landing page                                                             |
| Rahaf Al-Harthi   | Dashboard layout, subscription list UI, subscription cards, spending charts, category filters                                                                      |
| Rinad Al-Zuaybir  | Authentication screens, add/edit subscription modals , testing                                                                                                     |

---

## 3.4 Overall Team Assessment

The team successfully delivered a functional Arabic subscription management MVP within the planned five-stage project timeline.

Despite challenges involving:

* Timezone handling
* Email integration
* Task distribution

the team demonstrated strong problem-solving skills and effective communication throughout development.

The project provided valuable experience in:

* Full-stack software development
* Team collaboration
* Technical problem solving
* Professional software delivery

All five team members contributed significantly to the final product and developed both technical and collaborative skills throughout the project lifecycle.

---

