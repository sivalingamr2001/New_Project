import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import {
    ChartContainer, ChartTooltipContent,
    type ChartConfig
} from "@/shared/components/ui/chart";
import { formatINR, formatPercent } from "@/shared/utils/utils";

const trendConfig = {
  planned: {
    label: "Planned",
    color: "var(--chart-1)",
  },
  actual: {
    label: "Actual",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const categoryConfig = {
  planned: {
    label: "Planned",
    color: "var(--chart-1)",
  },
  actual: {
    label: "Actual",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const donutConfig = {
  "Engineering Labour": {
    label: "Engineering Labour",
    color: "#1a56db",
  },
  "Material & Components": {
    label: "Material & Components",
    color: "#10b981",
  },
  "Machining & Fabrication": {
    label: "Machining & Fabrication",
    color: "#f59e0b",
  },
  "Testing & Validation": {
    label: "Testing & Validation",
    color: "#6366f1",
  },
  "Miscellaneous": {
    label: "Miscellaneous",
    color: "#ef4444",
  },
} satisfies ChartConfig;

const scatterConfig = {
  actual: {
    label: "Actual",
    color: "var(--chart-2)",
  },
  utilization: {
    label: "Utilization",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const sampleBudgetData = [
  { category: "Material & Components", planned: 465000, actual: 452000 },
  { category: "Machining & Fabrication", planned: 380000, actual: 343000 },
  { category: "Testing & Validation", planned: 205000, actual: 139000 },
  { category: "Engineering Labour", planned: 700000, actual: 499000 },
  { category: "Miscellaneous & Overheads", planned: 100000, actual: 100000 },
] as const;

const sampleTotals = {
  totalPlanned: sampleBudgetData.reduce((sum, item) => sum + item.planned, 0),
  totalActual: sampleBudgetData.reduce((sum, item) => sum + item.actual, 0),
  variance: sampleBudgetData.reduce((sum, item) => sum + item.planned - item.actual, 0),
};

export function BudgetAnalyticsSection() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Category Comparison Bar Chart */}
      <CategoryComparisonChart />

      {/* Budget Utilisation Donut Chart */}
      <BudgetUtilisationChart />

      {/* Variance Highlights */}
      <VarianceHighlights />

      {/* Phase Progress */}
      <PhaseProgress />

      {/* Performance Report Section (existing) */}
      <div className="xl:col-span-2">
        <PerformanceReportSection />
      </div>
    </div>
  );
}

function CategoryComparisonChart() {
  const categoryData = sampleBudgetData;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Planned vs Actual by Category</h3>
          <p className="text-sm text-muted-foreground">All amounts in ₹ Lakhs</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Actual</span>
          </div>
        </div>
      </div>
      <ChartContainer config={categoryConfig} className="h-80">
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatINR(value)} width={64} />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Legend />
          <Bar
            dataKey="planned"
            fill="var(--color-planned)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="actual"
            fill="var(--color-actual)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}

function BudgetUtilisationChart() {
  const totals = sampleTotals;
  const utilization = totals.totalPlanned
    ? (totals.totalActual / totals.totalPlanned) * 100
    : 0;

  // Sample data - in real app, this would come from actual category breakdowns
  const donutData = [
    { name: "Engineering Labour", value: 37.8, fill: "#1a56db" },
    { name: "Material & Components", value: 25.1, fill: "#10b981" },
    { name: "Machining & Fabrication", value: 18.6, fill: "#f59e0b" },
    { name: "Testing & Validation", value: 11.1, fill: "#6366f1" },
    { name: "Miscellaneous", value: 7.4, fill: "#ef4444" },
  ];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Budget Utilisation Breakdown</h3>
        <p className="text-sm text-muted-foreground">As % of total planned spend</p>
      </div>
      <div className="flex items-center gap-8">
        <ChartContainer config={donutConfig} className="h-48 w-48">
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              dataKey="value"
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
        <div className="flex-1">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold">{utilization.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Used</div>
          </div>
          <div className="space-y-2">
            {donutData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function VarianceHighlights() {
  // Sample variance data - in real app, this would be calculated from actual data
  const varianceItems = [
    {
      name: "Tooling & Jig Development",
      category: "Engineering Labour",
      amount: -91000,
      percent: -32.5,
      type: "under",
    },
    {
      name: "Design Engineering Hours",
      category: "Engineering Labour",
      amount: -110000,
      percent: -26.2,
      type: "under",
    },
    {
      name: "Environmental & Fatigue Testing",
      category: "Testing",
      amount: -44000,
      percent: -51.8,
      type: "under",
    },
    {
      name: "Purchased Parts — Solenoid Coils",
      category: "Material",
      amount: 15000,
      percent: 8.3,
      type: "over",
    },
    {
      name: "Contingency Reserve",
      category: "Miscellaneous",
      amount: 8000,
      percent: 20,
      type: "over",
    },
  ];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Top Variance Items</h3>
        <p className="text-sm text-muted-foreground">Biggest over and under-spend line items</p>
      </div>
      <div className="space-y-4">
        {varianceItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`text-lg ${item.type === "under" ? "text-green-600" : "text-red-600"}`}>
                {item.type === "under" ? "💚" : "🔴"}
              </div>
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.category}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-medium ${item.type === "under" ? "text-green-600" : "text-red-600"}`}>
                {item.type === "under" ? "−" : "+"}₹{Math.abs(item.amount).toLocaleString()}
              </div>
              <div className={`text-sm ${item.type === "under" ? "text-green-600" : "text-red-600"}`}>
                {item.percent.toFixed(1)}% {item.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PhaseProgress() {
  // Sample phase data - in real app, this would come from project phases
  const phases = [
    {
      name: "Product Design",
      planned: 620000,
      actual: 620000,
      progress: 100,
      status: "complete",
    },
    {
      name: "Concept Dev",
      planned: 480000,
      actual: 512000,
      progress: 100,
      status: "over",
    },
    {
      name: "Prototype Dev",
      planned: 1850000,
      actual: 1432000,
      progress: 77,
      status: "in-progress",
    },
    {
      name: "Product Testing",
      planned: 940000,
      actual: 0,
      progress: 0,
      status: "not-started",
    },
    {
      name: "Capital Equip.",
      planned: 2200000,
      actual: 0,
      progress: 0,
      status: "not-started",
    },
    {
      name: "Field Validation",
      planned: 310000,
      actual: 0,
      progress: 0,
      status: "not-started",
    },
  ];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Phase-wise Budget Progress</h3>
        <p className="text-sm text-muted-foreground">All 6 development phases · NPD-2025-07</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {phases.map((phase, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              phase.status === "in-progress"
                ? "border-blue-200 bg-blue-50"
                : phase.status === "complete"
                ? "border-green-200 bg-green-50"
                : "border-gray-200 opacity-60"
            }`}
          >
            <div className="font-medium mb-2">{phase.name}</div>
            <div className="flex justify-between text-sm mb-2">
              <span>₹{(phase.planned / 100000).toFixed(2)}L</span>
              <span className={phase.status === "over" ? "text-red-600" : ""}>
                ₹{(phase.actual / 100000).toFixed(2)}L
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full ${
                  phase.status === "complete"
                    ? "bg-green-600"
                    : phase.status === "over"
                    ? "bg-red-600"
                    : phase.status === "in-progress"
                    ? "bg-blue-600"
                    : "bg-gray-400"
                }`}
                style={{ width: `${phase.progress}%` }}
              ></div>
            </div>
            <div
              className={`text-xs font-medium ${
                phase.status === "complete"
                  ? "text-green-600"
                  : phase.status === "over"
                  ? "text-red-600"
                  : phase.status === "in-progress"
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {phase.status === "complete" && "✓ Complete"}
              {phase.status === "over" && `⚠ ${(phase.actual / phase.planned * 100 - 100).toFixed(1)}% Over`}
              {phase.status === "in-progress" && `▶ In Progress ${phase.progress}%`}
              {phase.status === "not-started" && "Not Started"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Consolidated Performance Report Section (existing functionality)
function PerformanceReportSection() {
  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border/70 px-5 py-4">
        <Badge
          className="border-primary/20 bg-primary/10 text-primary"
          variant="secondary"
        >
          Quarterly Performance Report
        </Badge>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-auto p-5">
        <ReportHeader />
        <ExecutiveSummary />
        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <TrendLineChart />
            <DeepDiveInsights />
          </div>
          <div className="space-y-5">
            <CategoryStackedChart />
            <VarianceScatterPlot />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ReportHeader() {
  const totals = sampleTotals;
  const varianceRate = totals.totalPlanned
    ? ((totals.totalActual - totals.totalPlanned) / totals.totalPlanned) * 100
    : 0;
  const utilization = totals.totalPlanned
    ? (totals.totalActual / totals.totalPlanned) * 100
    : 0;
  const lastUpdated = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-rose-200/90 bg-rose-50 p-5 text-rose-900 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700/80">
              Overall Status
            </div>
            <div className="mt-3 flex items-center gap-3 text-xl font-semibold tracking-tight sm:text-2xl">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                !
              </span>
              OVER BUDGET{" "}
              <span className="text-rose-900">{varianceRate.toFixed(1)}%</span>
            </div>
            <div className="mt-2 text-sm text-rose-700/90">
              Action Required - Review critical cost heads.
            </div>
          </div>
          <div className="rounded-3xl border border-rose-300/80 bg-white/80 px-4 py-3 text-right text-sm text-slate-700 shadow-sm">
            <div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
              Last Updated
            </div>
            <div className="mt-1 font-medium">{lastUpdated}</div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        <SummaryCard
          title="Total Planned"
          value={formatINR(totals.totalPlanned)}
          note=""
          accent="slate"
        />
        <SummaryCard
          title="Total Actual"
          value={formatINR(totals.totalActual)}
          note="(spent + committed)"
          accent="violet"
        />
        <SummaryCard
          title="Variance"
          value={`${formatINR(totals.variance)} (${varianceRate.toFixed(1)}%)`}
          note=""
          accent={varianceRate > 0 ? "rose" : "emerald"}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        <SummaryCard
          title="Direct Cost Variance"
          value={`${formatPercent(varianceRate)}`}
          note="First 10 cost heads"
          accent="rose"
        />
        <SummaryCard
          title="Indirect Cost Variance"
          value="0.0%"
          note="Factory OH + Team"
          accent="emerald"
        />
        <SummaryCard
          title="Budget Utilization"
          value={`${formatPercent(utilization)}`}
          note="of planned budget"
          accent={utilization > 100 ? "rose" : "emerald"}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  note,
  accent = "slate",
}: {
  title: string;
  value: string;
  note: string;
  accent?: "slate" | "violet" | "rose" | "emerald";
}) {
  const accentClass =
    accent === "violet"
      ? "text-violet-600"
      : accent === "rose"
        ? "text-rose-600"
      : accent === "emerald"
          ? "text-emerald-600"
          : "";

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5 shadow-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <div className={`mt-4 text-3xl font-semibold ${accentClass}`}>
        {value}
      </div>
      {note ? (
        <div className="mt-2 text-sm text-muted-foreground">{note}</div>
      ) : null}
    </div>
  );
}

function ExecutiveSummary() {
  const totals = sampleTotals;
  const categories: Array<{ name: string; variance: number; utilization: number }> = sampleBudgetData.map((category) => {
    const variance = category.planned - category.actual;
    const utilization = category.planned
      ? (category.actual / category.planned) * 100
      : 0;

    return {
      name: category.category,
      variance,
      utilization,
    };
  });

  const topVariance = categories.reduce(
    (prev, next) =>
      Math.abs(next.variance) > Math.abs(prev.variance) ? next : prev,
    categories[0],
  );
  const overBudgetCount = categories.filter(
    (item: { utilization: number; }) => item.utilization > 100,
  ).length;
  const performancePhrase =
    totals.totalActual > totals.totalPlanned ? "above plan" : "below plan";

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="text-sm font-semibold text-foreground">
        Executive Summary
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
          <p>
            Total actual spend is <strong>{performancePhrase}</strong>, with a
            variance of <strong>{formatINR(totals.variance)}</strong> driven by{" "}
            <strong>{topVariance.name}</strong>.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-muted-foreground" />
          <p>
            {overBudgetCount} category{overBudgetCount === 1 ? "" : "ies"} are
            currently over budget, signaling a need for tighter category
            controls.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-500" />
          <p>
            Trend analysis suggests spend momentum is stabilizing, with the next
            period dependent on corrective oversight for high-variance segments.
          </p>
        </div>
      </div>
    </div>
  );
}

function TrendLineChart() {
  const totals = sampleTotals;
  const baseline = Math.max(1, totals.totalPlanned || totals.totalActual);
  const trendData = MONTHS.map((month, index) => ({
    month,
    planned: Math.round(baseline * (0.68 + 0.025 * index)),
    actual: Math.round(baseline * (0.62 + 0.028 * index)),
  }));

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="mb-4">
        <div className="font-display text-xl text-foreground">
          12-Month Spend Trend
        </div>
        <div className="text-sm text-muted-foreground">
          Actual vs planned spend over the last year
        </div>
      </div>
      <ChartContainer config={trendConfig}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatINR(value)} width={64} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="planned"
            stroke="var(--color-planned)"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="var(--color-actual)"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

function CategoryStackedChart() {
  const categoryData = sampleBudgetData;

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="mb-4">
        <div className="font-display text-xl text-foreground">
          Category Spend Comparison
        </div>
        <div className="text-sm text-muted-foreground">
          Planned and actual spend by category
        </div>
      </div>
      <ChartContainer config={categoryConfig}>
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatINR(value)} width={64} />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Legend />
          <Bar
            dataKey="planned"
            stackId="a"
            fill="var(--color-planned)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="actual"
            stackId="a"
            fill="var(--color-actual)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function VarianceScatterPlot() {
  const data = sampleBudgetData.map((category) => ({
    category: category.category,
    actual: category.actual,
    utilization: category.planned ? (category.actual / category.planned) * 100 : 0,
  }));

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="mb-4">
        <div className="font-display text-xl text-foreground">
          Variance vs Utilization
        </div>
        <div className="text-sm text-muted-foreground">
          How actual spend relates to category efficiency
        </div>
      </div>
      <ChartContainer config={scatterConfig}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="actual"
            type="number"
            name="Actual"
            tickFormatter={(value) => formatINR(value)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="utilization"
            type="number"
            name="Utilization"
            unit="%"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Scatter name="Category" data={data} fill="var(--color-actual)" />
        </ScatterChart>
      </ChartContainer>
      <div className="mt-4 text-sm text-muted-foreground">
        Categories in the upper right are high spend and high utilization, and
        should be reviewed first.
      </div>
    </div>
  );
}

function DeepDiveInsights() {
  const categories = sampleBudgetData.map((category) => ({
    name: category.category,
    planned: category.planned,
    actual: category.actual,
    variance: category.planned - category.actual,
    utilization: category.planned
      ? (category.actual / category.planned) * 100
      : 0,
  }));

  const highestVariance = categories.reduce(
    (prev, next) =>
      Math.abs(next.variance) > Math.abs(prev.variance) ? next : prev,
    categories[0],
  );

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="font-display text-xl text-foreground">
        Deep-Dive Insights
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
        <p>
          The root cause of the current variance is concentrated in{" "}
          <strong>{highestVariance.name}</strong>, where actual spend is{" "}
          <strong>{formatINR(highestVariance.actual)}</strong> versus a plan of{" "}
          <strong>{formatINR(highestVariance.planned)}</strong>.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Validate scope and resourcing assumptions for the top variance
            category to prevent further drift.
          </li>
          <li>
            Shift flexibility from lower-utilization categories to support
            priority initiatives without increasing total spend.
          </li>
          <li>
            Establish weekly budget checkpoints for categories above 100%
            utilization to catch overspend early.
          </li>
        </ul>
      </div>
    </div>
  );
}