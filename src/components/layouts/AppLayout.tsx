import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Chatbot } from '@/components/common/Chatbot';
import {
  getUnreadAlertCount,
  getDashboardStats,
  getFinancialRecords,
  getOrders,
  getEquipment,
  getGovernmentSchemes,
  getFarmMapping,
  getCropPlans,
  getIrrigationSchedules,
  getDiagnoses,
  getProducts,
  getInventory,
  getAlerts,
} from '@/db/api';
import { toast } from 'sonner';
import { Menu, Bell, User, Settings, LogOut, Sprout, Tractor, Home, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Circle, ExternalLink, Gauge, Radar, Clock3, BarChart3, Table2, ClipboardPenLine } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  farmTypes: ('rural' | 'urban' | 'both')[];
}

const ruralNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/rural/dashboard', icon: <Home className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Crop Encyclopedia', path: '/rural/encyclopedia', icon: <Sprout className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Plant Diagnosis', path: '/rural/diagnosis', icon: <Sprout className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Farm Records', path: '/rural/records', icon: <Tractor className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Crops Management', path: '/rural/crops', icon: <Sprout className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Livestock', path: '/rural/livestock', icon: <Tractor className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Inventory', path: '/rural/inventory', icon: <Tractor className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Equipment', path: '/rural/equipment', icon: <Tractor className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Financial', path: '/rural/financial', icon: <Tractor className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Orders', path: '/rural/orders', icon: <Tractor className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Weather', path: '/rural/weather', icon: <Tractor className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Farm Mapping', path: '/rural/mapping', icon: <Tractor className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Analytics', path: '/rural/analytics', icon: <Tractor className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
  { label: 'Gov Schemes', path: '/rural/schemes', icon: <Tractor className="w-4 h-4" />, farmTypes: ['rural', 'both'] },
];

const urbanNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/urban/dashboard', icon: <Home className="w-4 h-4" />, farmTypes: ['urban', 'both'] },
  { label: 'Crop Planning', path: '/urban/planning', icon: <Sprout className="w-4 h-4" />, farmTypes: ['urban', 'both'] },
  { label: 'Irrigation', path: '/urban/irrigation', icon: <Sprout className="w-4 h-4" />, farmTypes: ['urban', 'both'] },
  { label: 'Plant Health', path: '/urban/health', icon: <Sprout className="w-4 h-4" />, farmTypes: ['urban', 'both'] },
  { label: 'Marketplace', path: '/urban/marketplace', icon: <Sprout className="w-4 h-4" />, farmTypes: ['urban', 'both'] },
  { label: 'Analytics', path: '/urban/analytics', icon: <Sprout className="w-4 h-4" />, farmTypes: ['urban', 'both'] },
  { label: 'Inventory', path: '/urban/inventory', icon: <Sprout className="w-4 h-4" />, farmTypes: ['urban', 'both'] },
  { label: 'Weather', path: '/urban/weather', icon: <Sprout className="w-4 h-4" />, farmTypes: ['urban', 'both'] },
];

interface ContextualPanelData {
  title: string;
  focus: string;
  score: number;
  tasks: string[];
  actions: Array<{ label: string; path: string }>;
}

type StudioTab = 'chart' | 'table' | 'capture';

interface ModuleStudioData {
  chartLabel: string;
  chartSeries: number[];
  tableHeaders: string[];
  tableRows: string[][];
  captureFields: string[];
  captureCta: string;
}

const contextByPath: Record<string, ContextualPanelData> = {
  '/rural/dashboard': {
    title: 'Farm Command Pulse',
    focus: 'Balance crop performance, costs, and operational readiness.',
    score: 82,
    tasks: ['Review high-risk fields', 'Validate daily expense logs', 'Confirm team assignments'],
    actions: [
      { label: 'Open Analytics', path: '/rural/analytics' },
      { label: 'Check Orders', path: '/rural/orders' },
    ],
  },
  '/rural/financial': {
    title: 'Financial Control Deck',
    focus: 'Protect cash flow and tighten spending quality.',
    score: 76,
    tasks: ['Reconcile pending expenses', 'Export this week summary', 'Tag uncategorized records'],
    actions: [
      { label: 'Go to Orders', path: '/rural/orders' },
      { label: 'View Dashboard', path: '/rural/dashboard' },
    ],
  },
  '/rural/orders': {
    title: 'Orders Fulfillment Watch',
    focus: 'Keep shipment backlog and payment delays under control.',
    score: 79,
    tasks: ['Prioritize delayed orders', 'Verify unpaid invoices', 'Contact high-value buyers'],
    actions: [
      { label: 'Open Financial', path: '/rural/financial' },
      { label: 'View Analytics', path: '/rural/analytics' },
    ],
  },
  '/rural/weather': {
    title: 'Weather Risk Console',
    focus: 'Translate forecast into immediate field decisions.',
    score: 84,
    tasks: ['Adjust irrigation schedule', 'Prepare rain-safe storage', 'Review wind-sensitive zones'],
    actions: [
      { label: 'Open Mapping', path: '/rural/mapping' },
      { label: 'Go to Dashboard', path: '/rural/dashboard' },
    ],
  },
  '/rural/mapping': {
    title: 'Field Mapping Studio',
    focus: 'Optimize allocation across plots and crop density.',
    score: 74,
    tasks: ['Mark low-performing blocks', 'Assign next crop rotation', 'Update irrigation lanes'],
    actions: [
      { label: 'Open Crops', path: '/rural/crops' },
      { label: 'Check Weather', path: '/rural/weather' },
    ],
  },
  '/rural/analytics': {
    title: 'Insights Intelligence Hub',
    focus: 'Turn metrics into weekly strategy changes.',
    score: 87,
    tasks: ['Compare yield by stage', 'Track top expense categories', 'Review alert trends'],
    actions: [
      { label: 'Go to Financial', path: '/rural/financial' },
      { label: 'Open Dashboard', path: '/rural/dashboard' },
    ],
  },
  '/rural/schemes': {
    title: 'Scheme Opportunity Board',
    focus: 'Capture deadlines and maximize policy benefits.',
    score: 71,
    tasks: ['Shortlist eligible schemes', 'Prepare document checklist', 'Track deadline calendar'],
    actions: [
      { label: 'Back to Dashboard', path: '/rural/dashboard' },
      { label: 'Open Financial', path: '/rural/financial' },
    ],
  },
  '/rural/equipment': {
    title: 'Maintenance Reliability Center',
    focus: 'Reduce downtime with proactive service planning.',
    score: 80,
    tasks: ['Flag overdue maintenance', 'Schedule technician rounds', 'Audit spare part inventory'],
    actions: [
      { label: 'View Inventory', path: '/rural/inventory' },
      { label: 'Open Dashboard', path: '/rural/dashboard' },
    ],
  },
  '/urban/dashboard': {
    title: 'Urban Farm Performance Grid',
    focus: 'Coordinate intensive operations in compact spaces.',
    score: 83,
    tasks: ['Review zone utilization', 'Validate water budget', 'Confirm sales pipeline'],
    actions: [
      { label: 'Open Crop Planning', path: '/urban/planning' },
      { label: 'Open Irrigation', path: '/urban/irrigation' },
    ],
  },
  '/urban/planning': {
    title: 'Crop Planning Engine',
    focus: 'Prioritize high-margin and climate-fit crops.',
    score: 78,
    tasks: ['Refresh season assumptions', 'Plan rotation sequence', 'Review space constraints'],
    actions: [
      { label: 'Go to Marketplace', path: '/urban/marketplace' },
      { label: 'Open Analytics', path: '/urban/analytics' },
    ],
  },
  '/urban/irrigation': {
    title: 'Irrigation Optimization Lab',
    focus: 'Lower water waste without affecting crop health.',
    score: 86,
    tasks: ['Tune watering windows', 'Audit zone-level usage', 'Review anomaly alerts'],
    actions: [
      { label: 'Open Plant Health', path: '/urban/health' },
      { label: 'Check Weather', path: '/urban/weather' },
    ],
  },
  '/urban/health': {
    title: 'Plant Health Monitor',
    focus: 'Detect issues early and improve treatment speed.',
    score: 81,
    tasks: ['Review latest diagnoses', 'Validate treatment backlog', 'Tag recurring symptoms'],
    actions: [
      { label: 'Open Irrigation', path: '/urban/irrigation' },
      { label: 'Go to Dashboard', path: '/urban/dashboard' },
    ],
  },
  '/urban/marketplace': {
    title: 'Marketplace Demand Radar',
    focus: 'Align inventory and pricing with demand signals.',
    score: 77,
    tasks: ['Update top listings', 'Monitor low stock SKUs', 'Review conversion blockers'],
    actions: [
      { label: 'Open Inventory', path: '/urban/inventory' },
      { label: 'View Analytics', path: '/urban/analytics' },
    ],
  },
  '/urban/analytics': {
    title: 'Urban Intelligence Canvas',
    focus: 'Track operating efficiency and sales quality.',
    score: 85,
    tasks: ['Compare zone productivity', 'Audit revenue leakage', 'Prioritize weekly optimizations'],
    actions: [
      { label: 'Go to Dashboard', path: '/urban/dashboard' },
      { label: 'Open Marketplace', path: '/urban/marketplace' },
    ],
  },
  '/urban/inventory': {
    title: 'Urban Inventory Control',
    focus: 'Improve replenishment timing and reduce stockouts.',
    score: 79,
    tasks: ['Verify reorder thresholds', 'Review aging stock', 'Sync procurement list'],
    actions: [
      { label: 'Open Marketplace', path: '/urban/marketplace' },
      { label: 'View Weather', path: '/urban/weather' },
    ],
  },
  '/urban/weather': {
    title: 'Microclimate Weather Board',
    focus: 'Use local forecast to tune urban systems.',
    score: 84,
    tasks: ['Adjust greenhouse vents', 'Review humidity alerts', 'Update irrigation profile'],
    actions: [
      { label: 'Open Irrigation', path: '/urban/irrigation' },
      { label: 'Go to Dashboard', path: '/urban/dashboard' },
    ],
  },
};

const defaultContext: ContextualPanelData = {
  title: 'Smart Operations Assistant',
  focus: 'Stay focused on today\'s critical farm actions.',
  score: 80,
  tasks: ['Review pending alerts', 'Update task progress', 'Confirm tomorrow priorities'],
  actions: [
    { label: 'Rural Dashboard', path: '/rural/dashboard' },
    { label: 'Urban Dashboard', path: '/urban/dashboard' },
  ],
};

const defaultStudio: ModuleStudioData = {
  chartLabel: 'Weekly module trend',
  chartSeries: [58, 64, 62, 71, 75, 79, 83],
  tableHeaders: ['Metric', 'Current', 'Change'],
  tableRows: [
    ['Productivity', '83%', '+5%'],
    ['Risk', 'Low', '-2'],
    ['Efficiency', '78%', '+4%'],
  ],
  captureFields: ['Observation', 'Priority', 'Owner'],
  captureCta: 'Save quick note',
};

const normalizeSeries = (values: number[], fallback: number[]) => {
  const cleaned = values.filter((value) => Number.isFinite(value));
  const source = cleaned.length ? cleaned : fallback;
  const bounded = source.map((value) => Math.max(8, Math.min(100, Math.round(value))));
  if (bounded.length >= 7) {
    return bounded.slice(-7);
  }
  const padValue = bounded[0] ?? 50;
  const padded = [...bounded];
  while (padded.length < 7) {
    padded.unshift(padValue);
  }
  return padded;
};

const currency = (amount: number) => `$${amount.toFixed(0)}`;

const studioByPath: Record<string, ModuleStudioData> = {
  '/rural/equipment': {
    chartLabel: 'Maintenance readiness trend',
    chartSeries: [62, 60, 67, 70, 72, 78, 81],
    tableHeaders: ['Machine', 'Status', 'Due'],
    tableRows: [
      ['Tractor A', 'Due soon', '2 days'],
      ['Seeder Pro', 'Scheduled', '9 days'],
      ['Sprayer X', 'Overdue', '3 days'],
    ],
    captureFields: ['Machine', 'Issue', 'Action'],
    captureCta: 'Log maintenance task',
  },
  '/rural/financial': {
    chartLabel: 'Cashflow health trend',
    chartSeries: [54, 61, 60, 66, 71, 73, 77],
    tableHeaders: ['Category', 'Amount', 'Direction'],
    tableRows: [
      ['Revenue', '$4,920', 'Up'],
      ['Expenses', '$3,180', 'Stable'],
      ['Net', '$1,740', 'Up'],
    ],
    captureFields: ['Entry title', 'Amount', 'Category'],
    captureCta: 'Capture finance note',
  },
  '/rural/orders': {
    chartLabel: 'Fulfillment speed trend',
    chartSeries: [49, 57, 63, 61, 68, 74, 80],
    tableHeaders: ['Order', 'Stage', 'Delay'],
    tableRows: [
      ['ORD-124', 'Packed', '0d'],
      ['ORD-126', 'Pending', '2d'],
      ['ORD-130', 'Shipped', '0d'],
    ],
    captureFields: ['Order ID', 'Issue', 'Resolution'],
    captureCta: 'Add ops note',
  },
  '/rural/weather': {
    chartLabel: 'Weather risk score trend',
    chartSeries: [70, 64, 59, 67, 74, 69, 72],
    tableHeaders: ['Zone', 'Risk', 'Action'],
    tableRows: [
      ['North Field', 'High wind', 'Delay spray'],
      ['Greenhouse', 'Humidity', 'Open vents'],
      ['Main Plot', 'Rain', 'Drain check'],
    ],
    captureFields: ['Area', 'Condition', 'Decision'],
    captureCta: 'Save weather action',
  },
  '/rural/mapping': {
    chartLabel: 'Plot utilization trend',
    chartSeries: [52, 55, 61, 66, 70, 73, 76],
    tableHeaders: ['Plot', 'Assigned crop', 'Status'],
    tableRows: [
      ['A1', 'Rice', 'Active'],
      ['B4', 'Maize', 'Planned'],
      ['C2', 'Tomato', 'Monitor'],
    ],
    captureFields: ['Plot ID', 'Crop', 'Notes'],
    captureCta: 'Update map plan',
  },
  '/rural/analytics': {
    chartLabel: 'Insights confidence trend',
    chartSeries: [60, 65, 68, 72, 76, 82, 88],
    tableHeaders: ['Insight', 'Impact', 'Priority'],
    tableRows: [
      ['Water savings', 'High', 'P1'],
      ['Yield uplift', 'Medium', 'P2'],
      ['Cost drift', 'High', 'P1'],
    ],
    captureFields: ['Insight', 'Decision', 'Owner'],
    captureCta: 'Record insight action',
  },
  '/rural/schemes': {
    chartLabel: 'Eligibility progress trend',
    chartSeries: [45, 52, 57, 63, 68, 72, 75],
    tableHeaders: ['Scheme', 'Deadline', 'Readiness'],
    tableRows: [
      ['Subsidy A', '5 days', '70%'],
      ['Insurance B', '12 days', '55%'],
      ['Loan C', '18 days', '83%'],
    ],
    captureFields: ['Scheme', 'Document', 'Status'],
    captureCta: 'Save scheme step',
  },
  '/urban/dashboard': {
    chartLabel: 'Urban performance trend',
    chartSeries: [58, 62, 65, 70, 73, 79, 84],
    tableHeaders: ['Zone', 'Output', 'Health'],
    tableRows: [
      ['Zone 1', '92%', 'Good'],
      ['Zone 2', '81%', 'Watch'],
      ['Zone 3', '87%', 'Good'],
    ],
    captureFields: ['Zone', 'Observation', 'Action'],
    captureCta: 'Update dashboard log',
  },
  '/urban/planning': {
    chartLabel: 'Planning fit trend',
    chartSeries: [50, 56, 61, 65, 69, 75, 79],
    tableHeaders: ['Crop', 'Space fit', 'Margin'],
    tableRows: [
      ['Lettuce', 'High', 'High'],
      ['Basil', 'Medium', 'High'],
      ['Spinach', 'High', 'Medium'],
    ],
    captureFields: ['Crop', 'Space', 'Cycle'],
    captureCta: 'Add planning option',
  },
  '/urban/irrigation': {
    chartLabel: 'Water efficiency trend',
    chartSeries: [61, 64, 67, 72, 74, 80, 85],
    tableHeaders: ['Zone', 'Usage', 'Variance'],
    tableRows: [
      ['North', '120L', '-8%'],
      ['Center', '140L', '+2%'],
      ['South', '108L', '-4%'],
    ],
    captureFields: ['Zone', 'Adjustment', 'Reason'],
    captureCta: 'Save irrigation tweak',
  },
  '/urban/health': {
    chartLabel: 'Plant health score trend',
    chartSeries: [57, 60, 63, 68, 71, 77, 82],
    tableHeaders: ['Plant', 'Symptom', 'Severity'],
    tableRows: [
      ['Tomato', 'Leaf spot', 'Medium'],
      ['Pepper', 'Wilting', 'Low'],
      ['Mint', 'Yellowing', 'Medium'],
    ],
    captureFields: ['Plant', 'Symptom', 'Treatment'],
    captureCta: 'Log diagnosis note',
  },
  '/urban/marketplace': {
    chartLabel: 'Demand momentum trend',
    chartSeries: [48, 55, 62, 67, 70, 76, 81],
    tableHeaders: ['Product', 'Views', 'Conversion'],
    tableRows: [
      ['Herb Mix', '1,240', '4.8%'],
      ['Leafy Box', '980', '5.2%'],
      ['Microgreens', '1,540', '3.9%'],
    ],
    captureFields: ['Listing', 'Update', 'Goal'],
    captureCta: 'Save marketplace action',
  },
  '/urban/analytics': {
    chartLabel: 'Urban insight trend',
    chartSeries: [59, 61, 66, 71, 75, 79, 86],
    tableHeaders: ['Metric', 'Value', 'Direction'],
    tableRows: [
      ['Efficiency', '84%', 'Up'],
      ['Waste', '9%', 'Down'],
      ['Revenue', '$3,420', 'Up'],
    ],
    captureFields: ['Metric', 'Finding', 'Decision'],
    captureCta: 'Record analytics action',
  },
  '/urban/inventory': {
    chartLabel: 'Stock health trend',
    chartSeries: [52, 58, 61, 65, 69, 73, 78],
    tableHeaders: ['Item', 'Qty', 'Status'],
    tableRows: [
      ['Grow Mix', '12 bags', 'Low'],
      ['Nutrient A', '24 L', 'Good'],
      ['Seeds B', '5 packs', 'Critical'],
    ],
    captureFields: ['Item', 'Adjustment', 'Reason'],
    captureCta: 'Save inventory note',
  },
  '/urban/weather': {
    chartLabel: 'Microclimate stability trend',
    chartSeries: [64, 67, 63, 70, 74, 72, 79],
    tableHeaders: ['Sensor', 'Reading', 'Flag'],
    tableRows: [
      ['Humidity', '71%', 'Watch'],
      ['Temp', '29C', 'Normal'],
      ['UV', '8', 'High'],
    ],
    captureFields: ['Parameter', 'Observation', 'Action'],
    captureCta: 'Save weather note',
  },
};

function Sidebar({
  farmType,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}: {
  farmType: 'rural' | 'urban' | 'both';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  const filteredRuralItems = ruralNavItems.filter(item => item.farmTypes.includes(farmType));
  const filteredUrbanItems = urbanNavItems.filter(item => item.farmTypes.includes(farmType));

  const isActive = (path: string) => location.pathname === path;

  const navItemClass = (active: boolean) =>
    [
      'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300',
      collapsed ? 'justify-center px-2' : '',
      active
        ? 'bg-white/90 text-emerald-950 shadow-sm ring-1 ring-emerald-200'
        : 'text-slate-700 hover:bg-white/70 hover:text-emerald-900',
    ].join(' ');

  return (
    <div className="flex h-full flex-col border-r border-emerald-100/70 bg-gradient-to-b from-emerald-50/95 via-white/95 to-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl">
      <div className={`border-b border-emerald-100/70 px-4 py-5 ${collapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
              <Sprout className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">SmartFarm</h2>
                <p className="text-xs text-slate-500">Farming Management</p>
              </div>
            )}
          </div>

          {onToggleCollapse && !collapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:bg-white/80" onClick={onToggleCollapse}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {onToggleCollapse && collapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:bg-white/80" onClick={onToggleCollapse}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!collapsed && (
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-700/80">Admin dashboard</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {(farmType === 'rural' || farmType === 'both') && (
          <div>
            {!collapsed && <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Rural Farming</h3>}
            <nav className="space-y-1">
              {filteredRuralItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={navItemClass(isActive(item.path))}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100">
                    {item.icon}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {(farmType === 'urban' || farmType === 'both') && (
          <div>
            {!collapsed && <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Urban Farming</h3>}
            <nav className="space-y-1">
              {filteredUrbanItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={navItemClass(isActive(item.path))}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100">
                    {item.icon}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [opsOpen, setOpsOpen] = useState(false);
  const [doneTasks, setDoneTasks] = useState<Record<string, boolean>>({});
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('chart');
  const [quickCapture, setQuickCapture] = useState<Record<string, string>>({});
  const [studioData, setStudioData] = useState<ModuleStudioData | null>(null);
  const [studioLoading, setStudioLoading] = useState(false);

  const contextPanel = useMemo(() => contextByPath[location.pathname] ?? defaultContext, [location.pathname]);
  const studioPanel = useMemo(
    () => studioData ?? studioByPath[location.pathname] ?? defaultStudio,
    [studioData, location.pathname]
  );
  const completedCount = contextPanel.tasks.filter((task) => doneTasks[`${location.pathname}-${task}`]).length;
  const completionPercent = contextPanel.tasks.length
    ? Math.round((completedCount / contextPanel.tasks.length) * 100)
    : 0;

  useEffect(() => {
    if (user) {
      getUnreadAlertCount(user.id).then(setUnreadCount);
      const interval = setInterval(() => {
        getUnreadAlertCount(user.id).then(setUnreadCount);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const loadStudioData = async () => {
      if (!user) {
        setStudioData(null);
        return;
      }

      setStudioLoading(true);
      try {
        let data: ModuleStudioData | null = null;

        if (location.pathname === '/rural/equipment') {
          const items = await getEquipment(user.id);
          const series = normalizeSeries(
            items.slice(0, 7).map((item) => {
              const days = item.next_maintenance_date
                ? Math.ceil((new Date(item.next_maintenance_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : 30;
              if (days < 0) return 25;
              if (days <= 7) return 50;
              if (days <= 14) return 70;
              return 88;
            }),
            [52, 58, 64, 72, 78, 82, 86]
          );
          const rows = items.slice(0, 3).map((item) => {
            const days = item.next_maintenance_date
              ? Math.ceil((new Date(item.next_maintenance_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;
            const status = days === null ? 'Unscheduled' : days < 0 ? 'Overdue' : days <= 14 ? 'Due soon' : 'Scheduled';
            return [item.name, status, item.next_maintenance_date || 'N/A'];
          });
          data = {
            chartLabel: 'Maintenance readiness trend',
            chartSeries: series,
            tableHeaders: ['Machine', 'Status', 'Due'],
            tableRows: rows.length ? rows : defaultStudio.tableRows,
            captureFields: ['Machine', 'Issue', 'Action'],
            captureCta: 'Log maintenance task',
          };
        } else if (location.pathname === '/rural/financial') {
          const records = await getFinancialRecords(user.id);
          const signedAmounts = records.slice(0, 7).map((record) => (record.record_type === 'income' ? record.amount : -record.amount));
          const series = normalizeSeries(signedAmounts.map((value) => 50 + value / 20), [48, 52, 57, 64, 70, 74, 78]);
          const income = records.filter((r) => r.record_type === 'income').reduce((sum, r) => sum + r.amount, 0);
          const expense = records.filter((r) => r.record_type === 'expense').reduce((sum, r) => sum + r.amount, 0);
          data = {
            chartLabel: 'Cashflow health trend',
            chartSeries: series,
            tableHeaders: ['Metric', 'Value', 'Direction'],
            tableRows: [
              ['Revenue', currency(income), 'Up'],
              ['Expenses', currency(expense), expense > income ? 'Watch' : 'Stable'],
              ['Net', currency(income - expense), income - expense >= 0 ? 'Positive' : 'Negative'],
            ],
            captureFields: ['Entry title', 'Amount', 'Category'],
            captureCta: 'Capture finance note',
          };
        } else if (location.pathname === '/rural/orders') {
          const orders = await getOrders(user.id);
          const statusScore = orders.slice(0, 7).map((order) => {
            if (order.status === 'delivered') return 90;
            if (order.status === 'shipped') return 75;
            if (order.status === 'confirmed') return 62;
            return 45;
          });
          data = {
            chartLabel: 'Fulfillment speed trend',
            chartSeries: normalizeSeries(statusScore, [50, 56, 62, 68, 72, 77, 80]),
            tableHeaders: ['Order', 'Stage', 'Qty'],
            tableRows: orders.slice(0, 3).map((order) => [order.id.slice(0, 8), order.status, String(order.quantity)]),
            captureFields: ['Order ID', 'Issue', 'Resolution'],
            captureCta: 'Add ops note',
          };
        } else if (location.pathname === '/rural/weather' || location.pathname === '/urban/weather') {
          const alerts = await getAlerts(user.id);
          const weatherAlerts = alerts.filter((alert) => alert.alert_type === 'weather_warning');
          data = {
            chartLabel: 'Weather risk signal trend',
            chartSeries: normalizeSeries(weatherAlerts.slice(0, 7).map((_, index) => 55 + index * 4), [60, 58, 62, 67, 71, 73, 76]),
            tableHeaders: ['Alert', 'Type', 'Read'],
            tableRows: weatherAlerts.slice(0, 3).map((alert) => [alert.title, alert.alert_type, alert.is_read ? 'Yes' : 'No']),
            captureFields: ['Area', 'Condition', 'Decision'],
            captureCta: 'Save weather action',
          };
        } else if (location.pathname === '/rural/mapping') {
          const mapping = await getFarmMapping(user.id);
          data = {
            chartLabel: 'Plot utilization trend',
            chartSeries: normalizeSeries(mapping.slice(0, 7).map((entry, index) => (entry.crop_assigned ? 70 + index : 45 + index * 2)), [50, 54, 58, 63, 67, 71, 75]),
            tableHeaders: ['Grid', 'Crop', 'Color'],
            tableRows: mapping.slice(0, 3).map((entry) => [entry.grid_position, entry.crop_assigned || 'Unassigned', entry.crop_color || '-']),
            captureFields: ['Plot ID', 'Crop', 'Notes'],
            captureCta: 'Update map plan',
          };
        } else if (location.pathname === '/rural/analytics') {
          const stats = await getDashboardStats(user.id, 'rural');
          data = {
            chartLabel: 'Rural performance trend',
            chartSeries: normalizeSeries([
              stats.active_crops,
              stats.pending_orders,
              stats.total_revenue / 200,
              stats.total_expenses / 200,
              stats.active_crops + 10,
              stats.pending_orders + 20,
              84,
            ], [55, 60, 64, 69, 74, 79, 84]),
            tableHeaders: ['Metric', 'Value', 'Signal'],
            tableRows: [
              ['Active crops', String(stats.active_crops), 'Track'],
              ['Pending orders', String(stats.pending_orders), 'Watch'],
              ['Revenue', currency(stats.total_revenue), 'Up'],
            ],
            captureFields: ['Insight', 'Decision', 'Owner'],
            captureCta: 'Record insight action',
          };
        } else if (location.pathname === '/rural/schemes') {
          const schemes = await getGovernmentSchemes();
          data = {
            chartLabel: 'Scheme readiness trend',
            chartSeries: normalizeSeries(schemes.slice(0, 7).map((_, index) => 50 + index * 5), [46, 52, 58, 64, 70, 74, 79]),
            tableHeaders: ['Scheme', 'Type', 'Deadline'],
            tableRows: schemes.slice(0, 3).map((scheme) => [scheme.scheme_name, scheme.scheme_type, scheme.application_deadline || 'Open']),
            captureFields: ['Scheme', 'Document', 'Status'],
            captureCta: 'Save scheme step',
          };
        } else if (location.pathname === '/urban/dashboard' || location.pathname === '/urban/analytics') {
          const stats = await getDashboardStats(user.id, 'urban');
          data = {
            chartLabel: 'Urban performance trend',
            chartSeries: normalizeSeries([
              stats.active_plants || 0,
              stats.pending_orders,
              stats.total_revenue / 150,
              stats.total_expenses / 150,
              (stats.water_usage || 0) / 10,
              (stats.active_plants || 0) + 8,
              86,
            ], [58, 62, 67, 71, 76, 81, 85]),
            tableHeaders: ['Metric', 'Value', 'Direction'],
            tableRows: [
              ['Active plants', String(stats.active_plants || 0), 'Up'],
              ['Water usage', String(stats.water_usage || 0), 'Optimize'],
              ['Revenue', currency(stats.total_revenue), 'Up'],
            ],
            captureFields: ['Metric', 'Finding', 'Decision'],
            captureCta: 'Record analytics action',
          };
        } else if (location.pathname === '/urban/planning') {
          const plans = await getCropPlans(user.id);
          data = {
            chartLabel: 'Planning fit trend',
            chartSeries: normalizeSeries(plans.slice(0, 7).map((plan) => Math.min(95, plan.available_space / 2)), [50, 55, 60, 66, 71, 75, 79]),
            tableHeaders: ['Location', 'Season', 'Space'],
            tableRows: plans.slice(0, 3).map((plan) => [plan.location, plan.season, `${plan.available_space} sqm`]),
            captureFields: ['Crop', 'Space', 'Cycle'],
            captureCta: 'Add planning option',
          };
        } else if (location.pathname === '/urban/irrigation') {
          const schedules = await getIrrigationSchedules(user.id);
          data = {
            chartLabel: 'Water efficiency trend',
            chartSeries: normalizeSeries(schedules.slice(0, 7).map((schedule) => 100 - Math.min(80, schedule.daily_water_usage)), [55, 61, 66, 70, 74, 78, 83]),
            tableHeaders: ['Plant', 'Time', 'Usage'],
            tableRows: schedules.slice(0, 3).map((schedule) => [schedule.plant_name, schedule.watering_time, `${schedule.daily_water_usage} L`]),
            captureFields: ['Zone', 'Adjustment', 'Reason'],
            captureCta: 'Save irrigation tweak',
          };
        } else if (location.pathname === '/urban/health') {
          const diagnoses = await getDiagnoses(user.id);
          data = {
            chartLabel: 'Plant health score trend',
            chartSeries: normalizeSeries(diagnoses.slice(0, 7).map((diagnosis) => diagnosis.confidence_score || 55), [52, 57, 61, 66, 70, 76, 81]),
            tableHeaders: ['Plant', 'Result', 'Confidence'],
            tableRows: diagnoses.slice(0, 3).map((diagnosis) => [diagnosis.plant_name || 'Unknown', diagnosis.diagnosis_result || 'Pending', `${Math.round(diagnosis.confidence_score || 0)}%`]),
            captureFields: ['Plant', 'Symptom', 'Treatment'],
            captureCta: 'Log diagnosis note',
          };
        } else if (location.pathname === '/urban/marketplace') {
          const products = await getProducts(user.id);
          data = {
            chartLabel: 'Demand momentum trend',
            chartSeries: normalizeSeries(products.slice(0, 7).map((product) => product.quantity_available * 2), [48, 54, 60, 66, 70, 76, 80]),
            tableHeaders: ['Product', 'Price', 'Qty'],
            tableRows: products.slice(0, 3).map((product) => [product.name, currency(product.price), String(product.quantity_available)]),
            captureFields: ['Listing', 'Update', 'Goal'],
            captureCta: 'Save marketplace action',
          };
        } else if (location.pathname === '/urban/inventory') {
          const items = await getInventory(user.id);
          data = {
            chartLabel: 'Stock health trend',
            chartSeries: normalizeSeries(items.slice(0, 7).map((item) => (item.quantity <= item.reorder_threshold ? 35 : 80)), [50, 54, 59, 64, 69, 74, 78]),
            tableHeaders: ['Item', 'Qty', 'Status'],
            tableRows: items.slice(0, 3).map((item) => [item.item_name, `${item.quantity} ${item.unit}`, item.quantity <= item.reorder_threshold ? 'Low' : 'Good']),
            captureFields: ['Item', 'Adjustment', 'Reason'],
            captureCta: 'Save inventory note',
          };
        }

        if (!cancelled) {
          setStudioData(data);
        }
      } catch (error) {
        console.error('Failed to load route studio data:', error);
        if (!cancelled) {
          setStudioData(null);
        }
      } finally {
        if (!cancelled) {
          setStudioLoading(false);
        }
      }
    };

    loadStudioData();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, user]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sidebarWidthClass = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72';

  const toggleTask = (task: string) => {
    const key = `${location.pathname}-${task}`;
    setDoneTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setCaptureField = (field: string, value: string) => {
    const key = `${location.pathname}-${field}`;
    setQuickCapture((prev) => ({ ...prev, [key]: value }));
  };

  const submitQuickCapture = () => {
    toast.success('Quick module note saved');
  };

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <Sidebar
          farmType={profile.farm_type}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        />
      </aside>

      <div className={`min-h-screen transition-all duration-300 ${sidebarWidthClass}`}>
        <div className="flex min-h-screen flex-col overflow-hidden">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-md lg:px-6">
            <div className="flex items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 sm:w-80">
                  <Sidebar
                    farmType={profile.farm_type}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              <div className="hidden lg:block">
                <h1 className="text-base font-semibold text-slate-900">Welcome, {profile.username}</h1>
                <p className="text-xs text-slate-500">{profile.farm_type} farming dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <Sheet open={opsOpen} onOpenChange={setOpsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden rounded-full border-emerald-200 bg-white/80 text-emerald-800 hover:bg-emerald-50 md:flex">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ops Panel
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[92vw] max-w-md overflow-y-auto sm:w-[420px]">
                  <div className="space-y-5 py-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Context Engine</p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">{contextPanel.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{contextPanel.focus}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-emerald-900">Operational Score</span>
                        <span className="font-semibold text-emerald-700">{contextPanel.score}%</span>
                      </div>
                      <Progress value={contextPanel.score} className="h-2" />
                      <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800">
                        <Gauge className="h-3.5 w-3.5" />
                        AI-guided confidence for this module
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-medium text-slate-900">Priority Tasks</p>
                        <Badge variant="secondary">{completionPercent}% done</Badge>
                      </div>
                      <div className="space-y-2">
                        {contextPanel.tasks.map((task) => {
                          const key = `${location.pathname}-${task}`;
                          const isDone = Boolean(doneTasks[key]);
                          return (
                            <button
                              key={task}
                              type="button"
                              onClick={() => toggleTask(task)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-slate-50"
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-slate-400" />
                              )}
                              <span className={isDone ? 'text-slate-500 line-through' : 'text-slate-800'}>{task}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="mb-3 font-medium text-slate-900">Quick Actions</p>
                      <div className="space-y-2">
                        {contextPanel.actions.map((action) => (
                          <Link
                            key={action.path}
                            to={action.path}
                            onClick={() => setOpsOpen(false)}
                            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
                          >
                            <span>{action.label}</span>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-medium text-slate-900">Module Studio</p>
                        <Badge variant="outline">Live</Badge>
                      </div>
                      <div className="mb-3 grid grid-cols-3 gap-2">
                        <Button size="sm" variant={activeStudioTab === 'chart' ? 'default' : 'outline'} onClick={() => setActiveStudioTab('chart')}>
                          <BarChart3 className="mr-1 h-3.5 w-3.5" /> Chart
                        </Button>
                        <Button size="sm" variant={activeStudioTab === 'table' ? 'default' : 'outline'} onClick={() => setActiveStudioTab('table')}>
                          <Table2 className="mr-1 h-3.5 w-3.5" /> Table
                        </Button>
                        <Button size="sm" variant={activeStudioTab === 'capture' ? 'default' : 'outline'} onClick={() => setActiveStudioTab('capture')}>
                          <ClipboardPenLine className="mr-1 h-3.5 w-3.5" /> Form
                        </Button>
                      </div>

                      {studioLoading && (
                        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
                          Loading live module data...
                        </div>
                      )}

                      {!studioLoading && activeStudioTab === 'chart' && (
                        <div>
                          <p className="mb-2 text-xs text-slate-600">{studioPanel.chartLabel}</p>
                          <div className="flex h-24 items-end gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
                            {studioPanel.chartSeries.map((point, index) => (
                              <div key={`${point}-${index}`} className="flex-1 rounded-t bg-emerald-500/80" style={{ height: `${Math.max(12, point)}%` }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {!studioLoading && activeStudioTab === 'table' && (
                        <div className="overflow-hidden rounded-lg border border-slate-100">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600">
                              <tr>
                                {studioPanel.tableHeaders.map((header) => (
                                  <th key={header} className="px-2 py-2 font-medium">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {studioPanel.tableRows.map((row, rowIndex) => (
                                <tr key={`${row.join('-')}-${rowIndex}`} className="border-t border-slate-100">
                                  {row.map((cell, cellIndex) => (
                                    <td key={`${cell}-${cellIndex}`} className="px-2 py-2 text-slate-700">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {!studioLoading && activeStudioTab === 'capture' && (
                        <div className="space-y-2">
                          {studioPanel.captureFields.map((field) => {
                            const key = `${location.pathname}-${field}`;
                            return (
                              <div key={field}>
                                <p className="mb-1 text-xs text-slate-600">{field}</p>
                                <input
                                  value={quickCapture[key] ?? ''}
                                  onChange={(event) => setCaptureField(field, event.target.value)}
                                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:ring"
                                  placeholder={`Enter ${field.toLowerCase()}`}
                                />
                              </div>
                            );
                          })}
                          <Button className="w-full" size="sm" onClick={submitQuickCapture}>{studioPanel.captureCta}</Button>
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-xs text-sky-900">
                      <div className="mb-1 flex items-center gap-2 font-medium">
                        <Radar className="h-4 w-4" />
                        System Note
                      </div>
                      <p>Use this panel daily to keep tasks, risks, and module transitions aligned.</p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Link to="/alerts">
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-emerald-600 text-white">
                        {profile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile.username}</p>
                      <p className="text-xs text-muted-foreground capitalize">{profile.farm_type} Farming</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => {
                    await signOut();
                    navigate('/login', { replace: true });
                  }} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {!isSupabaseConfigured && (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
              Demo mode is active. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live backend data.
            </div>
          )}

          <main className="flex-1 overflow-y-auto bg-slate-50">
            <Outlet />
          </main>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-6 right-6 z-30 hidden xl:block">
        <div className="pointer-events-auto w-80 rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Live Focus</p>
              <p className="text-sm font-semibold text-slate-900">{contextPanel.title}</p>
            </div>
            <Clock3 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xs text-slate-600">{contextPanel.focus}</p>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
              <span>Task completion</span>
              <span>{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>
          <Button className="mt-3 w-full" size="sm" onClick={() => setOpsOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> Open Ops Panel
          </Button>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}