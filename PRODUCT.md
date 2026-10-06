# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Vite + React frontend, delegated in Phase 1; Express backend and Supabase.

## Users
Gig workers such as rideshare drivers, freelancers, and creators who need to document variable income for housing or credit applications. This audience and its job are inferred from the user-provided product brief.

## Product Purpose
Translate variable gig income into clear evidence a landlord or lender can review. Success means a worker can connect income sources and produce a standardized proof-of-income report grounded in their earnings history. Inferred from the brief.

## Positioning
Aggregate income across gig platforms, smooth it into a trailing 12-month monthly estimate, and accompany that estimate with a reliability score and report. Inferred from the brief.

## Operating Context
Workers review financial evidence and share a PDF report with a housing or credit decision-maker. Inferred from the brief.

## Capabilities and Constraints
- Target sources include gig platforms such as Uber, freelance marketplaces, and creator platforms.
- Target integrations are Argyle or Plaid sandbox APIs.
- The income view uses a trailing 365-day period, grouped into 12 calendar months with inactive months represented as zero.
- Reports include a reliability score and adjusted monthly income.
- Infrastructure must remain within free tiers and sandbox services during development.
- No production user data, report samples, or verified outcomes are available in this scaffold. Any illustrative dashboard data must be labeled synthetic.

## Evidence on Hand
The scoring formulas and schema are specified in the user-provided product brief. No live income data, customer testimonials, partner approvals, or verified financial outcomes are available.

## Product Principles
- Make variable income legible without hiding inactive months.
- Keep financial claims traceable to their source data.
- Make the report understandable to both workers and reviewers.
- Treat financial and account data as private.
