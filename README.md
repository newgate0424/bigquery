# 170sa

A Next.js dashboard application for visualizing and analyzing data with advanced filtering and aggregation capabilities.

## Features

- **Data Integration**: Connect to data sources with custom configuration
- **Advanced Filtering**: Filter data by date range, advertiser, and status
- **Data Aggregation**: Automatically aggregates data by Ad ID when date range is selected
- **Pagination**: Handles large datasets (130k+ rows) efficiently
- **Responsive Design**: Built with shadcn/ui components for modern UI
- **Real-time Data**: Client-side data fetching with loading states

## Technologies Used

- **Next.js 15.5.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Data Analytics** - Advanced data processing and visualization
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Data source configuration
3. Service credentials for data access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/newgate0424/bigquery.git
cd 170sa
```

2. Install dependencies:
```bash
npm install
```

3. Set up BigQuery credentials:
   - Place your service account JSON file as `credentials.json` in the project root
   - Ensure the service account has BigQuery Data Viewer and Job User permissions

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the dashboard

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── data/route.ts      # Main data API with aggregation
│   │   └── filters/route.ts   # Filter options API
│   ├── layout.tsx
│   └── page.tsx               # Main dashboard page
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── DataTable.tsx          # Main data table component
│   └── DateRangePicker.tsx    # Custom date range picker
├── lib/
│   ├── bigquery.ts           # BigQuery client and queries
│   └── utils.ts              # Utility functions
└── credentials.json          # BigQuery service account credentials
```

## Data Features

- **Normal Mode**: Displays individual records with pagination
- **Aggregated Mode**: When date range is selected, groups data by Ad ID with aggregated metrics
- **Smart Filtering**: Efficient DISTINCT queries for filter dropdown options
- **Type Safety**: SAFE_CAST handling for numeric data fields

## Environment Setup

The application expects BigQuery data to be located in the `asia-southeast1` region. Ensure your BigQuery dataset is properly configured and accessible via the service account credentials.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
