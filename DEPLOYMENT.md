# PROMOTtv deployment

The application uses React/Vite on Vercel, Express on Render, and MySQL on the cPanel host. Deploy the `client` directory, not the old HTML files in the repository root.

## Local development

Use Node 22. Install with `npm ci` in `backend` and `client`. Copy each `.env.example` to `.env` only when there is no existing environment file. Existing `.env` files are intentionally preserved.

In `backend`, configure MySQL and a random `JWT_SECRET` of at least 32 characters. Back up an existing database, then run `npm run migrate`. This explicitly creates the new tables and adds the required account, referral, session and transaction fields. The API never changes the schema on startup. Migration resets the inactivity baseline for existing users to the upgrade date, avoiding historical deductions. MySQL DDL is not transactional: if a migration fails, inspect the error and your backup before retrying. Legacy campaign reward shares are preserved; new creator campaigns use 50% and new platform campaigns use 20%.

Run `npm start` in `backend` and `npm run dev` in `client`. Set `VITE_API_URL=http://localhost:5000` for local development. The older `VITE_PRODUCTION_API_URL` variable remains supported but takes lower priority. Do not point a local frontend at a live backend while testing money flows.

## cPanel MySQL

1. Create a dedicated database and user, grant access to that database, and take a backup before importing existing data.
2. In cPanel **Remote Database Access**, allow the outbound addresses of the Render service. Some shared hosts disable remote database connections; the hosting provider must enable access on the MySQL port.
3. Put the cPanel database hostname, full database/user names (including cPanel prefixes), password and port in Render environment variables. `localhost` on Render is not your cPanel server.
4. Enable `DB_SSL=true` when the database endpoint supports TLS. Supply `DB_SSL_CA` if the host uses a private certificate authority. Certificate verification remains enabled. Ask the host for a verified TLS endpoint before sending production database credentials over the network.

Official references: [cPanel Remote Database Access](https://docs.cpanel.net/cpanel/databases/remote-database-access/) and [Render outbound addresses](https://render.com/docs/outbound-ip-addresses/).

## Render API

The repository includes `render.yaml`. Alternatively, create a Node web service with root directory `backend`, build command `npm ci`, start command `npm start`, and health check `/health`. Use Node 22.

Set `NODE_ENV=production`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_SSL`, `JWT_SECRET`, `FRONTEND_URL`, and `ALLOWED_ORIGINS`. Set `FRONTEND_URL` to the exact Vercel/custom domain without a trailing slash. `ALLOWED_ORIGINS` accepts a comma-separated list of exact trusted origins; do not use a wildcard. Never place database passwords or Flutterwave secrets in a `VITE_` variable.

Run `npm run migrate` against the backed-up production database before starting the upgraded API. Run the migration as a deliberate release step, not on each server restart.

Schedule `node scripts/inactivity.js` daily after UTC midnight (for example, 00:05 UTC) using a Render cron job with the same backend environment and root directory. It applies 30% deductions once per inactive complete UTC day. The API also catches up before reading the wallet, submitting tasks, approving rewards, reserving withdrawals, or refunding withdrawals. Registration day is excluded. Pending submissions count as activity when the day is processed; later rejection does not retroactively change a processed day. Reserved withdrawal funds are excluded. The ledger records the date of each deduction.

## Vercel frontend

Set the project root directory to `client`, framework to Vite, build command to `npm run build`, output to `dist`, and `VITE_API_URL` to the Render service origin. The checked-in `client/vercel.json` handles React route refreshes. Redeploy after changing a Vite environment variable; it is compiled into the frontend bundle.

Sign-in uses an HttpOnly cookie plus a tab-scoped bearer token for browsers that block cookies between the Vercel and Render domains. Password changes, suspension, and logout invalidate earlier sessions on the server. Local storage is not used as proof of authentication.

## Payments and staff

Set `FLW_SECRET_KEY` only on the backend. Start with a Flutterwave test key and verify that your merchant account supports USD checkout. Creator wallet funding and 30-day memberships use Flutterwave Standard. After checkout, the creator clicks **Verify payment** on the return screen. The API checks payment status, reference, currency and exact amount with Flutterwave before crediting; repeat verification is idempotent. Membership receipts appear in transaction history but do not increase wallet balance.

The current flow depends on a successful browser return and verification. A creator can also verify a transaction ID in Wallet. Automatic webhook reconciliation is not implemented. Reconcile pending payments with Flutterwave before production launch, especially for customers who close checkout before returning.

Reference: [Flutterwave Standard](https://developer.flutterwave.com/docs/flutterwave-standard-1), [transaction verification](https://developer.flutterwave.com/docs/transaction-verification).

Crypto payouts use a manual finance queue for USDT on TRON (TRC20). Funds are reserved at request time; one pending request is allowed per earner. Finance must perform and verify the external transfer, then record its 64-character transaction hash. The application validates the hash format and uniqueness but does not independently confirm it on-chain. Rejection returns reserved funds exactly once. Automatic crypto transfers are not connected.

To create staff, set `STAFF_EMAIL`, `STAFF_NAME`, `STAFF_ROLE` (`moderator`, `finance`, or `manager`), and `STAFF_PASSWORD` (12+ characters, maximum 72 bytes), then run `npm run staff:create` from `backend`. Use individual accounts; there are no default staff passwords. Remove provisioning variables afterwards. Staff sign in through `/login` and can change their own password in Settings.

## Verification

`npm run lint` and `npm run build` in `client` validate the frontend. `npm test` in `backend` runs the rules tests and skips database integration by default. Set `RUN_MYSQL_TESTS=1` to run the integration test against local MySQL. It requires permission to create a temporary `promottv_test_<timestamp>` database, tests against that database, and removes only that generated database. It refuses non-local database hosts. Flutterwave calls are mocked; no live payment or crypto transfer is made.

Before launch, complete a Flutterwave test checkout, verify the creator wallet, publish a campaign, submit and approve evidence, confirm the referral and withdrawal gates, and review a test payout. Confirm your branded support contact, final logo, privacy notice and terms. Social profiles are currently self-declared URLs; moderation reviews task evidence manually. Google sign-in and email-based password recovery require additional provider configuration and are not implemented.
