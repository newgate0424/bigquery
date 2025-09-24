/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';
import { verifyJwt } from '@/lib/jwt';
import { getUserByUsername } from '@/lib/user';

const keyFilePath = path.resolve(process.cwd(), 'credentials.json');

export async function GET(request: Request) {
  try {
    console.log('Fetching filter options...');
    
    // ตรวจสอบ authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.headers.get('cookie')?.split(';')
                    .find(c => c.trim().startsWith('token='))?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const payload = verifyJwt(token);
    if (!payload || !payload.username) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // ดึงข้อมูลผู้ใช้
    const user = await getUserByUsername(payload.username as string);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const bigquery = new BigQuery({
      keyFilename: keyFilePath,
      projectId: 'sa-ads'
    });

    const options = {
      location: 'asia-southeast1',
      timeoutMs: 30000, // 30 seconds timeout
    };

    // Get unique adsers and statuses from 2025 data
    const adserQuery = `
      SELECT DISTINCT adser
      FROM \`sa-ads.Gateway_monitor.data_monitor\`
      WHERE date >= '2025-01-01' AND adser IS NOT NULL AND adser != ''
      ORDER BY adser;
    `;

    const statusQuery = `
      SELECT DISTINCT status
      FROM \`sa-ads.Gateway_monitor.data_monitor\`
      WHERE date >= '2025-01-01' AND status IS NOT NULL AND status != ''
      ORDER BY status;
    `;

    const teamQuery = `
      SELECT DISTINCT team
      FROM \`sa-ads.Gateway_monitor.data_monitor\`
      WHERE date >= '2025-01-01' AND team IS NOT NULL AND team != ''
      ORDER BY team;
    `;

    // Execute all queries in parallel
    const [adserResult, statusResult, teamResult] = await Promise.all([
      bigquery.query({ ...options, query: adserQuery }),
      bigquery.query({ ...options, query: statusQuery }),
      bigquery.query({ ...options, query: teamQuery })
    ]);

    const [adserRows] = adserResult;
    const [statusRows] = statusResult;
    const [teamRows] = teamResult;

    const adsers = adserRows.map(row => row.adser);
    const statuses = statusRows.map(row => row.status);
    let teams = teamRows.map(row => row.team);
    
    // กรองทีมตาม user role
    if (user.role === 'staff' && (user as any).teams) {
      const userTeams = (user as any).teams as string[];
      teams = teams.filter(team => userTeams.includes(team));
    }

    console.log(`Found ${adsers.length} unique adsers, ${statuses.length} unique statuses, and ${teams.length} unique teams (filtered for ${user.role})`);

    // Create team-advertiser mapping (กรองตาม teams ที่ user มีสิทธิ์)
    let teamAdvertiserQuery = `
      SELECT DISTINCT team, adser
      FROM \`sa-ads.Gateway_monitor.data_monitor\`
      WHERE date >= '2025-01-01' 
        AND team IS NOT NULL AND team != ''
        AND adser IS NOT NULL AND adser != ''`;
    
    // เพิ่มเงื่อนไข team filter สำหรับ staff
    if (user.role === 'staff' && (user as any).teams) {
      const userTeams = (user as any).teams as string[];
      const teamList = userTeams.map(team => `'${team}'`).join(', ');
      teamAdvertiserQuery += ` AND team IN (${teamList})`;
    }
    
    teamAdvertiserQuery += ` ORDER BY team, adser;`;

    const [teamAdvertiserResult] = await bigquery.query({ ...options, query: teamAdvertiserQuery });
    const teamAdvertiserMapping: Record<string, string[]> = {};
    
    teamAdvertiserResult.forEach(row => {
      if (!teamAdvertiserMapping[row.team]) {
        teamAdvertiserMapping[row.team] = [];
      }
      if (!teamAdvertiserMapping[row.team].includes(row.adser)) {
        teamAdvertiserMapping[row.team].push(row.adser);
      }
    });

    return NextResponse.json({
      adsers,
      statuses,
      teams,
      teamAdvertiserMapping
    });

  } catch (error) {
    console.error('Filter API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}