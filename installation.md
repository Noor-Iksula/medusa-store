# Medusa JS v2 — Step-by-Step Installation Guide

**Platform:** macOS (Homebrew)  
**Date:** 2026-06-11

---

## Prerequisites

- macOS with Homebrew installed
- Git
- Node.js v20+ (installed at `/opt/homebrew/opt/node@20`)
- npm v10+
- PostgreSQL (see Step 1)

---

## Step 1 — Install PostgreSQL (via Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

Add `psql` to PATH (add to `~/.zshrc` or `~/.bash_profile`):

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify:
psql --version
```

---

## Step 2 — Create Medusa Database & User

```bash
createdb medusa_db

# (Optional) Create a dedicated user:
psql -c "CREATE USER medusa_user WITH PASSWORD 'medusa_pass';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE medusa_db TO medusa_user;"
```

---

## Step 3 — Create Medusa Project

```bash
# Navigate to your project folder:
cd /opt/homebrew/var/www/html/medusajs

# Scaffold a new Medusa v2 app:
npx create-medusa-app@latest my-medusa-store
```

When prompted:
- **Project name:** `my-medusa-store` (or your choice)
- **Include Next.js storefront:** Yes/No (your choice)
- **Database URL:** `postgresql://medusa_user:medusa_pass@localhost:5432/medusa_db`

---

## Step 4 — Configure Environment Variables

```bash
cd my-medusa-store

# Copy the example env file (if not already created):
cp .env.template .env
```

Edit `.env` and set:

```env
DATABASE_URL=postgresql://medusa_user:medusa_pass@localhost:5432/medusa_db
JWT_SECRET=your_random_jwt_secret_here
COOKIE_SECRET=your_random_cookie_secret_here
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:7001
AUTH_CORS=http://localhost:7001,http://localhost:8000
```

Generate random secrets:

```bash
openssl rand -hex 32    # for JWT_SECRET
openssl rand -hex 32    # for COOKIE_SECRET
```

---

## Step 5 — Install Dependencies

```bash
cd my-medusa-store
npm install
```

---

## Step 6 — Run Database Migrations

```bash
npx medusa db:migrate
```

---

## Step 7 — Create Admin User

```bash
npx medusa user --email admin@example.com --password admin123
```

---

## Step 8 — Start the Medusa Backend Server

```bash
npm run dev
```

| | URL |
|---|---|
| Server | http://localhost:9000 |
| Admin dashboard | http://localhost:9000/app |
| API health check | http://localhost:9000/health |

---

## Step 9 — Start / Stop / Restart the Server

Always run from the project root:

```bash
cd /opt/homebrew/var/www/html/medusajs/my-medusa-store
```

**START** (dev mode with hot reload):
```bash
npm run backend:dev
```

**START** (background, so your terminal stays free):
```bash
npm run backend:dev > /tmp/medusa-dev.log 2>&1 &
echo "Server PID: $!"   # note the PID to stop it later
```

**STOP** — find and kill the process on port 9000:
```bash
lsof -i :9000 | grep LISTEN   # shows the PID
kill <PID>                    # graceful stop

# or in one command:
kill $(lsof -ti :9000)
```

**RESTART** — stop then start again:
```bash
kill $(lsof -ti :9000) ; sleep 2 ; npm run backend:dev
```

**CHECK** if server is running:
```bash
lsof -i :9000 | grep LISTEN              # shows a line if running, empty if not
curl -s http://localhost:9000/health     # returns {"status":"ok"} when up
```

> Logs (if started in background): `tail -f /tmp/medusa-dev.log`

---

## Step 10 — (Optional) Seed Sample Data

The seed script is located at `apps/backend/src/scripts/seed.ts`.

It creates the following sample data automatically:

| Type | Items |
|---|---|
| Regions | United States (USD) |
| Categories | Clothing, Accessories, Electronics |
| Products | 8 products with variants and USD + EUR prices |

**Products included:**

**Clothing**
- Classic White T-Shirt — S / M / L / XL — $19.99
- Slim Fit Jeans — W30 / W32 / W34 / W36 — $49.99
- Hooded Sweatshirt — S / M / L / XL — $39.99

**Accessories**
- Leather Bifold Wallet — Black / Brown / Tan — $29.99
- Canvas Tote Bag — Natural / Navy / Black — $24.99
- Snapback Baseball Cap — White / Black / Grey — $22.99

**Electronics**
- Wireless Bluetooth Earbuds — White / Black — $89.99
- Portable Phone Stand — Silver / Space Grey — $14.99

> All products are linked to the Default Sales Channel.  
> The script is **idempotent** — safe to run multiple times (skips if seed data already exists).

```bash
# Run from the backend directory:
cd apps/backend
npm run seed

# Or from the project root:
npm run backend:seed
```

View seeded products in the Admin dashboard: `http://localhost:9000/app` → **Products**

---

## Step 11 — Next.js Storefront

The storefront is scaffolded at `apps/storefront/` using the official Medusa v2 Next.js starter.

**Environment file:** `apps/storefront/.env.local`

```env
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<your publishable API key>
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=us
```

**START** the storefront:
```bash
# From the storefront directory:
cd apps/storefront
npm run dev

# Or from the project root:
npm run storefront:dev
```

**STOP** the storefront:
```bash
kill $(lsof -ti :8000)
```

| | URL |
|---|---|
| Storefront | http://localhost:8000 |
| Backend admin | http://localhost:9000/app |

---

## Useful Commands

| Command | Description |
|---|---|
| `npm run backend:dev` | Start backend in dev mode (hot reload) |
| `npm run storefront:dev` | Start storefront in dev mode |
| `npm run dev` | Start both backend and storefront |
| `npm run build` | Build for production |
| `npm start` | Start in production mode |
| `npx medusa db:migrate` | Run pending migrations |
| `npx medusa user` | Create an admin user |
| `brew services list` | Check if PostgreSQL is running |
| `brew services start postgresql@15` | Start PostgreSQL |
| `brew services stop postgresql@15` | Stop PostgreSQL |

---

## Common Issues

**1. "Database connection failed"**
- Make sure PostgreSQL is running: `brew services start postgresql@15`
- Double-check `DATABASE_URL` in `.env`

**2. "Port 9000 already in use"**
```bash
lsof -i :9000 | grep LISTEN
kill -9 <PID>
```

**3. Node version mismatch**
- Medusa v2 requires Node 20+
- Check: `node --version`

**4. Migration errors**
```bash
npx medusa db:migrate --revert
npx medusa db:migrate
```

**5. Admin login not working**
```bash
npx medusa user --email your@email.com --password yourpassword
```

---

## Project Structure

```
my-medusa-store/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── api/          # Custom API routes
│   │   │   ├── modules/      # Custom Medusa modules
│   │   │   ├── workflows/    # Custom workflows
│   │   │   ├── subscribers/  # Event subscribers
│   │   │   └── scripts/      # CLI scripts (seed, etc.)
│   │   ├── medusa-config.ts  # Main Medusa configuration
│   │   └── .env              # Environment variables (DO NOT commit)
│   └── storefront/           # Next.js storefront
├── package.json
└── turbo.json
```