// app/api/monitor-stream/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connection } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection message
            const data = `data: ${JSON.stringify({ 
                type: 'connected', 
                message: 'Connected to monitor updates',
                timestamp: new Date().toISOString()
            })}\n\n`;
            controller.enqueue(encoder.encode(data));

            // Set up polling to check for data changes
            const pollInterval = setInterval(async () => {
                try {
                    // Query to get latest record timestamp
                    const query = `
                        SELECT 
                            MAX(record_date) as latest_update,
                            COUNT(*) as total_records
                        FROM daily_metrics 
                        WHERE record_date >= CURDATE() - INTERVAL 7 DAYS
                    `;
                    
                    const [rows] = await connection.execute(query);
                    const result = rows as any[];
                    
                    if (result.length > 0) {
                        const updateData = `data: ${JSON.stringify({
                            type: 'data-update',
                            latest_update: result[0].latest_update,
                            total_records: result[0].total_records,
                            timestamp: new Date().toISOString()
                        })}\n\n`;
                        
                        controller.enqueue(encoder.encode(updateData));
                    }
                } catch (error) {
                    console.error('Error polling for updates:', error);
                    const errorData = `data: ${JSON.stringify({
                        type: 'error',
                        message: 'Error checking for updates',
                        timestamp: new Date().toISOString()
                    })}\n\n`;
                    controller.enqueue(encoder.encode(errorData));
                }
            }, 30000); // Poll every 30 seconds

            // Heartbeat to keep connection alive
            const heartbeatInterval = setInterval(() => {
                const heartbeat = `data: ${JSON.stringify({
                    type: 'heartbeat',
                    timestamp: new Date().toISOString()
                })}\n\n`;
                controller.enqueue(encoder.encode(heartbeat));
            }, 15000); // Heartbeat every 15 seconds

            // Cleanup function
            const cleanup = () => {
                clearInterval(pollInterval);
                clearInterval(heartbeatInterval);
            };

            // Handle client disconnect
            req.signal.addEventListener('abort', () => {
                cleanup();
                controller.close();
            });

            // Keep reference to cleanup function
            (controller as any).cleanup = cleanup;
        },
        cancel() {
            // Cleanup when stream is cancelled
            if ((this as any).cleanup) {
                (this as any).cleanup();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Cache-Control',
        },
    });
}