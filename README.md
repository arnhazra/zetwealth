# ZetWealth

An AI-driven wealth management platform that unifies personal finance into a single system - enabling users to manage assets, track spending, plan goals, and receive intelligent financial insights.

---

## Architecture Overview

![Architecture](architecture.svg)

The system follows a modular, service-oriented architecture:

### Frontend (UI Service)

- Built with Next.js
- Handles dashboards, forms, and AI conversation interface
- Communicates with backend via REST APIs

### Backend (Core Service)

- Built with NestJS
- Organized into domain modules:
- Assets, Expenses, Goals, Debt, Cashflow, Events
- Handles business logic, authentication (JWT), and API orchestration
- Integrates AI workflows via LangChain

### AI Layer

- Powered by LangChain + LLMs
- Enables financial insights, recommendations, and natural language queries

### Data Layer

- Azure Cosmos DB → Primary data store
- Azure App Config → Configuration management

### Background Jobs

- Github Cron
- Handles scheduled tasks like updates, reminders, and recalculations

---

## Apps Overview

The platform is modular, with each app solving a specific financial problem:

- **AssetManager**  
  Organize and manage financial assets (stocks, crypto, real estate, cash) with real-time valuation and portfolio visibility.

- **ExpenseTrack**  
  Monitor spending patterns with categorized transactions, budgets, and analytics dashboards.

- **WealthPlanner**  
  Define financial goals (retirement, savings, investments) and track progress with AI-assisted projections.

- **DebtTrack**  
  Track liabilities (loans, credit cards, mortgages) with repayment schedules and outstanding balances.

- **CashFlow**  
  Automate and visualize Inward/Outward cashflows across accounts for better liquidity management.

- **Calendar**  
  Financial planning timeline for mapping future events like investments, EMIs or Goals.

---

## Data Flow

1. User interacts with UI (Next.js)
2. Request is sent to backend (NestJS)
3. Backend processes:
   - Reads/Writes from Azure Cosmos DB
   - Invokes AI layer when needed
4. AI layer generates insights (LangChain + LLM)
5. Response returned to UI

---

## Tech Stack

- Frontend: Next.js (React)
- Backend: NestJS (Node.js, TypeScript)
- Database: Azure Cosmos DB
- AI: LangChain + LLMs
- Scheduler: Github Cron
- Deployment: Azure App Service

---

## Key Characteristics

- Modular domain-driven architecture
- AI-native financial intelligence
- Scalable and extensible system
- Multi-asset and multi-currency support
- Open-source and developer-friendly
