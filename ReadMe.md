# Hexa Ledger

Transaction ledger system with Node.js + Express + MongoDB. Think digital wallet backend.

## Why I Built This

Wanted to figure out how payment apps actually work under the hood. When you transfer money on PayTM or PhonePe, there's a whole system making sure that money doesn't just vanish or get sent twice if you click the button 10 times.

Built proper double-entry bookkeeping (every transaction affects two accounts), idempotency keys to prevent duplicates, and JWT auth. Also learned MongoDB aggregation pipelines which was painful but worth it.

The interesting part was implementing the ledger - instead of just updating a balance field, every money movement gets recorded as a separate entry. More reliable and gives you a complete history.

## Features

**Auth**
- Register/login with JWT (cookies)
- Bcrypt for password hashing
- Token blacklist for logout
- Welcome emails via Nodemailer

**Accounts**  
- Multiple accounts per user
- Supports INR, USD, EUR
- Status: active/frozen/closed
- Balance calculated from ledger entries using aggregation

**Transactions**
- Transfer between accounts
- Idempotency keys prevent duplicates
- Status tracking (pending/completed/failed/reversed)
- Transaction history

**Ledger**
- Double-entry bookkeeping - each transaction creates 2 entries
- Debit from sender, credit to receiver
- Balance = sum of all ledger entries for that account
- Everything's append-only, nothing gets modified

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Nodemailer
- dotenv

## Structure

```
server.js                    # Entry point
src/
  app.js                     # Express setup
  config/db.js               # MongoDB connection
  controllers/               # Business logic
  models/                    # Mongoose schemas
    account.model.js         # Has custom getBalance() method
    ledger.model.js          # Double-entry magic
  middlewares/auth.middleware.js
  routes/
  services/email.service.js
```

## Setup

Need Node.js and MongoDB. SMTP is optional for emails.

```bash
npm install
```

Create `.env` file:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/hexa_ledger
JWT_SECRET=any_random_string

# Optional email config
CLIENT_ID=your_smtp_client_id
CLIENT_SECRET=your_smtp_client_secret
EMAIL_USER=youremail@gmail.com
```

Run:
```bash
npm run dev    # development with nodemon
npm start      # production
```

Check `http://localhost:3000` - should see welcome message.

## API

All routes need JWT cookie except register/login.

### Auth `/api/auth`

**POST /api/auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "pass123"
}
```

**POST /api/auth/login** - same body as register

**POST /api/auth/logout** - blacklists token

### Accounts `/api/account`

**POST /api/account** - create account
```json
{ "currency": "INR" }
```

**GET /api/account** - list your accounts

**GET /api/account/:id/balance** - get balance

### Transactions `/api/transactions`

**POST /api/transactions**
```json
{
  "fromAccountId": "...",
  "toAccountId": "...",
  "amount": 500,
  "idempotencyKey": "unique-key-123"
}
```
Idempotency key prevents duplicate transactions - client should generate it.

**GET /api/transactions/:accountId** - transaction history

## How It Works

**Double-Entry Ledger**

Each transaction creates 2 ledger entries:
- Debit (negative) from sender
- Credit (positive) to receiver

Sum of all entries = 0. That's how you know everything balances out.

**Idempotency Keys**

Client generates a unique key per transaction. If same key is sent again, we reject it. Prevents charging someone twice if they spam click send.

```javascript
const idempotencyKey = `${userId}-${Date.now()}-${Math.random()}`;
```

**Balance Calculation**

No balance field in the account. We calculate it by summing ledger entries using MongoDB aggregation. More accurate since it's the source of truth.

```javascript
account.getBalance() // sums all ledger entries
```

## Security

- Bcrypt password hashing
- JWT auth with cookies
- Token blacklist for logout
- Mongoose validation
- Unique constraints on idempotency keys

## Notes

- MongoDB connection uses Google DNS (8.8.8.8) to avoid resolution issues
- Email service needs proper SMTP config, otherwise just ignore it
- Use Postman or Insomnia for testing
- There's a typo in transactoin.route.js filename but it works so 🤷

## What I Learned

- MongoDB aggregation pipelines (took a while to get right)
- Double-entry bookkeeping implementation
- Idempotency patterns
- JWT auth flow
- Structuring Express apps

## TODO

- Currency conversion (supports INR/USD/EUR but no conversion logic yet)
- Transaction reversals
- Rate limiting
- Better error handling
- Tests (should probably add these)
- Maybe add transaction categories

---

This is a learning project. Not production-ready, but demonstrates the core concepts.
