# Personal Trainer

React + TypeScript app for the Frontend Programming 2025 course. Manage customers and trainings, view statistics, and see upcoming sessions on a calendar. Includes CSV export and basic form validation.

- Live site: https://maab-osman.github.io/Personal-Trainer/

## Features
- Customers: search, add/edit/delete, add training for a customer, export CSV.
- Trainings: searchable list, export CSV of the filtered result.
- Statistics: date range filters with bar/pie/line charts, export CSV.
- Calendar: month/week/day/agenda views with working navigation.
- Validation: required fields for customers; training requires date, activity, and positive duration.

## Tech Stack
- React 19 + TypeScript + Vite
- UI: MUI (Material UI), MUI X DataGrid, MUI Date Pickers
- Charts: Recharts
- Calendar: react-big-calendar + date-fns localizer
- Dates: dayjs
- Router: react-router-dom v7

## Data Source
Public demo API (no auth): `https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api`
- `GET /customers` – list customers
- `POST /customers` – create customer
- `PUT /customers/{id}` – update customer
- `DELETE /customers/{id}` – delete customer
- `POST /trainings` – create training
- `GET /gettrainings` – list trainings with customer info

## Getting Started

Prerequisites
- Node.js 18+ and npm

Install and run (dev):
```bash
npm install
npm run dev
```
Vite will show the local URL. Because the app is configured for GitHub Pages, the dev URL includes the base path, e.g. `http://localhost:5173/Personal-Trainer/`.

Production build and preview:
```bash
npm run build
npm run preview
```

## Deployment (GitHub Pages)
- This repo includes a GitHub Actions workflow that builds and deploys to GitHub Pages.
- In GitHub settings, enable Pages and set source to “GitHub Actions”.
- The Vite base and router basename are set to `/Personal-Trainer/` so the app works under Pages.
- After pushing to `main`, the workflow publishes to: https://maab-osman.github.io/Personal-Trainer/

## Notes for Reviewers
- CSV exports include a UTF‑8 BOM so Excel opens them correctly.
- The calendar limits events to roughly the last 12 months for stability and performance.
- If the demo API is down, lists may show an error until it’s back.

## Project Structure (simplified)
```
src/
  App.tsx
  pages/
    CustomersPage.tsx
    TrainingsPage.tsx
    CalendarPage.tsx
    StatisticsPage.tsx
```

This project is intended for learning purposes as a final assignment in a beginner frontend course.
