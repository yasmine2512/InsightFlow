# InsightFlow

> A SaaS business intelligence platform that gives business owners a unified view of their performance — orders, revenue, customers, and products — without the spreadsheets.

---

## What is InsightFlow?

Most small business owners track their business across disconnected tools — an Excel sheet for orders, another for customers, manual revenue calculations. InsightFlow replaces all of that with a single dashboard powered by real analytics.

You get live KPIs, trend charts, and actionable insights calculated directly from your data using MongoDB's Aggregation Framework — not cached summaries or approximations.

---

## Features

### Dashboard
The command center of InsightFlow. Loads with a full business health overview on login.

- **KPI strip** — Revenue, Orders, Customers, Products (all MTD with growth indicators)
- **Charts** — Revenue trend (7 months), Orders this week
- **Recent activity** — Latest orders
- **Top performers** — Top customers by spend, top products by units sold

### Products
Full product catalog management with analytics built in.

- Add, edit, delete products
- Search, filter, paginate
- Per-product revenue, units sold 
- Stock alert system — low stock and out-of-stock flagged automatically
- Inventory value and Active products 

### Orders
End-to-end order tracking and analysis.

- Add, edit, delete orders
- Filter by status (pending / completed / cancelled)
- Search and pagination
- Order distribution chart, orders-this-week chart
- Average Order Value (AOV), fulfillment rate, order growth trends

### Customers
Customer base management with retention analytics.

- Add, edit, delete customers
- Active customers MTD, Customer Lifetime Value (CLV), retention rate
- Top customers by spend
- Customer growth chart, spending distribution

### Analytics Layer
InsightFlow's strongest feature. Every metric is calculated live via **MongoDB Aggregation Framework pipelines** — no stale data.

| Category | Metrics |
|---|---|
| Revenue | Total revenue, revenue growth (MTD vs same MTD last month), revenue trends |
| Orders | Order count, order growth, AOV, fulfillment rate, order trends |
| Customers | Active customers, retention rate, CLV, Avg Liftime Value |
| Products | Product revenue,Inventory value,Low stock alert, active product count |

Growth percentages use **MTD vs same MTD last month** — comparing June 1–8 against May 1–8, not a full prior month, so the numbers are always a fair apples-to-apples comparison.

---

## Pricing

### Free Plan
- Full product, customer, and order management
- Dashboard with all KPIs and charts
- Analytics layer (all aggregation metrics)
- Unlimited records

### Pro Plan
- Everything in Free
- **Excel Import** — bulk import products, customers, and orders directly from `.xlsx` spreadsheets
- Powered by Stripe — subscription managed with Stripe Webhooks

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React | UI framework |
| React Router | Client-side routing and protected routes |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| React Query | Server state management and client-side caching |
| Recharts | Charts and data visualization |
| Framer Motion | Animations and transitions |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| JWT | Stateless authentication, protected routes |
| Passport.js | Google OAuth 2.0 strategy |

### Database
| Tool | Purpose |
|---|---|
| MongoDB | Primary database |
| Mongoose | Schema modeling and query layer |
| Aggregation Framework | All analytics calculations |

### Payments
| Tool | Purpose |
|---|---|
| Stripe | Pro plan subscription billing |
| Stripe Webhooks | Subscription lifecycle events (activated, cancelled, renewed) |

---

## Authentication

InsightFlow supports two auth flows, both issuing a JWT on success.

**Traditional**
1. User registers with email and password
2. Password hashed and stored
3. Login issues a signed JWT
4. JWT attached to every request via Authorization header
5. Protected routes validate the token server-side

**Google OAuth**
1. User clicks "Sign in with Google"
2. Passport.js handles the OAuth 2.0 flow
3. On first login, account is created automatically
4. JWT issued and returned — same flow as traditional auth from this point

---

## Analytics Deep Dive

All metrics are computed with MongoDB aggregation pipelines. Growth indicators compare the current MTD window against the identical window in the prior month:

```js
// Current MTD (e.g. June 1–8)
{ $match: { createdAt: { $gte: startOfMonth, $lte: today } } }

// Same window last month (May 1–8)
{ $match: { createdAt: { $gte: startOfLastMonth, $lte: todayLastMonth } } }

// Growth %
((current - previous) / previous) * 100
```

This avoids the common mistake of comparing a partial current month against a full prior month, which produces misleading negative growth early in the month.

---

## Project Structure

```
insightflow/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages (Dashboard, Orders, etc.)
│   │   ├── hooks/           # React Query hooks
│   │   ├── lib/             # Axios instance, helpers
│   │   └── context/         # Auth context
│   └── ...
├── server/                  # Express backend
│   ├── routes/              # API routes
│   ├── controllers/         # Route handlers
│   ├── models/              # Mongoose schemas
│   ├── middleware/          # JWT auth, error handling
│   ├── config/              # DB and Passport Config
│   └── queries/             # MongoDB aggregation pipelines
└── ...
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (for Pro plan)
- Google OAuth credentials (for Google Sign-In)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/insightflow.git
cd insightflow

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Variables

Create a `.env` file in `/server`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

CLIENT_URL=http://localhost:5173
```

### Run Locally'
```bash
# Start Both 
 npm run dev

# Start backend
cd server && npm run dev

# Start frontend (new terminal)
cd client && npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.
