# SUI Portfolio Dashboard - Version 1

A premium infographic dashboard that fetches live portfolio data from a published Google Sheet and displays it in a beautiful, real-time interface.

## Features

- **Live Data Sync**: Automatically fetches the latest row from your published Google Sheet every 60 seconds
- **Net Worth Display**: Large hero card showing total portfolio net worth with positive/negative status
- **Asset Allocation**: Visual breakdown of wallet and protocol positions with percentage bars
- **APR Insights**: Current APR values from Cetus, NAVI, and Suilend protocols
- **Health Metrics**: Display health factor scores and debt-to-supply ratio
- **Raw Data Panel**: Full latest row data available for inspection
- **Premium UI**: Dark theme with gradients, glassmorphism effects, and responsive design

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The dashboard will start at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Configuration

To connect to your own Google Sheet:

1. Publish your sheet as CSV
2. Replace the `CSV_URL` in `src/App.jsx` with your published sheet URL
3. Ensure the CSV has the following column headers:
   - `Date`
   - `Net Worth ($)`
   - `Wallet Total ($)`
   - `Total Supplied ($)`
   - `Total Borrowed ($)`
   - `Unclaimed Rewards ($)`
   - `Wallet SUI`, `Wallet CETUS`
   - `Cetus Net Value ($)`, `Cetus APR (%)`
   - `NAVI Net Value ($)`, `NAVI APR (%)`
   - `Suilend Net Value ($)`, `Suilend APR (%)`
   - `NAVI Main Health Factor`, `NAVI E-mode Health Factor`

## Tech Stack

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **Papa Parse**: CSV parsing
- **CSS3**: Modern styling with gradients and layouts

## Version History

### v0.0.1 (Initial Release)
- Live Google Sheet data fetching
- Premium dashboard UI
- Asset allocation visualization
- APR metrics display
- Real-time sync (60s refresh)
- Responsive design

## License

MIT
