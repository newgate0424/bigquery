import { NextRequest, NextResponse } from 'next/server';

const EXCHANGE_API_URL = process.env.EXCHANGE_API_URL || 'https://v6.exchangerate-api.com/v6/531f86c756c6b290472d9f45/latest/USD';
const FALLBACK_RATE = 36.5; // fallback rate

export async function GET(req: NextRequest) {
    try {
        // Try to fetch from external API
        const response = await fetch(EXCHANGE_API_URL, {
            headers: {
                'User-Agent': 'SA-ADS/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result === 'success' && data.conversion_rates && data.conversion_rates.THB) {
            return NextResponse.json({
                rate: data.conversion_rates.THB,
                isFallback: false,
                timestamp: new Date().toISOString(),
                source: 'exchangerate-api.com'
            });
        } else {
            throw new Error('Invalid API response format');
        }
    } catch (error) {
        console.error('Exchange rate API error:', error);
        
        // Return fallback rate
        return NextResponse.json({
            rate: FALLBACK_RATE,
            isFallback: true,
            timestamp: new Date().toISOString(),
            source: 'fallback',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}