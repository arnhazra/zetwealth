# WealthFabric

**WealthFabric** is an open-source, AI-driven wealth management platform that centralizes all aspects of personal finance. It lets you add and categorize your assets (stocks, crypto, real estate, cash, etc.), track debts and loans, set and monitor financial goals, and view comprehensive net-worth analytics. An integrated AI agent provides personalized insights — for example, answering questions about tax optimization or investment allocation using large language models (LLMs). In short, WealthFabric helps you plan, grow, or preserve your wealth by combining traditional finance tools with modern AI.

## Key Features

- **Comprehensive Asset Management:** Maintain portfolios across multiple asset classes (equities, crypto, real estate, bank accounts, etc.) with real-time or periodic valuation updates.
- **Debt & Liability Tracking:** Manage liabilities like mortgages, student loans, and credit card debt. Set up payment schedules and reminders to stay on top of obligations.
- **Budgeting & Expense Tracking:** Categorize transactions automatically or manually (e.g. groceries, utilities, entertainment), set budgets per category, and visualize spending trends over time.
- **Financial Goals & Planning:** Define goals (retirement fund, down payment, emergency fund) and track progress. WealthFabric can project future savings or recommend adjustments using AI forecasting.
- **Net Worth Calculation:** Automatically compute net worth by aggregating all assets minus liabilities. Visualize net worth growth charts and historical trends.
- **AI-Powered Insights:** Use natural language queries or pre-built reports to get AI-generated analysis. For example, ask _“How can I optimize my portfolio for tax efficiency?”_ or _“What should I do to reach my retirement goal?”_ – LangChain-powered agents will retrieve your financial data and external knowledge, then use LLMs to craft an answer.
- **Multi-Currency & Aggregation:** Supports multiple currencies and can aggregate balances from different accounts for a unified view.
- **Open-Source & Extensible:** Built in TypeScript/Node, WealthFabric is fully open source (AGPL-3.0), allowing developers to extend modules or integrate new services (e.g. bank APIs, crypto exchanges).

## Architecture & Workflows

![HLD](architecture.svg)

WealthFabric follows a modular, service-oriented design:

- **Frontend (UI Service):** The Next.js app provides the user interface. It handles user sign-in, displays dashboards (net worth, spending charts), and offers forms (add new asset, record expense, set a goal, etc.). It calls the backend API for all data operations. The UI also provides an “AI Chat” or Q&A interface where users can pose natural-language finance questions; these requests are forwarded to the backend, which then invokes a LangChain agent to generate a response.

- **Backend (Core Service):** The NestJS application exposes a unified API. Internally, it is broken into modules such as AssetModule, DebtModule, ExpenseModule, GoalModule, CashflowModule, TaxModule, etc. Each module contains controllers (REST endpoints), services (business logic), and data models/schemas (for MongoDB). For example, `AssetService` might handle fetching price data and computing portfolio value. The backend also implements authentication (JWT-based) so that each user’s data is isolated. When an AI-driven endpoint is called (e.g. `POST /api/ai/recommendation`), the backend may gather relevant data from MongoDB, construct a LangChain prompt/chain, call the LLM(s), and return the formulated insight.

- **Cron Service:** A separate (headless) Next.js app that runs serverless functions for scheduled jobs. For example, a `get /api/cron/daily` endpoint might perform end-of-day calculations (update account balances from linked banks), while `/api/cron/weekly` might generate a summary report. This service is triggered via Vercel’s Cron configuration. (It shares the same codebase/libraries as the UI but is deployed as a distinct project so it only handles background tasks.)

- **Data Flow:** User data (accounts, transactions, etc.) is stored in MongoDB. The backend can also fetch external data as needed (e.g. stock prices from an API). Redis is used to cache things like user settings or recent queries to speed up repeated operations. When a user requests an AI insight, LangChain may use either MongoDB or external APIs as retrieval sources before querying the LLM. All inter-service communication is via HTTP/HTTPS APIs (there is no monolithic monolith).

- **High-Level Diagram:** A typical request flows like this: the browser (Next.js) calls a NestJS endpoint; NestJS retrieves data from MongoDB/Redis or calls LangChain; LangChain might in turn query an LLM (e.g. OpenAI’s GPT) and return a result; NestJS sends JSON back to the UI. Scheduled tasks are invoked independently: Vercel Cron hits a Next.js API route (`/api/cron/*`), which executes a task in the Cron Service.

## Tech Stack

WealthFabric’s architecture is based on modern, scalable frameworks:

- **LangChain (LLM Framework):** An open-source orchestration toolkit for building applications with large language models. LangChain provides modular “chains” and agent support so the platform can integrate LLMs into workflows (e.g. financial analysis agents that call out to MongoDB or REST APIs). Using LangChain means we can easily experiment with different LLMs or prompt strategies when generating insights.
- **NestJS (Backend API):** A progressive, TypeScript-based Node.js framework for building scalable server-side applications. WealthFabric’s core business logic lives in a NestJS app. NestJS’s modular structure allows separation of domains (assets, expenses, goals, etc.) and supports both REST and GraphQL. It also has built-in support for microservices if we want to distribute components independently.
- **Next.js (Frontend UI):** A React framework by Vercel for building fast, SEO-friendly web apps. The UI is a Next.js app (written in TypeScript) that runs on Vercel. It handles client-side interactions, forms, and charts, while fetching data via the NestJS API. Next.js enables server-side rendering (for initial page loads) and client-side hydration for a smooth user experience.
- **MongoDB (Primary Database):** A document-oriented NoSQL database. We use MongoDB to persist all user data – accounts, transactions, goals, etc. Its flexible JSON-like schema (BSON) allows us to evolve data models over time (for example, adding new fields without downtime). MongoDB’s scalability is ideal for handling growing user data.
- **Redis (In-Memory Store):** A fast in-memory key-value store. In WealthFabric Redis is used for configuration and caching (e.g. storing computed settings, session data, or intermediate results). Because Redis is _“the world’s fastest in-memory database”_, it can quickly serve frequently-accessed data and reduce load on MongoDB.
- **Vercel Cron Jobs:** A cloud-based cron scheduler (built into Vercel) for running periodic background tasks. We define cron expressions (e.g. daily or weekly schedules) in `vercel.json`, and Vercel will trigger HTTP endpoints at those times. For example, a monthly job might recalculate interest on savings or send summary emails. Using Vercel’s Cron feature means we don’t need a separate server for scheduling.

## Component Breakdown

- **Authentication:** Handled by the Core Service. We use JWT tokens (signed with a secure `JWT_SECRET`). The UI obtains a token at login and sends it in the `Authorization` header. The backend guards routes to ensure only authenticated access. OAuth/social login could be added via NestJS Passport strategies.
- **API & Data Models:** The Core Service uses Mongoose (or TypeORM) with typed schemas for all entities (User, Asset, Transaction, Goal, etc.). Each HTTP request is validated (using `class-validator`) to prevent bad data. Controllers are responsible for parsing requests and calling services; services contain the business logic.
- **AI & LangChain:** We embed LangChain chains/agents where needed. For example, a `CashflowAgent` could use a combination of prompt templates and database queries to generate a cashflow forecast. The key point is that LangChain allows us to treat LLMs like a toolkit – swapping models (GPT-4, GPT-5, open source models) without code changes.
- **UI Components:** The Next.js app has pages like `/dashboard`, `/assets`, `/expenses`, `/goals`, etc. It uses React hooks to fetch data (e.g. via `fetch('/api/assets')`). It also defines React Server Components or API routes under `/pages/api` if needed. Environment config (such as API base URL) is managed via `.env.local`.
- **Cron Jobs:** Defined in `cron-service/vercel.json`. For example:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron",
        "schedule": "0 5 * * *"
      }
    ]
  }
  ```
  Vercel will then make GET requests to `/api/cron/daily-sync` every midnight UTC and `/api/cron/weekly-summary` every Monday. The handler for `/api/cron/weekly-summary` might compile the week’s transactions into a report and email it to the user.

## Getting Started

Follow these steps to run WealthFabric locally:

1. **Prerequisites:** Ensure you have Node.js (v18+), npm, and a MongoDB instance. Redis is optional but recommended for caching. You will also need an API key for an LLM provider (e.g. OpenAI).

2. **Clone the repo:**

   ```bash
   git clone https://github.com/arnhazra/wealthfabric.git
   cd wealthfabric
   ```

3. **Configure environment variables:** Copy the example files and fill in your settings:

   ```bash
   cp services/core-service/.env.example services/core-service/.env
   cp services/ui-service/.env.example services/ui-service/.env.local
   cp services/cron-service/.env.example services/cron-service/.env.local
   ```

   Edit each `.env` file to set:
   - `MONGO_URI` (e.g. `mongodb://localhost:27017/wealthfabric`)
   - `REDIS_URL` (if used, e.g. `redis://localhost:6379`)
   - `OPENAI_API_KEY` (for LLM features)
   - `JWT_SECRET` (a strong random string)
   - Any other required keys (these should be documented in each `.env.example` file).

4. **Install dependencies and run services:**
   - **Core API (NestJS):**
     ```bash
     cd services/core-service
     npm install
     npm run start:dev
     ```
     This starts the backend on (by default) port 3001 (see `main.ts` or `package.json` for exact port).
   - **Frontend UI (NextJS):**
     ```bash
     cd services/ui-service
     npm install
     npm run dev
     ```
     By default, Next.js will run on http://localhost:3000. Visit this URL in your browser.
   - **Cron Service:**
     ```bash
     cd services/cron-service
     npm install
     npm run dev
     ```
     (This is a Next.js app too, but meant for background tasks. You can invoke its endpoints manually to test.)

5. **Use the application:**
   - Open http://localhost:3000. Register a new account or log in.
   - Go to the Assets page to add your financial accounts and holdings.
   - Go to Expenses to add spending transactions.
   - Create a new Goal (e.g. _“Save $10,000 by 2027”_) and see your progress.
   - Ask the AI bot a question like _“How should I adjust my monthly budget to reach my goal?”_ and watch it analyze your data.

## Deployment

WealthFabric can be deployed on the cloud. A typical setup is:

- **Frontend (Next.js):** Deploy to Vercel (https://vercel.com). Connect your GitHub repo and set the project root to `services/ui-service`. Configure the environment variables (e.g. `NEXT_PUBLIC_API_URL`) in the Vercel dashboard.
- **Backend (NestJS Core):** You have two options:
  1. **Vercel (Serverless):** You can deploy the NestJS app as serverless functions. Include a `services/core-service/vercel.json` like:
     ```json
     {
       "version": 2,
       "builds": [{ "src": "dist/main.js", "use": "@vercel/node" }],
       "routes": [{ "src": "/(.*)", "dest": "dist/main.js" }]
     }
     ```
     Ensure you run `npm run build` on deployment and that `dist/main.js` exists. Set env variables on Vercel.
  2. **Traditional Node Host:** Deploy on AWS/GCP/Azure or Heroku. For example, build a Docker image or run on an EC2 instance. Configure the environment and run `node dist/main.js`.

- **Cron Jobs:** Use Vercel’s built-in scheduling. In your project (UI or a separate Cron project), include a `vercel.json` similar to above (see **Cron Service** example) to define the schedules. Vercel will then handle triggering those endpoints. Make sure the cron endpoints call into the backend as needed.

## Security

Security is a priority. Recommendations and best practices:

- **Protect Secrets:** Never commit API keys or passwords. Use environment variables for `MONGO_URI`, `OPENAI_API_KEY`, `JWT_SECRET`, etc. For example:

  ```bash
  # Do NOT do this:
  const OPENAI_API_KEY = 'sk-123...';

  # Instead:
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  ```

- **HTTPS Everywhere:** Deploy behind HTTPS to encrypt data in transit. Vercel provides HTTPS by default for custom domains.
- **Validate Input:** All backend inputs should be validated and sanitized. For example, NestJS pipes or DTO validation should enforce string lengths, numeric ranges, etc., to prevent injections or overflow.
- **Least Privilege:** If you integrate with external services (like banking APIs), use accounts/keys with minimal scope.
- **Dependency Auditing:** Regularly run `npm audit` or use GitHub Dependabot. Keep dependencies up to date to patch vulnerabilities.
- **Error Handling:** Don’t expose stack traces or internal errors to clients. Log errors server-side and show generic messages to users.
- **CORS & Rate Limiting:** Configure CORS to only allow your frontend domain. Consider rate-limiting or authentication on API endpoints to prevent abuse.
- **Data Protection:** Encrypt any sensitive fields if needed (e.g. use HTTPS and consider encrypting at rest via MongoDB or disk encryption). Ensure backups of MongoDB are secure.
- **Vulnerability Disclosure:** If you discover a security flaw, please [contact the maintainers](https://github.com/arnhazra) privately first. We strive to address issues responsibly.

**Note:** The AGPL-3.0 license means that if you deploy a modified version of WealthFabric for external use, you must make your modified source available under the same license.

## License

This project is released under the **GNU AGPLv3.0** license. See the `LICENSE` file for details. The AGPL ensures that improvements remain open and that anyone who interacts with the software over a network has access to its source code.
