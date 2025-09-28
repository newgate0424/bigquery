// app/(main)/overview/page.tsx
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
import { teamGroups, cpmThresholds, costPerDepositThresholds, depositsMonthlyTargets, calculateDailyTarget, coverTargets } from '@/lib/config';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Label } from 'recharts';
import { getChartFontSizes } from '@/lib/font-utils';
import useSWR from 'swr';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Wifi, TrendingUp, Settings, PlusCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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

// ✅ Real-time Fetcher
const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
});

// ✅ Compact Status indicator component
const RealTimeStatus = memo(({ lastUpdate }: { lastUpdate: Date | null }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      if (lastUpdate) {
        setTimeAgo(dayjs(lastUpdate).fromNow());
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
      <Wifi className="h-3 w-3 text-green-500" />
      <span className="text-green-600">อัพเดท: {timeAgo}</span>
    </div>
  );
});

// --- Interfaces and Helper Functions ---
const formatNumber = (value: number | string, options: Intl.NumberFormatOptions = {}): string => {
  const num = Number(value);
  if (isNaN(num)) { return '0'; }
  return num.toLocaleString('en-US', options);
};

interface DailyDataPoint { date: string; value: number; }
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
  facebook_cost_per_inquiry: number;
  actual_spend_daily: DailyDataPoint[];
  total_inquiries_daily: DailyDataPoint[];
}
interface TransformedChartData { date: string; [key: string]: any; }

const teamColors: { [key: string]: string } = {
  'สาวอ้อย': '#3b82f6', 'อลิน': '#16a34a', 'อัญญา C': '#db2777', 'อัญญา D': '#f78c00ff',
  'Spezbar': '#5f6669ff', 'Barlance': '#dc266cff', 'Football Area': '#f59e0b', 'Football Area(Haru)': '#0181a1ff',
};

const groupYAxisMax: { [key: string]: { cpm: number; costPerDeposit: number; cover: number; } } = {
  'Lotto': { cpm: 2.5, costPerDeposit: 35, cover: 15 },
  'Bacarat': { cpm: 4.5, costPerDeposit: 80, cover: 10 },
  'Football': { cpm: 6.5, costPerDeposit: 120, cover: 8 },
};

const filterFrameClass = "inline-flex items-center gap-1 rounded-md border border-input bg-muted/50 h-9 px-2 shadow-sm";

// Configurable fields for color settings
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

// ... (Sub-components) ...
const ExchangeRateSmall = memo(({ rate, isLoading, isFallback }: { rate: number | null, isLoading: boolean, isFallback: boolean }) => {
  if (isLoading) {
    return (
      <div className="bg-muted/50 rounded px-2 py-1">
        <div className="text-xs text-muted-foreground">฿--</div>
      </div>
    );
  }
  return (
    <div className={cn("rounded px-2 py-1 text-xs font-medium", isFallback ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700")}>
      {isFallback && "⚠️ "}฿{rate ? formatNumber(rate, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
    </div>
  );
});

const ProgressCell = memo(({ value, total, isCurrency = false }: { value: number; total: number; isCurrency?: boolean }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  let progressBarColor: string;
  if (isCurrency) {
    if (percentage > 150) progressBarColor = 'bg-red-500/80';
    else if (percentage > 100) progressBarColor = 'bg-yellow-400/80';
    else progressBarColor = 'bg-green-500/80';
  } else {
    if (percentage >= 100) progressBarColor = 'bg-green-500/80';
    else if (percentage >= 80) progressBarColor = 'bg-yellow-400/80';
    else progressBarColor = 'bg-red-500/80';
  }
  const displayValue = isCurrency ? `$${formatNumber(value, { maximumFractionDigits: 0 })}` : formatNumber(value);
  const displayTotal = isCurrency ? `$${formatNumber(total, { maximumFractionDigits: 0 })}` : formatNumber(total);
  return (
    <div className="flex flex-col w-36">
      <div className="flex justify-between items-baseline text-sm">
        <span className="font-semibold number-transition">{displayValue} / {displayTotal}</span>
        <span className="font-semibold text-primary number-transition">{percentage.toFixed(1)}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted mt-1">
        <div className={cn('h-full progress-bar-smooth', progressBarColor)} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
      </div>
    </div>
  );
});

const StackedProgressCell = memo(({ net, wasted, total }: { net: number; wasted: number; total: number }) => {
  const netPercentage = total > 0 ? (net / total) * 100 : 0;
  const wastedPercentage = total > 0 ? (wasted / total) * 100 : 0;
  return (
    <div className="flex flex-col w-36">
      <div className="flex justify-between items-baseline text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-sky-500"></div>
          <span className="font-semibold">{formatNumber(net)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-orange-500">{formatNumber(wasted)}</span>
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
        </div>
      </div>
      <div className="flex w-full h-2 rounded-full overflow-hidden bg-muted mt-1">
        <div style={{ width: `${netPercentage}%` }} className="bg-sky-500"></div>
        <div style={{ width: `${wastedPercentage}%` }} className="bg-orange-500"></div>
      </div>
      <div className="flex justify-between items-baseline text-sm mt-0.5">
        <span className="font-semibold text-primary">{netPercentage.toFixed(1)}%</span>
        <span className="font-semibold text-muted-foreground">{wastedPercentage.toFixed(1)}%</span>
      </div>
    </div>
  );
});

const FinancialMetric = memo(({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) => (
  <span className="font-semibold text-sm whitespace-nowrap">
    {prefix}{formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
  </span>
));

const BreakdownCell = memo(({ value, total }: { value: number, total: number }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="text-center">
      <div className="font-semibold text-sm leading-center">{formatNumber(value)}</div>
      <div className="text-xs text-muted-foreground leading-center">({percentage.toFixed(1)}%)</div>
    </div>
  );
});

const GroupedChart = memo(({
  title, data, yAxisLabel, loading, teamsToShow, chartType, dateForTarget, yAxisDomainMax, groupName, graphView
}: {
  title: string;
  data: TransformedChartData[];
  yAxisLabel: string;
  loading: boolean;
  teamsToShow: string[];
  chartType: 'cpm' | 'costPerDeposit' | 'deposits' | 'cover';
  dateForTarget?: Date;
  yAxisDomainMax?: number;
  groupName?: string;
  graphView: 'daily' | 'monthly';
}) => {
  // ✅ ใช้ ref เพื่อเก็บข้อมูลเดิมไว้ระหว่างการ reload
  const previousDataRef = useRef<TransformedChartData[]>([]);
  
  // ✅ ใช้ข้อมูลเดิมหากยังกำลัง loading
  const displayData = useMemo(() => {
    if (loading && previousDataRef.current.length > 0) {
      return previousDataRef.current;
    }
    if (!loading && data.length > 0) {
      previousDataRef.current = data;
    }
    return data;
  }, [data, loading]);

  const formatYAxis = (tickItem: number) => `${yAxisLabel}${tickItem.toFixed(1)}`;

  const tickFormatter = (date: string) => {
    if (graphView === 'monthly') {
      return dayjs(date).format('MMM');
    }
    return dayjs(date).format('DD');
  };

  const targets = useMemo(() => {
    const targetMap = new Map<string, number>();
    if (chartType === 'cover' && groupName && coverTargets[groupName as keyof typeof coverTargets]) {
      const groupTarget = coverTargets[groupName as keyof typeof coverTargets];
      teamsToShow.forEach(teamName => targetMap.set(teamName, groupTarget));
    } else {
      teamsToShow.forEach(teamName => {
        if (chartType === 'cpm') {
          targetMap.set(teamName, cpmThresholds[teamName as keyof typeof cpmThresholds] || 0);
        } else if (chartType === 'costPerDeposit') {
          targetMap.set(teamName, costPerDepositThresholds[teamName as keyof typeof costPerDepositThresholds] || 0);
        } else if (chartType === 'deposits' && dateForTarget) {
          const monthlyTarget = depositsMonthlyTargets[teamName as keyof typeof depositsMonthlyTargets] || 0;
          if (graphView === 'monthly') {
            targetMap.set(teamName, monthlyTarget);
          } else {
            targetMap.set(teamName, calculateDailyTarget(monthlyTarget, dayjs(dateForTarget).format('YYYY-MM-DD')));
          }
        }
      });
    }
    return targetMap;
  }, [chartType, dateForTarget, teamsToShow, groupName, graphView]);

  // ✅ แสดง Skeleton เฉพาะครั้งแรกที่ไม่มีข้อมูลเลย
  if (loading && displayData.length === 0) { 
    return <Skeleton className="w-full h-[250px]" />; 
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base flex items-center justify-between">
          {title}
          {/* ✅ แสดง loading indicator เล็กๆ ระหว่าง refresh */}
          {loading && displayData.length > 0 && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={displayData} 
            margin={{ top: 5, right: 30, left: -10, bottom: 20 }}
            // ✅ ป้องกันการ re-render ที่ไม่จำเป็น
            key={`${title}-${graphView}`}
          >
            <XAxis dataKey="date" tickFormatter={tickFormatter} tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 10 }} domain={[0, yAxisDomainMax || 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              formatter={(value: number, name: string) => [`${yAxisLabel}${formatNumber(value, { maximumFractionDigits: 2 })}`, name]}
              labelFormatter={(label) => dayjs(label).format('D MMMM YYYY')}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            {teamsToShow.map(teamName => (
              <Line key={teamName} type="monotone" dataKey={teamName} stroke={teamColors[teamName] || '#8884d8'} strokeWidth={1.5} dot={{ r: 2 }} activeDot={{ r: 5 }} />
            ))}
            {chartType === 'cover' && groupName && coverTargets[groupName as keyof typeof coverTargets] && (
              <ReferenceLine y={coverTargets[groupName as keyof typeof coverTargets]} stroke="#ef4444" strokeDasharray="6 6" strokeWidth={1}>
                <Label value={`${coverTargets[groupName as keyof typeof coverTargets]}`} position="right" fill="#ef4444" fontSize={11} fontWeight="normal" />
              </ReferenceLine>
            )}
            {chartType !== 'cover' && Array.from(targets.entries()).map(([teamName, targetValue]) => {
              if (targetValue > 0) {
                return (
                  <ReferenceLine key={`${teamName}-target`} y={targetValue} stroke={teamColors[teamName] || '#8884d8'} strokeDasharray="4 4" strokeWidth={1}>
                    <Label value={formatNumber(targetValue, { maximumFractionDigits: 2 })} position="right" fill={teamColors[teamName] || '#8884d8'} fontSize={10} />
                  </ReferenceLine>
                );
              }
              return null;
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

// Color Settings Popover Component
const ColorSettingsPopover = memo(({ groupName, teamNames, settings, onSave }: { 
  groupName: string; 
  teamNames: string[]; 
  settings: AllTeamsColorSettings; 
  onSave: (newSettings: AllTeamsColorSettings) => void; 
}) => {
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
            localStorage.setItem('overview-color-settings', JSON.stringify(newSettingsForAllTeams));
            console.log('✅ Overview color settings saved to localStorage');
            
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
                console.log('✅ Overview color settings saved to database:', result);
                toast.success(`บันทึกการตั้งค่าสำหรับกลุ่ม ${groupName} สำเร็จแล้ว`);
            }
            
            onSave(newSettingsForAllTeams);
            setOpen(false);
        } catch (error) {
            console.error('Error saving overview color settings:', error);
            // แม้ API ล้มเหลว ก็ยังพยายามบันทึกลง localStorage
            try {
                const groupSettings = localSettings[representativeTeam] || {};
                const newSettingsForAllTeams = { ...settings };
                teamNames.forEach(teamName => { 
                    newSettingsForAllTeams[teamName] = { ...groupSettings }; 
                });
                localStorage.setItem('overview-color-settings', JSON.stringify(newSettingsForAllTeams));
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

export default function OverviewPage() {
  const { effectiveTheme } = useTheme();
  const chartFontSizes = getChartFontSizes();
  const [isClient, setIsClient] = useState(false);
  const [chartData, setChartData] = useState<{ cpm: TransformedChartData[], costPerDeposit: TransformedChartData[], deposits: TransformedChartData[], cover: TransformedChartData[] }>({ cpm: [], costPerDeposit: [], deposits: [], cover: [] });
  const [tableDateRange, setTableDateRange] = useState<DateRange | undefined>(undefined);
  const [graphView, setGraphView] = useState<'daily' | 'monthly'>('daily');
  const [graphYear, setGraphYear] = useState<number>(dayjs().year());
  const [graphMonth, setGraphMonth] = useState<number>(dayjs().month());
  const [colorSettings, setColorSettings] = useState<AllTeamsColorSettings>(initialColorSettings);
  
  // ✅ เพิ่ม Real-time state (ตลอดเวลา)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // ✅ เพิ่ม showBreakdown state สำหรับซ่อน/แสดงคอลั่ม
  const [showBreakdown, setShowBreakdown] = useState(true);

  // Color settings functions
  const loadColorSettings = async () => {
    try {
        // ลองโหลดจาก localStorage ก่อน
        const localSettings = localStorage.getItem('overview-color-settings');
        if (localSettings) {
            try {
                const parsedLocalSettings = JSON.parse(localSettings);
                setColorSettings(parsedLocalSettings);
                console.log('✅ Overview color settings loaded from localStorage');
            } catch (e) {
                console.error('Error parsing localStorage overview color settings:', e);
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
            localStorage.setItem('overview-color-settings', JSON.stringify(newSettings));
            console.log('✅ Overview color settings loaded from database and synced to localStorage');
        }
    } catch (error) { 
        console.error('Error loading overview color settings:', error); 
        // หาก API ล้มเหลว ให้ใช้ localStorage
        const localSettings = localStorage.getItem('overview-color-settings');
        if (localSettings) {
            try {
                const parsedLocalSettings = JSON.parse(localSettings);
                setColorSettings(parsedLocalSettings);
                console.log('⚠️ Using localStorage overview color settings due to API error');
            } catch (e) {
                console.error('Error parsing localStorage overview color settings as fallback:', e);
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
        style.borderRadius = '4px';
        style.padding = '1px 4px';
        style.display = 'inline-block';
        style.whiteSpace = 'nowrap';
        style.maxWidth = '100%';
        style.overflow = 'hidden';
        style.textOverflow = 'ellipsis';
        if (!winningTextColor) { // Only adjust text color if not explicitly set
            style.color = getTextColorForBackground(winningBgColor);
        }
    }

    return style;
  };

  useEffect(() => {
    setIsClient(true);
    loadColorSettings(); // โหลดการตั้งค่าสี

    const savedDate = localStorage.getItem('dateRangeFilterBetaV6Table');
    if (savedDate) {
      try {
        const parsed = JSON.parse(savedDate);
        if (parsed.from && parsed.to) {
          setTableDateRange({ from: dayjs(parsed.from).toDate(), to: dayjs(parsed.to).toDate() });
        }
      } catch (e) {
        console.error('Failed to parse date range from localStorage:', e);
        setTableDateRange({ from: dayjs().startOf('month').toDate(), to: dayjs().endOf('day').toDate() });
      }
    } else {
      setTableDateRange({ from: dayjs().startOf('month').toDate(), to: dayjs().endOf('day').toDate() });
    }

    const savedView = localStorage.getItem('graphView');
    if (savedView === 'daily' || savedView === 'monthly') {
      setGraphView(savedView);
    }
    
    setGraphYear(dayjs().year());
    setGraphMonth(dayjs().month());

    // Load expanded groups from localStorage
    try { 
      const savedExpandedGroups = localStorage.getItem('overviewExpandedGroups'); 
      if (savedExpandedGroups) { 
        const parsed = JSON.parse(savedExpandedGroups); 
        setExpandedGroups(new Set(parsed)); 
      } 
    } catch (error) { 
      console.error("Failed to parse expanded groups from localStorage", error); 
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('graphView', graphView);
    }
  }, [graphView, isClient]);

  useEffect(() => {
    if (tableDateRange && isClient) {
      localStorage.setItem('dateRangeFilterBetaV6Table', JSON.stringify(tableDateRange));
    }
  }, [tableDateRange, isClient]);

  // Save expanded groups to localStorage
  useEffect(() => { 
    if (isClient) localStorage.setItem('overviewExpandedGroups', JSON.stringify(Array.from(expandedGroups))); 
  }, [expandedGroups, isClient]);

  // Toggle group function
  const toggleGroup = (groupName: string) => setExpandedGroups(prev => { 
    const newSet = new Set(prev); 
    newSet.has(groupName) ? newSet.delete(groupName) : newSet.add(groupName); 
    return newSet; 
  });

  // ✅ Exchange Rate with Real-time - ปรับ SWR config เพื่อไม่ให้กระพริบ
  const { data: exchangeRateData, isLoading: isRateLoading } = useSWR(
    '/api/exchange-rate', 
    fetcher, 
    { 
      refreshInterval: 60000, // อัพเดททุก 1 นาที
      onSuccess: () => setLastUpdate(new Date()),
      // ✅ เพิ่ม config เพื่อไม่ให้กระพริบ
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // ป้องกันการ fetch ซ้ำใน 30 วินาที
    }
  );
  
  const exchangeRate = exchangeRateData?.rate ?? 36.5;
  const isRateFallback = exchangeRateData?.isFallback ?? true;

  const graphDateRange = useMemo(() => {
    if (graphView === 'daily') {
      const date = dayjs().year(graphYear).month(graphMonth);
      return { from: date.startOf('month').toDate(), to: date.endOf('month').toDate() };
    } else {
      const date = dayjs().year(graphYear);
      return { from: date.startOf('year').toDate(), to: date.endOf('year').toDate() };
    }
  }, [graphView, graphYear, graphMonth]);

  const tableApiUrl = useMemo(() => {
    if (!tableDateRange?.from || !tableDateRange?.to || !exchangeRate) return null;
    return `/api/overview?startDate=${dayjs(tableDateRange.from).format('YYYY-MM-DD')}&endDate=${dayjs(tableDateRange.to).format('YYYY-MM-DD')}&exchangeRate=${exchangeRate}`;
  }, [tableDateRange, exchangeRate]);

  const graphApiUrl = useMemo(() => {
    if (!graphDateRange?.from || !graphDateRange?.to || !exchangeRate) return null;
    return `/api/overview?startDate=${dayjs(graphDateRange.from).format('YYYY-MM-DD')}&endDate=${dayjs(graphDateRange.to).format('YYYY-MM-DD')}&exchangeRate=${exchangeRate}`;
  }, [graphDateRange, exchangeRate]);

  // ✅ Real-time data fetching - ปรับ SWR config เพื่อไม่ให้กระพริบ
  const { data: tableData, error: tableError, isLoading: loadingTable } = useSWR<TeamMetric[]>(
    tableApiUrl, 
    fetcher, 
    { 
      refreshInterval: 15000, // อัพเดททุก 15 วินาที
      onSuccess: () => setLastUpdate(new Date()),
      // ✅ เพิ่ม config เพื่อไม่ให้กระพริบ
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000, // ป้องกันการ fetch ซ้ำใน 10 วินาที
    }
  );

  const { data: graphRawData, error: graphError, isLoading: loadingGraph } = useSWR<TeamMetric[]>(
    graphApiUrl, 
    fetcher, 
    { 
      refreshInterval: 20000, // อัพเดททุก 20 วินาที
      onSuccess: () => setLastUpdate(new Date()),
      // ✅ เพิ่ม config เพื่อไม่ให้กระพริบ
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 15000, // ป้องกันการ fetch ซ้ำใน 15 วินาที
    }
  );

  useEffect(() => {
    if (!graphRawData || graphRawData.length === 0) {
      setChartData({ cpm: [], costPerDeposit: [], deposits: [], cover: [] });
      return;
    }

    const aggregateMonthly = (dailyData: DailyDataPoint[], aggregationType: 'sum' | 'last') => {
      const monthlyMap = new Map<string, { total: number, lastValue: number }>();
      const sortedDailyData = [...dailyData].sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
      sortedDailyData.forEach(day => {
        const monthKey = dayjs(day.date).format('YYYY-MM-01');
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { total: 0, lastValue: 0 });
        }
        const month = monthlyMap.get(monthKey)!;
        month.total += day.value;
        month.lastValue = day.value;
      });
      return Array.from(monthlyMap.entries()).map(([date, values]) => {
        let value = 0;
        switch (aggregationType) {
          case 'sum': value = values.total; break;
          case 'last': value = values.lastValue; break;
        }
        return { date, value };
      });
    };

    const transformData = (dataKey: keyof TeamMetric, monthlyAgg: 'sum' | 'last') => {
      const dateMap = new Map<string, TransformedChartData>();
      graphRawData.forEach(team => {
        let processedData = team[dataKey] as DailyDataPoint[] || [];
        if (graphView === 'monthly' && Array.isArray(processedData)) {
          processedData = aggregateMonthly(processedData, monthlyAgg);
        }
        if (Array.isArray(processedData)) {
          processedData.forEach(day => {
            if (!dateMap.has(day.date)) {
              dateMap.set(day.date, { date: day.date });
            }
            dateMap.get(day.date)![team.team_name] = day.value;
          });
        }
      });

      const sortedData = Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return sortedData.filter(d => !dayjs(d.date).isAfter(dayjs(), 'day'));
    };

    const calculateMonthlyRatio = (numeratorKey: keyof TeamMetric, denominatorKey: keyof TeamMetric) => {
        const dateMap = new Map<string, TransformedChartData>();

        graphRawData.forEach(team => {
            const numeratorDaily = team[numeratorKey] as DailyDataPoint[] || [];
            const denominatorDaily = team[denominatorKey] as DailyDataPoint[] || [];

            const monthlyTotals = new Map<string, { numerator: number, denominator: number }>();

            numeratorDaily.forEach(day => {
                const monthKey = dayjs(day.date).format('YYYY-MM-01');
                if (!monthlyTotals.has(monthKey)) {
                    monthlyTotals.set(monthKey, { numerator: 0, denominator: 0 });
                }
                monthlyTotals.get(monthKey)!.numerator += day.value;
            });
            
            denominatorDaily.forEach(day => {
                const monthKey = dayjs(day.date).format('YYYY-MM-01');
                if (!monthlyTotals.has(monthKey)) {
                    monthlyTotals.set(monthKey, { numerator: 0, denominator: 0 });
                }
                monthlyTotals.get(monthKey)!.denominator += day.value;
            });

            monthlyTotals.forEach((totals, monthKey) => {
                if (!dateMap.has(monthKey)) {
                    dateMap.set(monthKey, { date: monthKey });
                }
                const value = totals.denominator > 0 ? totals.numerator / totals.denominator : 0;
                dateMap.get(monthKey)![team.team_name] = value;
            });
        });

        const sortedData = Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return sortedData.filter(d => !dayjs(d.date).isAfter(dayjs(), 'day'));
    };

    if (graphView === 'monthly') {
      setChartData({
        cpm: calculateMonthlyRatio('actual_spend_daily', 'total_inquiries_daily'),
        costPerDeposit: calculateMonthlyRatio('actual_spend_daily', 'deposits_count_daily'),
        deposits: transformData('deposits_count_daily', 'sum'),
        cover: transformData('one_dollar_per_cover_daily', 'last'),
      });
    } else {
      setChartData({
        cpm: transformData('cpm_cost_per_inquiry_daily', 'sum'),
        costPerDeposit: transformData('cost_per_deposit_daily', 'sum'),
        deposits: transformData('deposits_count_daily', 'sum'),
        cover: transformData('one_dollar_per_cover_daily', 'last'),
      });
    }
  }, [graphRawData, graphView]);

  const error = tableError || graphError;
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>;

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: dayjs().month(i).locale('th').format('MMMM'), value: i }));
  const yearOptions = Array.from({ length: 5 }, (_, i) => dayjs().year() - i);

  return (
    <div 
      className={cn(
        "h-screen p-4 sm:p-6 transition-colors duration-200",
        effectiveTheme === 'dark' 
          ? "bg-slate-900 text-slate-100" 
          : "bg-slate-50 text-slate-900"
      )} 
      data-page="overview"
    >
      <Card className={cn(
        "h-full overflow-hidden border-0 shadow-lg transition-colors duration-200",
        effectiveTheme === 'dark'
          ? "bg-slate-800 shadow-slate-900/50"
          : "bg-white shadow-slate-200/50"
      )}>
        <div className="h-full overflow-y-auto p-6">
          <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className={cn(
                "text-2xl font-bold tracking-tight transition-colors duration-200",
                effectiveTheme === 'dark' ? "text-slate-100" : "text-slate-900"
              )}>ภาพรวมรายทีม</h1>
              <RealTimeStatus lastUpdate={lastUpdate} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* ฝั่ง "ข้อมูลตาราง" */}
              <div>
                <p className="text-xs text-muted-foreground mb-1 text-center sm:text-left">ข้อมูลตาราง</p>
                {!isClient ? (
                  <Skeleton className="h-9 w-[260px]" />
                ) : (
                  <DateRangePicker
                    date={tableDateRange}
                    onDateChange={setTableDateRange}
                  />
                )}
              </div>

              {/* ฝั่ง "ข้อมูลกราฟ" */}
              <div className="flex flex-col items-center sm:items-start">
                <p className="text-xs text-muted-foreground mb-1">ข้อมูลกราฟ</p>
                {!isClient ? (
                  <Skeleton className="h-9 w-[300px]" />
                ) : (
                  <div className={filterFrameClass}>
                    {graphView === 'daily' && (
                      <Select value={String(graphMonth)} onValueChange={(v) => setGraphMonth(Number(v))}>
                        <SelectTrigger className="h-9 border-0 shadow-none focus:ring-0 w-[120px]">
                          <SelectValue placeholder="เลือกเดือน" />
                        </SelectTrigger>
                        <SelectContent>
                          {monthOptions.map(opt => <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}

                    <Select value={String(graphYear)} onValueChange={(v) => setGraphYear(Number(v))}>
                      <SelectTrigger className="h-9 border-0 shadow-none focus:ring-0 w-[90px]">
                        <SelectValue placeholder="เลือกปี" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <div className="h-6 w-px bg-border" />

                    <ToggleGroup
                      type="single"
                      value={graphView}
                      onValueChange={(value) => { if (value) setGraphView(value as 'daily' | 'monthly'); }}
                      aria-label="Graph View"
                    >
                      <ToggleGroupItem value="daily" aria-label="Daily view" className="h-9 px-2.5 text-xs">
                        รายวัน
                      </ToggleGroupItem>
                      <ToggleGroupItem value="monthly" aria-label="Monthly view" className="h-9 px-2.5 text-xs">
                        รายเดือน
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
        {Object.entries(teamGroups).map(([groupName, teamNames]) => {
          const teamsInGroup = tableData ? tableData.filter(team => teamNames.includes(team.team_name)) : [];
          if (loadingTable && !tableData) { return <Skeleton key={groupName} className="h-96 w-full" />; }
          if (!isClient && teamsInGroup.length === 0) { return <Skeleton key={groupName} className="h-96 w-full" />;}
          if (teamsInGroup.length === 0) {
            return (
              <Card key={groupName} className="p-4 md:p-6 relative">
                <h2 className="text-2xl font-bold mb-4">{groupName}</h2>
                <p className="text-muted-foreground">ไม่มีข้อมูลสำหรับกลุ่มนี้ในช่วงวันที่ที่เลือก</p>
              </Card>
            );
          }

          const groupMaxValues = groupYAxisMax[groupName as keyof typeof groupYAxisMax];

          return (
            <Card key={groupName} className="p-0">
              <div className="flex flex-row items-center justify-between mb-4 px-4 pt-4 pb-2">
                <h2 className="text-2xl font-bold">{groupName}</h2>
                <div className="flex items-center gap-2">
                  {groupName === 'Lotto' && <ExchangeRateSmall rate={exchangeRate} isLoading={isRateLoading} isFallback={isRateFallback} />}
                  <ColorSettingsPopover groupName={groupName} teamNames={teamNames} settings={colorSettings} onSave={setColorSettings} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="h-8"
                  >
                    {showBreakdown ? <ChevronLeft className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                    {showBreakdown ? 'ซ่อน' : 'ละเอียด'}
                  </Button>
                </div>
              </div>

              <div className="space-y-6 px-0 pb-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">ทีม</TableHead>
                        <TableHead>ยอดทัก / แผน</TableHead>
                        <TableHead>ใช้จ่าย / แผน</TableHead>
                        <TableHead>ยอดทักสุทธิ / เสีย</TableHead>
                        <TableHead className="text-right min-w-[80px]">CPM</TableHead>
                        <TableHead className="text-right min-w-[70px]">ยอดเติม</TableHead>
                        <TableHead className="text-right min-w-[80px]">ทุน/เติม</TableHead>
                        <TableHead className="text-right min-w-[120px]">ยอดเล่นใหม่</TableHead>
                        <TableHead className="text-right min-w-[90px]">1$ / Cover</TableHead>
                        {showBreakdown && <>
                          <TableHead className="text-center min-w-[70px]">ทักเงียบ</TableHead>
                          <TableHead className="text-center min-w-[70px]">ทักซ้ำ</TableHead>
                          <TableHead className="text-center min-w-[70px]">มียูส</TableHead>
                          <TableHead className="text-center min-w-[70px]">ก่อกวน</TableHead>
                          <TableHead className="text-center min-w-[70px]">บล็อก</TableHead>
                          <TableHead className="text-center min-w-[70px]">ต่ำกว่า18</TableHead>
                          <TableHead className="text-center min-w-[70px]">อายุเกิน50</TableHead>
                          <TableHead className="text-center min-w-[70px]">ต่างชาติ</TableHead>
                        </>}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {teamsInGroup
                        .sort((a, b) => {
                          const teamOrder = teamNames;
                          const indexA = teamOrder.indexOf(a.team_name);
                          const indexB = teamOrder.indexOf(b.team_name);
                          return indexA - indexB;
                        })
                        .map((team) => {
                          return (
                            <TableRow key={team.team_name} className="table-row-transition">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <span
                                    className={cn(
                                      'w-2.5 h-2.5 rounded-full flex-shrink-0 status-indicator',
                                      Number(team.actual_spend ?? 0) <= Number(team.planned_daily_spend ?? 0) ? 'bg-green-500' : 'bg-red-500'
                                    )}
                                  />
                                  <span className="font-semibold">{team.team_name}</span>
                                </div>
                              </TableCell>
                              <TableCell><div className="text-sm"><ProgressCell value={team.total_inquiries ?? 0} total={team.planned_inquiries ?? 0} /></div></TableCell>
                              <TableCell><div className="text-sm"><ProgressCell value={team.actual_spend ?? 0} total={team.planned_daily_spend ?? 0} isCurrency /></div></TableCell>
                              <TableCell><div className="text-sm"><StackedProgressCell net={team.net_inquiries ?? 0} wasted={team.wasted_inquiries ?? 0} total={team.total_inquiries ?? 0} /></div></TableCell>
                              <TableCell className="text-right"><div className="text-sm"><span style={getCellStyle(team.team_name, 'cpm_cost_per_inquiry', team.cpm_cost_per_inquiry ?? 0)}><FinancialMetric value={team.cpm_cost_per_inquiry ?? 0} prefix="$" /></span></div></TableCell>
                              <TableCell className="text-right font-semibold"><div className="text-sm number-transition"><span style={getCellStyle(team.team_name, 'deposits_count', team.deposits_count ?? 0)}>{formatNumber(team.deposits_count ?? 0)}</span></div></TableCell>
                              <TableCell className="text-right"><div className="text-sm"><span style={getCellStyle(team.team_name, 'cost_per_deposit', team.cost_per_deposit ?? 0)}><FinancialMetric value={team.cost_per_deposit ?? 0} prefix="$" /></span></div></TableCell>
                              <TableCell className="text-right min-w-[120px] pr-2"><div className="text-sm"><span style={getCellStyle(team.team_name, 'new_player_value_thb', team.new_player_value_thb ?? 0)}><FinancialMetric value={team.new_player_value_thb ?? 0} prefix="฿" /></span></div></TableCell>
                              <TableCell className="text-right"><div className="text-sm"><span style={getCellStyle(team.team_name, 'one_dollar_per_cover', team.one_dollar_per_cover ?? 0)}><FinancialMetric value={team.one_dollar_per_cover ?? 0} prefix="$" /></span></div></TableCell>
                              {showBreakdown && <>
                                <TableCell><div className="text-sm"><span style={getCellStyle(team.team_name, 'silent_inquiries', team.silent_inquiries ?? 0, team.total_inquiries ?? 0)}><BreakdownCell value={team.silent_inquiries ?? 0} total={team.total_inquiries ?? 0} /></span></div></TableCell>
                                <TableCell><div className="text-sm"><span style={getCellStyle(team.team_name, 'repeat_inquiries', team.repeat_inquiries ?? 0, team.total_inquiries ?? 0)}><BreakdownCell value={team.repeat_inquiries ?? 0} total={team.total_inquiries ?? 0} /></span></div></TableCell>
                                <TableCell><div className="text-sm"><span style={getCellStyle(team.team_name, 'existing_user_inquiries', team.existing_user_inquiries ?? 0, team.total_inquiries ?? 0)}><BreakdownCell value={team.existing_user_inquiries ?? 0} total={team.total_inquiries ?? 0} /></span></div></TableCell>
                                <TableCell><div className="text-sm"><span style={getCellStyle(team.team_name, 'spam_inquiries', team.spam_inquiries ?? 0, team.total_inquiries ?? 0)}><BreakdownCell value={team.spam_inquiries ?? 0} total={team.total_inquiries ?? 0} /></span></div></TableCell>
                                <TableCell><div className="text-sm"><span style={getCellStyle(team.team_name, 'blocked_inquiries', team.blocked_inquiries ?? 0, team.total_inquiries ?? 0)}><BreakdownCell value={team.blocked_inquiries ?? 0} total={team.total_inquiries ?? 0} /></span></div></TableCell>
                                <TableCell><div className="text-sm"><span style={getCellStyle(team.team_name, 'under_18_inquiries', team.under_18_inquiries ?? 0, team.total_inquiries ?? 0)}><BreakdownCell value={team.under_18_inquiries ?? 0} total={team.total_inquiries ?? 0} /></span></div></TableCell>
                                <TableCell><div className="text-sm"><span style={getCellStyle(team.team_name, 'over_50_inquiries', team.over_50_inquiries ?? 0, team.total_inquiries ?? 0)}><BreakdownCell value={team.over_50_inquiries ?? 0} total={team.total_inquiries ?? 0} /></span></div></TableCell>
                                <TableCell><div className="text-sm"><span style={getCellStyle(team.team_name, 'foreigner_inquiries', team.foreigner_inquiries ?? 0, team.total_inquiries ?? 0)}><BreakdownCell value={team.foreigner_inquiries ?? 0} total={team.total_inquiries ?? 0} /></span></div></TableCell>
                              </>}
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>

                <Collapsible open={expandedGroups.has(groupName)} onOpenChange={() => toggleGroup(groupName)}>
                  <CollapsibleContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <GroupedChart title="ต้นทุนทัก (CPM)" data={chartData.cpm} yAxisLabel="$" loading={loadingGraph} teamsToShow={teamNames} chartType="cpm" yAxisDomainMax={groupMaxValues?.cpm} graphView={graphView} />
                      <GroupedChart title="ต้นทุนต่อเติม" data={chartData.costPerDeposit} yAxisLabel="$" loading={loadingGraph} teamsToShow={teamNames} chartType="costPerDeposit" yAxisDomainMax={groupMaxValues?.costPerDeposit} graphView={graphView} />
                      <GroupedChart title="เป้ายอดเติม" data={chartData.deposits} yAxisLabel="" loading={loadingGraph} teamsToShow={teamNames} chartType="deposits" dateForTarget={graphDateRange?.from} graphView={graphView} />
                      <GroupedChart title="1$ / Cover" data={chartData.cover} yAxisLabel="$" loading={loadingGraph} teamsToShow={teamNames} chartType="cover" groupName={groupName} yAxisDomainMax={groupMaxValues?.cover} graphView={graphView} />
                    </div>
                  </CollapsibleContent>
                  
                  <div className="flex justify-center border-t bg-muted/30 p-3 mt-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="text-xs text-muted-foreground w-full max-w-xs h-9">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {expandedGroups.has(groupName) ? 'ซ่อนกราฟ' : 'แสดงกราฟ'}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </Collapsible>
              </div>
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