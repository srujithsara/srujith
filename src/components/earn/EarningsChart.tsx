import { useMemo, useState } from "react";
import type { EarnTransaction } from "../../types/creatorverse";

interface EarningsChartProps {
  transactions: EarnTransaction[];
}

type TimeRange = "daily" | "weekly" | "monthly";

export function EarningsChart({ transactions }: EarningsChartProps) {
  const [range, setRange] = useState<TimeRange>("weekly");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const releasedTotal = useMemo(
    () =>
      transactions
        .filter((t) => t.amountInr > 0 && t.status === "Released")
        .reduce((sum, t) => sum + t.amountInr, 0),
    [transactions]
  );

  const points = useMemo(() => {
    const extraScale = Math.max(0, releasedTotal - 24000);
    if (range === "daily") {
      return [
        { label: "Mon", amount: 1200 },
        { label: "Tue", amount: 2400 },
        { label: "Wed", amount: 1800 },
        { label: "Thu", amount: 3500 },
        { label: "Fri", amount: 4200 },
        { label: "Sat", amount: 6100 },
        { label: "Sun", amount: 4800 + extraScale },
      ];
    }
    if (range === "weekly") {
      return [
        { label: "Wk 1", amount: 3200 },
        { label: "Wk 2", amount: 5400 },
        { label: "Wk 3", amount: 6000 },
        { label: "Wk 4", amount: 9400 + extraScale },
      ];
    }
    return [
      { label: "Jul", amount: 6500 },
      { label: "Aug", amount: 11200 },
      { label: "Sep", amount: 14800 },
      { label: "Oct", amount: 18400 },
      { label: "Nov", amount: 24000 + extraScale },
    ];
  }, [range, releasedTotal]);

  const maxVal = Math.max(...points.map((p) => p.amount), 1000);
  const svgWidth = 640;
  const svgHeight = 200;
  const padX = 28;
  const padTop = 18;
  const padBottom = 28;
  const innerW = svgWidth - padX * 2;
  const innerH = svgHeight - padTop - padBottom;

  const coords = points.map((pt, idx) => {
    const x =
      points.length === 1
        ? padX + innerW / 2
        : padX + (idx / (points.length - 1)) * innerW;
    const y = padTop + innerH - (pt.amount / maxVal) * innerH;
    return { ...pt, x, y };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`
      : "";

  const activePoint = hoveredIdx !== null ? coords[hoveredIdx] : coords[coords.length - 1];

  return (
    <div className="cv-surface rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/8 pb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Earnings Overview</h2>
          <p className="text-xs text-zinc-400">
            {activePoint
              ? `${activePoint.label}: ₹${activePoint.amount.toLocaleString("en-IN")} (Demo Ledger)`
              : "Demo earnings timeline"}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#08090D] p-1 self-start sm:self-auto">
          {(["daily", "weekly", "monthly"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRange(r);
                setHoveredIdx(null);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                range === r ? "bg-white/12 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 sm:h-52 select-none"
          role="img"
          aria-label={`Creator earnings ${range} chart`}
        >
          <defs>
            <linearGradient id="earnAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="earnStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal gridlines */}
          {[0.25, 0.5, 0.75, 1].map((frac) => {
            const y = padTop + innerH * (1 - frac);
            return (
              <line
                key={frac}
                x1={padX}
                y1={y}
                x2={svgWidth - padX}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 4"
              />
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#earnAreaGrad)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#earnStrokeGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {coords.map((c, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={c.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? "#FFFFFF" : "#8B5CF6"}
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                <text
                  x={c.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fill={isHovered ? "#FFFFFF" : "#71717A"}
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {c.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
