import { NextRequest, NextResponse } from 'next/server';
import { connection } from '@/lib/db';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// Interfaces ตรงตาม sa-ads
interface DailyMetricsRow { 
    team_name: string; 
    record_date: Date; 
    planned_inquiries: string; 
    total_inquiries: string; 
    wasted_inquiries: string; 
    net_inquiries: string; 
    planned_daily_spend: string; 
    actual_spend: string; 
    deposits_count: string; 
    silent_inquiries: string; 
    repeat_inquiries: string; 
    existing_user_inquiries: string; 
    spam_inquiries: string; 
    blocked_inquiries: string; 
    under_18_inquiries: string; 
    over_50_inquiries: string; 
    foreigner_inquiries: string; 
    new_player_value_thb: string; 
}

interface DailyDataPoint { 
    date: string; 
    value: number; 
}

interface TeamMetric {
    team_name: string;
    planned_inquiries: number;
    total_inquiries: number;
    wasted_inquiries: number;
    net_inquiries: number;
    planned_daily_spend: number;
    actual_spend: number;
    cpm_cost_per_inquiry: number;
    facebook_cost_per_inquiry: number;
    deposits_count: number;
    inquiries_per_deposit: number;
    quality_inquiries_per_deposit: number;
    cost_per_deposit: number;
    new_player_value_thb: number;
    one_dollar_per_cover: number;
    page_blocks_7d: number;
    page_blocks_30d: number;
    silent_inquiries: number;
    repeat_inquiries: number;
    existing_user_inquiries: number;
    spam_inquiries: number;
    blocked_inquiries: number;
    under_18_inquiries: number;
    over_50_inquiries: number;
    foreigner_inquiries: number;
    cpm_cost_per_inquiry_daily: DailyDataPoint[];
    deposits_count_daily: DailyDataPoint[];
    cost_per_deposit_daily: DailyDataPoint[];
    one_dollar_per_cover_daily: DailyDataPoint[];
    actual_spend_daily: DailyDataPoint[];
    total_inquiries_daily: DailyDataPoint[];
}

export async function GET(req: NextRequest) {
    try {
        // Get query parameters
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate') || dayjs().startOf('month').format('YYYY-MM-DD');
        const endDate = searchParams.get('endDate') || dayjs().endOf('day').format('YYYY-MM-DD');
        const usdToThbRate = Number(searchParams.get('exchangeRate')) || 36.5;

        console.log('Overview API - Parameters:', { startDate, endDate, exchangeRate: usdToThbRate });

        // Query database for daily metrics
        const query = `
            SELECT *
            FROM daily_metrics
            WHERE record_date BETWEEN ? AND ?
            ORDER BY team_name, record_date ASC
        `;
        const [rows] = await connection.execute(query, [startDate, endDate]);
        const dailyMetricsRows = rows as DailyMetricsRow[];

        console.log('Overview API: Retrieved', dailyMetricsRows.length, 'daily metrics rows from database');
        
        // If no data found, return empty array
        if (dailyMetricsRows.length === 0) {
            console.log('No data found in daily_metrics table for date range:', startDate, 'to', endDate);
            return NextResponse.json([]);
        }

        // Process data into team metrics
        const teamDataMap = new Map<string, TeamMetric>();

        dailyMetricsRows.forEach(row => {
            const teamName = row.team_name;
            const date = dayjs(row.record_date).format('YYYY-MM-DD');
            
            if (!teamDataMap.has(teamName)) {
                teamDataMap.set(teamName, { 
                    team_name: teamName, 
                    planned_inquiries: 0, 
                    total_inquiries: 0, 
                    wasted_inquiries: 0, 
                    net_inquiries: 0, 
                    planned_daily_spend: 0, 
                    actual_spend: 0, 
                    deposits_count: 0, 
                    new_player_value_thb: 0, 
                    cpm_cost_per_inquiry: 0, 
                    cost_per_deposit: 0, 
                    inquiries_per_deposit: 0, 
                    quality_inquiries_per_deposit: 0, 
                    one_dollar_per_cover: 0, 
                    page_blocks_7d: 0, 
                    page_blocks_30d: 0, 
                    silent_inquiries: 0, 
                    repeat_inquiries: 0, 
                    existing_user_inquiries: 0, 
                    spam_inquiries: 0, 
                    blocked_inquiries: 0, 
                    under_18_inquiries: 0, 
                    over_50_inquiries: 0, 
                    foreigner_inquiries: 0, 
                    cpm_cost_per_inquiry_daily: [], 
                    deposits_count_daily: [], 
                    cost_per_deposit_daily: [], 
                    one_dollar_per_cover_daily: [], 
                    facebook_cost_per_inquiry: 0, 
                    actual_spend_daily: [], 
                    total_inquiries_daily: [] 
                });
            }
            
            const team = teamDataMap.get(teamName)!;
            const spend = Number(row.actual_spend);
            const inquiries = Number(row.total_inquiries);
            const deposits = Number(row.deposits_count);
            
            // Aggregate totals
            team.planned_inquiries += Number(row.planned_inquiries);
            team.total_inquiries += inquiries;
            team.wasted_inquiries += Number(row.wasted_inquiries);
            team.net_inquiries += Number(row.net_inquiries);
            team.planned_daily_spend += Number(row.planned_daily_spend);
            team.actual_spend += spend;
            team.deposits_count += deposits;
            team.new_player_value_thb += Number(row.new_player_value_thb);
            team.silent_inquiries += Number(row.silent_inquiries);
            team.repeat_inquiries += Number(row.repeat_inquiries);
            team.existing_user_inquiries += Number(row.existing_user_inquiries);
            team.spam_inquiries += Number(row.spam_inquiries);
            team.blocked_inquiries += Number(row.blocked_inquiries);
            team.under_18_inquiries += Number(row.under_18_inquiries);
            team.over_50_inquiries += Number(row.over_50_inquiries);
            team.foreigner_inquiries += Number(row.foreigner_inquiries);
            
            // Calculate daily values
            const cpmCostDaily = inquiries > 0 ? spend / inquiries : 0;
            const costPerDepositDaily = deposits > 0 ? spend / deposits : 0;
            
            // Add daily data points
            team.cpm_cost_per_inquiry_daily.push({ date, value: cpmCostDaily });
            team.deposits_count_daily.push({ date, value: deposits });
            team.cost_per_deposit_daily.push({ date, value: costPerDepositDaily });
            team.actual_spend_daily.push({ date, value: spend });
            team.total_inquiries_daily.push({ date, value: inquiries });
        });

        // Calculate one_dollar_per_cover_daily for each team
        Array.from(teamDataMap.values()).forEach(team => {
            const teamDailyRows = dailyMetricsRows.filter(r => r.team_name === team.team_name);
            const rowsByMonth = new Map<string, DailyMetricsRow[]>();
            
            teamDailyRows.forEach(row => {
                const monthKey = dayjs(row.record_date).format('YYYY-MM');
                if (!rowsByMonth.has(monthKey)) {
                    rowsByMonth.set(monthKey, []);
                }
                rowsByMonth.get(monthKey)!.push(row);
            });
            
            const final_one_dollar_per_cover_daily: DailyDataPoint[] = [];
            rowsByMonth.forEach((monthRows) => {
                let cumulativeSpendInMonth = 0;
                let cumulativeNewPlayerValueInMonth = 0;
                
                monthRows.forEach(row => {
                    cumulativeSpendInMonth += Number(row.actual_spend);
                    cumulativeNewPlayerValueInMonth += Number(row.new_player_value_thb);
                    const dailyCover = (cumulativeSpendInMonth > 0 && usdToThbRate > 0) ? 
                        cumulativeNewPlayerValueInMonth / cumulativeSpendInMonth / usdToThbRate : 0;
                    final_one_dollar_per_cover_daily.push({ 
                        date: dayjs(row.record_date).format('YYYY-MM-DD'), 
                        value: dailyCover 
                    });
                });
            });
            team.one_dollar_per_cover_daily = final_one_dollar_per_cover_daily;
        });

        // Calculate final metrics for each team
        const teamMetrics: TeamMetric[] = Array.from(teamDataMap.values()).map(team => {
            const totalSpend = team.actual_spend;
            const totalInquiries = team.total_inquiries;
            const totalDeposits = team.deposits_count;
            const totalNewPlayerValue = team.new_player_value_thb;
            
            team.cpm_cost_per_inquiry = totalInquiries > 0 ? totalSpend / totalInquiries : 0;
            team.cost_per_deposit = totalDeposits > 0 ? totalSpend / totalDeposits : 0;
            team.inquiries_per_deposit = totalDeposits > 0 ? totalInquiries / totalDeposits : 0;
            team.quality_inquiries_per_deposit = totalDeposits > 0 ? team.net_inquiries / totalDeposits : 0;
            team.one_dollar_per_cover = (totalSpend > 0 && usdToThbRate > 0) ? 
                totalNewPlayerValue / totalSpend / usdToThbRate : 0;
            team.facebook_cost_per_inquiry = team.cpm_cost_per_inquiry; // Same as CPM for now
            
            return team;
        });
        
        console.log('Overview API: Returning data for', teamMetrics.length, 'teams with date range:', startDate, 'to', endDate, 'exchange rate:', usdToThbRate);
        return NextResponse.json(teamMetrics);
        
    } catch (error: any) {
        console.error('Overview API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
