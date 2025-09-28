// app/api/adser/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { adserTeamGroups } from '@/lib/adser-config';

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
    deposits_count: number;
    new_player_value_thb: number;
    cpm_cost_per_inquiry: number;
    cost_per_deposit: number;
    inquiries_per_deposit: number;
    quality_inquiries_per_deposit: number;
    one_dollar_per_cover: number;
    silent_inquiries: number;
    repeat_inquiries: number;
    existing_user_inquiries: number;
    spam_inquiries: number;
    blocked_inquiries: number;
    under_18_inquiries: number;
    over_50_inquiries: number;
    foreigner_inquiries: number;
    cpm_cost_per_inquiry_daily: DailyDataPoint[];
    cost_per_deposit_daily: DailyDataPoint[];
    deposits_count_daily: DailyDataPoint[];
    one_dollar_per_cover_daily: DailyDataPoint[];
    actual_spend_daily: DailyDataPoint[];
    total_inquiries_daily: DailyDataPoint[];
    new_player_value_thb_daily: DailyDataPoint[];
}

// Create MySQL connection using ADSER_DATABASE_URL
const createConnection = async () => {
    const url = process.env.ADSER_DATABASE_URL;
    if (!url) {
        throw new Error('ADSER_DATABASE_URL is not defined');
    }
    return mysql.createConnection(url);
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate') || dayjs().startOf('day').format('YYYY-MM-DD');
        const endDate = searchParams.get('endDate') || dayjs().endOf('day').format('YYYY-MM-DD');
        const usdToThbRate = Number(searchParams.get('exchangeRate')) || 36.5;

        const allAdserTeams = Object.values(adserTeamGroups).flat();

        if (allAdserTeams.length === 0) {
            return NextResponse.json([]);
        }

        const connection = await createConnection();
        
        const placeholders = allAdserTeams.map(() => '?').join(',');
        const query = `
            SELECT *
            FROM daily_metrics
            WHERE record_date BETWEEN ? AND ?
            AND team_name IN (${placeholders})
            ORDER BY team_name, record_date ASC
        `;
        const params = [startDate, endDate, ...allAdserTeams];
        const [rows] = await connection.execute(query, params);
        const dailyMetricsRows = rows as DailyMetricsRow[];
        
        const teamDataMap = new Map<string, TeamMetric>();

        dailyMetricsRows.forEach(row => {
            const teamName = row.team_name;
            const date = dayjs(row.record_date).format('YYYY-MM-DD');
            if (!teamDataMap.has(teamName)) {
                teamDataMap.set(teamName, {
                    team_name: teamName, planned_inquiries: 0, total_inquiries: 0, wasted_inquiries: 0,
                    net_inquiries: 0, planned_daily_spend: 0, actual_spend: 0, deposits_count: 0,
                    new_player_value_thb: 0, cpm_cost_per_inquiry: 0, cost_per_deposit: 0,
                    inquiries_per_deposit: 0, quality_inquiries_per_deposit: 0, one_dollar_per_cover: 0,
                    silent_inquiries: 0, repeat_inquiries: 0, existing_user_inquiries: 0,
                    spam_inquiries: 0, blocked_inquiries: 0, under_18_inquiries: 0,
                    over_50_inquiries: 0, foreigner_inquiries: 0,
                    cpm_cost_per_inquiry_daily: [],
                    cost_per_deposit_daily: [],
                    deposits_count_daily: [],
                    one_dollar_per_cover_daily: [],
                    actual_spend_daily: [],
                    total_inquiries_daily: [],
                    new_player_value_thb_daily: []
                });
            }
            const team = teamDataMap.get(teamName)!;
            const spend = Number(row.actual_spend);
            const inquiries = Number(row.total_inquiries);
            const deposits = Number(row.deposits_count);
            const npv = Number(row.new_player_value_thb);

            // Accumulate totals for the summary row
            team.planned_inquiries += Number(row.planned_inquiries);
            team.total_inquiries += inquiries;
            team.wasted_inquiries += Number(row.wasted_inquiries);
            team.net_inquiries += Number(row.net_inquiries);
            team.planned_daily_spend += Number(row.planned_daily_spend);
            team.actual_spend += spend;
            team.deposits_count += deposits;
            team.new_player_value_thb += npv;
            team.silent_inquiries += Number(row.silent_inquiries);
            team.repeat_inquiries += Number(row.repeat_inquiries);
            team.existing_user_inquiries += Number(row.existing_user_inquiries);
            team.spam_inquiries += Number(row.spam_inquiries);
            team.blocked_inquiries += Number(row.blocked_inquiries);
            team.under_18_inquiries += Number(row.under_18_inquiries);
            team.over_50_inquiries += Number(row.over_50_inquiries);
            team.foreigner_inquiries += Number(row.foreigner_inquiries);

            // Store daily calculated values for "daily" graph view
            const cmpCostDaily = inquiries > 0 ? spend / inquiries : 0;
            const costPerDepositDaily = deposits > 0 ? spend / deposits : 0;
            team.cpm_cost_per_inquiry_daily.push({ date, value: cmpCostDaily });
            team.cost_per_deposit_daily.push({ date, value: costPerDepositDaily });

            // Store raw daily data for correct "monthly" graph calculation
            team.actual_spend_daily.push({ date, value: spend });
            team.total_inquiries_daily.push({ date, value: inquiries });
            team.deposits_count_daily.push({ date, value: deposits });
            team.new_player_value_thb_daily.push({ date, value: npv });
        });

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
                    const dailyCover = (cumulativeSpendInMonth > 0 && usdToThbRate > 0)
                        ? cumulativeNewPlayerValueInMonth / cumulativeSpendInMonth / usdToThbRate
                        : 0;
                    final_one_dollar_per_cover_daily.push({
                        date: dayjs(row.record_date).format('YYYY-MM-DD'),
                        value: dailyCover
                    });
                });
            });
            team.one_dollar_per_cover_daily = final_one_dollar_per_cover_daily;
        });

        const teamMetrics: TeamMetric[] = Array.from(teamDataMap.values()).map(team => {
            const totalSpend = team.actual_spend;
            const totalInquiries = team.total_inquiries;
            const totalDeposits = team.deposits_count;
            const totalNewPlayerValue = team.new_player_value_thb;
            team.cpm_cost_per_inquiry = totalInquiries > 0 ? totalSpend / totalInquiries : 0;
            team.cost_per_deposit = totalDeposits > 0 ? totalSpend / totalDeposits : 0;
            team.inquiries_per_deposit = totalDeposits > 0 ? totalInquiries / totalDeposits : 0;
            team.quality_inquiries_per_deposit = totalDeposits > 0 ? team.net_inquiries / totalDeposits : 0;
            team.one_dollar_per_cover = (totalSpend > 0 && usdToThbRate > 0)
                ? totalNewPlayerValue / totalSpend / usdToThbRate
                : 0;
            return team;
        });

        await connection.end();
        return NextResponse.json(teamMetrics);

    } catch (error: unknown) {
        console.error('Error in API route (adser):', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
    }
}