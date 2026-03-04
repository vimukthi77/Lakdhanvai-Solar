"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sun, Zap, TrendingUp, TrendingDown, DollarSign, Activity,
  Calendar, Clock, ArrowRight, BarChart3, Fuel, Leaf,
  ThermometerSun, CloudSun, BatteryCharging, RefreshCw,
  Sparkles, Target, AlertCircle, Wifi, WifiOff, ServerOff,
  Eye, Layers, Shield, Radio, Gauge,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, TooltipProps,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import ChatBot from "@/components/ChatBot";
import UserManagementPage from "@/app/admin/users/page";

/* ═══ Types ═══ */
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
interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  uvIndex: number;
}
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

const energySourceData = [
  { name: "Solar", value: 75, color: "#f97316" },
  { name: "Grid", value: 15, color: "#172554" },
  { name: "Generator", value: 10, color: "#64748b" },
];

/* ═══ 3D Floating Sun Component ═══ */
function FloatingSun3D({ size = 120 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size, perspective: "400px" }}
    >
      {/* Outer glow rings */}
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: "20s" }}>
        <div
          className="absolute inset-2 rounded-full border-2 border-orange-400/20"
          style={{ transform: "rotateX(60deg)" }}
        />
      </div>
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }}>
        <div
          className="absolute inset-4 rounded-full border-2 border-yellow-400/15"
          style={{ transform: "rotateX(45deg) rotateY(20deg)" }}
        />
      </div>
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: "25s" }}>
        <div
          className="absolute inset-1 rounded-full border border-orange-300/10"
          style={{ transform: "rotateX(75deg) rotateZ(30deg)" }}
        />
      </div>

      {/* Main sun body */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full animate-pulse"
          style={{
            width: size * 0.5,
            height: size * 0.5,
            background: "radial-gradient(circle at 35% 35%, #fef3c7, #fbbf24, #f97316, #ea580c)",
            boxShadow: `
              0 0 ${size * 0.3}px rgba(251, 191, 36, 0.4),
              0 0 ${size * 0.6}px rgba(249, 115, 22, 0.2),
              inset 0 0 ${size * 0.1}px rgba(255, 255, 255, 0.3)
            `,
            animationDuration: "3s",
          }}
        />
      </div>

      {/* Light rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <div
          key={deg}
          className="absolute top-1/2 left-1/2 origin-left"
          style={{
            transform: `rotate(${deg}deg)`,
            width: size * 0.4,
            height: "2px",
            background: `linear-gradient(90deg, rgba(251,191,36,0.3), transparent)`,
            animation: `pulse 2s ease-in-out infinite`,
            animationDelay: `${deg * 5}ms`,
          }}
        />
      ))}
    </div>
  );
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
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTransform(`perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale3d(1.02, 1.02, 1.02)`);
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
      {/* Glow follow effect */}
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

/* ═══ 3D Icon Component ═══ */
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
      {/* Shadow underneath */}
      <div
        className={`absolute -bottom-1 left-1 ${size} rounded-xl lg:rounded-2xl opacity-30 blur-sm`}
        style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}
      />
      {/* Main icon body */}
      <div
        className={`relative ${size} rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg`}
        style={{
          background: `linear-gradient(135deg, ${gradient})`,
          transform: "translateZ(8px)",
          boxShadow: `0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`,
        }}
      >
        <Icon className="text-white" size={iconSize} />
        {/* Shine effect */}
        <div
          className="absolute inset-0 rounded-xl lg:rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
          }}
        />
      </div>
    </div>
  );
}

/* ═══ Animated Counter ═══ */
function AnimatedValue({ value, suffix = "", prefix = "" }: { value: number | string; suffix?: string; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const numVal = typeof value === "string" ? parseFloat(value) || 0 : value;

  useEffect(() => {
    let start = 0;
    const end = numVal;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = start + (end - start) * eased;
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [numVal]);

  return (
    <span>
      {prefix}
      {Number.isInteger(numVal) ? Math.round(display).toLocaleString() : display.toFixed(1)}
      {suffix && <span className="text-sm font-medium opacity-60 ml-1">{suffix}</span>}
    </span>
  );
}

/* ═══ Particle Background ═══ */
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-orange-400/10"
          style={{
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-25px) translateX(8px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

/* ═══ DASHBOARD CONTENT ═══ */
function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "loading">("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0, condition: "Loading...", humidity: 0, uvIndex: 0,
  });

  const AI_API_URL = "https://solar-ai-model.onrender.com/predict_range";

  const fetchWeatherData = useCallback(async () => {
    try {
      const r = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=6.9271&longitude=79.8612&current=temperature_2m,relative_humidity_2m,weather_code,uv_index&timezone=auto"
      );
      if (r.ok) {
        const d = await r.json();
        const c = d.current.weather_code;
        let condition = "Clear";
        if (c <= 3) condition = "Sunny";
        else if (c <= 48) condition = "Foggy";
        else if (c <= 67) condition = "Rainy";
        else if (c <= 77) condition = "Snowy";
        else condition = "Stormy";
        setWeather({
          temperature: Math.round(d.current.temperature_2m),
          condition,
          humidity: Math.round(d.current.relative_humidity_2m),
          uvIndex: Math.round(d.current.uv_index),
        });
      }
    } catch { }
  }, []);

  const fetchAIPrediction = useCallback(async () => {
    setError(null);
    setApiStatus("loading");
    try {
      const dateStr = new Date().toISOString().split("T")[0];
      const r = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, start_hour: 6, end_hour: 18 }),
      });
      if (!r.ok) throw new Error(`${r.status}`);
      const data: PredictionResponse = await r.json();
      setPredictionData(data);
      setApiStatus("online");
      setLastUpdated(new Date());
    } catch {
      setApiStatus("offline");
      setError("Failed to connect to AI model. Please check if the server is running.");
      setPredictionData(null);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchAIPrediction(), fetchWeatherData()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await Promise.all([fetchAIPrediction(), fetchWeatherData()]);
      setIsLoading(false);
    })();
  }, [fetchAIPrediction, fetchWeatherData]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
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

  const stats = predictionData
    ? {
      totalEnergy: predictionData.total_kw,
      totalSavings: predictionData.total_savings,
      co2Saved: parseFloat((predictionData.total_kw * 0.5).toFixed(1)),
      efficiency: 94.5,
    }
    : null;

  const peakHour = predictionData?.breakdown.reduce(
    (max, item) => (item.predicted_kw > max.predicted_kw ? item : max),
    { hour: "-", predicted_kw: 0, predicted_temp: 0, saving_lkr: 0 }
  );

  return (
    <main className="flex-1 overflow-auto">
      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-blue-950 to-blue-900 border-b-2 border-orange-500 sticky top-0 z-40 relative overflow-hidden">
        <ParticleField />
        <div className="relative px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* 3D Sun Logo */}
              <div className="hidden sm:block">
                <FloatingSun3D size={56} />
              </div>
              <div className="sm:hidden w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sun className="text-white" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    Solar Intelligence
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30 backdrop-blur-sm">
                    <Sparkles className="w-3 h-3" />
                    AI Powered
                  </span>
                </div>
                <p className="text-blue-300/80 text-sm mt-0.5">{formatDate(currentTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="hidden md:flex items-center gap-2 bg-blue-800/40 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-700/50">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-white font-mono text-lg tracking-wider">{formatTime(currentTime)}</span>
              </div>

              <div
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-sm ${apiStatus === "online"
                    ? "bg-green-500/15 border-green-500/30"
                    : apiStatus === "offline"
                      ? "bg-red-500/15 border-red-500/30"
                      : "bg-yellow-500/15 border-yellow-500/30"
                  }`}
              >
                {apiStatus === "online" ? (
                  <>
                    <div className="relative">
                      <Wifi className="w-4 h-4 text-green-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    </div>
                    <span className="text-green-400 text-sm font-medium">AI Online</span>
                  </>
                ) : apiStatus === "offline" ? (
                  <>
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">AI Offline</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-yellow-400 text-sm font-medium">Connecting...</span>
                  </>
                )}
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25 active:scale-95"
              >
                <RefreshCw className={`w-5 h-5 text-white ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <FloatingSun3D size={100} />
            </div>
            <h3 className="text-2xl font-bold text-blue-950 mb-2">Connecting to AI Model</h3>
            <p className="text-blue-600">Fetching solar predictions...</p>
            <div className="mt-6 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && !predictionData && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-28 h-28 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100">
              <ServerOff className="w-14 h-14 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-blue-950 mb-3">AI Model Unavailable</h3>
            <p className="text-blue-600 text-center max-w-md mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/25 active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
              Try Again
            </button>
            <code className="text-xs bg-slate-100 px-4 py-2 rounded-lg mt-4 text-blue-600 border border-blue-100">{AI_API_URL}</code>
          </div>
        )}

        {/* ── Main Content ── */}
        {!isLoading && predictionData && stats && (
          <>
            {/* Weather Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card3D glowColor="orange">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <ThermometerSun className="w-5 h-5" />
                      <span className="text-sm font-medium opacity-90">Temperature</span>
                    </div>
                    <p className="text-3xl font-bold">
                      <AnimatedValue value={weather.temperature} suffix="°C" />
                    </p>
                  </div>
                </div>
              </Card3D>

              <Card3D glowColor="blue">
                <div className="bg-white rounded-2xl p-4 border-2 border-blue-100 h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudSun className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Weather</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-950">{weather.condition}</p>
                </div>
              </Card3D>

              <Card3D glowColor="orange">
                <div className="bg-white rounded-2xl p-4 border-2 border-blue-100 h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-blue-600">UV Index</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-950">{weather.uvIndex}</p>
                  <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-1000"
                      style={{ width: `${Math.min(100, (weather.uvIndex / 11) * 100)}%` }}
                    />
                  </div>
                </div>
              </Card3D>

              <Card3D glowColor="blue">
                <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl p-4 text-white relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full translate-y-1/3 translate-x-1/3" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-orange-400" />
                      <span className="text-sm font-medium text-blue-300">Peak Hour</span>
                    </div>
                    <p className="text-2xl font-bold">{peakHour?.hour}</p>
                    <p className="text-xs text-blue-400 mt-1">{peakHour?.predicted_kw} kW</p>
                  </div>
                </div>
              </Card3D>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Total Energy */}
              <Card3D glowColor="orange">
                <div className="group bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 hover:border-orange-300 transition-all duration-300 shadow-lg hover:shadow-xl h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Icon3D icon={Zap} gradient="#f97316, #ea580c" />
                    <div className="flex items-center gap-1 bg-green-100 px-2.5 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-green-700">Live</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Today&apos;s Prediction</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-bold text-blue-950">
                      <AnimatedValue value={stats.totalEnergy} suffix="kWh" />
                    </span>
                  </div>
                  {/* Mini sparkline */}
                  <div className="mt-3 flex items-end gap-[2px] h-8">
                    {predictionData.breakdown.slice(0, 12).map((b, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-sm transition-all duration-500"
                        style={{
                          height: `${(b.predicted_kw / (peakHour?.predicted_kw || 1)) * 100}%`,
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Card3D>

              {/* Total Savings */}
              <Card3D glowColor="blue">
                <div className="group bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-800 hover:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-xl h-full relative overflow-hidden">
                  {/* Decorative orb */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-orange-500/10 rounded-full blur-xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <Icon3D icon={DollarSign} gradient="#f97316, #fb923c" />
                      <div className="flex items-center gap-1 bg-orange-500/20 px-2.5 py-1 rounded-full border border-orange-500/30">
                        <TrendingUp className="w-3 h-3 text-orange-400" />
                        <span className="text-xs font-bold text-orange-400">Savings</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-blue-300 mb-1">Estimated Savings</p>
                    <span className="text-2xl lg:text-3xl font-bold text-white">
                      <AnimatedValue value={stats.totalSavings} prefix="Rs. " />
                    </span>
                  </div>
                </div>
              </Card3D>

              {/* CO2 Saved */}
              <Card3D glowColor="green">
                <div className="group bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 hover:border-green-300 transition-all duration-300 shadow-lg hover:shadow-xl h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Icon3D icon={Leaf} gradient="#22c55e, #16a34a" />
                    <div className="flex items-center gap-1 bg-green-100 px-2.5 py-1 rounded-full">
                      <Sparkles className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-bold text-green-700">ECO</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-blue-600 mb-1">CO₂ Reduced</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-bold text-blue-950">
                      <AnimatedValue value={stats.co2Saved} suffix="kg" />
                    </span>
                  </div>
                  {/* Eco indicator */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-green-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-3/4 animate-pulse" style={{ animationDuration: "3s" }} />
                    </div>
                    <span className="text-xs font-bold text-green-600">🌱</span>
                  </div>
                </div>
              </Card3D>

              {/* Efficiency */}
              <Card3D glowColor="blue">
                <div className="group bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Icon3D icon={Target} gradient="#3b82f6, #2563eb" />
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">A+</span>
                  </div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Efficiency</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-bold text-blue-950">
                      <AnimatedValue value={stats.efficiency} suffix="%" />
                    </span>
                  </div>
                  {/* Circular progress */}
                  <div className="mt-3 flex justify-center">
                    <div className="relative w-10 h-10">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${stats.efficiency * 2.51} 251`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card3D>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Area Chart */}
              <Card3D className="xl:col-span-2" glowColor="orange">
                <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border-2 border-blue-100 shadow-lg h-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Icon3D icon={Sun} gradient="#f97316, #ea580c" size="w-12 h-12" iconSize={22} />
                      <div>
                        <h3 className="text-lg lg:text-xl font-bold text-blue-950">AI Forecasted Generation</h3>
                        <p className="text-xs lg:text-sm text-blue-600">Real-time prediction from AI model</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastUpdated && (
                        <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                          Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                      )}
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 hover:bg-orange-50 rounded-xl transition-colors border border-transparent hover:border-orange-200"
                      >
                        <RefreshCw className={`w-5 h-5 text-orange-600 ${isRefreshing ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div className="h-[300px] lg:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={predictionData.breakdown}>
                        <defs>
                          <linearGradient id="kwGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                            <stop offset="50%" stopColor="#f97316" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#172554", fontSize: 12, fontWeight: 500 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#172554", fontSize: 12 }} tickFormatter={(v) => `${v} kW`} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area type="monotone" dataKey="predicted_kw" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#kwGrad)"
                          dot={{ fill: "#f97316", strokeWidth: 2, r: 4, stroke: "#fff" }}
                          activeDot={{ r: 8, fill: "#ea580c", stroke: "#fff", strokeWidth: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card3D>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Energy Source */}
                <Card3D glowColor="blue">
                  <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-950 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
                        <Activity className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-950">Energy Source</h3>
                        <p className="text-xs text-blue-600">Distribution</p>
                      </div>
                    </div>
                    <div className="h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={energySourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" strokeWidth={0}>
                            {energySourceData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      {energySourceData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium text-blue-950">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                            </div>
                            <span className="text-sm font-bold text-blue-950 w-8 text-right">{item.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card3D>

                {/* System Status */}
                <Card3D glowColor="green">
                  <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-blue-950">System Status</h3>
                    </div>
                    <div className="space-y-2">
                      <StatusItem label="Solar Panels" status="Optimal" active={true} icon={<Sun size={14} />} />
                      <StatusItem label="Inverter" status="Running" active={true} icon={<Gauge size={14} />} />
                      <StatusItem label="AI Model" status="Connected" active={apiStatus === "online"} icon={<Radio size={14} />} />
                      <StatusItem label="Battery" status="95%" active={true} icon={<BatteryCharging size={14} />} />
                      <StatusItem label="Generator" status="Standby" active={false} icon={<Layers size={14} />} />
                    </div>
                  </div>
                </Card3D>
              </div>
            </div>

            {/* Bar Chart & Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Bar Chart */}
              <Card3D className="xl:col-span-2" glowColor="blue">
                <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border-2 border-blue-100 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-950 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
                      <BarChart3 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-950">Hourly Generation</h3>
                      <p className="text-xs text-blue-600">Power output per hour</p>
                    </div>
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={predictionData.breakdown} barCategoryGap="15%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#172554", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#172554", fontSize: 11 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Bar dataKey="predicted_kw" radius={[8, 8, 0, 0]}>
                          {predictionData.breakdown.map((entry, index) => (
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

              {/* Quick Actions */}
              <Card3D glowColor="blue">
                <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-800 shadow-lg h-full relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                  <div className="relative">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-400" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      {[
                        { href: "/predict", icon: Sun, label: "New Prediction", bg: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/25" },
                        { href: "/fuel", icon: Fuel, label: "Fuel Management", bg: "bg-blue-800/80 hover:bg-blue-700 border border-blue-700" },
                        { href: "/history", icon: Calendar, label: "View History", bg: "bg-blue-800/80 hover:bg-blue-700 border border-blue-700" },
                      ].map((action) => (
                        <Link
                          key={action.href}
                          href={action.href}
                          className={`flex items-center justify-between p-4 ${action.bg} rounded-xl transition-all group shadow-lg active:scale-[0.98]`}
                        >
                          <div className="flex items-center gap-3">
                            <action.icon className="w-5 h-5 text-white" />
                            <span className="font-semibold text-white">{action.label}</span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 group-hover:text-white transition-all" />
                        </Link>
                      ))}
                    </div>

                    {/* AI Analysis */}
                    <div className="mt-6 p-4 bg-blue-800/40 rounded-xl border border-blue-700/50 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-14 h-14">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#1e3a5f" strokeWidth="6" />
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="6" strokeLinecap="round"
                              strokeDasharray={`${stats.efficiency * 2.51} 251`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{stats.efficiency}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">AI Confidence</p>
                          <p className="text-blue-300 text-xs">Based on weather data</p>
                        </div>
                      </div>
                      <p className="text-blue-200 text-sm leading-relaxed">
                        Peak generation expected at{" "}
                        <span className="text-orange-400 font-bold">{peakHour?.hour}</span> with{" "}
                        <span className="text-orange-400 font-bold">{peakHour?.predicted_kw} kW</span> output.
                      </p>
                    </div>
                  </div>
                </div>
              </Card3D>
            </div>

            {/* Detailed Table */}
            <Card3D glowColor="blue">
              <div className="bg-white rounded-2xl lg:rounded-3xl border-2 border-blue-100 overflow-hidden shadow-lg">
                <div className="p-5 lg:p-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-950 to-blue-900 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
                      backgroundSize: "24px 24px",
                    }} />
                  </div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Hourly Breakdown</h3>
                        <p className="text-xs text-blue-300">Detailed AI predictions</p>
                      </div>
                    </div>
                    <span className="text-sm text-blue-300 bg-blue-800/50 px-3 py-1 rounded-full">
                      {predictionData.breakdown.length} hours
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-50/80">
                        <th className="p-4 text-left text-xs font-bold text-blue-950 uppercase tracking-wider">Time</th>
                        <th className="p-4 text-center text-xs font-bold text-blue-950 uppercase tracking-wider">Temperature</th>
                        <th className="p-4 text-center text-xs font-bold text-blue-950 uppercase tracking-wider">Generation</th>
                        <th className="p-4 text-right text-xs font-bold text-blue-950 uppercase tracking-wider">Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictionData.breakdown.map((row, i) => {
                        const isPeak = row.predicted_kw === peakHour?.predicted_kw;
                        return (
                          <tr
                            key={i}
                            className={`border-b border-blue-50 hover:bg-orange-50/50 transition-colors ${isPeak ? "bg-orange-50" : i % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                              }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isPeak ? "bg-gradient-to-br from-orange-500 to-orange-600" : "bg-blue-100"
                                  }`}>
                                  <Clock className={`w-4 h-4 ${isPeak ? "text-white" : "text-blue-600"}`} />
                                </div>
                                <span className="font-bold text-blue-950">{row.hour}</span>
                                {isPeak && (
                                  <span className="text-[10px] bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                                    ⚡ Peak
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-950 to-blue-900 px-3 py-1.5 rounded-full shadow-sm">
                                <ThermometerSun className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold text-white">{row.predicted_temp}°C</span>
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-lg font-bold ${isPeak ? "text-orange-500" : "text-blue-950"}`}>
                                {row.predicted_kw} kW
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className="font-bold text-green-600">Rs. {row.saving_lkr.toLocaleString()}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-r from-blue-950 to-blue-900">
                        <td className="p-4 text-white font-bold" colSpan={2}>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-400" />
                            Total
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-orange-400">{predictionData.total_kw} kWh</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-lg font-bold text-white">Rs. {predictionData.total_savings.toLocaleString()}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </Card3D>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="p-4 sm:p-6 lg:p-8">
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-5 lg:p-6 border-2 border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }} />
          </div>
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold">Lakdhanvi Limited</span>
              <span className="text-blue-400 text-sm ml-2">v2.0</span>
            </div>
          </div>
          <div className="relative flex items-center gap-4">
            {lastUpdated && (
              <p className="text-xs text-blue-400">Last updated: {lastUpdated.toLocaleString()}</p>
            )}
            <p className="text-sm text-blue-300">Powered by AI • Real-time Solar Prediction</p>
          </div>
        </div>
      </footer>

      <ChatBot dashboardData={stats} />
    </main>
  );
}

/* ═══ Status Item ═══ */
interface StatusItemProps {
  label: string;
  status: string;
  active: boolean;
  icon?: React.ReactNode;
}

function StatusItem({ label, status, active, icon }: StatusItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl hover:bg-slate-100 transition-all group cursor-default">
      <div className="flex items-center gap-3">
        <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-400"
          }`}>
          {icon}
          {active && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
        <span className="text-sm font-medium text-blue-950">{label}</span>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${active ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-200 text-slate-600 border border-slate-300"
        }`}>
        {status}
      </span>
    </div>
  );
}

/* ═══ Page Wrapper ═══ */
function DashboardPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { setIsLoading(false); }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
        <FloatingSun3D size={80} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar />
      {tab === "users" ? (
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <UserManagementPage />
          </div>
        </div>
      ) : (
        <DashboardContent />
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
          <FloatingSun3D size={80} />
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  );
}