"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Sun, Sunset, Sunrise, Clock, MapPin, Info, ChevronDown,
  Calendar, RefreshCw, Zap, TrendingUp, Navigation, Compass,
  ArrowUp, Target, Maximize2, RotateCcw, CheckCircle2, AlertCircle,
  Sparkles, Eye, Wind, Droplets,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SunCalc from "suncalc";

/* ═══ Types ═══ */
interface Location {
  name: string;
  lat: number;
  lng: number;
  region: string;
}
interface WeeklyData {
  date: string;
  fullDate: string;
  dayLength: number;
  sunrise: number;
  sunset: number;
}
interface SunPos {
  azimuth: number;
  altitude: number;
  azimuthCompass: number;
  optimalTilt: number;
  optimalAzimuth: number;
  direction: string;
  isDay: boolean;
}

/* ═══ Constants ═══ */
const LOCATIONS: Location[] = [
  { name: "Colombo", lat: 6.9271, lng: 79.8612, region: "Western Province" },
  { name: "Kandy", lat: 7.2906, lng: 80.6337, region: "Central Province" },
  { name: "Galle", lat: 6.0535, lng: 80.221, region: "Southern Province" },
  { name: "Jaffna", lat: 9.6615, lng: 80.0255, region: "Northern Province" },
  { name: "Trincomalee", lat: 8.5874, lng: 81.2152, region: "Eastern Province" },
  { name: "Batticaloa", lat: 7.731, lng: 81.6747, region: "Eastern Province" },
  { name: "Anuradhapura", lat: 8.3114, lng: 80.4037, region: "North Central" },
  { name: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, region: "Central Province" },
  { name: "Matara", lat: 5.9549, lng: 80.555, region: "Southern Province" },
  { name: "Negombo", lat: 7.2008, lng: 79.8358, region: "Western Province" },
  { name: "Ratnapura", lat: 6.6828, lng: 80.3992, region: "Sabaragamuwa" },
  { name: "Badulla", lat: 6.9934, lng: 81.055, region: "Uva Province" },
];

const toDeg = (r: number) => r * (180 / Math.PI);

const cardinal16 = (az: number) => {
  const d = [
    "North", "NNE", "Northeast", "ENE", "East", "ESE", "Southeast", "SSE",
    "South", "SSW", "Southwest", "WSW", "West", "WNW", "Northwest", "NNW",
  ];
  return d[Math.round(az / 22.5) % 16];
};

const cardinal8 = (az: number) => {
  if (az >= 337.5 || az < 22.5) return "N";
  if (az < 67.5) return "NE";
  if (az < 112.5) return "E";
  if (az < 157.5) return "SE";
  if (az < 202.5) return "S";
  if (az < 247.5) return "SW";
  if (az < 292.5) return "W";
  return "NW";
};

/* ═══ 3‑D Solar Panel Component ═══ */
function SolarPanel3D({
  tilt,
  azimuth,
  sunAlt,
  sunAz,
  isDay,
}: {
  tilt: number;
  azimuth: number;
  sunAlt: number;
  sunAz: number;
  isDay: boolean;
}) {
  const eff = isDay ? Math.min(100, Math.max(0, (sunAlt / 60) * 100)) : 0;
  const glowColor =
    eff > 70 ? "#22c55e" : eff > 40 ? "#f59e0b" : eff > 0 ? "#f97316" : "#475569";

  // Panel rotation based on azimuth & tilt
  const panelRotateY = ((azimuth - 180) / 180) * 25; // max ±25° Y rotation
  const panelRotateX = -tilt * 0.6; // tilt maps to X rotation

  return (
    <div className="relative w-full max-w-[320px] mx-auto" style={{ perspective: "800px" }}>
      {/* Sun glow behind panel */}
      {isDay && (
        <div
          className="absolute w-32 h-32 rounded-full blur-3xl opacity-40 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, #fbbf24, transparent)`,
            top: `${30 - sunAlt * 0.4}%`,
            left: `${40 + ((sunAz - 180) / 180) * 30}%`,
            transform: "translate(-50%,-50%)",
          }}
        />
      )}

      {/* 3D Panel Assembly */}
      <div
        className="relative mx-auto transition-transform duration-700 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${panelRotateX}deg) rotateY(${panelRotateY}deg)`,
          width: "260px",
          height: "220px",
        }}
      >
        {/* Support pole */}
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2"
          style={{
            width: "8px",
            height: "80px",
            background: "linear-gradient(180deg, #64748b, #334155)",
            borderRadius: "4px",
            transformOrigin: "bottom center",
            transform: "translateZ(-4px)",
            boxShadow: "2px 4px 8px rgba(0,0,0,0.3)",
          }}
        />

        {/* Base plate */}
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2"
          style={{
            width: "60px",
            height: "12px",
            background: "linear-gradient(180deg, #475569, #334155)",
            borderRadius: "6px",
            transform: "translateZ(-4px) rotateX(60deg)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        />

        {/* Panel frame */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-700"
          style={{
            width: "220px",
            height: "140px",
            top: "10px",
            transformOrigin: "center bottom",
            transform: `rotateX(${tilt * 0.3}deg)`,
          }}
        >
          {/* Panel outer frame */}
          <div
            className="relative w-full h-full rounded-lg overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              border: `2px solid ${glowColor}40`,
              boxShadow: `
                0 8px 32px rgba(0,0,0,0.4),
                0 0 20px ${glowColor}20,
                inset 0 1px 0 rgba(255,255,255,0.05)
              `,
            }}
          >
            {/* Solar cells grid */}
            <div className="absolute inset-2 grid grid-cols-6 grid-rows-4 gap-[2px]">
              {Array.from({ length: 24 }).map((_, i) => {
                const cellDelay = i * 30;
                const cellEff = isDay
                  ? Math.min(100, eff + Math.sin(i * 0.5) * 10)
                  : 0;
                return (
                  <div
                    key={i}
                    className="rounded-[2px] transition-all duration-500"
                    style={{
                      background: isDay
                        ? `linear-gradient(135deg, 
                            hsl(${210 + cellEff * 0.3}, ${60 + cellEff * 0.3}%, ${15 + cellEff * 0.2}%), 
                            hsl(${220 + cellEff * 0.2}, ${50 + cellEff * 0.4}%, ${10 + cellEff * 0.15}%))`
                        : "linear-gradient(135deg, #1e293b, #0f172a)",
                      boxShadow: isDay
                        ? `inset 0 0 ${cellEff / 10}px ${glowColor}30`
                        : "none",
                      transitionDelay: `${cellDelay}ms`,
                      opacity: 0.6 + cellEff * 0.004,
                    }}
                  >
                    {/* Cell shine line */}
                    <div
                      className="w-full h-[1px] mt-[40%]"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${isDay ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)"}, transparent)`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Glass reflection */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isDay
                  ? `linear-gradient(${135 + panelRotateY}deg, 
                      rgba(255,255,255,0.06) 0%, 
                      transparent 40%, 
                      transparent 60%, 
                      rgba(255,255,255,0.03) 100%)`
                  : "none",
              }}
            />

            {/* Efficiency indicator LED */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full transition-colors duration-500"
                style={{
                  background: glowColor,
                  boxShadow: isDay ? `0 0 6px ${glowColor}` : "none",
                }}
              />
              <span className="text-[8px] font-mono text-slate-500">
                {Math.round(eff)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel info underneath */}
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-50 rounded-xl p-2 border border-blue-100">
          <p className="text-[10px] text-blue-600 font-medium">TILT</p>
          <p className="text-lg font-bold text-blue-950">{tilt.toFixed(0)}°</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-2 border border-blue-100">
          <p className="text-[10px] text-blue-600 font-medium">FACING</p>
          <p className="text-lg font-bold text-blue-950">
            {cardinal8(azimuth)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-2 border border-blue-100">
          <p className="text-[10px] text-blue-600 font-medium">OUTPUT</p>
          <p
            className="text-lg font-bold"
            style={{ color: glowColor }}
          >
            {Math.round(eff)}%
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function SolarInsights() {
  const [loading, setLoading] = useState(true);
  const [loc, setLoc] = useState<Location>(LOCATIONS[0]);
  const [ddOpen, setDdOpen] = useState(false);
  const [weekly, setWeekly] = useState<WeeklyData[]>([]);
  const [now, setNow] = useState(new Date());
  const [search, setSearch] = useState("");
  const ddRef = useRef<HTMLDivElement>(null);

  /* ── Sun position (SunCalc) ── */
  const sunPos = useMemo((): SunPos => {
    const p = SunCalc.getPosition(now, loc.lat, loc.lng);
    let az = toDeg(p.azimuth) + 180;
    if (az >= 360) az -= 360;
    if (az < 0) az += 360;
    const alt = toDeg(p.altitude);
    const mo = now.getMonth();
    let adj = 0;
    if (mo >= 2 && mo <= 4) adj = -5;
    else if (mo >= 5 && mo <= 7) adj = -10;
    else if (mo >= 8 && mo <= 10) adj = 5;
    else adj = 10;
    const tilt = Math.max(5, Math.min(45, loc.lat + adj));
    const optAz = alt > 0 ? az : 180;
    return {
      azimuth: p.azimuth,
      altitude: alt,
      azimuthCompass: az,
      optimalTilt: tilt,
      optimalAzimuth: optAz,
      direction: cardinal16(az),
      isDay: alt > 0,
    };
  }, [now, loc]);

  const sunTimes = useMemo(
    () => SunCalc.getTimes(now, loc.lat, loc.lng),
    [now, loc]
  );

  /* ── Clock ── */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── Click outside dropdown ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Fetch weekly ── */
  const fetchWeekly = (l: Location) => {
    const d: WeeklyData[] = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date();
      dt.setDate(dt.getDate() + i);
      const t = SunCalc.getTimes(dt, l.lat, l.lng);
      d.push({
        date: dt.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayLength: (t.sunset.getTime() - t.sunrise.getTime()) / 3600000,
        sunrise: t.sunrise.getHours() + t.sunrise.getMinutes() / 60,
        sunset: t.sunset.getHours() + t.sunset.getMinutes() / 60,
      });
    }
    setWeekly(d);
  };

  useEffect(() => {
    setLoading(true);
    fetchWeekly(loc);
    setTimeout(() => setLoading(false), 600);
  }, [loc]);

  /* ── Helpers ── */
  const dayProgress = (() => {
    const n = now.getTime();
    const sr = sunTimes.sunrise.getTime();
    const ss = sunTimes.sunset.getTime();
    if (n < sr) return 0;
    if (n > ss) return 100;
    return ((n - sr) / (ss - sr)) * 100;
  })();

  const timeStatus = (() => {
    if (dayProgress === 0) return { label: "Before Sunrise", color: "text-blue-600", icon: <Sunrise size={16} /> };
    if (dayProgress === 100) return { label: "After Sunset", color: "text-indigo-600", icon: <Sunset size={16} /> };
    if (dayProgress < 30) return { label: "Morning", color: "text-orange-500", icon: <Sunrise size={16} /> };
    if (dayProgress < 70) return { label: "Peak Hours", color: "text-yellow-500", icon: <Sun size={16} /> };
    return { label: "Evening", color: "text-orange-500", icon: <Sunset size={16} /> };
  })();

  const efficiency = sunPos.altitude <= 0
    ? 0
    : Math.min(100, Math.max(0, (sunPos.altitude / 60) * 100));

  const tracking = (() => {
    if (sunPos.altitude <= 0) return { text: "Sun below horizon — Panels in standby", type: "none" as const };
    if (sunPos.altitude < 15) return { text: "Low sun angle — Minimal production", type: "low" as const };
    if (sunPos.altitude < 30) return { text: "Moderate angle — Single-axis tracking helpful", type: "moderate" as const };
    return { text: "Optimal angle — Maximum production possible", type: "good" as const };
  })();

  const filtered = LOCATIONS.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.region.toLowerCase().includes(search.toLowerCase())
  );

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const daylightStr = (() => {
    const diff = sunTimes.sunset.getTime() - sunTimes.sunrise.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  })();

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-950 rounded-full flex items-center justify-center mb-6 mx-auto">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 mb-2">Loading Solar Data</h3>
            <p className="text-blue-600">Calculating for {loc.name}…</p>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ RENDER ═══ */
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* ── Header ── */}
        <header className="bg-gradient-to-r from-blue-950 to-blue-900 border-b-2 border-orange-500 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Solar Intelligence</h1>
                    <span className="hidden sm:inline-flex items-center gap-1 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
                      <Sparkles className="w-3 h-3" /> SunCalc
                    </span>
                  </div>
                  <p className="text-blue-300 text-sm mt-0.5">{fmtDate(now)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Location Selector */}
                <div className="relative" ref={ddRef}>
                  <button
                    onClick={() => setDdOpen(!ddOpen)}
                    className="bg-blue-800/50 hover:bg-blue-700/50 border border-blue-700 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all min-w-[200px]"
                  >
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <MapPin size={16} className="text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-white text-sm">{loc.name}</p>
                      <p className="text-xs text-blue-300">{loc.region}</p>
                    </div>
                    <ChevronDown size={18} className={`text-blue-300 transition-transform ${ddOpen ? "rotate-180" : ""}`} />
                  </button>

                  {ddOpen && (
                    <div className="absolute top-full mt-2 w-72 bg-white border-2 border-blue-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-blue-100">
                        <input
                          type="text"
                          placeholder="Search locations…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {filtered.map((l) => (
                          <button
                            key={l.name}
                            onClick={() => { setLoc(l); setDdOpen(false); setSearch(""); }}
                            className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-3 border-b border-blue-50 last:border-0 ${loc.name === l.name ? "bg-orange-50" : ""
                              }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${loc.name === l.name ? "bg-orange-500 text-white" : "bg-blue-100 text-blue-600"
                              }`}>
                              <Navigation size={14} />
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${loc.name === l.name ? "text-orange-500" : "text-blue-950"}`}>
                                {l.name}
                              </p>
                              <p className="text-xs text-slate-500">{l.region}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Clock */}
                <div className="hidden md:flex items-center gap-2 bg-blue-800/50 px-4 py-2 rounded-xl border border-blue-700">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-mono text-lg">
                    {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>

                {/* Status */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${sunPos.isDay
                  ? "bg-green-500/20 border-green-500/30"
                  : "bg-blue-800/50 border-blue-700"
                  }`}>
                  {timeStatus.icon}
                  <span className={`text-sm font-medium ${sunPos.isDay ? "text-green-400" : "text-blue-300"}`}>
                    {timeStatus.label}
                  </span>
                </div>

                {/* Refresh */}
                <button
                  onClick={() => fetchWeekly(loc)}
                  className="p-2 bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {/* ── Quick Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sunrise className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Sunrise</span>
              </div>
              <p className="text-2xl font-bold">{fmtTime(sunTimes.sunrise)}</p>
              <p className="text-xs text-orange-100 mt-1">Dawn: {fmtTime(sunTimes.dawn)}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sunset className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Sunset</span>
              </div>
              <p className="text-2xl font-bold">{fmtTime(sunTimes.sunset)}</p>
              <p className="text-xs text-blue-100 mt-1">Dusk: {fmtTime(sunTimes.dusk)}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Daylight</span>
              </div>
              <p className="text-2xl font-bold text-blue-950">{daylightStr}</p>
              <p className="text-xs text-slate-500 mt-1">Production window</p>
            </div>

            <div className="bg-blue-950 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-medium text-blue-300">Sun Altitude</span>
              </div>
              <p className="text-2xl font-bold">{sunPos.altitude.toFixed(1)}°</p>
              <p className="text-xs text-blue-400 mt-1">{sunPos.isDay ? "Above horizon" : "Below horizon"}</p>
            </div>
          </div>

          {/* ── 3D Panel + Compass + Settings ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* 3D Solar Panel */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 border-2 border-blue-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-950">3D Panel Tracker</h3>
                  <p className="text-xs text-blue-600">Real-time orientation</p>
                </div>
              </div>

              <SolarPanel3D
                tilt={sunPos.optimalTilt}
                azimuth={sunPos.optimalAzimuth}
                sunAlt={sunPos.altitude}
                sunAz={sunPos.azimuthCompass}
                isDay={sunPos.isDay}
              />
            </div>

            {/* Compass */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 border-2 border-blue-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-950 rounded-xl flex items-center justify-center">
                    <Compass className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-950">Sun Compass</h3>
                    <p className="text-xs text-blue-600">Live position tracking</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${sunPos.isDay
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>
                  {sunPos.isDay ? "VISIBLE" : "BELOW HORIZON"}
                </span>
              </div>

              <div className="relative w-full aspect-square max-w-[260px] mx-auto">
                <div className="absolute inset-0 rounded-full bg-blue-50 border-4 border-blue-200 shadow-inner">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    <circle cx="100" cy="100" r="50" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    <circle cx="100" cy="100" r="30" fill="none" stroke="#e2e8f0" strokeWidth="1" />

                    <text x="100" y="20" textAnchor="middle" className="fill-red-500 text-sm font-bold">N</text>
                    <text x="100" y="190" textAnchor="middle" className="fill-blue-950 text-xs font-bold">S</text>
                    <text x="10" y="104" textAnchor="middle" className="fill-blue-950 text-xs font-bold">W</text>
                    <text x="190" y="104" textAnchor="middle" className="fill-blue-950 text-xs font-bold">E</text>

                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                      const rad = (deg - 90) * (Math.PI / 180);
                      const x1 = 100 + 82 * Math.cos(rad);
                      const y1 = 100 + 82 * Math.sin(rad);
                      const x2 = 100 + 90 * Math.cos(rad);
                      const y2 = 100 + 90 * Math.sin(rad);
                      return (
                        <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2" />
                      );
                    })}

                    {/* Sun */}
                    {sunPos.isDay && (
                      <g transform={`rotate(${sunPos.azimuthCompass}, 100, 100)`}>
                        <line x1="100" y1="100" x2="100" y2="30" stroke="#f97316" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                        <circle cx="100" cy="28" r="14" fill="#f97316" />
                        <circle cx="100" cy="28" r="10" fill="#fbbf24" />
                        <circle cx="100" cy="28" r="5" fill="#fef3c7" />
                      </g>
                    )}

                    {/* Panel direction */}
                    <g transform={`rotate(${sunPos.optimalAzimuth}, 100, 100)`}>
                      <line x1="100" y1="100" x2="100" y2="45" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6,3" />
                      <polygon points="100,40 94,52 106,52" fill="#3b82f6" />
                    </g>

                    <circle cx="100" cy="100" r="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                    <circle cx="100" cy="100" r="4" fill="#3b82f6" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400" />
                  <span className="text-xs text-slate-500 font-medium">Sun ({sunPos.azimuthCompass.toFixed(0)}°)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <span className="text-xs text-slate-500 font-medium">Panel ({sunPos.optimalAzimuth.toFixed(0)}°)</span>
                </div>
              </div>
            </div>

            {/* Position & Settings Cards */}
            <div className="space-y-4">
              {/* Sun Position */}
              <div className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Sun size={16} className="text-orange-500" />
                  </div>
                  <h4 className="font-bold text-blue-950">Sun Position</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-blue-600">Azimuth</span>
                      <span className="font-bold text-blue-950">{sunPos.azimuthCompass.toFixed(1)}° {cardinal8(sunPos.azimuthCompass)}</span>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-300 rounded-full" style={{ width: `${(sunPos.azimuthCompass / 360) * 100}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{sunPos.direction}</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-blue-600">Altitude</span>
                      <span className={`font-bold ${sunPos.isDay ? "text-yellow-600" : "text-slate-400"}`}>
                        {sunPos.altitude.toFixed(1)}°
                      </span>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${sunPos.isDay ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-slate-300"}`}
                        style={{ width: `${Math.max(0, (sunPos.altitude / 90) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Settings */}
              <div className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target size={16} className="text-blue-600" />
                  </div>
                  <h4 className="font-bold text-blue-950">Panel Settings</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600">Point To</span>
                    <span className="font-bold text-blue-950">{sunPos.optimalAzimuth.toFixed(0)}° {cardinal8(sunPos.optimalAzimuth)}</span>
                  </div>
                  <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Navigation size={14} className="text-blue-600" />
                      <span className="text-blue-700 text-xs font-medium">
                        {sunPos.isDay ? `Face ${sunPos.direction}` : "Face South (180°) for fixed panels"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-blue-600">Optimal Tilt</span>
                      <span className="font-bold text-blue-950">{sunPos.optimalTilt.toFixed(0)}°</span>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full" style={{ width: `${(sunPos.optimalTilt / 45) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Efficiency */}
              <div className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap size={16} className="text-green-600" />
                  </div>
                  <h4 className="font-bold text-blue-950">Efficiency</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke={efficiency > 70 ? "#22c55e" : efficiency > 40 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${efficiency * 2.51} 251`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-sm font-bold ${efficiency > 70 ? "text-green-600" : efficiency > 40 ? "text-yellow-600" : "text-red-500"}`}>
                        {Math.round(efficiency)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-blue-950">
                      {efficiency > 70 ? "Excellent" : efficiency > 40 ? "Good" : efficiency > 0 ? "Low" : "None"}
                    </p>
                    <p className="text-xs text-slate-500">Based on {sunPos.altitude.toFixed(1)}° altitude</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tracking & Fixed Panel Reference ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tracking Recommendation */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 border-2 border-blue-100 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-950 rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-950">Tracking Status</h3>
                  <p className="text-xs text-blue-600">Axis recommendation</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border-2 mb-4 ${tracking.type === "good" ? "bg-green-50 border-green-200" :
                tracking.type === "moderate" ? "bg-yellow-50 border-yellow-200" :
                  tracking.type === "low" ? "bg-orange-50 border-orange-200" :
                    "bg-slate-50 border-slate-200"
                }`}>
                <div className="flex items-start gap-3">
                  {tracking.type === "good" ? <CheckCircle2 size={18} className="text-green-600 mt-0.5" /> :
                    tracking.type === "moderate" ? <AlertCircle size={18} className="text-yellow-600 mt-0.5" /> :
                      tracking.type === "low" ? <AlertCircle size={18} className="text-orange-600 mt-0.5" /> :
                        <AlertCircle size={18} className="text-slate-400 mt-0.5" />}
                  <p className={`text-sm font-medium ${tracking.type === "good" ? "text-green-700" :
                    tracking.type === "moderate" ? "text-yellow-700" :
                      tracking.type === "low" ? "text-orange-700" :
                        "text-slate-500"
                    }`}>
                    {tracking.text}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl text-center border-2 transition-all ${sunPos.altitude > 15
                  ? "bg-green-50 border-green-200"
                  : "bg-slate-50 border-slate-200"
                  }`}>
                  <Maximize2 size={20} className={`mx-auto mb-2 ${sunPos.altitude > 15 ? "text-green-600" : "text-slate-400"}`} />
                  <p className={`text-sm font-bold ${sunPos.altitude > 15 ? "text-green-700" : "text-slate-400"}`}>
                    Single-Axis
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {sunPos.altitude > 15 ? "Recommended" : "Not needed"}
                  </p>
                </div>
                <div className={`p-4 rounded-xl text-center border-2 transition-all ${sunPos.altitude > 30
                  ? "bg-green-50 border-green-200"
                  : "bg-slate-50 border-slate-200"
                  }`}>
                  <Target size={20} className={`mx-auto mb-2 ${sunPos.altitude > 30 ? "text-green-600" : "text-slate-400"}`} />
                  <p className={`text-sm font-bold ${sunPos.altitude > 30 ? "text-green-700" : "text-slate-400"}`}>
                    Dual-Axis
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {sunPos.altitude > 30 ? "Optimal" : "Not beneficial"}
                  </p>
                </div>
              </div>
            </div>

            {/* Fixed Panel Reference */}
            <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl lg:rounded-3xl p-6 border-2 border-blue-800 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Fixed Panel Guide</h3>
                  <p className="text-xs text-blue-300">Best settings for {loc.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Navigation size={16} className="text-orange-400" />, label: "Best Direction", value: "South (180°)", sub: "Max yearly output" },
                  { icon: <ArrowUp size={16} className="text-orange-400" />, label: "Best Tilt", value: `${loc.lat.toFixed(0)}°`, sub: "Equal to latitude" },
                  { icon: <MapPin size={16} className="text-orange-400" />, label: "Latitude", value: `${loc.lat.toFixed(4)}°N`, sub: "Northern hemisphere" },
                  { icon: <MapPin size={16} className="text-orange-400" />, label: "Longitude", value: `${loc.lng.toFixed(4)}°E`, sub: "Eastern hemisphere" },
                ].map((item, i) => (
                  <div key={i} className="bg-blue-800/50 rounded-xl p-3 border border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      {item.icon}
                      <span className="text-xs text-blue-300 font-medium">{item.label}</span>
                    </div>
                    <p className="text-white text-lg font-bold">{item.value}</p>
                    <p className="text-blue-400 text-xs mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sun Arc ── */}
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 border-2 border-blue-100 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-950">Sun Arc — Today</h3>
                  <p className="text-xs text-blue-600">{Math.round(dayProgress)}% of daylight completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                <span className="text-xs font-bold text-blue-700">{Math.round(dayProgress)}%</span>
              </div>
            </div>

            <div className="relative h-44 mb-4">
              <svg className="w-full h-full" viewBox="0 0 500 130" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="arcBg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#eff6ff" />
                    <stop offset="100%" stopColor="#f8fafc" />
                  </linearGradient>
                  <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>

                <rect x="0" y="0" width="500" height="130" fill="url(#arcBg)" rx="12" />
                <line x1="30" y1="110" x2="470" y2="110" stroke="#cbd5e1" strokeWidth="2" />

                {/* Track */}
                <path d="M 40 105 Q 250 -30 460 105" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
                {/* Progress */}
                <path
                  d="M 40 105 Q 250 -30 460 105"
                  fill="none" stroke="url(#arcGlow)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray="520"
                  strokeDashoffset={520 - (dayProgress / 100) * 520}
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />

                <text x="40" y="125" fill="#64748b" fontSize="10" textAnchor="middle">
                  {fmtTime(sunTimes.sunrise)}
                </text>
                <text x="250" y="125" fill="#64748b" fontSize="10" textAnchor="middle">
                  {fmtTime(sunTimes.solarNoon)}
                </text>
                <text x="460" y="125" fill="#64748b" fontSize="10" textAnchor="middle">
                  {fmtTime(sunTimes.sunset)}
                </text>
              </svg>

              {/* Sun ball */}
              <div
                className="absolute transition-all duration-1000 ease-out"
                style={{
                  left: `${8 + dayProgress * 0.84}%`,
                  top: `${105 - Math.sin((dayProgress / 100) * Math.PI) * 90}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-orange-300/50 flex items-center justify-center border-2 border-yellow-300">
                    <Sun className="text-white" size={22} />
                  </div>
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[10px] font-bold text-blue-950 bg-white px-2 py-0.5 rounded-full border border-blue-100 shadow-sm">
                      {sunPos.altitude.toFixed(0)}° alt
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sunrise / Noon / Sunset labels */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 bg-orange-50 border-2 border-orange-200 px-4 py-2.5 rounded-xl">
                <Sunrise className="text-orange-500" size={20} />
                <div>
                  <p className="text-xs text-orange-600 font-medium">Sunrise</p>
                  <p className="text-lg font-bold text-blue-950">{fmtTime(sunTimes.sunrise)}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Solar Noon</p>
                <p className="text-lg font-bold text-orange-500">{fmtTime(sunTimes.solarNoon)}</p>
              </div>
              <div className="flex items-center gap-3 bg-blue-50 border-2 border-blue-200 px-4 py-2.5 rounded-xl">
                <div className="text-right">
                  <p className="text-xs text-blue-600 font-medium">Sunset</p>
                  <p className="text-lg font-bold text-blue-950">{fmtTime(sunTimes.sunset)}</p>
                </div>
                <Sunset className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7-Day Daylight */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 border-2 border-blue-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-950 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-950">7-Day Daylight</h3>
                  <p className="text-xs text-blue-600">Duration forecast</p>
                </div>
              </div>

              {weekly.length > 0 ? (
                <div className="space-y-3">
                  {weekly.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-14 text-right flex-shrink-0">
                        <p className="text-sm font-bold text-blue-950">{d.date}</p>
                        <p className="text-[10px] text-slate-500">{d.fullDate}</p>
                      </div>
                      <div className="flex-1">
                        <div className="h-8 bg-blue-50 rounded-full overflow-hidden relative border border-blue-200">
                          <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-500"
                            style={{ width: `${(d.dayLength / 14) * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-950">{d.dayLength.toFixed(1)}h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
                </div>
              )}
            </div>

            {/* Weekly Sun Timeline */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 border-2 border-blue-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-xl flex items-center justify-center">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-950">Weekly Timeline</h3>
                  <p className="text-xs text-blue-600">Day & night cycles</p>
                </div>
              </div>

              {weekly.length > 0 ? (
                <div className="space-y-3">
                  {weekly.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 w-10">{d.date}</span>
                      <div className="flex-1 h-7 bg-indigo-100 rounded-full relative overflow-hidden border border-indigo-200">
                        <div
                          className="absolute left-0 h-full bg-indigo-200"
                          style={{ width: `${(d.sunrise / 24) * 100}%` }}
                        />
                        <div
                          className="absolute h-full rounded-full"
                          style={{
                            left: `${(d.sunrise / 24) * 100}%`,
                            width: `${((d.sunset - d.sunrise) / 24) * 100}%`,
                            background: "linear-gradient(90deg, #f97316, #fbbf24 30%, #fbbf24 70%, #f97316)",
                          }}
                        />
                        <div
                          className="absolute right-0 h-full bg-indigo-200"
                          style={{ width: `${((24 - d.sunset) / 24) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-blue-100">
                    <span className="w-10" />
                    <div className="flex-1 flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>12AM</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-indigo-200 rounded border border-indigo-300" />
                      <span className="text-xs text-slate-500">Night</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-yellow-400 rounded" />
                      <span className="text-xs text-slate-500">Daylight</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
                </div>
              )}
            </div>
          </div>

          {/* ── Info Footer ── */}
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl lg:rounded-3xl p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-green-800">Accurate Calculations</h4>
                <p className="text-green-700 text-sm mt-1 leading-relaxed">
                  This page uses the <strong>SunCalc</strong> astronomical library for precise sun position calculations.
                  The azimuth ({sunPos.azimuthCompass.toFixed(1)}°) and altitude ({sunPos.altitude.toFixed(1)}°)
                  values are accurate to within ±0.5°. For <strong>{loc.name}</strong>, fixed panels should face{" "}
                  <strong>South (180°)</strong> with a tilt of approximately <strong>{loc.lat.toFixed(0)}°</strong> for
                  maximum yearly energy production.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 sm:p-6 lg:p-8">
          <div className="bg-blue-950 rounded-2xl p-5 lg:p-6 border-2 border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold">Lakdhanvi Solar Intelligence</span>
                <span className="text-blue-400 text-sm ml-2">v2.0</span>
              </div>
            </div>
            <p className="text-sm text-blue-300">Powered by SunCalc • Real-time Sun Tracking • {loc.name}, Sri Lanka</p>
          </div>
        </footer>
      </main>
    </div>
  );
}