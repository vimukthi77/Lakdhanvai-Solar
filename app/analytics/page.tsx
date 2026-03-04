"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ComposedChart,
  Line,
  TooltipProps,
} from "recharts";
import {
  BarChart3,
  Zap,
  TrendingUp,
  RefreshCw,
  Download,
  Sun,
  Battery,
  Activity,
  Clock,
  Gauge,
  Leaf,
  DollarSign,
  Cpu,
  Wifi,
  WifiOff,
  ServerOff,
  ThermometerSun,
  CloudSun,
  Sparkles,
  Target,
  CheckCircle,
  BellRing,
  Calendar,
  Droplets,
  Wind,
  Eye,
  ChevronDown,
  FileText,
  Printer,
  ChevronRight,
} from "lucide-react";

/* ═══════════════════════════════════════
   TYPES
   ═══════════════════════════════════════ */
interface BreakdownItem {
  hour: string;
  predicted_kw: number;
  predicted_temp: number;
  saving_lkr: number;
}
interface PredictionResponse {
  total_kw: number;
  total_savings: number;
  breakdown: BreakdownItem[];
}
interface CurrentWeather {
  temperature: number;
  condition: string;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  cloudCover: number;
  pressure: number;
}
interface DailyForecast {
  date: string;
  label: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  uvIndex: number;
  precipitation: number;
}
interface DayPrediction {
  date: string;
  label: string;
  data: PredictionResponse | null;
}
interface TipPayload {
  value: number;
  dataKey: string;
  name: string;
  color: string;
}
type TimeRange = "today" | "3d" | "7d";

/* ═══════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════ */
const API_URL = "https://solar-ai-model.onrender.com/predict_range";
const ENERGY_SOURCES = [
  { name: "Solar Direct", value: 75, color: "#f97316" },
  { name: "Battery", value: 15, color: "#172554" },
  { name: "Grid Import", value: 10, color: "#64748b" },
];
const weatherLabel = (code: number) => {
  if (code <= 3) return "Sunny";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  return "Stormy";
};

/* ═══════════════════════════════════════
   3D CARD WRAPPER
   ═══════════════════════════════════════ */
function Card3D({
  children,
  className = "",
  glowColor = "orange",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: "orange" | "blue" | "green" | "purple";
}) {
  const [transform, setTransform] = useState("");
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const colors = {
    orange: "rgba(249, 115, 22, 0.08)",
    blue: "rgba(59, 130, 246, 0.08)",
    green: "rgba(34, 197, 94, 0.08)",
    purple: "rgba(168, 85, 247, 0.08)",
  };

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    setTransform(
      `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale3d(1.01, 1.01, 1.01)`
    );
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      className={`relative transition-all duration-300 ease-out ${className}`}
      style={{ transform, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouse}
      onMouseLeave={() => setTransform("")}
    >
      <div
        className="absolute inset-0 rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${colors[glowColor]}, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   3D ICON
   ═══════════════════════════════════════ */
function Icon3D({
  icon: Icon,
  gradient,
  size = "w-12 h-12 lg:w-14 lg:h-14",
  iconSize = 24,
}: {
  icon: React.ElementType;
  gradient: string;
  size?: string;
  iconSize?: number;
}) {
  return (
    <div
      className="relative group-hover:scale-110 transition-transform duration-300"
      style={{ perspective: "200px" }}
    >
      <div
        className={`absolute -bottom-1 left-1 ${size} rounded-xl lg:rounded-2xl opacity-30 blur-sm`}
        style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}
      />
      <div
        className={`relative ${size} rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg`}
        style={{
          background: `linear-gradient(135deg, ${gradient})`,
          transform: "translateZ(8px)",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <Icon className="text-white" size={iconSize} />
        <div
          className="absolute inset-0 rounded-xl lg:rounded-2xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════ */
function AnimatedValue({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number | string;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const numVal = typeof value === "string" ? parseFloat(value) || 0 : value;

  useEffect(() => {
    const duration = 1200;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(numVal * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [numVal]);

  return (
    <span>
      {prefix}
      {Number.isInteger(numVal)
        ? Math.round(display).toLocaleString()
        : display.toFixed(1)}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════
   PARTICLE FIELD
   ═══════════════════════════════════════ */
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-orange-400/10"
          style={{
            width: `${3 + Math.random() * 5}px`,
            height: `${3 + Math.random() * 5}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-10px) translateX(-5px);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-25px) translateX(8px);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════
   FLOATING SUN
   ═══════════════════════════════════════ */
function FloatingSun({ size = 56 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size, perspective: "400px" }}
    >
      <div
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: "20s" }}
      >
        <div
          className="absolute inset-2 rounded-full border-2 border-orange-400/20"
          style={{ transform: "rotateX(60deg)" }}
        />
      </div>
      <div
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: "15s", animationDirection: "reverse" }}
      >
        <div
          className="absolute inset-4 rounded-full border-2 border-yellow-400/15"
          style={{ transform: "rotateX(45deg) rotateY(20deg)" }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full animate-pulse"
          style={{
            width: size * 0.5,
            height: size * 0.5,
            background:
              "radial-gradient(circle at 35% 35%, #fef3c7, #fbbf24, #f97316, #ea580c)",
            boxShadow: `0 0 ${size * 0.3}px rgba(251,191,36,0.4), 0 0 ${size * 0.6}px rgba(249,115,22,0.2), inset 0 0 ${size * 0.1}px rgba(255,255,255,0.3)`,
            animationDuration: "3s",
          }}
        />
      </div>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <div
          key={deg}
          className="absolute top-1/2 left-1/2 origin-left"
          style={{
            transform: `rotate(${deg}deg)`,
            width: size * 0.35,
            height: "1.5px",
            background:
              "linear-gradient(90deg, rgba(251,191,36,0.3), transparent)",
            animation: "pulse 2s ease-in-out infinite",
            animationDelay: `${deg * 3}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   CHART TOOLTIP
   ═══════════════════════════════════════ */
function ChartTip({
  active,
  payload,
  label,
}: TooltipProps<number, string> & { payload?: TipPayload[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-blue-950/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-orange-500/30">
      <p className="text-orange-400 text-sm font-medium mb-2">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2 text-sm mt-1">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: e.color }}
          />
          <span className="text-blue-300">{e.name}:</span>
          <span className="font-bold">
            {e.dataKey?.includes("temp") || e.dataKey?.includes("temperature")
              ? `${e.value}°C`
              : e.dataKey?.includes("saving") || e.dataKey?.includes("savings")
                ? `Rs. ${e.value.toLocaleString()}`
                : `${e.value} kW`}
          </span>
        </div>
      ))}
      <div className="mt-2 h-1 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400" />
    </div>
  );
}

/* ═══════════════════════════════════════
   BADGE
   ═══════════════════════════════════════ */
function Badge({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: "green" | "blue" | "orange" | "red";
}) {
  const m: Record<string, string> = {
    green: "bg-green-500/10 border-green-500/30 text-green-400",
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    orange: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    red: "bg-red-500/10 border-red-500/30 text-red-400",
  };
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm ${m[color]}`}
    >
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════
   DOT PATTERN
   ═══════════════════════════════════════ */
function DotPattern({ size = 24 }: { size?: number }) {
  return (
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)",
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function AnalyticsPage() {
  /* state */
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());
  const [range, setRange] = useState<TimeRange>("today");
  const [status, setStatus] = useState<"online" | "offline" | "loading">(
    "loading"
  );
  const [err, setErr] = useState<string | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [today, setToday] = useState<PredictionResponse | null>(null);
  const [days, setDays] = useState<DayPrediction[]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [weather, setWeather] = useState<CurrentWeather>({
    temperature: 0,
    condition: "Loading…",
    humidity: 0,
    uvIndex: 0,
    windSpeed: 0,
    cloudCover: 0,
    pressure: 0,
  });
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [dlMenu, setDlMenu] = useState(false);

  /* chart refs */
  const mainRef = useRef<HTMLDivElement>(null);
  const tempRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const savRef = useRef<HTMLDivElement>(null);
  const multiRef = useRef<HTMLDivElement>(null);

  const isMulti = range === "3d" || range === "7d";

  /* ── fetch weather ── */
  const fetchWeather = useCallback(async () => {
    try {
      const r = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=6.9271&longitude=79.8612" +
        "&current=temperature_2m,relative_humidity_2m,weather_code,uv_index,wind_speed_10m,cloud_cover,surface_pressure" +
        "&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,precipitation_sum" +
        "&timezone=auto&forecast_days=7"
      );
      if (!r.ok) return;
      const d = await r.json();
      setWeather({
        temperature: Math.round(d.current.temperature_2m),
        condition: weatherLabel(d.current.weather_code),
        humidity: Math.round(d.current.relative_humidity_2m),
        uvIndex: Math.round(d.current.uv_index),
        windSpeed: Math.round(d.current.wind_speed_10m),
        cloudCover: Math.round(d.current.cloud_cover),
        pressure: Math.round(d.current.surface_pressure),
      });
      if (d.daily) {
        setForecast(
          (d.daily.time as string[]).map((t: string, i: number) => ({
            date: t,
            label: new Date(t).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            maxTemp: Math.round(d.daily.temperature_2m_max[i]),
            minTemp: Math.round(d.daily.temperature_2m_min[i]),
            condition: weatherLabel(d.daily.weather_code[i]),
            uvIndex: Math.round(d.daily.uv_index_max[i]),
            precipitation: d.daily.precipitation_sum[i],
          }))
        );
      }
    } catch {
      /* silent */
    }
  }, []);

  /* ── fetch one day ── */
  const fetchDay = useCallback(
    async (ds: string): Promise<PredictionResponse | null> => {
      try {
        const r = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: ds, start_hour: 6, end_hour: 18 }),
        });
        if (!r.ok) throw new Error(`${r.status}`);
        return await r.json();
      } catch {
        return null;
      }
    },
    []
  );

  /* ── fetch all ── */
  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    setErr(null);
    setStatus("loading");
    try {
      const ts = new Date().toISOString().split("T")[0];
      const td = await fetchDay(ts);
      if (!td) throw new Error("No data");
      setToday(td);
      setStatus("online");
      setUpdated(new Date());

      const count = range === "3d" ? 3 : range === "7d" ? 7 : 1;
      if (count > 1) {
        const ps = await Promise.all(
          Array.from({ length: count }, (_, i) => {
            const dt = new Date();
            dt.setDate(dt.getDate() + i);
            const s = dt.toISOString().split("T")[0];
            const l = dt.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            return fetchDay(s).then((data) => ({ date: s, label: l, data }));
          })
        );
        setDays(ps);
        setDayIdx(0);
      } else {
        setDays([]);
      }
    } catch {
      setStatus("offline");
      setErr("Failed to connect to AI model. Check if the server is running.");
      setToday(null);
    }
    setLoading(false);
    setRefreshing(false);
  }, [fetchDay, range]);

  /* ── effects ── */
  useEffect(() => {
    setLoading(true);
    fetchWeather();
    fetchAll();
  }, [fetchWeather, fetchAll]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!dlMenu) return;
    const close = () => setDlMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [dlMenu]);

  /* ── derived ── */
  const active: PredictionResponse | null = isMulti
    ? days[dayIdx]?.data ?? today
    : today;

  const peak = active?.breakdown.reduce(
    (m, i) => (i.predicted_kw > m.predicted_kw ? i : m),
    { hour: "-", predicted_kw: 0, predicted_temp: 0, saving_lkr: 0 }
  );

  const avgT = active
    ? (
      active.breakdown.reduce((s, i) => s + i.predicted_temp, 0) /
      active.breakdown.length
    ).toFixed(1)
    : "0";
  const avgK = active
    ? (
      active.breakdown.reduce((s, i) => s + i.predicted_kw, 0) /
      active.breakdown.length
    ).toFixed(2)
    : "0";
  const eff = active
    ? Math.min(
      98,
      85 + (active.total_kw / (active.breakdown.length * 10)) * 15
    ).toFixed(1)
    : "0";

  const totals = days.reduce(
    (a, d) => {
      if (d.data) {
        a.kw += d.data.total_kw;
        a.sav += d.data.total_savings;
        a.n++;
      }
      return a;
    },
    { kw: 0, sav: 0, n: 0 }
  );

  const showKw =
    isMulti && totals.n > 0 ? totals.kw.toFixed(1) : (active?.total_kw ?? 0);
  const showSav =
    isMulti && totals.n > 0 ? totals.sav : (active?.total_savings ?? 0);
  const showCo2 =
    isMulti && totals.n > 0
      ? (totals.kw * 0.5).toFixed(1)
      : active
        ? (active.total_kw * 0.5).toFixed(1)
        : "0";

  const multiChart = days
    .filter((d) => d.data)
    .map((d) => ({
      day: d.label,
      totalKw: d.data!.total_kw,
      savings: d.data!.total_savings,
      peakKw: Math.max(...d.data!.breakdown.map((b) => b.predicted_kw)),
    }));

  const corrData = active?.breakdown.map((i) => ({
    hour: i.hour,
    generation: i.predicted_kw,
    temperature: i.predicted_temp,
  }));

  const savData = active?.breakdown.map((i) => ({
    hour: i.hour,
    savings: i.saving_lkr,
  }));

  const rangeLabel =
    range === "today" ? "Today" : range === "3d" ? "3 Days" : "7 Days";

  /* ═══ SVG Capture ═══ */
  const grabSVG = (ref: React.RefObject<HTMLDivElement | null>): string => {
    if (!ref.current) return "";
    const svg = ref.current.querySelector("svg");
    if (!svg) return "";
    try {
      const clone = svg.cloneNode(true) as SVGElement;
      const { width: w, height: h } = svg.getBoundingClientRect();
      if (!clone.getAttribute("viewBox"))
        clone.setAttribute("viewBox", `0 0 ${w} ${h}`);
      clone.setAttribute("width", "100%");
      clone.removeAttribute("height");
      clone.style.maxHeight = "320px";
      clone.style.display = "block";
      return new XMLSerializer().serializeToString(clone);
    } catch {
      return "";
    }
  };

  const chartBlock = (title: string, svg: string) =>
    svg
      ? `<div style="margin:25px 0;">
           <h3 style="color:#172554;font-size:16px;margin-bottom:10px;padding-left:12px;border-left:4px solid #f97316;">${title}</h3>
           <div style="border:1px solid #e2e8f0;border-radius:12px;padding:12px;overflow:hidden;background:#fff;">${svg}</div>
         </div>`
      : "";

  /* ═══ Download CSV ═══ */
  const downloadCSV = () => {
    if (!active) return;
    const BOM = "\uFEFF";
    let csv = "";
    csv += "Solar Analytics Report\r\n";
    csv += `Generated,"${new Date().toLocaleString()}"\r\n`;
    csv += `Period,"${rangeLabel}"\r\n\r\n`;
    csv += "CURRENT WEATHER\r\n";
    csv += `Temperature,${weather.temperature}°C\r\n`;
    csv += `Condition,${weather.condition}\r\n`;
    csv += `Humidity,${weather.humidity}%\r\n`;
    csv += `UV Index,${weather.uvIndex}\r\n`;
    csv += `Wind Speed,${weather.windSpeed} km/h\r\n`;
    csv += `Cloud Cover,${weather.cloudCover}%\r\n`;
    csv += `Pressure,${weather.pressure} hPa\r\n\r\n`;
    csv += "SUMMARY\r\n";
    csv += `Total Generation,"${showKw} kWh"\r\n`;
    csv += `Peak Output,"${peak?.predicted_kw} kW at ${peak?.hour}"\r\n`;
    csv += `Est. Savings,"Rs. ${Number(showSav).toLocaleString()}"\r\n`;
    csv += `CO2 Reduced,"${showCo2} kg"\r\n`;
    csv += `Efficiency,"${eff}%"\r\n\r\n`;

    if (isMulti && days.length > 0) {
      csv += "MULTI-DAY OVERVIEW\r\n";
      csv += "Date,Total kWh,Peak kW,Savings (LKR),CO2 (kg)\r\n";
      days
        .filter((d) => d.data)
        .forEach((d) => {
          const pk = Math.max(
            ...d.data!.breakdown.map((b) => b.predicted_kw)
          );
          csv += `"${d.label}",${d.data!.total_kw},${pk},${d.data!.total_savings},${(d.data!.total_kw * 0.5).toFixed(1)}\r\n`;
        });
      csv += `Aggregate Total,${totals.kw.toFixed(1)},,${totals.sav},${(totals.kw * 0.5).toFixed(1)}\r\n\r\n`;
      days
        .filter((d) => d.data)
        .forEach((d) => {
          csv += `HOURLY BREAKDOWN — ${d.label}\r\n`;
          csv += "Hour,Predicted kW,Temperature (°C),Savings (LKR)\r\n";
          d.data!.breakdown.forEach((r) => {
            csv += `${r.hour},${r.predicted_kw},${r.predicted_temp},${r.saving_lkr}\r\n`;
          });
          csv += `Total,${d.data!.total_kw},,${d.data!.total_savings}\r\n\r\n`;
        });
    } else {
      csv += "HOURLY BREAKDOWN\r\n";
      csv += "Hour,Predicted kW,Temperature (°C),Savings (LKR),% of Peak\r\n";
      active.breakdown.forEach((r) => {
        const pct = peak
          ? ((r.predicted_kw / peak.predicted_kw) * 100).toFixed(0)
          : "0";
        csv += `${r.hour},${r.predicted_kw},${r.predicted_temp},${r.saving_lkr},${pct}%\r\n`;
      });
      csv += `Total,${active.total_kw},,${active.total_savings}\r\n`;
    }

    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `solar-analytics-${rangeLabel.replace(/\s/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* ═══ Generate PDF Report ═══ */
  const generateReport = () => {
    if (!active) return;
    const svgMain = grabSVG(mainRef);
    const svgTemp = grabSVG(tempRef);
    const svgBar = grabSVG(barRef);
    const svgSav = grabSVG(savRef);
    const svgMulti = grabSVG(multiRef);

    const miniBar = (bd: BreakdownItem[], maxKw: number) =>
      `<div style="display:flex;align-items:flex-end;gap:3px;height:80px;margin:10px 0;">
        ${bd
        .map(
          (b) =>
            `<div title="${b.hour}: ${b.predicted_kw} kW" style="flex:1;background:${b.predicted_kw === maxKw ? "#f97316" : "#172554"};border-radius:4px 4px 0 0;height:${maxKw > 0 ? (b.predicted_kw / maxKw) * 100 : 0}%;min-height:2px;"></div>`
        )
        .join("")}
       </div>
       <div style="display:flex;gap:3px;font-size:8px;color:#64748b;">
        ${bd.map((b) => `<div style="flex:1;text-align:center;">${b.hour.replace(":00", "")}</div>`).join("")}
       </div>`;

    const hourTable = (data: PredictionResponse, dayLabel: string) => {
      const pk = Math.max(...data.breakdown.map((b) => b.predicted_kw));
      return `
        <h3 style="color:#172554;font-size:16px;margin:25px 0 10px;padding-left:12px;border-left:4px solid #f97316;">
          Hourly Breakdown — ${dayLabel}
        </h3>
        ${miniBar(data.breakdown, pk)}
        <table>
          <thead><tr><th style="text-align:left;">Hour</th><th>Temp</th><th>Generation</th><th>% Peak</th><th style="text-align:right;">Savings</th></tr></thead>
          <tbody>${data.breakdown
          .map((r) => {
            const pct =
              pk > 0 ? ((r.predicted_kw / pk) * 100).toFixed(0) : "0";
            const isPk = r.predicted_kw === pk;
            return `<tr style="${isPk ? "background:#fff7ed;font-weight:bold;" : ""}">
                <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${r.hour}${isPk ? ' <span style="background:#f97316;color:#fff;padding:1px 8px;border-radius:10px;font-size:10px;">PEAK</span>' : ""}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${r.predicted_temp}°C</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#f97316;font-weight:bold;">${r.predicted_kw} kW</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">
                  <div style="display:inline-flex;align-items:center;gap:6px;">
                    <div style="width:60px;height:6px;background:#e2e8f0;border-radius:4px;"><div style="width:${pct}%;height:6px;background:#f97316;border-radius:4px;"></div></div>${pct}%
                  </div>
                </td>
                <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#16a34a;font-weight:bold;">Rs. ${r.saving_lkr.toLocaleString()}</td>
              </tr>`;
          })
          .join("")}
          </tbody>
          <tfoot><tr>
            <td colspan="2" style="padding:10px 12px;font-weight:bold;">Total</td>
            <td style="padding:10px 12px;text-align:center;color:#f97316;font-weight:bold;">${data.total_kw} kWh</td>
            <td></td>
            <td style="padding:10px 12px;text-align:right;font-weight:bold;">Rs. ${data.total_savings.toLocaleString()}</td>
          </tr></tfoot>
        </table>`;
    };

    const fcSlice = forecast.slice(
      0,
      range === "3d" ? 3 : range === "7d" ? 7 : 1
    );
    const fcTable =
      isMulti && fcSlice.length > 0
        ? `<h3 style="color:#172554;font-size:16px;margin:25px 0 10px;padding-left:12px;border-left:4px solid #3b82f6;">Weather Forecast — ${rangeLabel}</h3>
           <table><thead><tr><th style="text-align:left;">Date</th><th>Condition</th><th>High</th><th>Low</th><th>UV</th><th style="text-align:right;">Rain</th></tr></thead>
           <tbody>${fcSlice
          .map(
            (f) =>
              `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${f.label}</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${f.condition}</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#f97316;font-weight:bold;">${f.maxTemp}°C</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#3b82f6;font-weight:bold;">${f.minTemp}°C</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${f.uvIndex}</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${f.precipitation > 0 ? f.precipitation + " mm" : "—"}</td></tr>`
          )
          .join("")}
           </tbody></table>`
        : "";

    const mdSummary =
      isMulti && days.filter((d) => d.data).length > 0
        ? `<h3 style="color:#172554;font-size:16px;margin:25px 0 10px;padding-left:12px;border-left:4px solid #f97316;">Multi-Day Summary</h3>
           <table><thead><tr><th style="text-align:left;">Date</th><th>Total kWh</th><th>Peak kW</th><th>CO₂ (kg)</th><th style="text-align:right;">Savings</th></tr></thead>
           <tbody>${days
          .filter((d) => d.data)
          .map(
            (d) =>
              `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;">${d.label}</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${d.data!.total_kw} kWh</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#f97316;font-weight:bold;">${Math.max(...d.data!.breakdown.map((b) => b.predicted_kw))} kW</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${(d.data!.total_kw * 0.5).toFixed(1)}</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#16a34a;font-weight:bold;">Rs. ${d.data!.total_savings.toLocaleString()}</td></tr>`
          )
          .join("")}
           </tbody>
           <tfoot><tr style="background:#172554;color:#fff;">
             <td style="padding:10px 12px;font-weight:bold;">Aggregate</td>
             <td style="padding:10px 12px;text-align:center;font-weight:bold;">${totals.kw.toFixed(1)} kWh</td>
             <td></td>
             <td style="padding:10px 12px;text-align:center;">${(totals.kw * 0.5).toFixed(1)} kg</td>
             <td style="padding:10px 12px;text-align:right;font-weight:bold;">Rs. ${totals.sav.toLocaleString()}</td>
           </tr></tfoot></table>`
        : "";

    const allDayTables = isMulti
      ? days
        .filter((d) => d.data)
        .map((d) => hourTable(d.data!, d.label))
        .join("")
      : hourTable(active, "Today");

    const html = `<!DOCTYPE html><html><head>
<title>Solar Analytics Report — ${rangeLabel}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;padding:40px;color:#1e293b;max-width:960px;margin:0 auto;font-size:13px}
.hdr{display:flex;align-items:center;gap:16px;border-bottom:4px solid #f97316;padding-bottom:20px;margin-bottom:30px}
.logo{width:56px;height:56px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;flex-shrink:0}
h1{color:#172554;font-size:26px}
h2{color:#172554;margin:30px 0 15px;font-size:20px;border-left:5px solid #f97316;padding-left:14px}
.meta{color:#64748b;font-size:12px;margin-top:4px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:20px 0}
.stat{background:#f8fafc;padding:18px;border-radius:14px;border-left:4px solid #f97316}
.stat-v{font-size:26px;font-weight:800;color:#172554}
.stat-l{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:3px}
.wx{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin:15px 0}
.wxc{background:#f1f5f9;padding:10px;border-radius:10px;text-align:center}
.wxc strong{display:block;font-size:16px;color:#172554}
.wxc span{font-size:10px;color:#64748b}
table{width:100%;border-collapse:collapse;margin:12px 0;border-radius:12px;overflow:hidden}
thead th{background:#172554;color:#fff;padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
tfoot td{background:#172554;color:#fff;padding:10px 12px}
.foot{margin-top:50px;padding-top:20px;border-top:3px solid #e2e8f0;color:#64748b;font-size:11px;text-align:center}
.btn{background:#f97316;color:#fff;border:none;padding:12px 28px;border-radius:12px;font-weight:700;cursor:pointer;font-size:14px;margin-bottom:25px}
svg{max-width:100%!important}
@media print{.no-print{display:none!important}body{padding:20px}}
</style></head><body>
<div class="hdr"><div class="logo">☀</div><div><h1>Solar Energy Analytics Report</h1>
<div class="meta">Generated: ${new Date().toLocaleString()} | Period: ${rangeLabel} | Location: Colombo, Sri Lanka</div></div></div>
<button class="no-print btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
<h2>Current Weather</h2>
<div class="wx">
  <div class="wxc"><strong>${weather.temperature}°C</strong><span>Temperature</span></div>
  <div class="wxc"><strong>${weather.condition}</strong><span>Condition</span></div>
  <div class="wxc"><strong>${weather.humidity}%</strong><span>Humidity</span></div>
  <div class="wxc"><strong>UV ${weather.uvIndex}</strong><span>UV Index</span></div>
  <div class="wxc"><strong>${weather.windSpeed} km/h</strong><span>Wind</span></div>
  <div class="wxc"><strong>${weather.cloudCover}%</strong><span>Cloud</span></div>
  <div class="wxc"><strong>${weather.pressure}</strong><span>hPa</span></div>
</div>
${fcTable}
<h2>Key Metrics${isMulti ? ` (${rangeLabel} Aggregate)` : ""}</h2>
<div class="stats">
  <div class="stat"><div class="stat-v">${showKw} kWh</div><div class="stat-l">Total Generation</div></div>
  <div class="stat"><div class="stat-v">${peak?.predicted_kw} kW</div><div class="stat-l">Peak Output (${peak?.hour})</div></div>
  <div class="stat"><div class="stat-v">Rs. ${Number(showSav).toLocaleString()}</div><div class="stat-l">Est. Savings</div></div>
  <div class="stat"><div class="stat-v">${showCo2} kg</div><div class="stat-l">CO₂ Reduced</div></div>
  <div class="stat"><div class="stat-v">${eff}%</div><div class="stat-l">Efficiency</div></div>
  <div class="stat"><div class="stat-v">${avgK} kW</div><div class="stat-l">Avg Output</div></div>
</div>
${isMulti ? mdSummary : ""}
${isMulti ? chartBlock("Multi-Day Comparison", svgMulti) : ""}
${chartBlock("Generation Forecast", svgMain)}
${chartBlock("Temperature vs Generation", svgTemp)}
${chartBlock("Hourly Generation", svgBar)}
${chartBlock("Hourly Savings", svgSav)}
<h2>Detailed Data</h2>
${allDayTables}
<div class="foot"><p><strong>Lakdhanvi Limited</strong> — Solar Intelligence Platform v2.0</p>
<p style="margin-top:4px;">AI-Powered Prediction • Open-Meteo Weather • Report ID: RPT-${Date.now()}</p></div>
</body></html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  /* ── helpers ── */
  const refresh = () => {
    fetchWeather();
    fetchAll();
  };
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* ══════════ HEADER ══════════ */}
        <header className="bg-gradient-to-r from-blue-950 to-blue-900 border-b-2 border-orange-500 sticky top-0 z-40 relative overflow-hidden">
          <ParticleField />
          <DotPattern size={32} />
          <div className="relative px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <FloatingSun size={52} />
                </div>
                <div className="sm:hidden w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      Analytics
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30 backdrop-blur-sm">
                      <Sparkles className="w-3 h-3" /> AI Powered
                    </span>
                  </div>
                  <p className="text-blue-300/80 text-sm mt-0.5">
                    {fmtDate(now)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Time Range Toggle */}
                <div className="bg-blue-800/40 backdrop-blur-sm p-1 rounded-xl flex border border-blue-700/50">
                  {(["today", "3d", "7d"] as TimeRange[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRange(r);
                        setDayIdx(0);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${range === r
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                          : "text-blue-300 hover:text-white hover:bg-blue-700/30"
                        }`}
                    >
                      {r === "today" ? "Today" : r === "3d" ? "3 Days" : "7 Days"}
                    </button>
                  ))}
                </div>

                {/* Clock */}
                <div className="hidden md:flex items-center gap-2 bg-blue-800/40 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-700/50">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-mono text-lg tracking-wider">
                    {fmtTime(now)}
                  </span>
                </div>

                {/* Status */}
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-sm ${status === "online"
                      ? "bg-green-500/15 border-green-500/30"
                      : status === "offline"
                        ? "bg-red-500/15 border-red-500/30"
                        : "bg-yellow-500/15 border-yellow-500/30"
                    }`}
                >
                  {status === "online" ? (
                    <>
                      <div className="relative">
                        <Wifi className="w-4 h-4 text-green-400" />
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                      </div>
                      <span className="text-green-400 text-sm font-medium">
                        AI Online
                      </span>
                    </>
                  ) : status === "offline" ? (
                    <>
                      <WifiOff className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">
                        AI Offline
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-yellow-400 text-sm font-medium">
                        Connecting…
                      </span>
                    </>
                  )}
                </div>

                {/* Refresh */}
                <button
                  onClick={refresh}
                  disabled={refreshing}
                  className="p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 active:scale-[0.95]"
                >
                  <RefreshCw
                    className={`w-5 h-5 text-white ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>

                {/* Download Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDlMenu(!dlMenu);
                    }}
                    disabled={!active}
                    className="flex items-center gap-1.5 p-2.5 bg-blue-800/40 hover:bg-blue-700/50 backdrop-blur-sm rounded-xl border border-blue-700/50 disabled:opacity-50 transition-all active:scale-[0.95]"
                  >
                    <Download className="w-5 h-5 text-white" />
                    <ChevronDown className="w-3 h-3 text-white" />
                  </button>
                  {dlMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 py-2 w-60 z-50">
                      <button
                        onClick={() => {
                          downloadCSV();
                          setDlMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-left transition-colors"
                      >
                        <FileText className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-bold text-blue-950 text-sm">
                            Download CSV
                          </p>
                          <p className="text-xs text-slate-500">
                            Spreadsheet format
                          </p>
                        </div>
                      </button>
                      <div className="border-t border-blue-100 mx-3" />
                      <button
                        onClick={() => {
                          generateReport();
                          setDlMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-left transition-colors"
                      >
                        <Printer className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-bold text-blue-950 text-sm">
                            Full Report (PDF)
                          </p>
                          <p className="text-xs text-slate-500">
                            With charts & tables
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {/* ══════════ LOADING STATE ══════════ */}
          {loading && (
            <Card3D glowColor="orange">
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl lg:rounded-3xl border-2 border-dashed border-blue-200 relative overflow-hidden">
                <div className="absolute top-10 right-10 w-20 h-20 bg-orange-100 rounded-full blur-2xl" />
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-100 rounded-full blur-2xl" />
                <div className="relative mb-8">
                  <FloatingSun size={100} />
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-blue-950 mb-2">
                  Analyzing Solar Data
                </h3>
                <p className="text-blue-600">
                  Fetching AI predictions for {rangeLabel}…
                </p>
                <div className="flex items-center gap-2 text-orange-500 mt-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Processing…</span>
                </div>
              </div>
            </Card3D>
          )}

          {/* ══════════ ERROR STATE ══════════ */}
          {!loading && err && !today && (
            <Card3D glowColor="orange">
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl lg:rounded-3xl border-2 border-red-200 relative overflow-hidden">
                <div className="absolute top-10 right-10 w-20 h-20 bg-red-100 rounded-full blur-2xl" />
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <ServerOff className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-blue-950 mb-3">
                  AI Model Unavailable
                </h3>
                <p className="text-blue-600 text-center max-w-md mb-6">
                  {err}
                </p>
                <button
                  onClick={refresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Try Again
                </button>
                <code className="text-xs bg-blue-50 px-4 py-2 rounded-xl mt-4 text-blue-600 border border-blue-200">
                  {API_URL}
                </code>
              </div>
            </Card3D>
          )}

          {/* ══════════ MAIN CONTENT ══════════ */}
          {!loading && active && (
            <>
              {/* ── WEATHER BAR ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  {
                    icon: (
                      <ThermometerSun className="w-4 h-4" />
                    ),
                    label: "Temp",
                    value: `${weather.temperature}°C`,
                    accent: true,
                  },
                  {
                    icon: (
                      <CloudSun className="w-4 h-4 text-blue-600" />
                    ),
                    label: "Weather",
                    value: weather.condition,
                  },
                  {
                    icon: (
                      <Sun className="w-4 h-4 text-orange-500" />
                    ),
                    label: "UV",
                    value: String(weather.uvIndex),
                  },
                  {
                    icon: (
                      <Droplets className="w-4 h-4 text-blue-500" />
                    ),
                    label: "Humidity",
                    value: `${weather.humidity}%`,
                  },
                  {
                    icon: (
                      <Wind className="w-4 h-4 text-slate-500" />
                    ),
                    label: "Wind",
                    value: `${weather.windSpeed} km/h`,
                  },
                  {
                    icon: (
                      <Eye className="w-4 h-4 text-slate-500" />
                    ),
                    label: "Cloud",
                    value: `${weather.cloudCover}%`,
                  },
                  {
                    icon: (
                      <Gauge className="w-4 h-4 text-orange-400" />
                    ),
                    label: "Pressure",
                    value: `${weather.pressure} hPa`,
                    dark: true,
                  },
                ].map((w, i) => (
                  <Card3D
                    key={i}
                    glowColor={w.accent ? "orange" : w.dark ? "blue" : "blue"}
                  >
                    <div
                      className={
                        w.accent
                          ? "bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg shadow-orange-200 border-2 border-orange-400"
                          : w.dark
                            ? "bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl p-4 text-white border-2 border-blue-800 shadow-lg"
                            : "bg-white rounded-2xl p-4 border-2 border-blue-100 shadow-lg hover:border-blue-200 transition-all"
                      }
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {w.icon}
                        <span
                          className={`text-xs font-medium ${w.accent
                              ? "opacity-90"
                              : w.dark
                                ? "text-blue-300"
                                : "text-blue-600"
                            }`}
                        >
                          {w.label}
                        </span>
                      </div>
                      <p
                        className={`text-xl font-bold ${w.accent || w.dark ? "" : "text-blue-950"
                          }`}
                      >
                        {w.value}
                      </p>
                    </div>
                  </Card3D>
                ))}
              </div>

              {/* ── DAY SELECTOR (multi-day) ── */}
              {isMulti && days.length > 0 && (
                <Card3D glowColor="blue">
                  <div className="bg-white rounded-2xl lg:rounded-3xl p-5 border-2 border-blue-100 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon3D
                        icon={Calendar}
                        gradient="#f97316, #ea580c"
                        size="w-10 h-10"
                        iconSize={20}
                      />
                      <div>
                        <span className="font-bold text-blue-950">
                          Select Day
                        </span>
                        <p className="text-xs text-blue-600">
                          {rangeLabel} forecast period
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {days.map((d, i) => (
                        <button
                          key={d.date}
                          onClick={() => setDayIdx(i)}
                          disabled={!d.data}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${dayIdx === i
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                              : d.data
                                ? "bg-blue-50 text-blue-950 hover:bg-blue-100 border-2 border-blue-100 hover:border-blue-200"
                                : "bg-red-50 text-red-400 border-2 border-red-100 cursor-not-allowed"
                            }`}
                        >
                          {d.label}
                          {d.data && (
                            <span className="ml-2 text-xs opacity-75">
                              {d.data.total_kw} kWh
                            </span>
                          )}
                          {!d.data && (
                            <span className="ml-2 text-xs">No data</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card3D>
              )}

              {/* ── WEATHER FORECAST (multi-day) ── */}
              {isMulti && forecast.length > 0 && (
                <Card3D glowColor="blue">
                  <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 shadow-lg">
                    <div className="flex items-center gap-3 mb-5">
                      <Icon3D
                        icon={CloudSun}
                        gradient="#3b82f6, #2563eb"
                        size="w-11 h-11"
                        iconSize={22}
                      />
                      <div>
                        <h3 className="font-bold text-blue-950">
                          Weather Forecast
                        </h3>
                        <p className="text-xs text-blue-600">
                          {rangeLabel} outlook
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                      {forecast
                        .slice(0, range === "3d" ? 3 : 7)
                        .map((fc, i) => (
                          <div
                            key={fc.date}
                            className={`rounded-xl p-3 text-center border-2 transition-all ${i === dayIdx
                                ? "border-orange-400 bg-orange-50 shadow-md"
                                : "border-blue-100 bg-blue-50/50 hover:border-blue-200"
                              }`}
                          >
                            <p className="text-xs font-bold text-blue-600 mb-1">
                              {fc.label}
                            </p>
                            <p className="text-lg font-bold text-blue-950">
                              {fc.condition}
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              <span className="text-orange-500 font-bold">
                                {fc.maxTemp}°
                              </span>{" "}
                              /{" "}
                              <span className="text-blue-500 font-bold">
                                {fc.minTemp}°
                              </span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              UV {fc.uvIndex}
                            </p>
                            {fc.precipitation > 0 && (
                              <p className="text-xs text-blue-500 mt-1">
                                🌧 {fc.precipitation}mm
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </Card3D>
              )}

              {/* ── STAT CARDS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                {/* Total Generation */}
                <Card3D glowColor="orange">
                  <div className="group bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 hover:border-orange-300 transition-all shadow-lg h-full">
                    <div className="flex items-start justify-between mb-4">
                      <Icon3D
                        icon={Zap}
                        gradient="#f97316, #ea580c"
                        size="w-12 h-12"
                        iconSize={22}
                      />
                      <div className="flex items-center gap-1 bg-green-100 px-2.5 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-bold text-green-700">
                          {isMulti ? `${totals.n}d` : "Live"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      Total Generation
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl font-bold text-blue-950">
                        <AnimatedValue
                          value={parseFloat(String(showKw))}
                          suffix=""
                        />
                      </span>
                      <span className="text-sm font-medium text-blue-400">
                        kWh
                      </span>
                    </div>
                  </div>
                </Card3D>

                {/* Peak */}
                <Card3D glowColor="blue">
                  <div className="group bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-800 hover:border-orange-500/50 transition-all shadow-lg h-full relative overflow-hidden">
                    <DotPattern />
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-500/10 rounded-full blur-xl" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <Icon3D
                          icon={Sun}
                          gradient="#f97316, #fb923c"
                          size="w-12 h-12"
                          iconSize={22}
                        />
                        <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-1 rounded-full border border-orange-500/30">
                          {peak?.hour}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-blue-300 mb-1">
                        Peak Output
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl lg:text-3xl font-bold text-white">
                          <AnimatedValue
                            value={peak?.predicted_kw || 0}
                            suffix=""
                          />
                        </span>
                        <span className="text-sm font-medium text-blue-400">
                          kW
                        </span>
                      </div>
                    </div>
                  </div>
                </Card3D>

                {/* Efficiency */}
                <Card3D glowColor="blue">
                  <div className="group bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 hover:border-blue-300 transition-all shadow-lg h-full">
                    <div className="flex items-start justify-between mb-4">
                      <Icon3D
                        icon={Target}
                        gradient="#3b82f6, #2563eb"
                        size="w-12 h-12"
                        iconSize={22}
                      />
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
                        A+
                      </span>
                    </div>
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      Efficiency
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl font-bold text-blue-950">
                        <AnimatedValue value={parseFloat(eff)} suffix="" />
                      </span>
                      <span className="text-sm font-medium text-blue-400">
                        %
                      </span>
                    </div>
                  </div>
                </Card3D>

                {/* CO₂ */}
                <Card3D glowColor="green">
                  <div className="group bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 hover:border-green-300 transition-all shadow-lg h-full">
                    <div className="flex items-start justify-between mb-4">
                      <Icon3D
                        icon={Leaf}
                        gradient="#22c55e, #16a34a"
                        size="w-12 h-12"
                        iconSize={22}
                      />
                      <div className="flex items-center gap-1 bg-green-100 px-2.5 py-1 rounded-full">
                        <Sparkles className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-bold text-green-700">
                          ECO
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      CO₂ Reduced
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl font-bold text-blue-950">
                        <AnimatedValue
                          value={parseFloat(String(showCo2))}
                          suffix=""
                        />
                      </span>
                      <span className="text-sm font-medium text-blue-400">
                        kg
                      </span>
                    </div>
                  </div>
                </Card3D>

                {/* Savings */}
                <Card3D glowColor="orange">
                  <div className="group bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-800 hover:border-orange-500/50 transition-all shadow-lg h-full relative overflow-hidden">
                    <DotPattern />
                    <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-500/10 rounded-full blur-xl" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <Icon3D
                          icon={DollarSign}
                          gradient="#f97316, #ea580c"
                          size="w-12 h-12"
                          iconSize={22}
                        />
                        <div className="flex items-center gap-1 bg-orange-500/20 px-2.5 py-1 rounded-full border border-orange-500/30">
                          <TrendingUp className="w-3 h-3 text-orange-400" />
                          <span className="text-xs font-bold text-orange-400">
                            Savings
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-blue-300 mb-1">
                        Est. Savings
                      </p>
                      <span className="text-xl lg:text-2xl font-bold text-white">
                        <AnimatedValue
                          value={Number(showSav)}
                          prefix="Rs. "
                        />
                      </span>
                    </div>
                  </div>
                </Card3D>
              </div>

              {/* ── MULTI-DAY CHART ── */}
              {isMulti && multiChart.length > 0 && (
                <Card3D glowColor="blue">
                  <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border-2 border-blue-100 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Icon3D
                          icon={TrendingUp}
                          gradient="#3b82f6, #2563eb"
                          size="w-12 h-12"
                          iconSize={22}
                        />
                        <div>
                          <h3 className="text-lg lg:text-xl font-bold text-blue-950">
                            {rangeLabel} Comparison
                          </h3>
                          <p className="text-xs text-blue-600">
                            {totals.n} days • {totals.kw.toFixed(1)} kWh total
                          </p>
                        </div>
                      </div>
                    </div>
                    <div ref={multiRef} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={multiChart}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#172554", fontSize: 12 }}
                          />
                          <YAxis
                            yAxisId="l"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#172554", fontSize: 12 }}
                            tickFormatter={(v) => `${v} kWh`}
                          />
                          <YAxis
                            yAxisId="r"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#172554", fontSize: 12 }}
                            tickFormatter={(v) => `Rs.${v}`}
                          />
                          <Tooltip content={<ChartTip />} />
                          <Bar
                            yAxisId="l"
                            dataKey="totalKw"
                            name="Total kWh"
                            fill="#172554"
                            radius={[8, 8, 0, 0]}
                          />
                          <Bar
                            yAxisId="l"
                            dataKey="peakKw"
                            name="Peak kW"
                            fill="#f97316"
                            radius={[8, 8, 0, 0]}
                          />
                          <Line
                            yAxisId="r"
                            type="monotone"
                            dataKey="savings"
                            name="Savings"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{ fill: "#22c55e", r: 5 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-blue-100">
                      {[
                        { c: "bg-blue-950", l: "Total kWh", r: false },
                        { c: "bg-orange-500", l: "Peak kW", r: false },
                        { c: "bg-green-500", l: "Savings", r: true },
                      ].map((x) => (
                        <div key={x.l} className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 ${x.c} ${x.r ? "rounded-full" : "rounded-sm"}`}
                          />
                          <span className="text-sm text-blue-600 font-medium">
                            {x.l}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card3D>
              )}

              {/* ── MAIN GENERATION CHART ── */}
              <Card3D glowColor="orange">
                <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border-2 border-blue-100 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Icon3D
                        icon={Sun}
                        gradient="#f97316, #ea580c"
                        size="w-12 h-12"
                        iconSize={22}
                      />
                      <div>
                        <h3 className="text-lg lg:text-xl font-bold text-blue-950">
                          AI Forecasted Generation
                          {isMulti && (
                            <span className="text-sm text-orange-500 ml-2">
                              — {days[dayIdx]?.label ?? "Today"}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-blue-600">
                          Hourly power output from AI model
                        </p>
                      </div>
                    </div>
                    {updated && (
                      <span className="text-xs text-slate-500 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        Updated: {updated.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div ref={mainRef} className="h-[350px] lg:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={active.breakdown}>
                        <defs>
                          <linearGradient
                            id="kwG"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#f97316"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#f97316"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="hour"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#172554",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#172554", fontSize: 12 }}
                          tickFormatter={(v) => `${v} kW`}
                        />
                        <Tooltip content={<ChartTip />} />
                        <Area
                          type="monotone"
                          dataKey="predicted_kw"
                          name="Generation"
                          stroke="#f97316"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#kwG)"
                          dot={{
                            fill: "#f97316",
                            strokeWidth: 2,
                            r: 4,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 8,
                            fill: "#ea580c",
                            stroke: "#fff",
                            strokeWidth: 3,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card3D>

              {/* ── SECONDARY CHARTS ── */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                {/* Temp vs Gen */}
                <Card3D glowColor="blue" className="xl:col-span-2">
                  <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border-2 border-blue-100 shadow-lg h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <Icon3D
                        icon={Activity}
                        gradient="#172554, #1e3a5f"
                        size="w-11 h-11"
                        iconSize={20}
                      />
                      <div>
                        <h3 className="font-bold text-blue-950">
                          Temperature vs Generation
                        </h3>
                        <p className="text-xs text-blue-600">
                          Correlation analysis
                        </p>
                      </div>
                    </div>
                    <div ref={tempRef} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={corrData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="hour"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#172554", fontSize: 11 }}
                          />
                          <YAxis
                            yAxisId="l"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#172554", fontSize: 11 }}
                            tickFormatter={(v) => `${v} kW`}
                          />
                          <YAxis
                            yAxisId="r"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#172554", fontSize: 11 }}
                            tickFormatter={(v) => `${v}°C`}
                          />
                          <Tooltip content={<ChartTip />} />
                          <Bar
                            yAxisId="l"
                            dataKey="generation"
                            name="Generation"
                            fill="#f97316"
                            radius={[6, 6, 0, 0]}
                            opacity={0.8}
                          />
                          <Line
                            yAxisId="r"
                            type="monotone"
                            dataKey="temperature"
                            name="Temperature"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: "#3b82f6", r: 4 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-blue-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                        <span className="text-sm text-blue-600 font-medium">
                          Generation (kW)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm text-blue-600 font-medium">
                          Temperature (°C)
                        </span>
                      </div>
                    </div>
                  </div>
                </Card3D>

                {/* Side panel */}
                <div className="space-y-6">
                  {/* Energy Source Pie */}
                  <Card3D glowColor="orange">
                    <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon3D
                          icon={Activity}
                          gradient="#172554, #1e3a5f"
                          size="w-10 h-10"
                          iconSize={18}
                        />
                        <div>
                          <h3 className="font-bold text-blue-950">
                            Energy Source
                          </h3>
                          <p className="text-xs text-blue-600">Distribution</p>
                        </div>
                      </div>
                      <div className="h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={ENERGY_SOURCES}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {ENERGY_SOURCES.map((e, i) => (
                                <Cell key={i} fill={e.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-2.5 mt-4">
                        {ENERGY_SOURCES.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: s.color }}
                              />
                              <span className="text-sm font-medium text-blue-950">
                                {s.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-blue-950">
                              {s.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card3D>

                  {/* Quick Analysis */}
                  <Card3D glowColor="blue">
                    <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-800 shadow-lg relative overflow-hidden">
                      <DotPattern />
                      <div className="relative">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-orange-400" />
                          Quick Analysis
                        </h3>
                        <div className="space-y-3">
                          {[
                            {
                              i: (
                                <ThermometerSun className="w-4 h-4 text-orange-400" />
                              ),
                              l: "Avg Temp",
                              v: `${avgT}°C`,
                            },
                            {
                              i: (
                                <Gauge className="w-4 h-4 text-orange-400" />
                              ),
                              l: "Avg Output",
                              v: `${avgK} kW`,
                            },
                            {
                              i: (
                                <Calendar className="w-4 h-4 text-orange-400" />
                              ),
                              l: "Active Hours",
                              v: `${active.breakdown.length}h`,
                            },
                            {
                              i: (
                                <Battery className="w-4 h-4 text-green-400" />
                              ),
                              l: "Battery",
                              v: "95%",
                              vc: "text-green-400",
                            },
                          ].map((x, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 bg-blue-800/50 rounded-xl border border-blue-700/30 backdrop-blur-sm"
                            >
                              <div className="flex items-center gap-2">
                                {x.i}
                                <span className="text-sm text-blue-300">
                                  {x.l}
                                </span>
                              </div>
                              <span
                                className={`font-bold ${x.vc ?? "text-white"}`}
                              >
                                {x.v}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card3D>
                </div>
              </div>

              {/* ── BAR & SAVINGS ── */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                <Card3D glowColor="blue">
                  <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border-2 border-blue-100 shadow-lg h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <Icon3D
                        icon={BarChart3}
                        gradient="#172554, #1e3a5f"
                        size="w-11 h-11"
                        iconSize={20}
                      />
                      <div>
                        <h3 className="font-bold text-blue-950">
                          Hourly Generation
                        </h3>
                        <p className="text-xs text-blue-600">
                          Power output per hour
                        </p>
                      </div>
                    </div>
                    <div ref={barRef} className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={active.breakdown}
                          barCategoryGap="15%"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="hour"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#172554", fontSize: 11 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#172554", fontSize: 11 }}
                            tickFormatter={(v) => `${v} kW`}
                          />
                          <Tooltip content={<ChartTip />} />
                          <Bar
                            dataKey="predicted_kw"
                            name="Generation"
                            radius={[8, 8, 0, 0]}
                          >
                            {active.breakdown.map((e, i) => (
                              <Cell
                                key={i}
                                fill={
                                  e.predicted_kw === peak?.predicted_kw
                                    ? "#f97316"
                                    : "#172554"
                                }
                                opacity={
                                  e.predicted_kw === peak?.predicted_kw
                                    ? 1
                                    : 0.85
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card3D>

                <Card3D glowColor="green">
                  <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border-2 border-blue-100 shadow-lg h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <Icon3D
                        icon={DollarSign}
                        gradient="#22c55e, #16a34a"
                        size="w-11 h-11"
                        iconSize={20}
                      />
                      <div>
                        <h3 className="font-bold text-blue-950">
                          Hourly Savings
                        </h3>
                        <p className="text-xs text-blue-600">
                          Revenue per hour (LKR)
                        </p>
                      </div>
                    </div>
                    <div ref={savRef} className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={savData}>
                          <defs>
                            <linearGradient
                              id="sG"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#22c55e"
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="95%"
                                stopColor="#22c55e"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="hour"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#172554", fontSize: 11 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#172554", fontSize: 11 }}
                            tickFormatter={(v) => `Rs.${v}`}
                          />
                          <Tooltip content={<ChartTip />} />
                          <Area
                            type="monotone"
                            dataKey="savings"
                            name="Savings"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fill="url(#sG)"
                            dot={{ fill: "#22c55e", r: 4, stroke: "#fff", strokeWidth: 2 }}
                            activeDot={{
                              r: 8,
                              fill: "#16a34a",
                              stroke: "#fff",
                              strokeWidth: 3,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card3D>
              </div>

              {/* ── DETAILED TABLE ── */}
              <Card3D glowColor="blue">
                <div className="bg-white rounded-2xl lg:rounded-3xl border-2 border-blue-100 overflow-hidden shadow-lg">
                  <div className="p-5 lg:p-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-950 to-blue-900 relative overflow-hidden">
                    <DotPattern />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">
                            Hourly Breakdown
                            {isMulti && (
                              <span className="text-orange-400 ml-2 text-sm">
                                — {days[dayIdx]?.label}
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-blue-300">
                            Detailed AI predictions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-300 bg-blue-800/50 px-3 py-1 rounded-full">
                          {active.breakdown.length} hours
                        </span>
                        <button
                          onClick={downloadCSV}
                          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors active:scale-[0.98]"
                        >
                          <Download className="w-3.5 h-3.5" /> CSV
                        </button>
                        <button
                          onClick={generateReport}
                          className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors active:scale-[0.98]"
                        >
                          <Printer className="w-3.5 h-3.5" /> PDF
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-blue-50/80">
                          <th className="p-4 lg:p-5 text-left text-xs font-bold text-blue-950 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="p-4 lg:p-5 text-center text-xs font-bold text-blue-950 uppercase tracking-wider">
                            Temperature
                          </th>
                          <th className="p-4 lg:p-5 text-center text-xs font-bold text-blue-950 uppercase tracking-wider">
                            Generation
                          </th>
                          <th className="p-4 lg:p-5 text-center text-xs font-bold text-blue-950 uppercase tracking-wider">
                            % Peak
                          </th>
                          <th className="p-4 lg:p-5 text-right text-xs font-bold text-blue-950 uppercase tracking-wider">
                            Savings
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.breakdown.map((r, i) => {
                          const pct =
                            peak && peak.predicted_kw > 0
                              ? (
                                (r.predicted_kw / peak.predicted_kw) *
                                100
                              ).toFixed(0)
                              : "0";
                          const isPk =
                            r.predicted_kw === peak?.predicted_kw;
                          return (
                            <tr
                              key={i}
                              className={`border-b border-blue-50 hover:bg-orange-50/50 transition-colors ${isPk
                                  ? "bg-orange-50"
                                  : i % 2 === 0
                                    ? "bg-white"
                                    : "bg-blue-50/30"
                                }`}
                            >
                              <td className="p-4 lg:p-5">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isPk
                                        ? "bg-gradient-to-br from-orange-500 to-orange-600"
                                        : "bg-blue-100"
                                      }`}
                                  >
                                    <Clock
                                      className={`w-4 h-4 ${isPk ? "text-white" : "text-blue-600"}`}
                                    />
                                  </div>
                                  <span className="font-bold text-blue-950">
                                    {r.hour}
                                  </span>
                                  {isPk && (
                                    <span className="text-[10px] bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                                      ⚡ Peak
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 lg:p-5 text-center">
                                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-950 to-blue-900 px-3 py-1.5 rounded-full shadow-sm">
                                  <ThermometerSun className="w-4 h-4 text-orange-500" />
                                  <span className="font-semibold text-white">
                                    {r.predicted_temp}°C
                                  </span>
                                </span>
                              </td>
                              <td className="p-4 lg:p-5 text-center">
                                <span
                                  className={`text-lg font-bold ${isPk ? "text-orange-500" : "text-blue-950"}`}
                                >
                                  {r.predicted_kw} kW
                                </span>
                              </td>
                              <td className="p-4 lg:p-5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-16 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-blue-950 w-8">
                                    {pct}%
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 lg:p-5 text-right">
                                <span className="font-bold text-green-600">
                                  Rs. {r.saving_lkr.toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gradient-to-r from-blue-950 to-blue-900">
                          <td
                            className="p-4 lg:p-5 text-white font-bold"
                            colSpan={2}
                          >
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-orange-400" />{" "}
                              Total
                            </div>
                          </td>
                          <td className="p-4 lg:p-5 text-center">
                            <span className="text-lg font-bold text-orange-400">
                              {active.total_kw} kWh
                            </span>
                          </td>
                          <td className="p-4 lg:p-5 text-center text-blue-300">
                            —
                          </td>
                          <td className="p-4 lg:p-5 text-right">
                            <span className="text-lg font-bold text-white">
                              Rs.{" "}
                              {active.total_savings.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </Card3D>

              {/* ── DOWNLOAD CTA ── */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-lg shadow-orange-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Download Report
                      </h3>
                      <p className="text-orange-100 text-sm mt-1">
                        Export {rangeLabel} analytics with all charts &amp; data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={downloadCSV}
                      className="flex items-center gap-2 bg-white text-orange-600 px-5 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg active:scale-[0.98]"
                    >
                      <Download className="w-5 h-5" /> Download CSV
                    </button>
                    <button
                      onClick={generateReport}
                      className="flex items-center gap-2 bg-white/20 text-white px-5 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors border border-white/30 active:scale-[0.98]"
                    >
                      <Printer className="w-5 h-5" /> Full Report PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* ── SYSTEM STATUS ── */}
              <Card3D glowColor="blue">
                <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-800 shadow-lg relative overflow-hidden">
                  <DotPattern size={32} />
                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/30">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-white font-bold">
                          All Systems Operational
                        </p>
                        <p className="text-blue-300 text-sm">
                          {updated
                            ? `Last updated: ${updated.toLocaleString()}`
                            : "Fetching…"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        icon={<Wifi className="w-4 h-4" />}
                        label="Connected"
                        color="green"
                      />
                      <Badge
                        icon={<Cpu className="w-4 h-4" />}
                        label={
                          status === "online" ? "AI Active" : "AI Offline"
                        }
                        color={status === "online" ? "blue" : "red"}
                      />
                      <Badge
                        icon={<BellRing className="w-4 h-4" />}
                        label={`${rangeLabel} Mode`}
                        color="orange"
                      />
                    </div>
                  </div>
                </div>
              </Card3D>
            </>
          )}
        </div>

        {/* ══════════ FOOTER ══════════ */}
        <footer className="p-4 sm:p-6 lg:p-8">
          <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-5 lg:p-6 border-2 border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <DotPattern size={32} />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold">
                  Lakdhanvi Analytics
                </span>
                <span className="text-blue-400 text-sm ml-2">v2.0</span>
              </div>
            </div>
            <p className="relative text-sm text-blue-300">
              Powered by Machine Learning • Real-time Solar Analytics •
              Open-Meteo Weather
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}