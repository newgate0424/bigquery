'use client';

import { useEffect, useState, memo, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-context';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adserTeamGroups, cpmThresholds, costPerDepositThresholds, depositsMonthlyTargets, calculateDailyTarget, calculateMonthlyTarget, coverTargets } from '@/lib/adser-config';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Label } from 'recharts';
import useSWR from 'swr';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Wifi, ChevronRight, ChevronLeft, TrendingUp, Settings, PlusCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.locale('th');

// --- Interfaces & Types ---
export type ThresholdRule = {
    id: string;
    operator: '>' | '<';
    threshold: number;
    color: string;
};

export type FieldColorSettings = {
    textColorRules: ThresholdRule[];
    backgroundColorRules: ThresholdRule[];
};

type AllTeamsColorSettings = Record<string, Record<string, FieldColorSettings>>;

interface TeamColorSettingDB {
    team_name: string;
    field_name: string;
    text_color_rules: string; // JSON string
    background_color_rules: string; // JSON string
}

interface DailyDataPoint {
    date: string;
    value: number;
}
interface TeamMetric {
    team_name: string;
    total_inquiries: number;
    planned_inquiries: number;
    actual_spend: number;
    planned_daily_spend: number;
    net_inquiries: number;
    wasted_inquiries: number;
    deposits_count: number;
    cpm_cost_per_inquiry: number;
    cost_per_deposit: number;
    new_player_value_thb: number;
    one_dollar_per_cover: number;
    cpm_cost_per_inquiry_daily: DailyDataPoint[];
    cost_per_deposit_daily: DailyDataPoint[];
    deposits_count_daily: DailyDataPoint[];
    one_dollar_per_cover_daily: DailyDataPoint[];
    silent_inquiries: number;
    repeat_inquiries: number;
    existing_user_inquiries: number;
    spam_inquiries: number;
    blocked_inquiries: number;
    under_18_inquiries: number;
    over_50_inquiries: number;
    foreigner_inquiries: number;
    actual_spend_daily: DailyDataPoint[];
    total_inquiries_daily: DailyDataPoint[];
    new_player_value_thb_daily: DailyDataPoint[];
}
interface TransformedChartData {
    date: string;
    [key: string]: any;
}

// --- Constants & Configs ---
const teamColors: { [key: string]: string } = {
    'Boogey': '#3b82f6', 'Bubble': '#16a34a', 'Lucifer': '#db2777', 'Risa': '#f78c00ff',
    'Shazam': '#5f6669ff', 'Vivien': '#dc266cff', 'Sim': '#f59e0b', 'Joanne': '#0181a1ff',
    'Cookie': '#3b82f6', 'Piea': '#16a34a', 'บาล้าน': '#db2777', 'หวยม้า': '#f78c00ff',
    'Thomas': '#5f6669ff', 'IU': '#dc266cff', 'Nolan': '#f59e0b', 'Minho': '#0181a1ff',
    'Bailu': '#3b82f6',
};
const groupYAxisMax: { [key: string]: { cpm: number; costPerDeposit: number; cover: number; } } = {
    'สาวอ้อย': { cpm: 2.5, costPerDeposit: 35, cover: 15 },
    'อลิน': { cpm: 2.5, costPerDeposit: 35, cover: 15 },
    'อัญญา C': { cpm: 2.5, costPerDeposit: 35, cover: 15 },
    'อัญญา D': { cpm: 2.5, costPerDeposit: 35, cover: 15 },
    'Spezbar': { cpm: 4.5, costPerDeposit: 80, cover: 10 },
    'Barlance': { cpm: 4.5, costPerDeposit: 80, cover: 10 },
    'Football Area': { cpm: 6.5, costPerDeposit: 120, cover: 8 },
    'Football Area(Haru)': { cpm: 6.5, costPerDeposit: 120, cover: 8 },
};
const filterFrameClass = "inline-flex items-center gap-1 rounded-md border border-input bg-muted/50 h-9 px-2 shadow-sm";
const allConfigurableFields = {
    net_inquiries: { name: 'ยอดทักสุทธิ', unit: null },
    wasted_inquiries: { name: 'ยอดเสีย', unit: '%' },
    cpm_cost_per_inquiry: { name: 'CPM', unit: '$' },
    deposits_count: { name: 'ยอดเติม', unit: null },
    cost_per_deposit: { name: 'ทุน/เติม', unit: '$' },
    new_player_value_thb: { name: 'ยอดเล่นใหม่', unit: '฿' },
    one_dollar_per_cover: { name: '1$/Cover', unit: '$' },
    silent_inquiries: { name: 'เงียบ', unit: '%' },
    repeat_inquiries: { name: 'ซ้ำ', unit: '%' },
    existing_user_inquiries: { name: 'มียูส', unit: '%' },
    spam_inquiries: { name: 'ก่อกวน', unit: '%' },
    blocked_inquiries: { name: 'บล็อก', unit: '%' },
    under_18_inquiries: { name: '<18', unit: '%' },
    over_50_inquiries: { name: '>50', unit: '%' },
    foreigner_inquiries: { name: 'ต่างชาติ', unit: '%' }
};
const initialColorSettings: AllTeamsColorSettings = {};

// --- Helper Functions ---
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch')));
const formatNumber = (value: number | string, options: Intl.NumberFormatOptions = {}): string => {
    const num = Number(value);
    return isNaN(num) ? '0' : num.toLocaleString('en-US', options);
};

// --- UI Components ---
const RealTimeStatus = memo(({ lastUpdate }: { lastUpdate: Date | null }) => {
    const [timeAgo, setTimeAgo] = useState('');
    useEffect(() => {
        const update = () => lastUpdate && setTimeAgo(dayjs(lastUpdate).fromNow());
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [lastUpdate]);
    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            <Wifi className="h-3 w-3 text-green-500" />
            <span className="text-green-600">อัพเดท: {timeAgo}</span>
        </div>
    );
});
RealTimeStatus.displayName = 'RealTimeStatus';

const ExchangeRateSmall = memo(({ rate, isLoading, isFallback }: { rate: number | null, isLoading: boolean, isFallback: boolean }) => {
    if (isLoading) return <Skeleton className="h-6 w-16" />;
    return (
        <div className={cn("rounded px-2 py-1 text-xs font-medium", isFallback ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700")}>
            {isFallback && "⚠️ "}฿{rate ? formatNumber(rate, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
        </div>
    );
});
ExchangeRateSmall.displayName = 'ExchangeRateSmall';

const ProgressCell = memo(({ value, total, isCurrency = false }: { value: number; total: number; isCurrency?: boolean }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const progressBarColor = isCurrency ? (percentage > 150 ? 'bg-red-500/80' : percentage > 100 ? 'bg-yellow-400/80' : 'bg-green-500/80') : (percentage >= 100 ? 'bg-green-500/80' : percentage >= 80 ? 'bg-yellow-400/80' : 'bg-red-500/80');
    return (
        <div className="flex flex-col w-36">
            <div className="flex justify-between items-baseline text-sm">
                <span className="font-medium">{isCurrency ? '$' : ''}{formatNumber(value, { maximumFractionDigits: 0 })}</span>
                <span className="text-xs text-muted-foreground">/ {formatNumber(total)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={cn('h-full', progressBarColor)} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
                <span className="text-sm font-medium text-primary w-12 text-right">{percentage.toFixed(1)}%</span>
            </div>
        </div>
    );
});
ProgressCell.displayName = 'ProgressCell';

const FinancialMetric = memo(({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) => (
    <div className="text-sm font-medium">
        {prefix}{formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
    </div>
));
FinancialMetric.displayName = 'FinancialMetric';

const BreakdownCell = memo(({ value, total }: { value: number, total: number }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="text-center w-[60px] flex-shrink-0 mx-auto">
            <div className="text-sm font-medium leading-tight">{formatNumber(value)}</div>
            <div className="text-xs text-muted-foreground leading-tight">({percentage.toFixed(1)}%)</div>
        </div>
    );
});

const GroupedChart = memo(({ title, data, yAxisLabel, loading, teamsToShow, chartType, dateForTarget, yAxisDomainMax, groupName, graphView }: { title: string; data: TransformedChartData[]; yAxisLabel: string; loading: boolean; teamsToShow: string[]; chartType: 'cpm' | 'costPerDeposit' | 'deposits' | 'cover'; dateForTarget?: Date; yAxisDomainMax?: number; groupName?: string; graphView: 'daily' | 'monthly'; }) => {
    const previousDataRef = useRef<TransformedChartData[]>([]);
    const displayData = useMemo(() => {
        if (loading && previousDataRef.current.length > 0) return previousDataRef.current;
        if (!loading && data.length > 0) previousDataRef.current = data;
        return data;
    }, [data, loading]);
    const formatYAxis = (tickItem: number) => `${yAxisLabel}${tickItem.toFixed(1)}`;
    const tickFormatter = (date: string) => graphView === 'monthly' ? dayjs(date).format('MMM') : dayjs(date).format('DD');
    const targets = useMemo(() => {
        const targetMap = new Map<string, number>();
        teamsToShow.forEach(teamName => {
            if (chartType === 'cpm') targetMap.set(teamName, cpmThresholds[teamName] || 0);
            else if (chartType === 'costPerDeposit') targetMap.set(teamName, costPerDepositThresholds[teamName] || 0);
            else if (chartType === 'deposits' && dateForTarget) {
                const monthlyTarget = depositsMonthlyTargets[teamName] || 0;
                const teamSize = teamsToShow.length;
                targetMap.set(teamName, graphView === 'monthly' ? calculateMonthlyTarget(monthlyTarget, teamSize) : calculateDailyTarget(monthlyTarget, dayjs(dateForTarget).format('YYYY-MM-DD'), teamSize));
            } else if (chartType === 'cover' && groupName && coverTargets[groupName]) {
                targetMap.set(teamName, coverTargets[groupName]);
            }
        });
        return targetMap;
    }, [chartType, dateForTarget, teamsToShow, groupName, graphView]);

    if (loading && displayData.length === 0) return <Skeleton className="w-full h-[250px]" />;

    return (
        <Card>
            <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center justify-between">
                    {title}
                    {loading && displayData.length > 0 && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayData} margin={{ top: 5, right: 30, left: -10, bottom: 20 }} key={`${title}-${graphView}`}>
                        <XAxis dataKey="date" tickFormatter={tickFormatter} tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 10 }} domain={[0, yAxisDomainMax || 'auto']} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} formatter={(value: number, name: string) => [`${yAxisLabel}${formatNumber(value, { maximumFractionDigits: 2 })}`, name]} labelFormatter={(label) => dayjs(label).format('D MMMM YY')} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        {teamsToShow.map(teamName => <Line key={teamName} type="monotone" dataKey={teamName} stroke={teamColors[teamName] || '#8884d8'} strokeWidth={1.5} dot={{ r: 2 }} activeDot={{ r: 5 }} />)}
                        {chartType === 'cover' && groupName && coverTargets[groupName] && <ReferenceLine y={coverTargets[groupName]} stroke="#ef4444" strokeDasharray="6 6" strokeWidth={1}><Label value={`${coverTargets[groupName]}`} position="right" fill="#ef4444" fontSize={11} fontWeight="normal" /></ReferenceLine>}
                        {chartType !== 'cover' && Array.from(targets.entries()).map(([teamName, targetValue]) => targetValue > 0 ? <ReferenceLine key={`${teamName}-target`} y={targetValue} stroke={teamColors[teamName] || '#8884d8'} strokeDasharray="4 4" strokeWidth={1}><Label value={formatNumber(targetValue, { maximumFractionDigits: 2 })} position="right" fill={teamColors[teamName] || '#8884d8'} fontSize={10} /></ReferenceLine> : null)}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
});

const ColorSettingsPopover = memo(({ groupName, teamNames, settings, onSave }: { groupName: string; teamNames: string[]; settings: AllTeamsColorSettings; onSave: (newSettings: AllTeamsColorSettings) => void; }) => {
    const [open, setOpen] = useState(false);
    const [localSettings, setLocalSettings] = useState<AllTeamsColorSettings>({});
    const [loading, setLoading] = useState(false);
    const representativeTeam = teamNames[0] || '';

    useEffect(() => { 
        if (open) {
            // Initialize with current settings or empty structure
            const initialSettings = { ...settings };
            if (!initialSettings[representativeTeam]) {
                initialSettings[representativeTeam] = {};
            }
            setLocalSettings(initialSettings);
        }
    }, [settings, open, representativeTeam]);

    const getFieldSettings = (fieldName: string): FieldColorSettings => {
        return localSettings?.[representativeTeam]?.[fieldName] || { textColorRules: [], backgroundColorRules: [] };
    };

    const updateFieldSettings = (fieldName: string, newFieldSettings: FieldColorSettings) => {
        setLocalSettings(prev => {
            const newSettings = JSON.parse(JSON.stringify(prev));
            if (!newSettings[representativeTeam]) {
                newSettings[representativeTeam] = {};
            }
            newSettings[representativeTeam][fieldName] = newFieldSettings;
            return newSettings;
        });
    };
    
    const handleRuleChange = (fieldName: string, ruleType: 'textColorRules' | 'backgroundColorRules', ruleId: string, property: keyof Omit<ThresholdRule, 'id'>, value: any) => {
        const fieldSettings = getFieldSettings(fieldName);
        const updatedRules = fieldSettings[ruleType].map(r => {
            if (r.id === ruleId) {
                if (property === 'threshold') {
                    const numValue = parseFloat(value);
                    return { ...r, [property]: isNaN(numValue) ? 0 : numValue };
                }
                return { ...r, [property]: value };
            }
            return r;
        });
        updateFieldSettings(fieldName, { ...fieldSettings, [ruleType]: updatedRules });
    };

    const handleAddRule = (fieldName: string, ruleType: 'textColorRules' | 'backgroundColorRules') => {
        const fieldSettings = getFieldSettings(fieldName);
        const newRule: ThresholdRule = { 
            id: `rule_${Date.now()}_${Math.random()}`, 
            operator: '>', 
            threshold: 0.01, 
            color: ruleType === 'textColorRules' ? '#000000' : '#ef4444' 
        };
        updateFieldSettings(fieldName, { ...fieldSettings, [ruleType]: [...fieldSettings[ruleType], newRule] });
    };

    const handleRemoveRule = (fieldName: string, ruleType: 'textColorRules' | 'backgroundColorRules', ruleId: string) => {
        const fieldSettings = getFieldSettings(fieldName);
        const updatedRules = fieldSettings[ruleType].filter(r => r.id !== ruleId);
        updateFieldSettings(fieldName, { ...fieldSettings, [ruleType]: updatedRules });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const groupSettings = localSettings[representativeTeam] || {};
            
            // Apply settings to all teams in the group
            const newSettingsForAllTeams = { ...settings };
            teamNames.forEach(teamName => { 
                newSettingsForAllTeams[teamName] = { ...groupSettings }; 
            });
            
            // บันทึกลง localStorage ทันที
            localStorage.setItem('adser-color-settings', JSON.stringify(newSettingsForAllTeams));
            console.log('✅ Color settings saved to localStorage');
            
            // บันทึกลงฐานข้อมูล
            const response = await fetch('/api/team-color-settings', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ teamNames, settings: groupSettings }) 
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                console.warn(`Database save failed: ${errorData}`);
                // แม้ database ล้มเหลว ก็ยังใช้การตั้งค่าจาก localStorage ได้
                toast.warning(`บันทึกการตั้งค่าใน localStorage สำเร็จ แต่ฐานข้อมูลล้มเหลว: ${errorData}`);
            } else {
                const result = await response.json();
                console.log('✅ Color settings saved to database:', result);
                toast.success(`บันทึกการตั้งค่าสำหรับกลุ่ม ${groupName} สำเร็จแล้ว`);
            }
            
            onSave(newSettingsForAllTeams);
            setOpen(false);
        } catch (error) {
            console.error('Error saving color settings:', error);
            // แม้ API ล้มเหลว ก็ยังพยายามบันทึกลง localStorage
            try {
                const groupSettings = localSettings[representativeTeam] || {};
                const newSettingsForAllTeams = { ...settings };
                teamNames.forEach(teamName => { 
                    newSettingsForAllTeams[teamName] = { ...groupSettings }; 
                });
                localStorage.setItem('adser-color-settings', JSON.stringify(newSettingsForAllTeams));
                onSave(newSettingsForAllTeams);
                toast.warning(`บันทึกการตั้งค่าใน localStorage สำเร็จ แต่ไม่สามารถเชื่อมต่อฐานข้อมูลได้`);
                setOpen(false);
            } catch (localError) {
                console.error('Error saving to localStorage:', localError);
                toast.error(`เกิดข้อผิดพลาดในการบันทึก: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent hover:text-accent-foreground" onClick={() => setOpen(true)}>
                <Settings className="h-4 w-4" />
            </Button>
            
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
                        onClick={() => setOpen(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative bg-background border rounded-lg shadow-lg w-[600px] max-w-[90vw] max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b flex-shrink-0">
                            <h4 className="font-medium text-lg">ตั้งค่าสีสำหรับกลุ่ม: {groupName}</h4>
                            <p className="text-sm text-muted-foreground">การตั้งค่านี้จะใช้กับทีมทั้งหมดในกลุ่ม: {teamNames.join(', ')}</p>
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                        {Object.entries(allConfigurableFields).map(([key, { name, unit }]) => {
                            const currentFieldSettings = getFieldSettings(key);
                            return (
                                <div key={key} className="p-3 border rounded-lg space-y-3">
                                    <h5 className="font-medium text-sm">{name}</h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(['textColorRules', 'backgroundColorRules'] as const).map(ruleType => (
                                            <div key={ruleType} className="space-y-2 p-3 rounded-md bg-muted/50">
                                                <h6 className="text-xs font-semibold text-center">{ruleType === 'textColorRules' ? 'สีข้อความ' : 'สีพื้นหลัง'}</h6>
                                                {currentFieldSettings[ruleType] && currentFieldSettings[ruleType].map((rule) => (
                                                    <div key={rule.id} className="flex items-center gap-2">
                                                        <Select value={rule.operator} onValueChange={(value: '>' | '<') => handleRuleChange(key, ruleType, rule.id, 'operator', value)}>
                                                            <SelectTrigger className="w-16 h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value=">">&gt;</SelectItem>
                                                                <SelectItem value="<">&lt;</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Input 
                                                            type="number" 
                                                            value={rule.threshold ?? 0} 
                                                            onChange={e => handleRuleChange(key, ruleType, rule.id, 'threshold', e.target.value)} 
                                                            className="w-24 h-8 text-xs" 
                                                            step="0.01"
                                                            min="0.01"
                                                            placeholder="0.01"
                                                        />
                                                        <span className="text-xs whitespace-nowrap">({unit || 'ค่า'})</span>
                                                        <Input 
                                                            type="color" 
                                                            value={rule.color} 
                                                            onChange={e => handleRuleChange(key, ruleType, rule.id, 'color', e.target.value)} 
                                                            className="w-12 h-8 p-1 rounded cursor-pointer" 
                                                        />
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 shrink-0 hover:bg-destructive/10" 
                                                            onClick={() => handleRemoveRule(key, ruleType, rule.id)}
                                                        >
                                                            <XCircle className="h-4 w-4 text-red-500"/>
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full h-8 text-xs" 
                                                    onClick={() => handleAddRule(key, ruleType)}
                                                >
                                                    <PlusCircle className="h-3 w-3 mr-1"/> เพิ่มเงื่อนไข
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="p-4 border-t flex-shrink-0 bg-background">
                            <Button onClick={handleSave} disabled={loading} className="w-full">
                                {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

// --- Main Page Component ---
export default function AdserPage() {
    const { effectiveTheme, colors } = useTheme();
    const [isClient, setIsClient] = useState(false);
    const [tableDateRange, setTableDateRange] = useState<DateRange | undefined>(undefined);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [colorSettings, setColorSettings] = useState<AllTeamsColorSettings>(initialColorSettings);
    const [chartData, setChartData] = useState<{ cpm: TransformedChartData[], costPerDeposit: TransformedChartData[], deposits: TransformedChartData[], cover: TransformedChartData[] }>({ cpm: [], costPerDeposit: [], deposits: [], cover: [] });
    const [graphView, setGraphView] = useState<'daily' | 'monthly'>('daily');
    const [graphYear, setGraphYear] = useState(dayjs().year());
    const [graphMonth, setGraphMonth] = useState(dayjs().month());
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const loadColorSettings = async () => {
        try {
            // ลองโหลดจาก localStorage ก่อน
            const localSettings = localStorage.getItem('adser-color-settings');
            if (localSettings) {
                try {
                    const parsedLocalSettings = JSON.parse(localSettings);
                    setColorSettings(parsedLocalSettings);
                    console.log('✅ Color settings loaded from localStorage');
                } catch (e) {
                    console.error('Error parsing localStorage color settings:', e);
                }
            }

            // จากนั้นโหลดจากฐานข้อมูล
            const response = await fetch('/api/team-color-settings');
            if (response.ok) {
                const dbSettings: TeamColorSettingDB[] = await response.json();
                const newSettings: AllTeamsColorSettings = {};
                dbSettings.forEach(setting => {
                    if (!newSettings[setting.team_name]) newSettings[setting.team_name] = {};
                    try {
                        const textRules = JSON.parse(setting.text_color_rules || '[]');
                        const bgRules = JSON.parse(setting.background_color_rules || '[]');
                        newSettings[setting.team_name][setting.field_name] = {
                            textColorRules: Array.isArray(textRules) ? textRules : [],
                            backgroundColorRules: Array.isArray(bgRules) ? bgRules : [],
                        };
                    } catch (e) {
                        console.error("Could not parse rules for", setting, e);
                        newSettings[setting.team_name][setting.field_name] = { textColorRules: [], backgroundColorRules: [] };
                    }
                });
                setColorSettings(newSettings);
                
                // บันทึกลง localStorage สำหรับการใช้งานครั้งต่อไป
                localStorage.setItem('adser-color-settings', JSON.stringify(newSettings));
                console.log('✅ Color settings loaded from database and synced to localStorage');
            }
        } catch (error) { 
            console.error('Error loading color settings:', error); 
            // หาก API ล้มเหลว ให้ใช้ localStorage
            const localSettings = localStorage.getItem('adser-color-settings');
            if (localSettings) {
                try {
                    const parsedLocalSettings = JSON.parse(localSettings);
                    setColorSettings(parsedLocalSettings);
                    console.log('⚠️ Using localStorage color settings due to API error');
                } catch (e) {
                    console.error('Error parsing localStorage color settings as fallback:', e);
                }
            }
        }
    };
    
    const getTextColorForBackground = (hexColor: string): string => {
        if (!hexColor || hexColor.length < 7) return '#000000';
        const r = parseInt(hexColor.slice(1, 3), 16), g = parseInt(hexColor.slice(3, 5), 16), b = parseInt(hexColor.slice(5, 7), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) > 128 ? '#000000' : '#FFFFFF';
    };

    const getCellStyle = (teamName: string, fieldName: keyof typeof allConfigurableFields, value: number, totalForPercentage: number | null = null): React.CSSProperties => {
        const fieldSettings = colorSettings[teamName]?.[fieldName];
        if (!fieldSettings) return {};
        
        const { textColorRules = [], backgroundColorRules = [] } = fieldSettings;
        if (textColorRules.length === 0 && backgroundColorRules.length === 0) return {};

        const fieldConfig = allConfigurableFields[fieldName];
        const isPercentage = fieldConfig.unit === '%';
        const numericValue = Number(value);
        if (isNaN(numericValue)) return {};

        const comparisonValue = isPercentage && totalForPercentage && totalForPercentage > 0 ? (numericValue / totalForPercentage) * 100 : numericValue;
        
        const findWinningColor = (rules: ThresholdRule[]): string | null => {
            const moreThanRules = rules.filter(r => r.operator === '>').sort((a, b) => b.threshold - a.threshold);
            const lessThanRules = rules.filter(r => r.operator === '<').sort((a, b) => a.threshold - b.threshold);
            for (const rule of moreThanRules) if (comparisonValue > rule.threshold) return rule.color;
            for (const rule of lessThanRules) if (comparisonValue < rule.threshold) return rule.color;
            return null;
        };

        const winningTextColor = findWinningColor(textColorRules);
        const winningBgColor = findWinningColor(backgroundColorRules);

        const style: React.CSSProperties = {};

        if (winningTextColor) {
            style.color = winningTextColor;
        }

        if (winningBgColor) {
            style.backgroundColor = `${winningBgColor}20`; // Add transparency
            style.borderRadius = '6px';
            style.padding = '2px 8px';
            style.display = 'inline-block';
            if (!winningTextColor) { // Only adjust text color if not explicitly set
                style.color = getTextColorForBackground(winningBgColor);
            }
        }

        return style;
    };

    useEffect(() => {
        setIsClient(true);
        loadColorSettings();
        try {
            const savedTableDate = localStorage.getItem('adserTableDateRange');
            if (savedTableDate) { const parsed = JSON.parse(savedTableDate); if (parsed.from && parsed.to) setTableDateRange({ from: dayjs(parsed.from).toDate(), to: dayjs(parsed.to).toDate() }); else setTableDateRange({ from: dayjs().startOf('month').toDate(), to: dayjs().endOf('day').toDate() }); } else setTableDateRange({ from: dayjs().startOf('month').toDate(), to: dayjs().endOf('day').toDate() });
        } catch (error) { console.error("Failed to parse table date range from localStorage", error); setTableDateRange({ from: dayjs().startOf('month').toDate(), to: dayjs().endOf('day').toDate() }); }
        try {
            const savedGraphView = localStorage.getItem('adserGraphView');
            if (savedGraphView === 'daily' || savedGraphView === 'monthly') setGraphView(savedGraphView);
            const savedGraphYear = localStorage.getItem('adserGraphYear');
            if (savedGraphYear) setGraphYear(parseInt(savedGraphYear, 10));
            const savedGraphMonth = localStorage.getItem('adserGraphMonth');
            if (savedGraphMonth) setGraphMonth(parseInt(savedGraphMonth, 10));
        } catch (error) { console.error("Failed to parse graph settings from localStorage", error); }
        try { const savedShowBreakdown = localStorage.getItem('adserShowBreakdown'); if (savedShowBreakdown) setShowBreakdown(JSON.parse(savedShowBreakdown)); } catch (error) { console.error("Failed to parse show breakdown from localStorage", error); }
        try { const savedExpandedGroups = localStorage.getItem('adserExpandedGroups'); if (savedExpandedGroups) { const parsed = JSON.parse(savedExpandedGroups); setExpandedGroups(new Set(parsed)); } } catch (error) { console.error("Failed to parse expanded groups from localStorage", error); }
    }, []);

    useEffect(() => { if (isClient && tableDateRange) localStorage.setItem('adserTableDateRange', JSON.stringify(tableDateRange)); }, [tableDateRange, isClient]);
    useEffect(() => { if (isClient) localStorage.setItem('adserGraphView', graphView); }, [graphView, isClient]);
    useEffect(() => { if (isClient) localStorage.setItem('adserGraphYear', graphYear.toString()); }, [graphYear, isClient]);
    useEffect(() => { if (isClient) localStorage.setItem('adserGraphMonth', graphMonth.toString()); }, [graphMonth, isClient]);
    useEffect(() => { if (isClient) localStorage.setItem('adserShowBreakdown', JSON.stringify(showBreakdown)); }, [showBreakdown, isClient]);
    useEffect(() => { if (isClient) localStorage.setItem('adserExpandedGroups', JSON.stringify(Array.from(expandedGroups))); }, [expandedGroups, isClient]);
    
    const toggleGroup = (groupName: string) => setExpandedGroups(prev => { const newSet = new Set(prev); newSet.has(groupName) ? newSet.delete(groupName) : newSet.add(groupName); return newSet; });
    const { data: exchangeRateData, isLoading: isRateLoading } = useSWR('/api/exchange-rate', fetcher, { refreshInterval: 300000, onSuccess: () => { setLastUpdate(new Date()); setConnectionError(null); }, onError: () => setConnectionError('Failed to fetch rate'), revalidateOnFocus: false });
    const exchangeRate = exchangeRateData?.rate ?? 36.5;
    const isRateFallback = exchangeRateData?.isFallback ?? true;
    const graphDateRange = useMemo(() => { const date = dayjs().year(graphYear).month(graphMonth); return graphView === 'daily' ? { from: date.startOf('month').toDate(), to: date.endOf('month').toDate() } : { from: dayjs().year(graphYear).startOf('year').toDate(), to: dayjs().year(graphYear).endOf('year').toDate() }; }, [graphView, graphYear, graphMonth]);
    const apiUrl = (range: DateRange | undefined) => range?.from && range?.to && exchangeRate ? `/api/adser?startDate=${dayjs(range.from).format('YYYY-MM-DD')}&endDate=${dayjs(range.to).format('YYYY-MM-DD')}&exchangeRate=${exchangeRate}` : null;
    
    const { data: tableData, error: tableError, isLoading: loadingTable } = useSWR<TeamMetric[]>(apiUrl(tableDateRange), fetcher, { refreshInterval: 30000, onSuccess: () => { setLastUpdate(new Date()); setConnectionError(null); }, onError: () => setConnectionError('Failed to fetch table data'), revalidateOnFocus: false, revalidateOnReconnect: false, revalidateIfStale: true, refreshWhenHidden: true, refreshWhenOffline: false, dedupingInterval: 10000 });
    const { data: graphRawData, error: graphError, isLoading: loadingGraph } = useSWR<TeamMetric[]>(apiUrl(graphDateRange), fetcher, { refreshInterval: 30000, onSuccess: () => { setLastUpdate(new Date()); setConnectionError(null); }, onError: () => setConnectionError('Failed to fetch graph data'), revalidateOnFocus: false, revalidateOnReconnect: false, revalidateIfStale: true, refreshWhenHidden: true, refreshWhenOffline: false, dedupingInterval: 15000 });
    
    useEffect(() => {
        if (!graphRawData || graphRawData.length === 0) { setChartData({ cpm: [], costPerDeposit: [], deposits: [], cover: [] }); return; }
        const aggregateMonthly = (dailyData: DailyDataPoint[], aggType: 'sum' | 'last') => { const monthly = new Map<string, { total: number, last: number }>(); [...dailyData].sort((a, b) => dayjs(a.date).diff(dayjs(b.date))).forEach(d => { const key = dayjs(d.date).format('YYYY-MM-01'); if (!monthly.has(key)) monthly.set(key, { total: 0, last: 0 }); const month = monthly.get(key)!; month.total += d.value; month.last = d.value; }); return Array.from(monthly.entries()).map(([date, values]) => ({ date, value: aggType === 'sum' ? values.total : values.last })); };
        const transformData = (dataKey: keyof TeamMetric, agg: 'sum' | 'last') => { const map = new Map<string, TransformedChartData>(); graphRawData.forEach(team => { let data = team[dataKey] as DailyDataPoint[] || []; if (graphView === 'monthly') data = aggregateMonthly(data, agg); data.forEach(d => { if (!map.has(d.date)) map.set(d.date, { date: d.date }); map.get(d.date)![team.team_name] = d.value; }); }); return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(d => !dayjs(d.date).isAfter(dayjs(), 'day')); };
        const monthlyRatio = (numKey: keyof TeamMetric, denKey: keyof TeamMetric) => { const map = new Map<string, TransformedChartData>(); graphRawData.forEach(team => { const monthly = new Map<string, { num: number, den: number }>(); (team[numKey] as DailyDataPoint[] || []).forEach(d => { const key = dayjs(d.date).format('YYYY-MM-01'); if (!monthly.has(key)) monthly.set(key, { num: 0, den: 0 }); monthly.get(key)!.num += d.value; }); (team[denKey] as DailyDataPoint[] || []).forEach(d => { const key = dayjs(d.date).format('YYYY-MM-01'); if (!monthly.has(key)) monthly.set(key, { num: 0, den: 0 }); monthly.get(key)!.den += d.value; }); monthly.forEach((totals, key) => { if (!map.has(key)) map.set(key, { date: key }); map.get(key)![team.team_name] = totals.den > 0 ? totals.num / totals.den : 0; }); }); return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(d => !dayjs(d.date).isAfter(dayjs(), 'day')); };
        setChartData(graphView === 'monthly' ? { cpm: monthlyRatio('actual_spend_daily', 'total_inquiries_daily'), costPerDeposit: monthlyRatio('actual_spend_daily', 'deposits_count_daily'), deposits: transformData('deposits_count_daily', 'sum'), cover: transformData('one_dollar_per_cover_daily', 'last'), } : { cpm: transformData('cpm_cost_per_inquiry_daily', 'sum'), costPerDeposit: transformData('cost_per_deposit_daily', 'sum'), deposits: transformData('deposits_count_daily', 'sum'), cover: transformData('one_dollar_per_cover_daily', 'last'), });
    }, [graphRawData, graphView]);

    const error = tableError || graphError;
    if (error) return <div className="p-6 text-center text-red-500">Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: dayjs().month(i).locale('th').format('MMMM'), value: i }));
    const yearOptions = Array.from({ length: 5 }, (_, i) => dayjs().year() - i);

    return (
        <div 
            className={cn(
                "h-screen p-4 sm:p-6 transition-colors duration-200",
                effectiveTheme === 'dark' 
                    ? "text-slate-100" 
                    : "text-slate-900"
            )}
            style={{ 
                backgroundColor: colors.background
            }}
            data-page="adser"
        >
            <Card className={cn(
                "h-full overflow-hidden border-0 shadow-lg transition-colors duration-200",
                effectiveTheme === 'dark'
                    ? "bg-slate-800/30 backdrop-blur-md shadow-slate-900/50"
                    : "bg-white/30 backdrop-blur-md shadow-slate-200/50"
            )}>
                <div className="h-full overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <h1 className={cn(
                                    "text-2xl font-bold tracking-tight transition-colors duration-200",
                                    effectiveTheme === 'dark' ? "text-slate-100" : "text-slate-900"
                                )}>ภาพรวม Adser</h1>
                                <RealTimeStatus lastUpdate={lastUpdate} />
                                {connectionError && <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">{connectionError}</div>}
                            </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1 text-center sm:text-left">ข้อมูลตาราง</p>
                                {isClient ? <DateRangePicker date={tableDateRange} onDateChange={setTableDateRange} /> : <Skeleton className="h-9 w-[260px]" />}
                            </div>
                            <div className="flex flex-col items-center sm:items-start">
                                <p className="text-xs text-muted-foreground mb-1">ข้อมูลกราฟ</p>
                                {isClient ? (
                                    <div className={filterFrameClass}>
                                        {graphView === 'daily' && <Select value={String(graphMonth)} onValueChange={v => setGraphMonth(Number(v))}><SelectTrigger className="h-9 border-0 shadow-none focus:ring-0 w-[120px]"><SelectValue /></SelectTrigger><SelectContent>{monthOptions.map(opt => <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>)}</SelectContent></Select>}
                                        <Select value={String(graphYear)} onValueChange={v => setGraphYear(Number(v))}><SelectTrigger className="h-9 border-0 shadow-none focus:ring-0 w-[90px]"><SelectValue /></SelectTrigger><SelectContent>{yearOptions.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select>
                                        <div className="h-6 w-px bg-border" />
                                        <ToggleGroup type="single" value={graphView} onValueChange={v => { if (v) setGraphView(v as 'daily' | 'monthly'); }}>
                                            <ToggleGroupItem value="daily" className="h-9 px-2.5 text-xs">รายวัน</ToggleGroupItem>
                                            <ToggleGroupItem value="monthly" className="h-9 px-2.5 text-xs">รายเดือน</ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>
                                ) : <Skeleton className="h-9 w-[300px]" />}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                {Object.entries(adserTeamGroups).map(([groupName, teamNames]) => {
                    const teamsInGroup = tableData ? tableData.filter(team => teamNames.includes(team.team_name)) : [];
                    if (loadingTable && !isClient) return <Skeleton key={groupName} className="h-96 w-full" />;
                    if (!teamsInGroup.length) return <Card key={groupName} className="p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50"><h2 className="text-2xl font-bold mb-4">{groupName}</h2><p className="text-muted-foreground">ไม่มีข้อมูลสำหรับกลุ่มนี้</p></Card>;
                    return (
                        <Card key={groupName} className="p-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                            <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-2">
                                <CardTitle className="text-xl font-bold">{groupName}</CardTitle>
                                <div className="flex items-center gap-2">
                                    {groupName === 'สาวอ้อย' && <ExchangeRateSmall rate={exchangeRate} isLoading={isRateLoading} isFallback={isRateFallback} />}
                                    <ColorSettingsPopover groupName={groupName} teamNames={teamNames} settings={colorSettings} onSave={setColorSettings} />
                                    <Button variant="outline" size="sm" onClick={() => setShowBreakdown(!showBreakdown)} className="h-8">{showBreakdown ? <ChevronLeft className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}{showBreakdown ? 'ซ่อน' : 'ละเอียด'}</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-0 pb-0">
                                <div className="overflow-x-auto">
                                    <Table className="text-sm">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-center w-[150px]">ทีม</TableHead>
                                                <TableHead className="text-center">ยอดทัก/แผน</TableHead>
                                                <TableHead className="text-center">ใช้จ่าย/แผน</TableHead>
                                                <TableHead className="text-center">ยอดทักสุทธิ</TableHead>
                                                <TableHead className="text-center">ยอดเสีย</TableHead>
                                                <TableHead className="text-center">CPM</TableHead>
                                                <TableHead className="text-center">ยอดเติม</TableHead>
                                                <TableHead className="text-center">ทุน/เติม</TableHead>
                                                <TableHead className="text-right">ยอดเล่นใหม่</TableHead>
                                                <TableHead className="text-right pr-4">1$/Cover</TableHead>
                                                {showBreakdown && <>
                                                    <TableHead className="text-center w-[70px]">เงียบ</TableHead>
                                                    <TableHead className="text-center w-[70px]">ซ้ำ</TableHead>
                                                    <TableHead className="text-center w-[70px]">มียูส</TableHead>
                                                    <TableHead className="text-center w-[70px]">ก่อกวน</TableHead>
                                                    <TableHead className="text-center w-[70px]">บล็อก</TableHead>
                                                    <TableHead className="text-center w-[70px]">เด็ก</TableHead>
                                                    <TableHead className="text-center w-[70px]">อายุเกิน 50</TableHead>
                                                    <TableHead className="text-center w-[70px] pr-4">ต่างชาติ</TableHead>
                                                </>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {teamsInGroup.sort((a, b) => teamNames.indexOf(a.team_name) - teamNames.indexOf(b.team_name)).map(team => (
                                                <TableRow key={team.team_name}>
                                                    <TableCell className="font-medium pl-4"><div className="flex items-center gap-2"><span className={cn('w-2 h-2 rounded-full flex-shrink-0', team.actual_spend <= team.planned_daily_spend ? 'bg-green-500' : 'bg-red-500')} />{team.team_name}</div></TableCell>
                                                    <TableCell className="text-center"><div className="flex justify-center"><ProgressCell value={team.total_inquiries} total={team.planned_inquiries} /></div></TableCell>
                                                    <TableCell className="text-center"><div className="flex justify-center"><ProgressCell value={team.actual_spend} total={team.planned_daily_spend} isCurrency /></div></TableCell>
                                                    <TableCell className="text-center"><span style={getCellStyle(team.team_name, 'net_inquiries', team.net_inquiries, team.total_inquiries)}><BreakdownCell value={team.net_inquiries} total={team.total_inquiries} /></span></TableCell>
                                                    <TableCell className="text-center"><span style={getCellStyle(team.team_name, 'wasted_inquiries', team.wasted_inquiries, team.total_inquiries)}><BreakdownCell value={team.wasted_inquiries} total={team.total_inquiries} /></span></TableCell>
                                                    <TableCell className="text-center"><span style={getCellStyle(team.team_name, 'cpm_cost_per_inquiry', team.cpm_cost_per_inquiry)}><FinancialMetric value={team.cpm_cost_per_inquiry} prefix="$" /></span></TableCell>
                                                    <TableCell className="text-center text-sm font-medium"><span style={getCellStyle(team.team_name, 'deposits_count', team.deposits_count)}>{formatNumber(team.deposits_count)}</span></TableCell>
                                                    <TableCell className="text-center"><span style={getCellStyle(team.team_name, 'cost_per_deposit', team.cost_per_deposit)}><FinancialMetric value={team.cost_per_deposit} prefix="$" /></span></TableCell>
                                                    <TableCell className="text-right"><span style={getCellStyle(team.team_name, 'new_player_value_thb', team.new_player_value_thb)}><FinancialMetric value={team.new_player_value_thb} prefix="฿" /></span></TableCell>
                                                    <TableCell className="text-right pr-4"><span style={getCellStyle(team.team_name, 'one_dollar_per_cover', team.one_dollar_per_cover)}><FinancialMetric value={team.one_dollar_per_cover} prefix="$" /></span></TableCell>
                                                    {showBreakdown && <>
                                                        {(Object.keys(allConfigurableFields) as Array<keyof typeof allConfigurableFields>)
                                                            .filter(key => allConfigurableFields[key].unit === '%' && !['wasted_inquiries', 'net_inquiries'].includes(key))
                                                            .map(key => {
                                                                const typedKey = key as keyof TeamMetric;
                                                                const value = team[typedKey] as number | undefined;
                                                                return (
                                                                    <TableCell key={key} className="text-center">
                                                                        <span style={getCellStyle(team.team_name, key, value ?? 0, team.total_inquiries)}>
                                                                            <BreakdownCell value={value ?? 0} total={team.total_inquiries} />
                                                                        </span>
                                                                    </TableCell>
                                                                )
                                                            })
                                                        }
                                                    </>}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Collapsible open={expandedGroups.has(groupName)} onOpenChange={() => toggleGroup(groupName)}>
                                    <CollapsibleContent className="px-4 pb-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                            <GroupedChart title="ต้นทุนทัก (CPM)" data={chartData.cpm} yAxisLabel="$" loading={loadingGraph} teamsToShow={teamNames} chartType="cpm" yAxisDomainMax={groupYAxisMax[groupName]?.cpm} graphView={graphView} />
                                            <GroupedChart title="ต้นทุนต่อเติม" data={chartData.costPerDeposit} yAxisLabel="$" loading={loadingGraph} teamsToShow={teamNames} chartType="costPerDeposit" yAxisDomainMax={groupYAxisMax[groupName]?.costPerDeposit} graphView={graphView} />
                                            <GroupedChart title="เป้ายอดเติม" data={chartData.deposits} yAxisLabel="" loading={loadingGraph} teamsToShow={teamNames} chartType="deposits" dateForTarget={graphDateRange?.from} graphView={graphView} />
                                            <GroupedChart title="1$ / Cover" data={chartData.cover} yAxisLabel="$" loading={loadingGraph} teamsToShow={teamNames} chartType="cover" groupName={groupName} yAxisDomainMax={groupYAxisMax[groupName]?.cover} graphView={graphView} />
                                        </div>
                                    </CollapsibleContent>
                                    <div className="flex justify-center border-t bg-muted/30 p-3">
                                        <CollapsibleTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-xs text-muted-foreground w-full max-w-xs">
                                            <TrendingUp className="h-4 w-4 mr-1" />
                                            {expandedGroups.has(groupName) ? 'ซ่อนกราฟ' : 'แสดงกราฟ'}
                                        </CollapsibleTrigger>
                                    </div>
                                </Collapsible>
                            </CardContent>
                        </Card>
                    );
                })}
                    </div>
                </div>
            </div>
        </Card>
    </div>
);
}