╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   SAAS GENERATOR MANAGEMENT SYSTEM — COMPLETE AI AGENT BUILD PROMPT           ║
║   v1.0 | Production-Ready | Copy Everything Inside This Box                   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
SECTION 0 — OVERALL SYSTEM DESCRIPTION (PLAIN ENGLISH)
═══════════════════════════════════════════════════════════════════════════════

WHAT WE ARE BUILDING:
You are building a complete mobile application for generator rental and
subscription businesses. Think of it like a "Salesforce for generator
companies" but mobile-first and works perfectly offline.

THE REAL WORLD SCENARIO:
Multiple generator rental companies (tenants) use this single app. Each
company has its own customers, its own pricing rules, and its own invoices.
They NEVER see each other's data.

The people using this app are field operators who:
- Visit customer locations in areas with poor or no internet
- Need to record payments immediately upon collection
- Need to see customer histories while standing at the customer's door
- Sync everything when they get back to the office or find WiFi

KEY BUSINESS ENTITIES:
- Tenant: A generator rental company using the system
- Customer: A person/business renting a generator
- Subscription: The generator rental plan for a customer
- Invoice: A bill sent to a customer
- Payment: Money received from a customer

CRITICAL RULES THE AI MUST FOLLOW:
1. No business logic inside UI components — ever
2. Every API request must filter by tenantId
3. The mobile app must work 100% offline first
4. Sync is ONLY manual — there is no automatic background sync
5. When conflicts happen, the most recent update wins

═══════════════════════════════════════════════════════════════════════════════
GLOBAL SYSTEM INSTRUCTIONS (FOR THE AI AGENT)
═══════════════════════════════════════════════════════════════════════════════

YOUR ROLE:
You are acting as a senior software architect and principal engineer with
15+ years of experience building SaaS platforms. You write production-grade
code. You think about edge cases, security, performance, and maintainability
before writing a single line.

═══════════════════════════════════════════════════════════════════════════════
TECHNOLOGY STACK (DO NOT DEVIATE FROM THIS)
═══════════════════════════════════════════════════════════════════════════════

MOBILE APPLICATION:
- Framework: React Native (latest stable version)
- Platform Wrapper: Expo (managed workflow)
- UI Component Library: Gluestack UI (installed via expo, not bare React Native)
- Local Database: SQLite (for offline-first storage)
- Language: TypeScript (strict mode enabled, no exceptions)

BACKEND APPLICATION:
- Framework: NestJS (latest stable version)
- Database: PostgreSQL (hosted on Neon Postgres — serverless Postgres)
- ORM: Prisma (latest stable version)
- Language: TypeScript (strict mode enabled, no exceptions)

MONOREPO STRUCTURE:
- Package Manager: pnpm (required, not npm, not yarn)
- Build System: Turborepo (for orchestrating builds across packages)
- Folder Structure:
  /apps/mobile    — The React Native + Expo application
  /apps/api       — The NestJS backend application
  /packages/shared — Shared TypeScript types, DTOs, and utility functions

═══════════════════════════════════════════════════════════════════════════════
NON-NEGOTIABLE ARCHITECTURE RULES
═══════════════════════════════════════════════════════════════════════════════

1. MULTI-TENANT ISOLATION (MOST IMPORTANT RULE):
   Every single database table MUST have a tenantId column. Every single
   database query MUST include a WHERE tenantId = ? clause. There is
   absolutely no exception to this rule. If tenant isolation breaks, the
   entire system is compromised.

2. CLEAN ARCHITECTURE LAYERS:
   The backend must separate code into these four layers:
   - domain: Pure business entities and rules (no framework code here)
   - application: Use cases that orchestrate domain logic
   - infrastructure: Database, external APIs, file system access
   - presentation: HTTP controllers, DTOs, request/response handling

   The mobile must separate code into these four layers:
   - domain: Pure business entities and rules
   - data: SQLite repositories, API clients, sync engine
   - ui: React Native components (display only, no business logic)
   - state: State management that connects data to UI

3. REPOSITORY PATTERN:
   Every data access must go through a repository interface. The rest of
   the code never touches Prisma or SQLite directly. This allows switching
   databases in the future without changing business logic.

4. DTO VALIDATION EVERYWHERE:
   Every API endpoint must validate incoming data using class-validator
   decorators. No raw request bodies are ever trusted.

5. NO GRAPHQL:
   This system uses REST APIs only. No GraphQL endpoints, no Apollo, nothing.

═══════════════════════════════════════════════════════════════════════════════
OFFLINE-FIRST BEHAVIOR (CRITICAL FOR MOBILE)
═══════════════════════════════════════════════════════════════════════════════

HOW OFFLINE MODE MUST WORK:
1. When the user performs ANY action (create customer, record payment, etc.)
   the data is written to the local SQLite database FIRST.
2. After writing to SQLite, the mutation is placed into a sync_queue table.
3. The UI updates immediately from SQLite — the user never waits.
4. There are NO direct API calls from any UI component or screen.
5. The only place that makes API calls is the Sync Engine.

WHEN THE USER PRESSES "SYNC NOW":
1. The Sync Engine reads all pending items from sync_queue (oldest first).
2. It sends them to the backend as a batch POST to /sync/batch.
3. Successful items are removed from sync_queue.
4. Failed items remain in sync_queue and are retried on next sync.
5. There is NO automatic sync. No background timers. No network listeners.
   Only a manual button press triggers synchronization.

CONFLICT RESOLUTION STRATEGY:
When the backend receives a record that was modified both locally and on
the server, the version with the most recent updatedAt timestamp wins.
The backend overwrites the older version completely. No merge, no questions
asked. This is called "Last Updated Wins" (LUW).

═══════════════════════════════════════════════════════════════════════════════
MESSAGING SYSTEM
═══════════════════════════════════════════════════════════════════════════════

We only send messages through WhatsApp. No SMS, no email, no push
notifications. The backend must integrate with a WhatsApp Business API
provider (like Twilio, MessageBird, or WATI). The specific provider can
be chosen later, but the MessagingService must be designed with an
interface so the provider can be swapped easily.

═══════════════════════════════════════════════════════════════════════════════
                        PHASE-BY-PHASE BUILDING INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════════

================================================================================
PHASE 1 — PROJECT FOUNDATION
================================================================================

PLAIN ENGLISH DESCRIPTION:
This is like pouring the concrete foundation of a house. We are creating
the folder structure, installing all dependencies, and configuring the
development tools that everything else will be built upon. Nothing
functional yet — just making sure the project compiles and runs.

WHAT THE AI MUST CREATE:
1. Initialize a monorepo using pnpm workspaces and Turborepo.
2. Create three directories: /apps/mobile, /apps/api, /packages/shared.
3. Configure TypeScript with strict mode across all packages.
4. Set up ESLint and Prettier with consistent configs shared across packages.
5. Configure path aliases so imports look clean (e.g., @shared/types,
   @mobile/components, @api/modules).
6. Mobile: Initialize a React Native project using Expo. Install and
   configure Gluestack UI (the component library, not a bare project).
   Set up the tab navigation structure (even if tabs are empty stubs).
7. Backend: Initialize a NestJS project. Create the folder structure for
   modules but leave them empty: auth, tenants, users.
8. Verify that both apps/api and apps/mobile start without errors.

ACCEPTANCE CRITERIA:
- Running "pnpm dev" from root starts both apps (or provides clear command).
- TypeScript strict mode shows no errors.
- ESLint passes across all files.
- Path aliases resolve correctly.

================================================================================
PHASE 2 — MULTI-TENANT AUTHENTICATION
================================================================================

PLAIN ENGLISH DESCRIPTION:
Now we build the login system. Each generator company using our system is
a "tenant." When a new company signs up, the registration creates both a
tenant record (representing the company) and an admin user (the person
who will manage that company's account). The login returns a JWT token
that contains the user's ID, their tenant ID, and their role. Every future
API call will attach this token, so the backend always knows which tenant
the user belongs to and can filter their data accordingly.

WHAT THE AI MUST CREATE:

DATABASE SCHEMA (Prisma):
- tenants table: id, companyName, createdAt, updatedAt
- users table: id, tenantId (foreign key), email, passwordHash, role (enum:
  SUPER_ADMIN, TENANT_ADMIN), createdAt, updatedAt

BACKEND:
- AuthModule, UsersModule, TenantsModule (with clean architecture layers)
- POST /auth/register — Creates a tenant AND an admin user in one transaction.
  If either fails, both roll back.
- POST /auth/login — Validates email/password, returns JWT with payload:
  { userId, tenantId, role }
- AuthGuard middleware that extracts the JWT, verifies it, and attaches
  userId and tenantId to the request object for downstream use.
- Every controller must then use tenantId from the request to filter data.

MOBILE:
- Login screen with email and password fields (using Gluestack UI components).
- On successful login: store the JWT token in secure storage (expo-secure-store).
- On app startup: check if a valid token exists, if yes skip login screen.
- Add a logout function that clears the stored token.

ACCEPTANCE CRITERIA:
- Registering creates one tenant + one admin user linked together.
- Logging in returns a JWT with userId, tenantId, and role.
- Unauthenticated API calls receive 401 error.
- Users from tenant A cannot see data from tenant B.
- Mobile app stores token and uses it for subsequent requests.

================================================================================
PHASE 3 — CUSTOMER MANAGEMENT WITH GEOLOCATION
================================================================================

PLAIN ENGLISH DESCRIPTION:
Now we build the core entity of the system: Customers. Each tenant (generator
company) manages its own list of customers. The important addition here is
that each customer can have an optional GPS location stored (latitude,
longitude, and accuracy). In the field, operators can tap a "Use My Current
Location" button while creating or editing a customer, which fills in the
GPS coordinates from the phone's GPS. This enables future features like
displaying customers on a map and optimizing driving routes for field visits.

WHAT THE AI MUST CREATE:

DATABASE SCHEMA (Prisma):
- customers table: id, tenantId (foreign key, indexed), name, phone, address,
  latitude (optional float), longitude (optional float), locationAccuracy
  (optional float), status (enum: ACTIVE, INACTIVE, BLOCKED), createdAt,
  updatedAt

BACKEND:
- CustomersModule with full CRUD endpoints:
  - GET /customers — List all customers for the authenticated tenant
  - GET /customers/:id — Get single customer (must belong to tenant)
  - POST /customers — Create customer (auto-sets tenantId from JWT)
  - PATCH /customers/:id — Update customer (verify tenant ownership)
  - DELETE /customers/:id — Soft delete or status change (verify tenant
    ownership)
- All queries must filter by tenantId extracted from the authenticated
  request (never trust client-provided tenantId).
- Validation: phone format, required fields, latitude/longitude range checks.

MOBILE:
- Customer list screen showing all customers (fetched and displayed from
  local SQLite — we seed SQLite from API on first load, then always read
  local).
- Customer detail screen showing all fields.
- Add/Edit customer form using Gluestack UI components.
- A "Use Current Location" button that calls expo-location to get GPS
  coordinates and fills in latitude, longitude, and accuracy fields.
- The form must validate required fields before saving.

SQLITE (LOCAL):
- Mirror the customers table structure in SQLite.
- All customer CRUD operations write to SQLite first, then queue for sync.

SYNC:
- Include all customer fields (including location) in the sync payload.

ACCEPTANCE CRITERIA:
- Each tenant only sees their own customers.
- Customer CRUD works fully offline (create, edit, view without internet).
- GPS button fills location fields from phone's actual location.
- Invalid coordinates are rejected (latitude must be -90 to 90, longitude
  -180 to 180).

================================================================================
PHASE 4 — SUBSCRIPTIONS AND PRICING
================================================================================

PLAIN ENGLISH DESCRIPTION:
This phase defines how customers get billed. In the generator business,
pricing varies between companies. Some charge a flat monthly fee regardless
of usage. Others charge based on the generator's amperage (power capacity).
We need a flexible pricing system where each tenant can define their own
pricing rules, and those rules are used to auto-calculate invoice amounts
in the next phase. This is a configuration-only phase — no end-user
interaction yet, just the data model and calculation engine.

WHAT THE AI MUST CREATE:

DATABASE SCHEMA (Prisma):
- subscriptions table: id, tenantId, customerId (foreign key), planName,
  status (enum: ACTIVE, PAUSED, CANCELLED), startDate, endDate (optional),
  pricingRuleId (foreign key), customRate (optional float — overrides the
  pricing rule if set), createdAt, updatedAt
- pricing_rules table: id, tenantId, name, type (enum: FIXED, AMPERE_BASED),
  config (JSON field — structure depends on type:
    - For FIXED: { "monthlyAmount": 500 }
    - For AMPERE_BASED: { "ratePerAmpere": 10, "baseAmperage": 100 }
  ), createdAt, updatedAt

BACKEND:
- SubscriptionsModule: CRUD APIs for subscription management.
- PricingRulesModule: CRUD APIs for pricing rule management.
- PricingService (in application layer):
  - Method: calculateInvoiceAmount(subscription)
  - Logic: If subscription has customRate, use that.
    Otherwise, look up the pricing rule.
    If FIXED: return config.monthlyAmount.
    If AMPERE_BASED: return config.ratePerAmpere * config.baseAmperage.
  - This service must be pure business logic — no HTTP, no database access.
    It receives data and returns a number.

MOBILE:
- Subscription list screen (read-only for now — display active subscriptions).
- Subscription detail screen showing plan, pricing rule, start/end dates.
- No editing capability in this phase — display only.

ACCEPTANCE CRITERIA:
- Pricing rules can be created with different types (FIXED and AMPERE_BASED).
- PricingService correctly calculates amounts for both types.
- Subscriptions link a customer to a pricing rule.
- Custom rate on a subscription overrides the pricing rule's calculated rate.

================================================================================
PHASE 5 — INVOICING SYSTEM
================================================================================

PLAIN ENGLISH DESCRIPTION:
Now we generate the actual bills. An invoice is a formal document saying
"Customer X owes $Y by Date Z." Invoices are generated based on a customer's
active subscription and the pricing rules defined in Phase 4. The system
must be able to generate invoices automatically (triggered manually or by
a future scheduler), track their status (PENDING, PAID, OVERDUE, CANCELLED),
and display them to users.

WHAT THE AI MUST CREATE:

DATABASE SCHEMA (Prisma):
- invoices table: id, tenantId, customerId (foreign key), subscriptionId
  (foreign key), invoiceNumber (auto-generated, unique per tenant), amount,
  status (enum: PENDING, PAID, OVERDUE, CANCELLED), dueDate, issuedDate,
  paidDate (optional), notes (optional), createdAt, updatedAt

BACKEND:
- InvoicesModule with CRUD endpoints:
  - GET /invoices — List invoices (filtered by tenant, optional status filter)
  - GET /invoices/:id — Get single invoice with customer details
  - POST /invoices/generate — Generate an invoice for a subscription.
    Uses PricingService.calculateInvoiceAmount() from Phase 4.
    Sets status to PENDING, dueDate to 30 days from now.
  - PATCH /invoices/:id — Update invoice (limited fields — notes, dueDate),
    verify tenant ownership.
- Business rule: An invoice cannot be deleted, only cancelled.
- Invoice status automatically changes to OVERDUE if dueDate has passed
  and status is still PENDING (this check runs when fetching invoices).

MOBILE:
- Invoice list screen showing all invoices with color-coded status badges:
  - Green for PAID
  - Yellow for PENDING
  - Red for OVERDUE
  - Grey for CANCELLED
- Invoice detail screen showing customer name, amount, dates, status.
- Filter capability: show all, pending only, overdue only.

ACCEPTANCE CRITERIA:
- Invoice generation pulls the correct price from the subscription's pricing.
- Invoice numbers are sequential and unique per tenant.
- Status automatically shows OVERDUE for past-due unpaid invoices.
- Mobile displays invoices with color-coded statuses.
- All invoice operations work offline.

================================================================================
PHASE 6 — PAYMENTS AND DEBT TRACKING
================================================================================

PLAIN ENGLISH DESCRIPTION:
Now we handle real money coming in. When a customer pays (partially or fully),
the operator records a payment against an invoice. The system must update
the invoice status accordingly: if the total payments equal or exceed the
invoice amount, mark the invoice as PAID. If less, keep it PENDING. We also
need to calculate customer debt — how much a customer currently owes across
all their unpaid and partially paid invoices.

WHAT THE AI MUST CREATE:

DATABASE SCHEMA (Prisma):
- payments table: id, tenantId, invoiceId (foreign key), amount, method
  (enum: CASH, BANK_TRANSFER, MOBILE_MONEY, CHEQUE), referenceNumber
  (optional), paymentDate, notes (optional), createdAt, updatedAt

BACKEND:
- PaymentsModule with endpoints:
  - POST /payments — Record a payment. Logic:
    1. Validate the invoice exists and belongs to the tenant.
    2. Insert payment record.
    3. Recalculate invoice status:
       - Sum all payments for this invoice.
       - If total >= invoice.amount: set status to PAID, set paidDate to now.
       - If total < invoice.amount: keep status PENDING.
  - GET /payments — List payments (with optional invoiceId filter).
  - GET /payments/:id — Get single payment.
- CustomerDebtService:
  - GET /customers/:id/debt — Returns:
      totalInvoiced (sum of all non-cancelled invoices)
      totalPaid (sum of all payments applied to those invoices)
      currentDebt (totalInvoiced - totalPaid)
      overdueAmount (sum of unpaid invoices past due date)

MOBILE:
- Payment entry screen: operator selects an invoice, enters amount paid,
  chooses payment method (cash, bank transfer, etc.), adds optional reference
  number and notes, and saves.
- Payment history screen: shows all payments for a customer or invoice.
- Payment must work offline — payment is saved to SQLite, invoice status
  updates locally immediately.

BUSINESS LOGIC (DOMAIN LAYER — MUST BE IN APPLICATION, NOT IN CONTROLLER):
- Paying more than the invoice amount is allowed (overpayment) — the invoice
  is marked PAID but the overpayment is tracked.
- Payment amount must be greater than zero (validate on both frontend and
  backend).
- Payment date cannot be in the future.

ACCEPTANCE CRITERIA:
- Recording a full payment marks the invoice as PAID.
- Recording a partial payment keeps the invoice PENDING.
- Debt calculation correctly shows total owed vs total paid.
- All payment operations work offline.
- Overpayment is handled gracefully.

================================================================================
PHASE 7 — OFFLINE SQLITE SYSTEM
================================================================================

PLAIN ENGLISH DESCRIPTION:
This is the heart of the offline capability. Up until now, we've been
mentioning "save to SQLite first" — now we formalize the entire local
database layer. Every table that exists on the server must have a mirror
in SQLite. Every write operation in the app must go through a repository
that writes to SQLite and then queues a sync operation. The UI layer never
talks directly to the API. This ensures the app works exactly the same
whether there's internet or not.

WHAT THE AI MUST CREATE:

SQLITE DATABASE STRUCTURE (in the mobile app):
- customers table: mirrors PostgreSQL schema (minus Prisma-specific fields).
  Store UUIDs as TEXT. Store dates as ISO 8601 strings.
- invoices table: same mirroring approach.
- payments table: same mirroring approach.
- sync_queue table:
  - id (auto-increment integer)
  - entityType (text: 'customer', 'invoice', 'payment')
  - entityId (text — the UUID of the record)
  - operation (text: 'CREATE', 'UPDATE', 'DELETE')
  - payload (text — JSON string of the full record data)
  - createdAt (ISO 8601 string)
  - status (text: 'PENDING', 'SYNCING', 'FAILED')
  - retryCount (integer, default 0)
  - lastError (text, nullable)

MOBILE ARCHITECTURE (CRITICAL — MUST FOLLOW EXACTLY):
1. Create a Repository interface for each entity (CustomerRepository,
   InvoiceRepository, PaymentRepository).
2. Create SQLite implementations of these repositories that:
   - Initialize the SQLite database and create tables if they don't exist.
   - Execute INSERT, UPDATE, DELETE on SQLite.
   - After each write, INSERT into sync_queue.
3. Create a SyncRepository that manages the sync_queue table.
4. All screens and UI components call the Repository interface, NOT the
   SQLite implementation directly (use dependency injection).
5. No screen or component ever calls fetch() or axios directly.

ACCEPTANCE CRITERIA:
- All writes go to SQLite first, confirmed by checking local database.
- Sync queue populates correctly after each write operation.
- App works fully when device is in airplane mode.
- All CRUD operations feel instant (reading from local DB).

================================================================================
PHASE 8 — MANUAL SYNC SYSTEM
================================================================================

PLAIN ENGLISH DESCRIPTION:
Now we build the bridge between the local SQLite database and the remote
PostgreSQL database. This is the sync engine. The key design decision here
is that sync is MANUAL ONLY. There is no background sync, no automatic
sync on app open, no listening for network changes. The user must physically
press a "Sync Now" button (located in the Settings screen). When pressed,
the app sends all pending changes to the server in one batch, processes
the response, and updates the local database. If the server already has a
newer version of a record (someone else updated it from another device),
our "Last Updated Wins" rule applies: the newer updatedAt timestamp wins.

WHAT THE AI MUST CREATE:

BACKEND ENDPOINT:
- POST /sync/batch
  Receives:
  {
    "operations": [
      {
        "entityType": "customer",
        "entityId": "uuid-here",
        "operation": "CREATE",
        "payload": { ... full record ... },
        "updatedAt": "2024-01-01T00:00:00Z"
      },
      ... more operations ...
    ]
  }
  Processing logic for EACH operation:
  1. Look up the existing record on the server (by entityId).
  2. If record doesn't exist: INSERT the payload.
  3. If record exists AND payload.updatedAt is NEWER than server.updatedAt:
     UPDATE the server record.
  4. If record exists AND payload.updatedAt is OLDER or EQUAL:
     Return the server's current version (so mobile can update its local).
     This is the "server wins" case when timestamps are equal or server is
     newer.
  5. Return a response with:
     {
       "results": [
         {
           "entityId": "uuid",
           "status": "SUCCESS" | "CONFLICT" | "ERROR",
           "serverVersion": { ... } // only for CONFLICT — the server's data
         }
       ]
     }

MOBILE SYNC ENGINE:
- A SyncService that:
  1. Reads all PENDING items from sync_queue ordered by createdAt ASC.
  2. Builds the batch payload.
  3. Sends POST to /sync/batch (this is the ONLY place HTTP calls happen).
  4. Processes each result:
     - SUCCESS: Remove from sync_queue.
     - CONFLICT: Remove from sync_queue, but upsert the serverVersion into
       local SQLite (accepting the server's version as the truth).
     - ERROR: Keep in sync_queue, increment retryCount, set lastError.
       If retryCount > 5, move to a dead_letter_queue or mark as permanently
       FAILED (so it doesn't block the rest of the queue).

MOBILE UI:
- Settings screen with a "Sync Now" button.
- Button shows current state:
  - Idle: "Sync Now" (enabled)
  - Syncing: "Syncing... X of Y" (disabled, shows progress)
  - Complete: "Last synced: [timestamp]" + green checkmark
  - Error: "Sync failed. X items remaining." + red warning
- A badge or counter showing "X items pending sync" on the Settings tab icon.

ACCEPTANCE CRITERIA:
- Pressing "Sync Now" sends all pending operations to the server.
- Successful operations are removed from the local sync queue.
- When the server has a newer version, the local database is updated with
  the server's data.
- Sync progress is displayed in real-time.
- Failed sync items can be retried on next press.
- Sync only happens when the button is pressed — verify no automatic sync.

================================================================================
PHASE 9 — WHATSAPP MESSAGING
================================================================================

PLAIN ENGLISH DESCRIPTION:
Now we add automated WhatsApp messaging to keep customers informed. When
certain events happen in the system, the backend triggers a WhatsApp message
to the customer's phone number. We need to design this with a clean interface
so the WhatsApp provider can be swapped later (Twilio, MessageBird, WATI,
etc.). The triggers are: invoice created (send "Here's your bill"), payment
received (send "Payment confirmed, thank you"), and invoice overdue (send
"Your payment is past due, please pay at your earliest convenience").

WHAT THE AI MUST CREATE:

BACKEND INTERFACE (in domain/application layer):
- IWhatsAppProvider interface with method:
  sendMessage(phoneNumber: string, message: string): Promise<{ success: boolean,
  messageId: string }>

BACKEND SERVICE (in application layer):
- MessagingService with methods:
  - sendInvoiceNotification(invoice: Invoice, customer: Customer):
    Formats and sends: "Dear [name], your invoice #[number] for [amount] is
    ready. Due date: [date]. Thank you for your business."
  - sendPaymentConfirmation(payment: Payment, invoice: Invoice,
    customer: Customer):
    Formats and sends: "Dear [name], we received your payment of [amount]
    for invoice #[number]. Thank you!"
  - sendOverdueReminder(invoice: Invoice, customer: Customer):
    Formats and sends: "Dear [name], your invoice #[number] for [amount] was
    due on [date]. Please make payment at your earliest convenience."

BACKEND TRIGGERS (in infrastructure/application layer):
- After invoice creation (in InvoiceService.generate), call
  messagingService.sendInvoiceNotification().
- After payment recording (in PaymentService.addPayment and invoice status
  changes to PAID), call messagingService.sendPaymentConfirmation().
- A scheduled/cron job (or manual endpoint for testing) that finds all
  invoices where status=OVERDUE and no reminder was sent in the last 7 days,
  then calls messagingService.sendOverdueReminder().

WHATSAPP PROVIDER IMPLEMENTATION (in infrastructure layer):
- Create a TwilioWhatsAppProvider (or similar) that implements
  IWhatsAppProvider.
- This provider handles the actual HTTP calls to the WhatsApp Business API.
- The provider is injected into MessagingService via the interface (using
  NestJS dependency injection with the interface token).

CONFIGURATION:
- Environment variables for WhatsApp API credentials.
- The provider can be swapped by changing one line in the module configuration.

ACCEPTANCE CRITERIA:
- Creating an invoice triggers a WhatsApp message to the customer.
- Recording a full payment triggers a confirmation message.
- Overdue invoices get reminder messages (test via manual trigger endpoint).
- Swapping the WhatsApp provider requires only changing the implementation
  class, not the MessagingService.
- Failed messages are logged and do not block the triggering operation
  (fire-and-forget or queued).

================================================================================
PHASE 10 — MOBILE DASHBOARD AND REPORTS
================================================================================

PLAIN ENGLISH DESCRIPTION:
This is the management cockpit. The mobile app needs a dashboard that gives
the operator a quick overview of their business: total revenue collected,
total unpaid invoices, total expected revenue, and a simple profit/loss
summary. Additionally, we need a Reports section with visual charts showing
revenue trends and payment trends over time. All data for these views must
come from the local SQLite database (which is updated when the user syncs).
This means the dashboard works perfectly offline, showing the last known
state.

WHAT THE AI MUST CREATE:

DASHBOARD SCREEN:
- Card showing "Total Revenue" (sum of all payments this month).
- Card showing "Pending Payments" (sum of all unpaid/overdue invoices).
- Card showing "Expected Revenue" (sum of all non-cancelled invoice amounts).
- Card showing "Collected vs Expected" as a percentage (Total Payments /
  Expected Revenue * 100).
- Quick list of "Recent Payments" (last 5 payments with customer name and
  amount).
- Quick list of "Overdue Invoices" (invoices past due date, unpaid).

REPORTS SCREEN:
- Revenue Over Time chart (bar chart or line chart showing monthly revenue
  for the past 6-12 months).
- Payment Method Breakdown (pie chart showing what percentage of payments
  are cash, bank transfer, mobile money, cheque).
- Customer Debt Report (bar chart showing top 10 customers by outstanding
  debt).
- All charts use a React Native charting library (react-native-chart-kit or
  victory-native).

SETTINGS SCREEN:
- "Sync Now" button (from Phase 8) with status indicator.
- Display last sync timestamp.
- Logout button.
- App version info.

DATA SOURCE (CRITICAL):
- ALL dashboard and report queries must read from local SQLite.
- No direct API calls for dashboard data.
- The data refreshes only when the user manually syncs.

ACCEPTANCE CRITERIA:
- Dashboard shows accurate numbers calculated from local SQLite data.
- All numbers update after a successful sync.
- Charts render correctly with real data.
- Dashboard works in airplane mode (showing last synced data).
- Settings screen shows sync status and logout works.

================================================================================
PHASE 11 — CLEAN ARCHITECTURE REFACTOR
================================================================================

PLAIN ENGLISH DESCRIPTION:
This is the quality assurance and future-proofing phase. By this point,
features may have been built quickly, and some business logic might have
leaked into UI components or controllers. This phase is a deliberate
refactoring pass to ensure the entire codebase follows Clean Architecture
principles. This means: domain logic has no framework dependencies,
repositories are behind interfaces, use cases orchestrate business rules,
and UI components are purely presentational. This is what separates a
hobby project from a production-grade system that can scale to thousands
of users across many tenants without becoming unmaintainable.

WHAT THE AI MUST VERIFY AND ENFORCE:

BACKEND LAYER AUDIT:
- DOMAIN LAYER (/domain):
  Must contain: Entities (plain classes/interfaces), Value Objects,
  Repository Interfaces, Domain Service Interfaces.
  Must NOT contain: NestJS decorators, Prisma imports, HTTP-related code,
  Express/Fastify dependencies.

- APPLICATION LAYER (/application):
  Must contain: Use Cases (services that orchestrate domain logic), DTOs,
  Application-specific interfaces.
  Must NOT contain: Direct database access, HTTP request handling.

- INFRASTRUCTURE LAYER (/infrastructure):
  Must contain: Prisma repositories (implementing domain interfaces),
  WhatsApp provider, external API clients, database config.
  This is the ONLY layer that imports PrismaClient or third-party SDKs.

- PRESENTATION LAYER (/presentation):
  Must contain: NestJS controllers, request DTOs with validation decorators,
  middleware (auth guards).
  Must NOT contain: Business logic, direct database calls, domain rules.

MOBILE LAYER AUDIT:
- DOMAIN LAYER (/domain):
  Must contain: Pure business entities and rules (same as backend domain).
  No React Native imports. No SQLite imports.

- DATA LAYER (/data):
  Must contain: SQLite repository implementations, API sync service,
  DTO mappings.
  This is the ONLY layer that imports SQLite or makes HTTP calls.

- UI LAYER (/ui):
  Must contain: React Native components, screens, navigation.
  Components receive data via props and emit events via callbacks.
  Must NOT contain: Business rules, data fetching logic, validation logic
  (validation can be called here but must be defined in domain).

- STATE LAYER (/state):
  Must contain: State management (React Context, Zustand, or Redux),
  connecting data layer to UI layer.
  Must NOT contain: Business rules.

HARD RULES TO CHECK:
1. No component directly imports Prisma, SQLite, axios, or fetch.
2. No controller contains if/else business logic — it delegates to services.
3. All repositories are injected via interfaces, not concrete classes.
4. The domain layer compiles without any framework imports.
5. Circular dependencies are eliminated.

ACCEPTANCE CRITERIA:
- Removing NestJS from the backend project would not break domain or
  application layers (they have zero NestJS imports).
- Removing React Native from the mobile project would not break the
  domain or data layers.
- Switching from Prisma to TypeORM requires changes only in the
  infrastructure layer.
- A new developer can understand the system by reading the domain layer
  first, then the application layer.

═══════════════════════════════════════════════════════════════════════════════
FINAL INSTRUCTIONS TO THE AI AGENT
═══════════════════════════════════════════════════════════════════════════════

BUILD ORDER:
Follow phases 1 through 11 in order. Each phase builds on the previous one.
Do not skip phases. Do not implement features from later phases early.

CODE QUALITY:
- Write code as if it will be reviewed by a principal engineer.
- Use meaningful variable and function names.
- Write JSDoc comments for public methods and complex logic.
- Handle errors gracefully — never let the app crash silently.
- Use TypeScript's type system fully — avoid 'any' at all costs.

TESTING (IF REQUESTED):
If the user asks for tests, add unit tests for domain/application layers
and integration tests for API endpoints. Use Jest for both.

WHEN IN DOUBT:
- Follow Clean Architecture principles.
- Keep business logic out of UI and out of controllers.
- Default to tenant isolation — never expose data across tenants.
- Prefer simplicity over cleverness.

THE SYSTEM IS COMPLETE WHEN:
- A user can register a new tenant (generator company).
- Log in as that tenant's admin.
- Create customers with GPS locations.
- Define pricing rules (fixed or ampere-based).
- Create subscriptions linking customers to pricing.
- Generate invoices based on subscriptions.
- Record payments against invoices.
- View dashboard and reports (all from local SQLite).
- Sync all data to the server by pressing "Sync Now."
- Receive WhatsApp notifications on invoice/payment events.
- Do ALL of the above while completely offline, syncing only when ready.

═══════════════════════════════════════════════════════════════════════════════
END OF BUILD PROMPT
═══════════════════════════════════════════════════════════════════════════════