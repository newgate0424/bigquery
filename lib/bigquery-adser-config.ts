// lib/bigquery-adser-config.ts
import dayjs from 'dayjs';

export const fontSizes = [
    { name: 'เล็ก', size: '14px' },
    { name: 'ปกติ', size: '16px' },
    { name: 'ใหญ่', size: '18px' },
];

export const backgroundStyles = {
    'Classic': [
        { name: 'Default', class: 'bg-gradient-default', previewClass: 'preview-gradient-default' },
        { name: 'Ocean', class: 'bg-gradient-ocean', previewClass: 'preview-gradient-ocean' },
        { name: 'Sunset', class: 'bg-gradient-sunset', previewClass: 'preview-gradient-sunset' },
        { name: 'Forest', class: 'bg-gradient-forest', previewClass: 'preview-gradient-forest' },
    ],
    'Vivid': [
        { name: 'Mango', class: 'bg-gradient-mango', previewClass: 'preview-gradient-mango' },
        { name: 'Lavender', class: 'bg-gradient-lavender', previewClass: 'preview-gradient-lavender' },
        { name: 'Emerald', class: 'bg-gradient-emerald', previewClass: 'preview-gradient-emerald' },
        { name: 'Crimson', class: 'bg-gradient-crimson', previewClass: 'preview-gradient-crimson' },
    ],
    'Monochrome': [
        { name: 'Gray', class: 'bg-gradient-gray', previewClass: 'preview-gradient-gray' },
        { name: 'Silver', class: 'bg-gradient-silver', previewClass: 'preview-gradient-silver' },
    ],
    'Premium': [
        { name: 'Blue Theme', class: 'bg-gradient-blue-theme', previewClass: 'preview-gradient-blue-theme' },
        { name: 'Deep Blue', class: 'bg-gradient-deep-blue', previewClass: 'preview-gradient-deep-blue' },
        { name: 'Gold', class: 'bg-gradient-premium', previewClass: 'preview-gradient-premium' },
    ]
};

// สำหรับ bigquery - ใช้ team mapping จากข้อมูล bigquery
export const adserTeamGroups: { [key: string]: string[] } = {
    'สาวอ้อย': ['Boogey', 'Bubble'],
    'อลิน': ['Lucifer', 'Risa'],
    'อัญญา C': ['Shazam', 'Vivien'],
    'อัญญา D': ['Sim', 'Joanne'],
    'Spezbar': ['Cookie', 'Piea'],
    'Barlance': ['บาล้าน', 'หวยม้า'],
    'Football Area': ['Thomas', 'IU', 'Nolan'],
    'Football Area(Haru)': ['Minho', 'Bailu']
};

// CPM thresholds สำหรับแต่ละ adser
export const cpmThresholds: { [key: string]: number } = {
    'Boogey': 2.0, 'Bubble': 2.0, 'Lucifer': 2.0, 'Risa': 2.0,
    'Shazam': 2.0, 'Vivien': 2.0, 'Sim': 1.8, 'Joanne': 1.8,
    'Cookie': 4.0, 'Piea': 4.0, 'บาล้าน': 4.0, 'หวยม้า': 4.0,
    'Thomas': 5.0, 'IU': 5.0, 'Nolan': 5.0, 'Minho': 5.0, 'Bailu': 5.0,
    'default': 2.5
};

export const cpmYAxisMax: { [key: string]: number } = {
    'Boogey': 2.5, 'Bubble': 2.5, 'Lucifer': 2.5, 'Risa': 2.5,
    'Shazam': 2.5, 'Vivien': 2.5, 'Sim': 2.5, 'Joanne': 2.5,
    'Cookie': 6, 'Piea': 6, 'บาล้าน': 6, 'หวยม้า': 6,
    'Thomas': 6, 'IU': 6, 'Nolan': 6, 'Minho': 6, 'Bailu': 6,
};

export const costPerDepositThresholds: { [key: string]: number } = {
    'Boogey': 25, 'Bubble': 25, 'Lucifer': 25, 'Risa': 25,
    'Shazam': 25, 'Vivien': 25, 'Sim': 25, 'Joanne': 25,
    'Cookie': 55, 'Piea': 55, 'บาล้าน': 55, 'หวยม้า': 55,
    'Thomas': 65, 'IU': 65, 'Nolan': 65, 'Minho': 65, 'Bailu': 65,
    'default': 30
};

export const costPerDepositYAxisMax: { [key: string]: number } = {
    'Boogey': 30, 'Bubble': 30, 'Lucifer': 30, 'Risa': 30,
    'Shazam': 30, 'Vivien': 30, 'Sim': 30, 'Joanne': 30,
    'Cookie': 65, 'Piea': 65, 'บาล้าน': 65, 'หวยม้า': 65,
    'Thomas': 80, 'IU': 80, 'Nolan': 80, 'Minho': 80, 'Bailu': 80,
};

export const depositsMonthlyTargets: { [key: string]: number } = {
    'Boogey': 1400, 'Bubble': 1400, 'Lucifer': 1400, 'Risa': 1400,
    'Shazam': 1400, 'Vivien': 1400, 'Sim': 1400, 'Joanne': 1400,
    'Cookie': 1200, 'Piea': 1200, 'บาล้าน': 600, 'หวยม้า': 600,
    'Thomas': 900, 'IU': 900, 'Nolan': 900, 'Minho': 450, 'Bailu': 450,
    'default': 50
};

export const coverTargets: { [key: string]: number } = {
    'สาวอ้อย': 70, 'อลิน': 70, 'อัญญา C': 70, 'อัญญา D': 70,
    'Spezbar': 25, 'Barlance': 25,
    'Football Area': 25, 'Football Area(Haru)': 25,
    'default': 10
};

// ✅ เพิ่ม parameter teamSize เพื่อหารตามจำนวนคนในทีม
export const calculateDailyTarget = (monthlyTarget: number, dateString: string, teamSize: number = 1): number => {
    const totalDaysInMonth = dayjs(dateString).daysInMonth();
    const dailyTarget = monthlyTarget / totalDaysInMonth;
    return Math.ceil(dailyTarget / teamSize); // ใช้ Math.ceil เพื่อปัดเศษขึ้น
};

// ✅ เพิ่มฟังก์ชันสำหรับคำนวณเป้าหมายรายเดือนต่อคน
export const calculateMonthlyTarget = (monthlyTarget: number, teamSize: number = 1): number => {
    return Math.ceil(monthlyTarget / teamSize); // ใช้ Math.ceil เพื่อปัดเศษขึ้น
};
