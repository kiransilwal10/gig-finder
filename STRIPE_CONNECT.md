# Stripe Connect marketplace

This documents the payments layer added to Gig Finder. Sellers ("hustlers")
onboard through Stripe Connect, buyers pay for gigs, and each payment is split
automatically: the seller receives their share and the platform keeps a fee.

## How the money moves

1. A seller signs up and opens **Become a seller**. The backend creates a
   Stripe Connect **Express** account and returns a hosted onboarding link.
2. The seller finishes onboarding on Stripe (identity + bank details). Once
   Stripe enables charges, the account can receive money.
3. The seller lists a gig with a price.
4. A buyer clicks **Hire**. The backend creates a Stripe Checkout Session as a
   **destination charge**: the full price is charged to the buyer, an
   `application_fee_amount` (the platform cut) stays with the platform, and the
   remainder is transferred to the seller's connected account.
5. Stripe pays the seller's balance out to their bank on its normal schedule.
   The seller views payouts through their Stripe Express dashboard.

The platform fee is 10% by default and is controlled by `PLATFORM_FEE_PERCENT`.

## Backend

| Area | Path |
| --- | --- |
| Stripe client + fee config | `backend/config/stripe.js`, `backend/utils/fees.js` |
| Connect onboarding / status / dashboard link | `backend/routes/connect/index.js` |
| Gig listing and management | `backend/routes/gigs/index.js` |
| Checkout (destination charge) | `backend/routes/checkout/index.js` |
| Webhook handler | `backend/routes/webhooks/stripe.js` |
| Buyer/seller orders + earnings | `backend/routes/orders/index.js` |
| Data models | `backend/models/Gig.js`, `backend/models/Order.js`, `backend/models/User.js` |
| Schema | `backend/schema.sql` |

The webhook is mounted before the JSON body parser in `index.js` so Stripe's
signature can be verified against the raw request body. It handles
`account.updated`, `checkout.session.completed`, and `charge.refunded`.

## Frontend

| Page | Path |
| --- | --- |
| Gig explorer + hire | `frontend/pages/index.js` |
| Become a seller | `frontend/pages/sell/onboard.js` |
| Create a gig | `frontend/pages/sell/create.js` |
| Seller dashboard | `frontend/pages/sell/dashboard.js` |
| Checkout result | `frontend/pages/checkout/success.js`, `cancel.js` |
| Buyer purchases | `frontend/pages/purchases.js` |

API calls live in `frontend/config/requests.js`.

## Environment

Copy the examples and fill in your own values:

```
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Backend needs `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and
`PLATFORM_FEE_PERCENT`. Test keys come from the Stripe dashboard under
**Developers > API keys** while in a sandbox/test mode. The webhook secret comes
from the Stripe CLI (below). The frontend needs `NEXT_PUBLIC_SERVER` pointing at
the backend's `/api` base.

## Running locally

The app expects the frontend on `app.localhost.com:3000` and the backend on
`api.localhost.com:8000`, sharing cookies across the `.localhost.com` domain. Add
this to `/etc/hosts`:

```
127.0.0.1 app.localhost.com api.localhost.com
```

Then:

```
# database (any local Postgres works; point DB_* at it)
psql -d gig-finder -f backend/schema.sql

# backend
cd backend && npm install && npm start

# frontend
cd frontend && npm install && npm run dev
```

If ports 5432 or 8000 are already taken, change `DB_PORT` / `PORT` in
`backend/.env` (and `NEXT_PUBLIC_SERVER` to match) and re-run.

## Webhooks in development

Stripe needs to reach your backend to confirm payments. Use the Stripe CLI:

```
stripe login
stripe listen --forward-to localhost:8000/api/webhooks/stripe
```

The CLI prints a signing secret (`whsec_...`). Put it in `backend/.env` as
`STRIPE_WEBHOOK_SECRET` and restart the backend.

## Testing a full transaction

1. Enable Connect in the Stripe dashboard (test mode).
2. Register two accounts: one seller, one buyer.
3. As the seller, open **Become a seller** and finish Stripe onboarding with the
   test values: SSN `000-00-0000`, date of birth `01/01/1990`, routing number
   `110000000`, account number `000123456789`.
4. Create a gig with a price.
5. As the buyer, hire the gig and pay with card `4242 4242 4242 4242`, any
   future expiry, any CVC.
6. Confirm the order shows as paid on the buyer's purchases page and the seller's
   dashboard, and that the application fee and transfer appear in the Stripe
   dashboard under the connected account's balance.

## Running the tests

```
cd backend && npm test
```

This covers the fee calculation. The Stripe flows are verified manually with the
steps above.
