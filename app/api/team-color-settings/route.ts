import { NextRequest, NextResponse } from 'next/server';

interface TeamColorSettingDB {
    team_name: string;
    field_name: string;
    text_color_rules: string; // JSON string
    background_color_rules: string; // JSON string
}

interface ThresholdRule {
    id: string;
    operator: '>' | '<';
    threshold: number;
    color: string;
}

interface FieldColorSettings {
    textColorRules: ThresholdRule[];
    backgroundColorRules: ThresholdRule[];
}

type TeamColorSettings = Record<string, Record<string, FieldColorSettings>>;

// Mock database - ใน production ควรใช้ฐานข้อมูลจริง
let mockDatabase: TeamColorSettingDB[] = [];

export async function GET() {
    try {
        // ใน production ควร query จากฐานข้อมูลจริง
        // const result = await db.query('SELECT * FROM team_color_settings');
        console.log('Loading color settings from mock database');
        return NextResponse.json(mockDatabase);
    } catch (error) {
        console.error('Error fetching team color settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { teamNames, settings }: { teamNames: string[], settings: Record<string, FieldColorSettings> } = body;

        if (!teamNames || !Array.isArray(teamNames) || !settings) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        console.log('Saving color settings for teams:', teamNames);
        console.log('Settings:', JSON.stringify(settings, null, 2));

        // ลบการตั้งค่าเดิมสำหรับทีมเหล่านี้
        mockDatabase = mockDatabase.filter(setting => !teamNames.includes(setting.team_name));

        // เพิ่มการตั้งค่าใหม่
        for (const teamName of teamNames) {
            for (const [fieldName, fieldSettings] of Object.entries(settings)) {
                const dbRecord: TeamColorSettingDB = {
                    team_name: teamName,
                    field_name: fieldName,
                    text_color_rules: JSON.stringify(fieldSettings.textColorRules || []),
                    background_color_rules: JSON.stringify(fieldSettings.backgroundColorRules || [])
                };
                mockDatabase.push(dbRecord);
            }
        }

        // บันทึกลง localStorage (client-side จะ sync กับข้อมูลนี้)
        const localStorage_key = 'team-color-settings';
        
        // ใน production ควรบันทึกลงฐานข้อมูลจริง
        // const insertQuery = `
        //     INSERT INTO team_color_settings (team_name, field_name, text_color_rules, background_color_rules)
        //     VALUES (?, ?, ?, ?)
        //     ON DUPLICATE KEY UPDATE
        //     text_color_rules = VALUES(text_color_rules),
        //     background_color_rules = VALUES(background_color_rules)
        // `;
        
        console.log('✅ Color settings saved successfully');
        console.log('Total settings in database:', mockDatabase.length);

        return NextResponse.json({ 
            success: true, 
            message: 'Settings saved successfully',
            savedCount: teamNames.length * Object.keys(settings).length
        });

    } catch (error) {
        console.error('Error saving team color settings:', error);
        return NextResponse.json({ 
            error: 'Failed to save settings',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const teamName = url.searchParams.get('team');
        const fieldName = url.searchParams.get('field');

        if (!teamName) {
            return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
        }

        // ลบการตั้งค่าตามเงื่อนไข
        const initialCount = mockDatabase.length;
        if (fieldName) {
            // ลบเฉพาะ field ที่ระบุ
            mockDatabase = mockDatabase.filter(setting => 
                !(setting.team_name === teamName && setting.field_name === fieldName)
            );
        } else {
            // ลบทั้งหมดของทีม
            mockDatabase = mockDatabase.filter(setting => setting.team_name !== teamName);
        }
        
        const deletedCount = initialCount - mockDatabase.length;
        console.log(`Deleted ${deletedCount} color settings for team: ${teamName}${fieldName ? `, field: ${fieldName}` : ''}`);

        return NextResponse.json({ 
            success: true, 
            message: `Deleted ${deletedCount} settings`,
            deletedCount 
        });

    } catch (error) {
        console.error('Error deleting team color settings:', error);
        return NextResponse.json({ error: 'Failed to delete settings' }, { status: 500 });
    }
}