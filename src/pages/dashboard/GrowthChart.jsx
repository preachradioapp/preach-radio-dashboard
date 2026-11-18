import PropTypes from "prop-types";
import { Segmented, Select, Skeleton, Table } from "antd";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useGetGrowthChartQuery } from "../../api/adminApi";
import Surface from "../../components/ui/Surface";
import { ErrorState } from "../../components/ui/States";
import { formatNumber } from "../../lib/format";

// Validated categorical pair (light surface): brand red + indigo — passes CVD & contrast checks.
const SERIES = [
  { key: "totalUser", label: "Users", color: "#E63946" },
  { key: "totalCreator", label: "Creators", color: "#3B5BDB" },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-lift">
      <div className="mb-1.5 text-xs font-medium text-muted">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-ink-soft">{p.name}</span>
          <span className="ml-auto pl-4 font-semibold tabular-nums text-ink">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

ChartTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array, label: PropTypes.string };

const GrowthChart = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [view, setView] = useState("chart");
  const { data, isLoading, isFetching, error, refetch } = useGetGrowthChartQuery(year);

  const yearOptions = useMemo(() => {
    const years = new Set([currentYear, ...(data?.yearsDropdown ?? [])]);
    return [...years].sort((a, b) => b - a).map((y) => ({ value: y, label: String(y) }));
  }, [data?.yearsDropdown, currentYear]);

  // Months that haven't happened yet are gaps, not zeros — a drop to 0 would read as a collapse.
  const rows = useMemo(() => {
    const lastMonth = year === currentYear ? new Date().getMonth() : 11;
    return (data?.chartData ?? []).map((r, i) =>
      i > lastMonth ? { ...r, totalUser: null, totalCreator: null } : r
    );
  }, [data?.chartData, year, currentYear]);
  const totals = SERIES.map((s) => ({ ...s, total: rows.reduce((sum, r) => sum + (r[s.key] || 0), 0) }));

  return (
    <Surface
      title="Sign-ups"
      extra={
        <div className="flex items-center gap-2">
          <Segmented
            size="small"
            value={view}
            onChange={setView}
            options={[
              { value: "chart", label: "Chart" },
              { value: "table", label: "Table" },
            ]}
          />
          <Select size="small" value={year} onChange={setYear} options={yearOptions} className="w-[90px]" aria-label="Year" />
        </div>
      }
    >
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton active paragraph={{ rows: 7 }} />
      ) : (
        <>
          {/* Legend doubles as the yearly total */}
          <div className="mb-4 flex flex-wrap gap-6">
            {totals.map((s) => (
              <div key={s.key}>
                <div className="flex items-center gap-2 text-xs font-medium text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label} in {year}
                </div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-ink">{formatNumber(s.total)}</div>
              </div>
            ))}
          </div>

          {view === "chart" ? (
            <div className={`h-[280px] transition-opacity ${isFetching ? "opacity-60" : ""}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="#F0F0F3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B6B76" }} />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6B6B76" }}
                    tickFormatter={(v) => formatNumber(v, { compactAbove: 1000 })}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#D4D4DA", strokeWidth: 1 }} />
                  {SERIES.map((s) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Table
              size="small"
              rowKey="month"
              pagination={false}
              dataSource={rows}
              scroll={{ y: 280 }}
              columns={[
                { title: "Month", dataIndex: "month" },
                ...SERIES.map((s) => ({
                  title: s.label,
                  dataIndex: s.key,
                  align: "right",
                  render: (v) => <span className="tabular-nums">{v === null ? "—" : formatNumber(v ?? 0)}</span>,
                })),
              ]}
            />
          )}
        </>
      )}
    </Surface>
  );
};

export default GrowthChart;
