import React, { useState, useMemo, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, HeartHandshake, Users, GraduationCap } from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Analytics charts for the admin overview tab.

   Data is passed in from AdminDashboard's existing live
   subscriptions (RTDB), so rendering these charts costs ZERO
   additional database reads. All grouping happens client-side
   inside useMemo, keyed on the data + selected period.
   ──────────────────────────────────────────────────────────── */

import { buildSeries } from "../utils/analyticsBuckets";
import type { AnalyticsPeriod, TimeStamped, Bucket } from "../utils/analyticsBuckets";

export type { AnalyticsPeriod };

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "week", label: "Current Week" },
  { value: "month", label: "Current Month" },
  { value: "year", label: "Current Year" },
  { value: "all", label: "All Time" },
];


/** Reactively tracks `body.dark-mode`, which the public site's theme toggle sets. */
function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.body.classList.contains("dark-mode")
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.body.classList.contains("dark-mode"))
    );
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  accent: string;
  data: Bucket[];
  total: number;
  totalLabel: string;
  isCurrency?: boolean;
  isDark: boolean;
  gradientId: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title, icon, accent, data, total, totalLabel, isCurrency, isDark, gradientId
}) => {
  const hasData = data.length > 0 && data.some(d => d.value > 0);

  const axis = isDark ? "#9C958A" : "#6b7280";
  const grid = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const surface = isDark ? "#252422" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0";
  const heading = isDark ? "#E6DFC5" : "#4b5563";
  const muted = isDark ? "#9C958A" : "#6b7280";

  const fmt = (n: number) => (isCurrency ? `₹${n.toLocaleString("en-IN")}` : n.toLocaleString("en-IN"));

  return (
    <div
      style={{
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: "var(--adm-radius-lg, 14px)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: 10,
              background: `${accent}1F`, color: accent, flexShrink: 0,
            }}
          >
            {icon}
          </span>
          <h3
            style={{
              margin: 0, fontSize: "0.95rem", fontWeight: 700, color: heading,
              fontFamily: "var(--font-display, inherit)", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {title}
          </h3>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: accent, lineHeight: 1.1, fontFamily: "var(--font-display, inherit)" }}>
            {fmt(total)}
          </div>
          <div style={{ fontSize: "0.65rem", color: muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
            {totalLabel}
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: 210 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: axis, fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: grid }}
                interval="preserveStartEnd"
                minTickGap={12}
              />
              <YAxis
                tick={{ fill: axis, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={48}
                tickFormatter={(v: number) => (isCurrency && v >= 1000 ? `${v / 1000}k` : String(v))}
              />
              <Tooltip
                cursor={{ stroke: accent, strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{
                  background: surface,
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  fontSize: "0.78rem",
                  color: heading,
                  boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(30,45,45,0.12)",
                }}
                labelStyle={{ color: muted, fontWeight: 700, marginBottom: 2 }}
                itemStyle={{ color: accent, fontWeight: 700 }}
                labelFormatter={(label, payload) =>
                  (Array.isArray(payload) && payload[0]?.payload?.fullLabel) || String(label ?? "")
                }
                formatter={(value) => [fmt(Number(value) || 0), title.replace(" Analytics", "")]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={accent}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={{ r: 2.5, fill: accent, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: accent, stroke: surface, strokeWidth: 2 }}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "0.4rem",
              color: muted, textAlign: "center", padding: "0 1rem",
            }}
          >
            <TrendingUp size={22} style={{ opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600 }}>No records in this period</p>
            <p style={{ margin: 0, fontSize: "0.72rem", opacity: 0.75 }}>
              Try a wider range such as All Time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface AnalyticsChartsProps {
  donations: TimeStamped[];
  volunteers: TimeStamped[];
  internships: TimeStamped[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  donations, volunteers, internships,
}) => {
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");
  const isDark = useIsDarkMode();

  // Recomputed only when the underlying data or the period changes.
  const donationSeries = useMemo(
    () => buildSeries(donations, period, r => Number(r.amount) || 0),
    [donations, period]
  );
  const volunteerSeries = useMemo(
    () => buildSeries(volunteers, period, () => 1),
    [volunteers, period]
  );
  const internshipSeries = useMemo(
    () => buildSeries(internships, period, () => 1),
    [internships, period]
  );

  const heading = isDark ? "#E6DFC5" : "#4b5563";
  const muted = isDark ? "#9C958A" : "#6b7280";
  const surface = isDark ? "#252422" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0";

  const groupingNote =
    period === "all"
      ? `Grouped by ${donationSeries.grouping}`
      : PERIOD_OPTIONS.find(o => o.value === period)?.label ?? "";

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "1rem", flexWrap: "wrap", marginBottom: "1rem",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0, fontSize: "1.05rem", fontWeight: 800, color: heading,
              fontFamily: "var(--font-display, inherit)",
            }}
          >
            Analytics Overview
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: muted }}>
            {groupingNote}
          </p>
        </div>

        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Period
          </span>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as AnalyticsPeriod)}
            aria-label="Select analytics time period"
            style={{
              background: surface,
              color: heading,
              border: `1px solid ${border}`,
              borderRadius: "var(--adm-radius-full, 9999px)",
              padding: "0.4rem 0.9rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              fontFamily: "var(--font-body, inherit)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {PERIOD_OPTIONS.map(o => (
              <option key={o.value} value={o.value} style={{ background: surface, color: heading }}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1rem",
        }}
      >
        <ChartCard
          title="Donation Analytics"
          icon={<HeartHandshake size={17} />}
          accent="#2AA527"
          data={donationSeries.data}
          total={donationSeries.total}
          totalLabel="Total Raised"
          isCurrency
          isDark={isDark}
          gradientId="analytics-grad-donations"
        />
        <ChartCard
          title="Volunteer Analytics"
          icon={<Users size={17} />}
          accent="#4E73B7"
          data={volunteerSeries.data}
          total={volunteerSeries.total}
          totalLabel="Registrations"
          isDark={isDark}
          gradientId="analytics-grad-volunteers"
        />
        <ChartCard
          title="Internship Analytics"
          icon={<GraduationCap size={17} />}
          accent="#C5A059"
          data={internshipSeries.data}
          total={internshipSeries.total}
          totalLabel="Applications"
          isDark={isDark}
          gradientId="analytics-grad-internships"
        />
      </div>
    </section>
  );
};

export default AnalyticsCharts;
