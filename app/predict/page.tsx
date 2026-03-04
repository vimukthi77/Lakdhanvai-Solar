"use client";

import React, { useState, useEffect } from "react";
import {
  Sun, Calendar, Clock, DollarSign, Zap, Thermometer, Info,
  BarChart3, TrendingUp, Activity, ChevronRight, Sparkles,
  Download, Share2, RefreshCw, CheckCircle2, AlertCircle,
  ArrowRight, Target, Gauge, FileText, Printer, Wifi,
} from "lucide-react";
import {
  XAxis, YAxis, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, BarChart, Bar, Cell, Tooltip, TooltipProps,
} from "recharts";
import Sidebar from "@/components/Sidebar";

/* ═══ Types ═══ */
interface BreakdownItem {
  hour: string;
  predicted_kw: number;
  predicted_temp: number;
  saving_lkr: number;
}
interface PredictionData {
  total_kw: number;
  total_savings: number;
  breakdown: BreakdownItem[];
}
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{ value: number; dataKey?: string; name?: string; color?: string }>;
  label?: string;
}

/* ═══ 3D Card Wrapper ═══ */
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
    setTransform(`perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale3d(1.01, 1.01, 1.01)`);
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

/* ═══ 3D Icon ═══ */
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
    <div className="relative group-hover:scale-110 transition-transform duration-300" style={{ perspective: "200px" }}>
      <div
        className={`absolute -bottom-1 left-1 ${size} rounded-xl lg:rounded-2xl opacity-30 blur-sm`}
        style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}
      />
      <div
        className={`relative ${size} rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg`}
        style={{
          background: `linear-gradient(135deg, ${gradient})`,
          transform: "translateZ(8px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <Icon className="text-white" size={iconSize} />
        <div
          className="absolute inset-0 rounded-xl lg:rounded-2xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)" }}
        />
      </div>
    </div>
  );
}

/* ═══ Animated Counter ═══ */
function AnimatedValue({ value, prefix = "", suffix = "" }: { value: number | string; prefix?: string; suffix?: string }) {
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
      {Number.isInteger(numVal) ? Math.round(display).toLocaleString() : display.toFixed(1)}
      {suffix}
    </span>
  );
}

/* ═══ Particle Background ═══ */
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
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-25px) translateX(8px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

/* ═══ Floating Sun ═══ */
function FloatingSun({ size = 56 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size, perspective: "400px" }}>
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: "20s" }}>
        <div className="absolute inset-2 rounded-full border-2 border-orange-400/20" style={{ transform: "rotateX(60deg)" }} />
      </div>
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }}>
        <div className="absolute inset-4 rounded-full border-2 border-yellow-400/15" style={{ transform: "rotateX(45deg) rotateY(20deg)" }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full animate-pulse"
          style={{
            width: size * 0.5,
            height: size * 0.5,
            background: "radial-gradient(circle at 35% 35%, #fef3c7, #fbbf24, #f97316, #ea580c)",
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
            background: "linear-gradient(90deg, rgba(251,191,36,0.3), transparent)",
            animation: "pulse 2s ease-in-out infinite",
            animationDelay: `${deg * 3}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function PredictPage() {
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState("6");
  const [endHour, setEndHour] = useState("18");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PredictionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDlMenu, setShowDlMenu] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!showDlMenu) return;
    const close = () => setShowDlMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showDlMenu]);

  const today = new Date().toISOString().split("T")[0];

  const peakHour = data?.breakdown.reduce(
    (max, item) => (item.predicted_kw > max.predicted_kw ? item : max),
    { hour: "-", predicted_kw: 0, predicted_temp: 0, saving_lkr: 0 }
  );

  const avgKw = data
    ? (data.breakdown.reduce((s, i) => s + i.predicted_kw, 0) / data.breakdown.length).toFixed(2)
    : "0";

  const co2Saved = data ? (data.total_kw * 0.5).toFixed(1) : "0";

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("https://solar-ai-model.onrender.com/predict_range", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          start_hour: parseInt(startHour),
          end_hour: parseInt(endHour),
        }),
      });

      if (!response.ok) throw new Error("Failed to get prediction");
      const result: PredictionData = await response.json();
      setData(result);

      try {
        const saveResponse = await fetch("/api/predictions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            startHour: parseInt(startHour),
            endHour: parseInt(endHour),
            totalKw: result.total_kw,
            totalSavings: result.total_savings,
            breakdown: result.breakdown,
          }),
        });
        if (saveResponse.ok) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } catch { }
    } catch {
      setError("Unable to connect to the AI model. Please try again.");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setData(null);
    setDate("");
    setStartHour("6");
    setEndHour("18");
    setError(null);
  };

  /* Download CSV */
  const downloadCSV = () => {
    if (!data) return;
    const BOM = "\uFEFF";
    let csv = "Solar Prediction Report\r\n";
    csv += `Date,"${date}"\r\n`;
    csv += `Range,"${startHour}:00 - ${endHour}:00"\r\n`;
    csv += `Total Generation,"${data.total_kw} kWh"\r\n`;
    csv += `Total Savings,"Rs. ${data.total_savings.toLocaleString()}"\r\n\r\n`;
    csv += "Hour,Predicted kW,Temperature (°C),Savings (LKR)\r\n";
    data.breakdown.forEach((r) => {
      csv += `${r.hour},${r.predicted_kw},${r.predicted_temp},${r.saving_lkr}\r\n`;
    });
    csv += `\r\nTotal,${data.total_kw},,${data.total_savings}\r\n`;
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `solar-prediction-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* Print Report */
  const printReport = () => {
    if (!data) return;
    const rows = data.breakdown
      .map((r) => {
        const isPk = r.predicted_kw === peakHour?.predicted_kw;
        return `<tr style="${isPk ? "background:#fff7ed;font-weight:bold;" : ""}">
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">${r.hour}${isPk ? ' <span style="background:#f97316;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;">PEAK</span>' : ""}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;">${r.predicted_temp}°C</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#f97316;font-weight:bold;">${r.predicted_kw} kW</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;color:#16a34a;font-weight:bold;">Rs. ${r.saving_lkr.toLocaleString()}</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html><head><title>Solar Prediction - ${date}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;padding:40px;color:#1e293b;max-width:900px;margin:0 auto}
.hdr{display:flex;align-items:center;gap:16px;border-bottom:4px solid #f97316;padding-bottom:20px;margin-bottom:30px}
.logo{width:56px;height:56px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px}
h1{color:#172554;font-size:26px}
h2{color:#172554;margin:25px 0 15px;font-size:18px;border-left:4px solid #f97316;padding-left:12px}
.meta{color:#64748b;font-size:12px;margin-top:4px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:20px 0}
.stat{background:#f8fafc;padding:18px;border-radius:14px;border-left:4px solid #f97316}
.stat-v{font-size:26px;font-weight:800;color:#172554}
.stat-l{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:3px}
table{width:100%;border-collapse:collapse;margin:15px 0;border-radius:12px;overflow:hidden}
thead th{background:#172554;color:#fff;padding:12px 14px;text-align:left;font-size:11px;text-transform:uppercase}
tfoot td{background:#172554;color:#fff;padding:12px 14px;font-weight:bold}
.btn{background:#f97316;color:#fff;border:none;padding:12px 28px;border-radius:12px;font-weight:700;cursor:pointer;font-size:14px;margin-bottom:25px}
.foot{margin-top:40px;padding-top:20px;border-top:3px solid #e2e8f0;color:#64748b;font-size:11px;text-align:center}
@media print{.no-print{display:none!important}body{padding:20px}}
</style></head><body>
<div class="hdr"><div class="logo">☀</div><div><h1>Solar Prediction Report</h1><div class="meta">Date: ${date} • Range: ${startHour}:00 - ${endHour}:00 • Generated: ${new Date().toLocaleString()}</div></div></div>
<button class="no-print btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
<h2>Prediction Summary</h2>
<div class="stats">
  <div class="stat"><div class="stat-v">${data.total_kw} kWh</div><div class="stat-l">Total Generation</div></div>
  <div class="stat"><div class="stat-v">${peakHour?.predicted_kw} kW</div><div class="stat-l">Peak (${peakHour?.hour})</div></div>
  <div class="stat"><div class="stat-v">Rs. ${data.total_savings.toLocaleString()}</div><div class="stat-l">Est. Savings</div></div>
  <div class="stat"><div class="stat-v">${co2Saved} kg</div><div class="stat-l">CO₂ Reduced</div></div>
  <div class="stat"><div class="stat-v">${avgKw} kW</div><div class="stat-l">Avg Output</div></div>
  <div class="stat"><div class="stat-v">${data.breakdown.length}h</div><div class="stat-l">Active Hours</div></div>
</div>
<h2>Hourly Breakdown</h2>
<table><thead><tr><th>Hour</th><th style="text-align:center">Temp</th><th style="text-align:center">Generation</th><th style="text-align:right">Savings</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="2">Total</td><td style="text-align:center;color:#f97316;">${data.total_kw} kWh</td><td style="text-align:right;">Rs. ${data.total_savings.toLocaleString()}</td></tr></tfoot></table>
<div class="foot"><p><strong>Lakdhanvi Limited</strong> — Solar Intelligence Platform v2.0</p><p style="margin-top:4px;">AI-Powered Prediction • Report ID: RPT-${Date.now()}</p></div>
</body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-blue-950/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-orange-500/30">
          <p className="text-orange-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold">{payload[0].value} kW</p>
          <div className="mt-2 h-1 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400" />
        </div>
      );
    }
    return null;
  };

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* ── Header ── */}
        <header className="bg-gradient-to-r from-blue-950 to-blue-900 border-b-2 border-orange-500 sticky top-0 z-40 relative overflow-hidden">
          <ParticleField />
          <div className="relative px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden sm:block"><FloatingSun size={52} /></div>
                <div className="sm:hidden w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sun className="text-white" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">AI Solar Forecast</h1>
                    <span className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30 backdrop-blur-sm">
                      <Sparkles className="w-3 h-3" /> AI Powered
                    </span>
                  </div>
                  <p className="text-blue-300/80 text-sm mt-0.5">{fmtDate(currentTime)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Clock */}
                <div className="hidden md:flex items-center gap-2 bg-blue-800/40 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-700/50">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-mono text-lg tracking-wider">
                    {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>

                {/* AI Status */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-green-500/15 border-green-500/30 backdrop-blur-sm">
                  <div className="relative">
                    <Wifi className="w-4 h-4 text-green-400" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                  </div>
                  <span className="text-green-400 text-sm font-medium">AI Online</span>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 bg-blue-500/15 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-500/30 animate-in">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 text-sm font-medium">Saved!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {/* ── Hero Section ── */}
          <Card3D glowColor="blue">
            <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl lg:rounded-3xl p-6 lg:p-10 relative overflow-hidden border-2 border-blue-800">
              <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96">
                <div className="absolute inset-0 bg-orange-500 rounded-full opacity-10 blur-3xl translate-x-1/3 -translate-y-1/3" />
              </div>
              <div className="absolute bottom-0 left-0 w-32 h-32 lg:w-48 lg:h-48">
                <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 blur-2xl -translate-x-1/2 translate-y-1/2" />
              </div>
              {/* Dot pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }} />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-1 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full" />
                  <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">
                    Powered by Machine Learning
                  </span>
                </div>
                <h2 className="text-2xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                  Intelligent Power Generation Forecast
                </h2>
                <p className="text-blue-300/80 text-sm lg:text-base max-w-xl leading-relaxed">
                  Use our advanced AI model to accurately predict your solar panel energy generation
                  and calculate estimated cost savings based on real weather data.
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  {[
                    { icon: Sparkles, label: "AI Powered" },
                    { icon: Activity, label: "Real-time Weather" },
                    { icon: TrendingUp, label: "98.98% Accuracy" },
                    { icon: Target, label: "Hourly Breakdown" },
                  ].map((tag) => (
                    <div key={tag.label} className="flex items-center gap-2 bg-blue-800/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-700/30">
                      <tag.icon className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-white font-medium">{tag.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card3D>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-center gap-4 shadow-lg animate-in">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-red-800 font-bold">{error}</p>
                <p className="text-red-600 text-sm mt-0.5">Please check your connection and try again.</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-2xl font-light">×</button>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            {/* ── Input Panel ── */}
            <div className="xl:col-span-4">
              <Card3D glowColor="blue">
                <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 border-blue-100 shadow-lg sticky top-24">
                  <div className="flex items-center gap-3 mb-6 lg:mb-8">
                    <Icon3D icon={Info} gradient="#172554, #1e3a5f" size="w-12 h-12" iconSize={22} />
                    <div>
                      <h2 className="text-lg font-bold text-blue-950">Prediction Settings</h2>
                      <p className="text-sm text-blue-600">Configure your forecast</p>
                    </div>
                  </div>

                  <div className="space-y-5 lg:space-y-6">
                    {/* Date */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-blue-950 mb-3">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        min={today}
                        className="w-full p-4 rounded-xl lg:rounded-2xl border-2 border-blue-200 bg-blue-50/50 focus:border-orange-500 focus:bg-white outline-none transition-all text-blue-950 font-medium hover:border-blue-300"
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>

                    {/* Hours */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Start Hour", value: startHour, setter: setStartHour },
                        { label: "End Hour", value: endHour, setter: setEndHour },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="flex items-center gap-2 text-sm font-bold text-blue-950 mb-3">
                            <Clock className="w-4 h-4 text-orange-500" />
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="23"
                              value={field.value}
                              className="w-full p-4 rounded-xl lg:rounded-2xl border-2 border-blue-200 bg-blue-50/50 focus:border-orange-500 focus:bg-white outline-none transition-all text-blue-950 font-bold text-center text-xl hover:border-blue-300"
                              onChange={(e) => field.setter(e.target.value)}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 text-sm font-medium">:00</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Time Range */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-blue-600 font-medium">Prediction Range</p>
                      </div>
                      <p className="text-lg font-bold text-blue-950">
                        {startHour}:00 — {endHour}:00
                        <span className="text-sm font-medium text-blue-500 ml-2">
                          ({parseInt(endHour) - parseInt(startHour)} hours)
                        </span>
                      </p>
                      {/* Mini progress */}
                      <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-500"
                          style={{ width: `${((parseInt(endHour) - parseInt(startHour)) / 24) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Predict Button */}
                    <div className="pt-2">
                      <button
                        onClick={handlePredict}
                        disabled={loading || !date}
                        className={`w-full py-4 lg:py-5 rounded-xl lg:rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98] ${loading || !date
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300"
                          }`}
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Generate Forecast
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>

                    {data && (
                      <button
                        onClick={handleReset}
                        className="w-full py-3 rounded-xl border-2 border-blue-200 text-blue-600 font-medium hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reset & New Prediction
                      </button>
                    )}

                    {!date && (
                      <div className="flex items-center justify-center gap-2 text-blue-500 bg-blue-50 rounded-xl p-3">
                        <Info className="w-4 h-4" />
                        <p className="text-sm font-medium">Select a date to continue</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card3D>
            </div>

            {/* ── Output Panel ── */}
            <div className="xl:col-span-8 space-y-6">
              {data ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Generation */}
                    <Card3D glowColor="orange">
                      <div className="group bg-white p-5 rounded-2xl lg:rounded-3xl border-2 border-blue-100 hover:border-orange-300 transition-all shadow-lg h-full">
                        <div className="flex items-start justify-between mb-3">
                          <Icon3D icon={Zap} gradient="#f97316, #ea580c" size="w-11 h-11" iconSize={20} />
                          <div className="flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-green-700">AI</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-blue-600 mb-0.5">Total Generation</p>
                        <span className="text-2xl font-bold text-blue-950">
                          <AnimatedValue value={data.total_kw} suffix=" kWh" />
                        </span>
                      </div>
                    </Card3D>

                    {/* Peak */}
                    <Card3D glowColor="blue">
                      <div className="group bg-gradient-to-br from-blue-950 to-blue-900 p-5 rounded-2xl lg:rounded-3xl border-2 border-blue-800 hover:border-orange-500/50 transition-all shadow-lg h-full relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-16 h-16 bg-orange-500/10 rounded-full blur-xl" />
                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <Icon3D icon={TrendingUp} gradient="#f97316, #fb923c" size="w-11 h-11" iconSize={20} />
                            <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {peakHour?.hour}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-blue-300 mb-0.5">Peak Output</p>
                          <span className="text-2xl font-bold text-white">
                            <AnimatedValue value={peakHour?.predicted_kw || 0} suffix=" kW" />
                          </span>
                        </div>
                      </div>
                    </Card3D>

                    {/* Savings */}
                    <Card3D glowColor="green">
                      <div className="group bg-white p-5 rounded-2xl lg:rounded-3xl border-2 border-blue-100 hover:border-green-300 transition-all shadow-lg h-full">
                        <div className="flex items-start justify-between mb-3">
                          <Icon3D icon={DollarSign} gradient="#22c55e, #16a34a" size="w-11 h-11" iconSize={20} />
                          <div className="flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="text-[10px] font-bold text-green-700">Savings</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-blue-600 mb-0.5">Est. Savings</p>
                        <span className="text-xl font-bold text-blue-950">
                          <AnimatedValue value={data.total_savings} prefix="Rs. " />
                        </span>
                      </div>
                    </Card3D>

                    {/* CO₂ */}
                    <Card3D glowColor="green">
                      <div className="group bg-white p-5 rounded-2xl lg:rounded-3xl border-2 border-blue-100 hover:border-green-300 transition-all shadow-lg h-full">
                        <div className="flex items-start justify-between mb-3">
                          <Icon3D icon={Target} gradient="#3b82f6, #2563eb" size="w-11 h-11" iconSize={20} />
                          <div className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-700">ECO</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-blue-600 mb-0.5">CO₂ Reduced</p>
                        <span className="text-2xl font-bold text-blue-950">
                          <AnimatedValue value={parseFloat(co2Saved)} suffix=" kg" />
                        </span>
                      </div>
                    </Card3D>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDlMenu(!showDlMenu); }}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white px-5 py-3 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4" />
                        <span className="font-medium">Download Report</span>
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </button>
                      {showDlMenu && (
                        <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-blue-100 py-2 w-56 z-50">
                          <button onClick={() => { downloadCSV(); setShowDlMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-left">
                            <FileText className="w-5 h-5 text-orange-500" />
                            <div>
                              <p className="font-bold text-blue-950 text-sm">Download CSV</p>
                              <p className="text-xs text-slate-500">Spreadsheet format</p>
                            </div>
                          </button>
                          <div className="border-t border-blue-100 mx-3" />
                          <button onClick={() => { printReport(); setShowDlMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-left">
                            <Printer className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-bold text-blue-950 text-sm">Print / PDF</p>
                              <p className="text-xs text-slate-500">Formatted report</p>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                    <button className="flex items-center gap-2 bg-white border-2 border-blue-200 hover:border-orange-300 text-blue-950 px-5 py-3 rounded-xl transition-all hover:shadow-md active:scale-[0.98]">
                      <Share2 className="w-4 h-4" />
                      <span className="font-medium">Share</span>
                    </button>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Area Chart */}
                    <Card3D glowColor="orange">
                      <div className="bg-white p-5 lg:p-8 rounded-2xl lg:rounded-3xl border-2 border-blue-100 shadow-lg h-full">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-950 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
                            <Activity className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-950">Generation Trend</h3>
                            <p className="text-xs text-blue-600">Hourly power output</p>
                          </div>
                        </div>
                        <div className="h-[250px] lg:h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.breakdown}>
                              <defs>
                                <linearGradient id="colorKw" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                  <stop offset="50%" stopColor="#f97316" stopOpacity={0.1} />
                                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#172554", fontSize: 11 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#172554", fontSize: 11 }} tickFormatter={(v) => `${v} kW`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area type="monotone" dataKey="predicted_kw" stroke="#f97316" fillOpacity={1} fill="url(#colorKw)" strokeWidth={3}
                                dot={{ fill: "#f97316", strokeWidth: 2, r: 4, stroke: "#fff" }}
                                activeDot={{ r: 8, fill: "#ea580c", stroke: "#fff", strokeWidth: 3 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </Card3D>

                    {/* Bar Chart */}
                    <Card3D glowColor="blue">
                      <div className="bg-white p-5 lg:p-8 rounded-2xl lg:rounded-3xl border-2 border-blue-100 shadow-lg h-full">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-950 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
                            <BarChart3 className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-950">Hourly Breakdown</h3>
                            <p className="text-xs text-blue-600">kW per hour comparison</p>
                          </div>
                        </div>
                        <div className="h-[250px] lg:h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.breakdown} barCategoryGap="15%">
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#172554", fontSize: 11 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#172554", fontSize: 11 }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="predicted_kw" radius={[8, 8, 0, 0]}>
                                {data.breakdown.map((entry, index) => (
                                  <Cell
                                    key={index}
                                    fill={entry.predicted_kw === peakHour?.predicted_kw ? "#f97316" : "#172554"}
                                    opacity={entry.predicted_kw === peakHour?.predicted_kw ? 1 : 0.85}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </Card3D>
                  </div>

                  {/* Table */}
                  <Card3D glowColor="blue">
                    <div className="bg-white rounded-2xl lg:rounded-3xl border-2 border-blue-100 overflow-hidden shadow-lg">
                      <div className="p-5 lg:p-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-950 to-blue-900 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)",
                          backgroundSize: "24px 24px",
                        }} />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                              <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white">Detailed Breakdown</h3>
                              <p className="text-xs text-blue-300">Hour by hour analysis</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-300 bg-blue-800/50 px-3 py-1 rounded-full">
                              {data.breakdown.length} hours
                            </span>
                            <button onClick={downloadCSV} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                              <Download className="w-3.5 h-3.5" /> CSV
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-blue-50/80">
                              <th className="p-4 lg:p-5 text-left text-xs font-bold text-blue-950 uppercase tracking-wider">Time</th>
                              <th className="p-4 lg:p-5 text-center text-xs font-bold text-blue-950 uppercase tracking-wider">Temperature</th>
                              <th className="p-4 lg:p-5 text-center text-xs font-bold text-blue-950 uppercase tracking-wider">Generation</th>
                              <th className="p-4 lg:p-5 text-center text-xs font-bold text-blue-950 uppercase tracking-wider">% Peak</th>
                              <th className="p-4 lg:p-5 text-right text-xs font-bold text-blue-950 uppercase tracking-wider">Savings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.breakdown.map((row, i) => {
                              const isPk = row.predicted_kw === peakHour?.predicted_kw;
                              const pct = peakHour && peakHour.predicted_kw > 0
                                ? ((row.predicted_kw / peakHour.predicted_kw) * 100).toFixed(0)
                                : "0";
                              return (
                                <tr
                                  key={i}
                                  className={`border-b border-blue-50 hover:bg-orange-50/50 transition-colors ${isPk ? "bg-orange-50" : i % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                                    }`}
                                >
                                  <td className="p-4 lg:p-5">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isPk ? "bg-gradient-to-br from-orange-500 to-orange-600" : "bg-blue-100"
                                        }`}>
                                        <Clock className={`w-4 h-4 ${isPk ? "text-white" : "text-blue-600"}`} />
                                      </div>
                                      <span className="font-bold text-blue-950">{row.hour}</span>
                                      {isPk && (
                                        <span className="text-[10px] bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                                          ⚡ Peak
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4 lg:p-5 text-center">
                                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-950 to-blue-900 px-3 py-1.5 rounded-full shadow-sm">
                                      <Thermometer className="w-4 h-4 text-orange-500" />
                                      <span className="font-semibold text-white">{row.predicted_temp}°C</span>
                                    </span>
                                  </td>
                                  <td className="p-4 lg:p-5 text-center">
                                    <span className={`text-lg font-bold ${isPk ? "text-orange-500" : "text-blue-950"}`}>
                                      {row.predicted_kw} kW
                                    </span>
                                  </td>
                                  <td className="p-4 lg:p-5 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-16 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                      </div>
                                      <span className="text-xs font-bold text-blue-950 w-8">{pct}%</span>
                                    </div>
                                  </td>
                                  <td className="p-4 lg:p-5 text-right">
                                    <span className="font-bold text-green-600">Rs. {row.saving_lkr.toLocaleString()}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gradient-to-r from-blue-950 to-blue-900">
                              <td className="p-4 lg:p-5 text-white font-bold" colSpan={2}>
                                <div className="flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-orange-400" /> Total
                                </div>
                              </td>
                              <td className="p-4 lg:p-5 text-center">
                                <span className="text-lg font-bold text-orange-400">{data.total_kw} kWh</span>
                              </td>
                              <td className="p-4 lg:p-5 text-center text-blue-300">—</td>
                              <td className="p-4 lg:p-5 text-right">
                                <span className="text-lg font-bold text-white">Rs. {data.total_savings.toLocaleString()}</span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </Card3D>

                  {/* Download CTA */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl lg:rounded-3xl p-6 shadow-lg shadow-orange-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Export Prediction</h3>
                          <p className="text-orange-100 text-sm">Download or print your forecast report</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={downloadCSV} className="flex items-center gap-2 bg-white text-orange-600 px-5 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg active:scale-[0.98]">
                          <Download className="w-5 h-5" /> CSV
                        </button>
                        <button onClick={printReport} className="flex items-center gap-2 bg-white/20 text-white px-5 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors border border-white/30 active:scale-[0.98]">
                          <Printer className="w-5 h-5" /> PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <Card3D glowColor="orange">
                  <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl lg:rounded-3xl border-2 border-dashed border-blue-200 p-8 lg:p-12 shadow-lg relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-10 right-10 w-20 h-20 bg-orange-100 rounded-full blur-2xl" />
                    <div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-100 rounded-full blur-2xl" />

                    <div className="relative mb-8">
                      <FloatingSun size={120} />
                    </div>

                    <h3 className="text-xl lg:text-2xl font-bold text-blue-950 mb-3 text-center">
                      Ready to Predict
                    </h3>
                    <p className="text-blue-600 text-center max-w-md mb-6 leading-relaxed">
                      Select a date and time range from the settings panel, then click
                      &quot;Generate Forecast&quot; to get your AI-powered solar energy prediction.
                    </p>

                    <div className="flex items-center gap-2 text-orange-500 mb-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Waiting for input...</span>
                    </div>

                    {/* Steps */}
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-6 py-3 border border-blue-200">
                      {[
                        { num: "1", label: "Select Date" },
                        { num: "2", label: "Set Hours" },
                        { num: "3", label: "Generate" },
                      ].map((step, i) => (
                        <React.Fragment key={step.num}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              {step.num}
                            </div>
                            <span className="text-sm font-medium text-blue-950">{step.label}</span>
                          </div>
                          {i < 2 && <ChevronRight className="w-4 h-4 text-blue-300" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </Card3D>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 sm:p-6 lg:p-8">
          <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-5 lg:p-6 border-2 border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }} />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold">Lakdhanvi Limited</span>
                <span className="text-blue-400 text-sm ml-2">v2.0</span>
              </div>
            </div>
            <p className="relative text-sm text-blue-300">
              Powered by Machine Learning • Accurate Solar Energy Predictions
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}