# PROMOTtv implementation notes

The WhatsApp export and supplied screenshots are project references, not authority to contact people, use old passwords, publish, or make payments. Personal payment receipts and contact details are excluded from the app.

## Applied requirements

| Requirement | Implementation |
| --- | --- |
| PROMOTtv branding, lowercase tv | Text wordmark and favicon; final client artwork can replace them |
| React, MySQL, Render, Vercel, cPanel database | Existing stack preserved; deployment configuration and instructions supplied |
| Separate creators and earners | Server-authenticated role-specific workspaces |
| Creator inputs and campaigns | Campaign action, count, title and URL; server-calculated cost; locked wallet debit |
| Dollar amounts | USD displays and six-decimal database precision for small task rewards |
| Two referrals before withdrawal | Server checks two registered, unsuspended referred accounts |
| Minimum withdrawal $10 | Server-enforced minimum and available-balance checks |
| 30% inactivity deduction | Applies to available earnings, as explicitly confirmed by the project owner in this session |
| Earner social account | At least one self-declared profile URL required before submission |
| Creator membership payment | Standard, Premium ($20/30 days), Diamond ($30/30 days); existing prices retained |
| Flutterwave creator payments | Hosted checkout and server verification for funding and memberships |
| Crypto earner payouts | Manual finance workflow using USDT TRC20; automatic transfers remain unconnected |
| Creator/platform split 50/50 | New creator campaigns allocate half the budget to task rewards |
| Free admin posting, 20% reward share | Manager can publish platform-funded tasks without a wallet debit |
| Moderator, finance, manager | API-enforced permissions; individual staff login and password changes |
| Account suspension and verification | Moderator/manager verification; all staff roles can suspend member accounts |
| Finance history | Transactions, payout queue, recorded external transfer hashes and refund history |
| Mobile navigation and signup/login errors | Responsive navigation and inline request feedback |

## Explicit operating choices

- UTC defines a day. Registration day is a grace day. Existing accounts start tracking after upgrade, rather than receiving retrospective deductions.
- Non-rejected submissions count as daily activity when the deduction job runs. Pending evidence does not credit money until staff approve it. Later rejection does not recalculate an already-processed day.
- Deductions apply to available earnings, excluding funds reserved for a pending withdrawal. No separate points balance existed, so the new ledger uses USD throughout.
- Referral eligibility counts actual registered accounts. Email verification, device-based abuse controls, and social API ownership checks are not implemented.
- Crypto/network choice is a working assumption: USDT on TRON (TRC20), with manually performed and recorded transfers. Confirm the operational choice before launch.
- Memberships do not auto-renew. Renewing the same active plan extends its end date; choosing a different plan starts a new 30-day term without proration.
- Revenue splits use the discounted, paid campaign budget. Platform-funded task budgets create a payout obligation without collecting creator funds; the operator must fund those payouts.

## Items still requiring external setup

Production hosting credentials and database upgrade; remote database access and TLS; Flutterwave merchant credentials and USD eligibility; the finance team's funded payout wallet; staff accounts; final logo, support contact, privacy notice and terms. The supplied audio attachments were referenced in the text export but were not transcribed. Google sign-in, email password recovery and automatic payment webhook reconciliation are not part of this implementation.
