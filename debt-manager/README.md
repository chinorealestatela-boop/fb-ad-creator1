# DebtManager — iOS Bill Management App

A premium iOS app built with Expo (React Native) for tracking bills, managing cash flow, and never missing a payment.

## Features

- **Dashboard** — See what's due this week, available cash, and overdue alerts in under 5 seconds
- **Interactive Pie Chart** — Visual breakdown of all bills by category, tap any slice for details
- **Bill Tracker** — Supports 4 bill types: Recurring, Installment (BNPL), One-Time, Payment Plan
- **Smart Reminders** — 3-tier alerts: 7 days → 3 days → 1 day before due (push + Apple Calendar)
- **Cash Flow Prioritizer** — AI tells you which bills to pay first when cash is tight
- **Budget Tracker** — Log variable income, see what's left after bills
- **AI Assistant** — Chat interface + proactive insights powered by Claude
- **Payment History** — Track every payment with date, method, and notes
- **PDF Export** — Generate and share a full financial report
- **Offline First** — All data stored locally with AsyncStorage

## Setup

### 1. Install dependencies
```bash
cd debt-manager
npm install
```

### 2. Add your Anthropic API key
Create a `.env` file in the `debt-manager` folder:
```
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_key_here
```
Get a key at console.anthropic.com

### 3. Run on your iPhone
```bash
npx expo start
```
Then scan the QR code with the **Expo Go** app on your iPhone (download from App Store).

## Build for App Store
```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

## Project Structure

```
app/
  (tabs)/
    index.tsx       # Dashboard
    bills.tsx       # Bills list + pie chart
    budget.tsx      # Income tracker
    assistant.tsx   # AI chat
    reports.tsx     # Reports + PDF export
  bill/
    add.tsx         # Add new bill
    [id].tsx        # Bill detail + payment log
store/
  billsStore.ts     # Bills state (Zustand + AsyncStorage)
  budgetStore.ts    # Budget & settings state
  types.ts          # TypeScript types
utils/
  calculations.ts   # Payoff math + AI insights
  notifications.ts  # Push notification scheduling
  calendar.ts       # Apple Calendar integration
  dateUtils.ts      # Date helpers + formatting
constants/
  colors.ts         # Dark theme color palette
  categories.ts     # Bill categories
```

## Bill Types

| Type | Use Case |
|------|----------|
| Recurring | Netflix, phone, utilities — resets monthly |
| Installment | Klarna, BNPL — X payments, countdown |
| One-Time | Single payment, disappears when paid |
| Payment Plan | IRS, medical — fixed installment schedule |

## Color Status System

| Color | Status |
|-------|--------|
| Green | Current — more than 7 days away |
| Yellow | Due Soon — within 3 days |
| Orange | Due This Week — within 7 days |
| Red | Overdue — past due date |
