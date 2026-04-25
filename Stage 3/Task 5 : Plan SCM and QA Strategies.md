# Plan SCM and QA Strategies

This section defines the Source Code Management (SCM) approach and Quality Assurance (QA) strategy for the Subscriptions Organiser Platform.

---

## 5.1 Source Code Management (SCM) Strategy

The team uses Git for version control with the repository hosted on GitHub. GitHub Actions provides continuous integration across all four team members.

### Branching Strategy

| Branch | Purpose | Rules |
|---|---|---|
| main | Production-ready code only | Protected. No direct commits. Merged from development only after full QA sign-off. |
| development | Integration branch | All feature branches merge here via PR. Requires peer review and passing automated tests. |
| staging | Pre-production testing environment | Auto-deployed when code is merged into development. Used for UAT and integration testing before any release to production. |
| feature/name | Individual feature development | Created from development. Named descriptively: feature/user-auth, feature/reminder-system. |
| bugfix/name | Bug isolation and fixing | Created from development. Merged back after fix is verified. |

### Commit and Code Review Standards

- Commit messages follow the format: type: short description
- Examples: feat: add reminder cron job / fix: correct JWT expiry / docs: update API table
- Commits are small and focused, each represents a single logical change
- Every pull request requires review by at least one other team member before merging
- PR descriptions must include: what changed, why it changed, and how it was tested
- No developer may approve and merge their own pull request
- All review feedback must be addressed before the PR is approved

---

## 5.2 QA Strategy — Testing Types and Tools

| Test Type | Tool | What is Tested | Details |
|---|---|---|---|
| Unit Testing | Jest | Individual functions: password hashing, token generation, date calculations. | Min 70% code coverage. Runs automatically on every push via GitHub Actions. |
| Integration Testing | Jest + Supertest | Full API request-response cycle including database interactions. | Runs against a dedicated test database. Validates all CRUD and auth flows. |
| API Testing | Postman | All REST endpoints: status codes, validation, error responses, JWT protection. | Shared Postman Collection in the repository. Each developer tests before opening a PR. |
| Manual / UAT | Browser + Checklist | Critical flows: registration, login, add/edit/delete subscription, dashboard, reminders. | On staging before any merge to main. Validates SMART objective: 80% register under 2 minutes. |
| Regression Testing | Jest full suite | Previously working features, ensures new changes do not break existing functionality. | Full suite re-run on every PR to development. Any failure blocks the merge. |

---

## 5.3 Deployment Pipeline

| Stage | Trigger | Steps | Purpose |
|---|---|---|---|
| 1. Code Push | Push to any feature or bugfix branch | Run unit tests via GitHub Actions. Report pass/fail on commit. | Fast feedback. Catch issues before code review. |
| 2. Pull Request | PR opened targeting development | Full test suite runs. Peer review required. All checks must pass before merge. | Ensures quality. Prevents regressions in the integration branch. |
| 3. Staging Deploy | Merge into development | Auto-deploy to staging. Manual UAT and integration testing by the team. | Production-like environment for thorough testing before release. |
| 4. Production Deploy | PR from development to main approved | Auto-deploy to production. Final smoke test confirms critical flows work live. | Releases stable, tested features to users with minimal risk. |

---

## 5.4 Environments

- Development (local): Each developer runs the application locally for active development and initial testing.
- Staging: A shared environment that mirrors production. Used for UAT and integration testing before any release.
- Production: The live environment accessible to end users. Only receives code merged into main via an approved pull request with all tests passing.
