import { NextRequest, NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';

const keyFilePath = path.resolve(process.cwd(), 'credentials.json');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '1');
    const year = parseInt(searchParams.get('year') || '2025');

    // Validate parameters
    if (month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid month. Must be between 1 and 12.' }, { status: 400 });
    }

    if (year < 2020 || year > 2030) {
      return NextResponse.json({ error: 'Invalid year. Must be between 2020 and 2030.' }, { status: 400 });
    }

    console.log(`Fetching daily deposits for ${year}-${month.toString().padStart(2, '0')}`);

    const bigquery = new BigQuery({
      keyFilename: keyFilePath,
      projectId: 'sa-ads'
    });

    // Calculate the date range for the specified month
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    console.log(`Date range: ${startDate} to ${endDate}`);

    // Query to get daily deposits grouped by ad_id and day of month
    const query = `
      SELECT 
        adid,
        EXTRACT(DAY FROM date) as day_of_month,
        SUM(SAFE_CAST(deposit AS INT64)) as total_deposit
      FROM \`sa-ads.Gateway_monitor.data_monitor\`
      WHERE date >= '${startDate}' 
        AND date <= '${endDate}'
        AND adid IS NOT NULL
        AND deposit IS NOT NULL
        AND SAFE_CAST(deposit AS INT64) > 0
      GROUP BY adid, EXTRACT(DAY FROM date)
      ORDER BY adid, day_of_month;
    `;

    console.log('Executing daily deposits query:', query);

    const options = {
      location: 'asia-southeast1',
      timeoutMs: 60000,
    };

    const [rows] = await bigquery.query({ ...options, query });
    
    console.log(`Query returned ${rows.length} daily deposit records`);

    // Transform data into the format expected by the frontend
    // Structure: { adid: { day1: amount, day2: amount, ... } }
    const dailyDeposits: Record<string, Record<string, number>> = {};

    rows.forEach((row: { adid: any; day_of_month: any; total_deposit: any }) => {
      const adid = row.adid.toString();
      const day = `day${row.day_of_month}`;
      const deposit = parseInt(row.total_deposit?.toString() || '0');

      if (!dailyDeposits[adid]) {
        dailyDeposits[adid] = {};
      }

      dailyDeposits[adid][day] = deposit;
    });

    console.log(`Processed ${Object.keys(dailyDeposits).length} unique ad IDs`);

    return NextResponse.json({
      success: true,
      data: dailyDeposits,
      month,
      year,
      dateRange: {
        start: startDate,
        end: endDate
      },
      summary: {
        totalAdIds: Object.keys(dailyDeposits).length,
        totalRecords: rows.length
      }
    });

  } catch (error) {
    console.error('Error fetching daily deposits:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch daily deposits',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}