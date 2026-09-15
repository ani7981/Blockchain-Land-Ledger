# Frontend Portal — Digital Land Registry

Web application interface for the Digital Land Registry consortium blockchain, built with React and Vite.

## Architecture

The frontend communicates solely via REST API (`http://localhost:3000/api`) and never handles private keys, blockchain certificates, or raw peer endpoints directly.

## Pages

1. **Dashboard:** Key metrics, active vs pending vs approved vs rejected title summary, and complete ledger catalog.
2. **Register Property:** Cadastral entry form with input validation (Parcel ID, Survey Number, Owner ID, Owner Name, Document Hash) and role enforcement for `REGISTRATION_OFFICER`.
3. **Property Search & History:** Real-time lookup by Parcel ID, title verification, transfer request submission for `LAND_OWNER`, and chronological timeline of state revisions with transaction IDs.
4. **Transfer Review:** Officer approval and rejection workflow with audit trail and justification recording.

## Role Switcher

A role selector is accessible in the top navigation bar to test role-based access control rules:
- `REGISTRATION_OFFICER` (Authorized to create properties, approve and reject transfers)
- `LAND_OWNER` (Authorized to request title transfers for owned parcels)
- `BUYER` / `SURVEY_OFFICER`

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`
