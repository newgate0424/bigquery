import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { adserTeamGroups, cpmThresholds, costPerDepositThresholds, depositsMonthlyTargets, coverTargets, calculateDailyTarget, calculateMonthlyTarget } from '@/lib/bigquery-adser-config'

// Create MySQL connection
const createConnection = async () => {
  const url = process.env.ADSER_DATABASE_URL;
  if (!url) {
    throw new Error('ADSER_DATABASE_URL is not defined');
  }
  return mysql.createConnection(url);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const connection = await createConnection()

    // Generate mock team data based on adserTeamGroups
    const teamData = []

    for (const [groupName, teamNames] of Object.entries(adserTeamGroups)) {
      for (const adserName of teamNames) {
        // Generate mock data for each team
        const team = {
          teamName: adserName,
          totalClicks: Math.floor(Math.random() * 10000) + 1000,
          totalCPC: Math.random() * 2 + 0.5,
          totalDeposits: Math.floor(Math.random() * 500) + 50,
          averageCPM: Math.random() * 3 + 1,
          totalCostPerDeposit: Math.random() * 50 + 10,
          averageQualityScore: Math.random() * 3 + 7,
          dailyCoverTarget: Math.random() * 20 + 5
        }
        teamData.push(team)
      }
    }

    await connection.end()

    return NextResponse.json({
      teamData,
      lastUpdate: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching summary data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}