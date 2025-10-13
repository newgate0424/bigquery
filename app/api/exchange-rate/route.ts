import { NextRequest, NextResponse } from 'next/server';

// Primary API (exchangerate-api.com)
const EXCHANGE_API_URL = process.env.EXCHANGE_API_URL || 'https://v6.exchangerate-api.com/v6/531f86c756c6b290472d9f45/latest/USD';

// Fallback APIs (Free APIs)
const FALLBACK_APIS = [
    {
        name: 'fawazahmed0-jsdelivr',
        url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json',
        extractRate: (data: any) => data?.usd?.thb
    },
    {
        name: 'fawazahmed0-cloudflare',
        url: 'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json',
        extractRate: (data: any) => data?.usd?.thb
    },
    {
        name: 'exchangerate-host',
        url: 'https://api.exchangerate.host/latest?base=USD&symbols=THB',
        extractRate: (data: any) => data?.rates?.THB
    }
];

const FALLBACK_RATE = 36.5; // fallback rate
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// In-memory cache
interface CacheEntry {
    rate: number;
    timestamp: Date;
    isFallback: boolean;
    source: string;
}

let cache: CacheEntry | null = null;

async function tryFetchFromAPI(apiUrl: string, extractFn: (data: any) => number, apiName: string): Promise<{ rate: number; source: string } | null> {
    try {
        console.log(`🌐 Trying ${apiName}: ${apiUrl}`);
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'SA-ADS/1.0'
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
            console.log(`❌ ${apiName} failed with status: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const rate = extractFn(data);
        
        if (rate && typeof rate === 'number' && rate > 0) {
            console.log(`✅ ${apiName} success: ${rate} THB`);
            return { rate, source: apiName };
        } else {
            console.log(`❌ ${apiName} invalid rate:`, rate);
            return null;
        }
    } catch (error) {
        console.log(`❌ ${apiName} error:`, error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        // Check for force refresh parameter
        const url = new URL(req.url);
        const forceRefresh = url.searchParams.get('refresh') === 'true';
        
        // Check cache first (skip if force refresh)
        if (!forceRefresh && cache && (Date.now() - cache.timestamp.getTime()) < CACHE_DURATION) {
            console.log(`📋 Returning cached exchange rate: ${cache.rate} from ${cache.source}`);
            return NextResponse.json({
                rate: cache.rate,
                isFallback: cache.isFallback,
                timestamp: cache.timestamp.toISOString(),
                source: `${cache.source}-cached`
            });
        }

        console.log('🔄 Cache expired or refresh requested, fetching fresh exchange rate...');

        // Try primary API first
        const primaryResult = await tryFetchFromAPI(
            EXCHANGE_API_URL,
            (data) => data?.conversion_rates?.THB,
            'exchangerate-api.com'
        );

        if (primaryResult) {
            // Update cache with primary API result
            cache = {
                rate: primaryResult.rate,
                timestamp: new Date(),
                isFallback: false,
                source: primaryResult.source
            };
            
            return NextResponse.json({
                rate: primaryResult.rate,
                isFallback: false,
                timestamp: new Date().toISOString(),
                source: primaryResult.source
            });
        }

        // If primary API fails, try fallback APIs
        console.log('⚠️ Primary API failed, trying fallback APIs...');
        
        for (const fallbackApi of FALLBACK_APIS) {
            const result = await tryFetchFromAPI(
                fallbackApi.url,
                fallbackApi.extractRate,
                fallbackApi.name
            );

            if (result) {
                // Update cache with fallback API result
                cache = {
                    rate: result.rate,
                    timestamp: new Date(),
                    isFallback: false,
                    source: result.source
                };
                
                return NextResponse.json({
                    rate: result.rate,
                    isFallback: false,
                    timestamp: new Date().toISOString(),
                    source: result.source
                });
            }
        }

        // If all APIs fail, but we have cache (even expired), use it
        if (cache) {
            console.log(`📋 All APIs failed, using expired cache: ${cache.rate} from ${cache.source}`);
            return NextResponse.json({
                rate: cache.rate,
                isFallback: cache.isFallback,
                timestamp: cache.timestamp.toISOString(),
                source: `${cache.source}-expired`,
                error: 'All APIs failed, using expired cache'
            });
        }

        // Last resort: use hardcoded fallback
        throw new Error('All APIs failed and no cache available');

    } catch (error) {
        console.error('💥 All exchange rate sources failed:', error);
        
        // Update cache with fallback rate
        cache = {
            rate: FALLBACK_RATE,
            timestamp: new Date(),
            isFallback: true,
            source: 'hardcoded-fallback'
        };
        
        // Return fallback rate
        return NextResponse.json({
            rate: FALLBACK_RATE,
            isFallback: true,
            timestamp: new Date().toISOString(),
            source: 'hardcoded-fallback',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}