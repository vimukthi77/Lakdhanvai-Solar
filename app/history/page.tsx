"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import {
    History,
    Calendar,
    Clock,
    Zap,
    DollarSign,
    Fuel,
    Droplets,
    Leaf,
    Wind,
    RefreshCw,
    Download,
    Printer,
    ChevronDown,
    ChevronRight,
    Search,
    FileText,
    TrendingUp,
    BarChart3,
    Sparkles,
    AlertCircle,
    Eye,
    X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────
interface BreakdownItem {
    hour: string;
    predicted_kw: number;
    predicted_temp: number;
    saving_lkr: number;
}

interface PredictionRecord {
    _id: string;
    date: string;
    startHour: number;
    endHour: number;
    totalKw: number;
    totalSavings: number;
    breakdown: BreakdownItem[];
    createdAt: string;
}

// ─── Constants ────────────────────────────────────────────
const LITERS_PER_KWH = 0.199;
const DIESEL_PRICE = 283;
const CO2_PER_LITER = 2.68;

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function HistoryPage() {
    const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterMode, setFilterMode] = useState<"single" | "range">("single");
    const [singleDate, setSingleDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // View
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // ─── Clock ──────────────────────────────────────────────
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // close dropdown on outside click
    useEffect(() => {
        if (!showDownloadMenu) return;
        const close = () => setShowDownloadMenu(false);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [showDownloadMenu]);

    // ─── Fetch Predictions ──────────────────────────────────
    const fetchPredictions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filterMode === "single" && singleDate) {
                params.set("date", singleDate);
            } else if (filterMode === "range") {
                if (startDate) params.set("startDate", startDate);
                if (endDate) params.set("endDate", endDate);
            }
            params.set("limit", "100");

            const res = await fetch(`/api/predictions?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setPredictions(data.predictions || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load history");
        } finally {
            setLoading(false);
        }
    }, [filterMode, singleDate, startDate, endDate]);

    // Load on mount and when filters change
    useEffect(() => {
        fetchPredictions();
    }, [fetchPredictions]);

    // ─── Helpers ────────────────────────────────────────────
    const formatTime = (d: Date) =>
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const formatDate = (d: Date) =>
        d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const formatDateShort = (dateStr: string) => {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    };

    // ─── Aggregated Stats ───────────────────────────────────
    const totalKwh = predictions.reduce((s, p) => s + p.totalKw, 0);
    const totalSavings = predictions.reduce((s, p) => s + p.totalSavings, 0);
    const totalDieselSaved = totalKwh * LITERS_PER_KWH;
    const totalCo2 = totalDieselSaved * CO2_PER_LITER;
    const uniqueDates = [...new Set(predictions.map((p) => p.date))];

    // ─── Download CSV ───────────────────────────────────────
    const downloadCSV = () => {
        if (predictions.length === 0) return;

        let csv = "Solar & Diesel History Report\n";
        csv += `Generated,${new Date().toLocaleString()}\n`;
        csv += `Records,${predictions.length}\n`;
        csv += `Unique Dates,${uniqueDates.length}\n\n`;

        csv += "SUMMARY\n";
        csv += `Total Generation,${totalKwh.toFixed(1)} kWh\n`;
        csv += `Total Savings,Rs. ${Math.round(totalSavings).toLocaleString()}\n`;
        csv += `Diesel Saved,${totalDieselSaved.toFixed(1)} L\n`;
        csv += `CO2 Avoided,${totalCo2.toFixed(1)} kg\n\n`;

        csv += "PREDICTION RECORDS\n";
        csv += "Date,Start Hour,End Hour,Total kWh,Savings (LKR),Diesel Saved (L),CO2 (kg),Created At\n";
        predictions.forEach((p) => {
            const diesel = p.totalKw * LITERS_PER_KWH;
            const co2 = diesel * CO2_PER_LITER;
            csv += `${p.date},${p.startHour}:00,${p.endHour}:00,${p.totalKw},${p.totalSavings},${diesel.toFixed(1)},${co2.toFixed(1)},${new Date(p.createdAt).toLocaleString()}\n`;
        });

        csv += "\nHOURLY DETAILS\n";
        predictions.forEach((p) => {
            csv += `\n--- ${p.date} (${p.startHour}:00-${p.endHour}:00) ---\n`;
            csv += "Hour,kW,Temp (C),Savings (LKR),Diesel Saved (L)\n";
            p.breakdown.forEach((b) => {
                csv += `${b.hour},${b.predicted_kw},${b.predicted_temp},${b.saving_lkr},${(b.predicted_kw * LITERS_PER_KWH).toFixed(2)}\n`;
            });
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `solar-history-${singleDate || startDate || "all"}-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ─── Print Report ───────────────────────────────────────
    const printReport = () => {
        if (predictions.length === 0) return;

        const rows = predictions
            .map((p) => {
                const diesel = (p.totalKw * LITERS_PER_KWH).toFixed(1);
                const co2 = (p.totalKw * LITERS_PER_KWH * CO2_PER_LITER).toFixed(1);
                return `<tr>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${formatDateShort(p.date)}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${p.startHour}:00 – ${p.endHour}:00</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#f97316;font-weight:bold;">${p.totalKw} kWh</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#2563eb;font-weight:bold;">${diesel} L</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#16a34a;">${co2} kg</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#16a34a;">Rs. ${p.totalSavings.toLocaleString()}</td>
        </tr>`;
            })
            .join("");

        const win = window.open("", "_blank");
        if (!win) return;

        win.document.write(`<!DOCTYPE html>
<html><head><title>Solar History Report</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Segoe UI',system-ui,sans-serif; padding:40px; color:#1e293b; max-width:900px; margin:0 auto; }
.header { display:flex; align-items:center; gap:15px; border-bottom:4px solid #f97316; padding-bottom:20px; margin-bottom:30px; }
.logo { width:50px; height:50px; background:linear-gradient(135deg,#f97316,#ea580c); border-radius:12px; display:flex; align-items:center; justify-content:center; color:white; font-size:24px; }
h1 { color:#172554; font-size:28px; }
h2 { color:#172554; margin:30px 0 15px; font-size:20px; border-left:4px solid #f97316; padding-left:12px; }
.meta { color:#64748b; font-size:13px; margin-top:4px; }
.stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:15px; margin:20px 0; }
.stat { background:#f8fafc; padding:20px; border-radius:12px; border-left:4px solid #f97316; }
.stat-val { font-size:24px; font-weight:800; color:#172554; }
.stat-lbl { font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-top:4px; }
table { width:100%; border-collapse:collapse; margin:15px 0; }
thead th { background:#172554; color:white; padding:12px; text-align:left; font-size:12px; text-transform:uppercase; }
tfoot td { background:#172554; color:white; padding:12px; font-weight:bold; }
.footer { margin-top:40px; padding-top:20px; border-top:3px solid #e2e8f0; color:#64748b; font-size:12px; text-align:center; }
@media print { body { padding:20px; } .no-print { display:none; } }
</style></head><body>
<div class="header"><div class="logo">☀</div><div><h1>Solar & Diesel History Report</h1>
<div class="meta">Generated: ${new Date().toLocaleString()} | Records: ${predictions.length} | Dates: ${uniqueDates.length}</div></div></div>
<button onclick="window.print()" class="no-print" style="background:#f97316;color:white;border:none;padding:12px 24px;border-radius:10px;font-weight:bold;cursor:pointer;margin-bottom:20px;">🖨 Print / Save PDF</button>
<h2>Summary</h2>
<div class="stat-grid">
<div class="stat"><div class="stat-val">${totalKwh.toFixed(1)} kWh</div><div class="stat-lbl">Total Generation</div></div>
<div class="stat"><div class="stat-val">Rs. ${Math.round(totalSavings).toLocaleString()}</div><div class="stat-lbl">Total Savings</div></div>
<div class="stat"><div class="stat-val">${totalDieselSaved.toFixed(1)} L</div><div class="stat-lbl">Diesel Saved</div></div>
<div class="stat"><div class="stat-val">${totalCo2.toFixed(1)} kg</div><div class="stat-lbl">CO₂ Avoided</div></div>
</div>
<h2>All Records</h2>
<table><thead><tr><th>Date</th><th style="text-align:center">Hours</th><th style="text-align:center">Generation</th><th style="text-align:center">Diesel Saved</th><th style="text-align:center">CO₂</th><th style="text-align:right">Savings</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="2">Total (${predictions.length} records)</td>
<td style="text-align:center">${totalKwh.toFixed(1)} kWh</td>
<td style="text-align:center">${totalDieselSaved.toFixed(1)} L</td>
<td style="text-align:center">${totalCo2.toFixed(1)} kg</td>
<td style="text-align:right">Rs. ${Math.round(totalSavings).toLocaleString()}</td></tr></tfoot></table>
<div class="footer"><p><strong>Lakdhanvi Limited</strong> • Solar Intelligence Platform v2.0</p></div>
</body></html>`);
        win.document.close();
    };

    const clearFilters = () => {
        setSingleDate("");
        setStartDate("");
        setEndDate("");
    };

    // ═══════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                {/* ── Header ─────────────────────────────────────── */}
                <header className="bg-gradient-to-r from-blue-950 to-blue-900 border-b-2 border-orange-500 sticky top-0 z-40">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <History className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl lg:text-3xl font-bold text-white">Prediction History</h1>
                                        <span className="hidden sm:inline-flex items-center gap-1 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
                                            <Sparkles className="w-3 h-3" /> Solar & Diesel
                                        </span>
                                    </div>
                                    <p className="text-blue-300 text-sm mt-0.5">{formatDate(currentTime)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="hidden md:flex items-center gap-2 bg-blue-800/50 px-4 py-2 rounded-xl border border-blue-700">
                                    <Clock className="w-4 h-4 text-orange-400" />
                                    <span className="text-white font-mono text-lg">{formatTime(currentTime)}</span>
                                </div>

                                <button
                                    onClick={fetchPredictions}
                                    disabled={loading}
                                    className="p-2 bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-5 h-5 text-white ${loading ? "animate-spin" : ""}`} />
                                </button>

                                {/* Download Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowDownloadMenu(!showDownloadMenu); }}
                                        disabled={predictions.length === 0}
                                        className="flex items-center gap-1 p-2 bg-blue-800 hover:bg-blue-700 rounded-xl transition-colors border border-blue-700 disabled:opacity-50"
                                    >
                                        <Download className="w-5 h-5 text-white" />
                                        <ChevronDown className="w-3 h-3 text-white" />
                                    </button>
                                    {showDownloadMenu && (
                                        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-blue-100 py-2 w-56 z-50">
                                            <button onClick={() => { downloadCSV(); setShowDownloadMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left">
                                                <FileText className="w-5 h-5 text-orange-500" />
                                                <div><p className="font-bold text-blue-950 text-sm">Download CSV</p><p className="text-xs text-slate-500">Spreadsheet format</p></div>
                                            </button>
                                            <div className="border-t border-blue-100 mx-3" />
                                            <button onClick={() => { printReport(); setShowDownloadMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left">
                                                <Printer className="w-5 h-5 text-blue-600" />
                                                <div><p className="font-bold text-blue-950 text-sm">Print / PDF Report</p><p className="text-xs text-slate-500">Formatted report</p></div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* ── Filter Section ──────────────────────────── */}
                    <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border-2 border-blue-100 shadow-lg">
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                            {/* Filter Mode Toggle */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-blue-950 mb-3">
                                    <Search className="w-4 h-4 text-orange-500" /> Filter Mode
                                </label>
                                <div className="bg-blue-50 p-1 rounded-xl flex border border-blue-200">
                                    <button
                                        onClick={() => setFilterMode("single")}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterMode === "single" ? "bg-orange-500 text-white shadow" : "text-blue-600 hover:text-blue-900"}`}
                                    >
                                        Single Date
                                    </button>
                                    <button
                                        onClick={() => setFilterMode("range")}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterMode === "range" ? "bg-orange-500 text-white shadow" : "text-blue-600 hover:text-blue-900"}`}
                                    >
                                        Date Range
                                    </button>
                                </div>
                            </div>

                            {/* Date Inputs */}
                            {filterMode === "single" ? (
                                <div className="flex-1">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-blue-950 mb-3">
                                        <Calendar className="w-4 h-4 text-orange-500" /> Select Date
                                    </label>
                                    <input
                                        type="date"
                                        value={singleDate}
                                        className="w-full p-3 rounded-xl border-2 border-blue-200 bg-blue-50 focus:border-orange-500 focus:bg-white outline-none transition-all text-blue-950 font-medium"
                                        onChange={(e) => setSingleDate(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-blue-950 mb-3">
                                            <Calendar className="w-4 h-4 text-orange-500" /> Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            className="w-full p-3 rounded-xl border-2 border-blue-200 bg-blue-50 focus:border-orange-500 focus:bg-white outline-none transition-all text-blue-950 font-medium"
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-blue-950 mb-3">
                                            <Calendar className="w-4 h-4 text-orange-500" /> End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            className="w-full p-3 rounded-xl border-2 border-blue-200 bg-blue-50 focus:border-orange-500 focus:bg-white outline-none transition-all text-blue-950 font-medium"
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={fetchPredictions}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Search className="w-4 h-4" /> Search
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 border-2 border-blue-200 text-blue-600 px-4 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                                >
                                    <X className="w-4 h-4" /> Clear
                                </button>
                            </div>
                        </div>

                        {/* Active Filter Display */}
                        {(singleDate || startDate || endDate) && (
                            <div className="mt-4 pt-4 border-t border-blue-100 flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-blue-600 uppercase">Active Filter:</span>
                                {singleDate && (
                                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">{formatDateShort(singleDate)}</span>
                                )}
                                {startDate && (
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">From: {formatDateShort(startDate)}</span>
                                )}
                                {endDate && (
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">To: {formatDateShort(endDate)}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Summary Stats ──────────────────────────── */}
                    {predictions.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{predictions.length}</span>
                                </div>
                                <p className="text-sm text-blue-600 font-medium">Records</p>
                                <p className="text-xl font-bold text-blue-950 mt-1">{uniqueDates.length} <span className="text-sm font-medium text-blue-400">days</span></p>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
                                </div>
                                <p className="text-sm text-blue-600 font-medium">Total Generation</p>
                                <p className="text-xl font-bold text-blue-950 mt-1">{totalKwh.toFixed(1)} <span className="text-sm font-medium text-blue-400">kWh</span></p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl p-5 border-2 border-blue-800 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-white" /></div>
                                </div>
                                <p className="text-sm text-blue-300 font-medium">Total Savings</p>
                                <p className="text-xl font-bold text-white mt-1">Rs. {Math.round(totalSavings).toLocaleString()}</p>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center"><Droplets className="w-5 h-5 text-white" /></div>
                                </div>
                                <p className="text-sm text-blue-600 font-medium">Diesel Saved</p>
                                <p className="text-xl font-bold text-blue-950 mt-1">{totalDieselSaved.toFixed(1)} <span className="text-sm font-medium text-blue-400">L</span></p>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border-2 border-green-100 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center"><Wind className="w-5 h-5 text-white" /></div>
                                </div>
                                <p className="text-sm text-green-600 font-medium">CO₂ Avoided</p>
                                <p className="text-xl font-bold text-green-700 mt-1">{totalCo2.toFixed(1)} <span className="text-sm font-medium text-green-400">kg</span></p>
                            </div>
                        </div>
                    )}

                    {/* ── Loading ─────────────────────────────────── */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 bg-blue-950 rounded-full flex items-center justify-center mb-6">
                                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <h3 className="text-xl font-bold text-blue-950 mb-2">Loading History</h3>
                            <p className="text-blue-600">Fetching prediction records...</p>
                        </div>
                    )}

                    {/* ── Error ───────────────────────────────────── */}
                    {!loading && error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-center gap-4">
                            <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-red-800 font-bold text-lg">Failed to Load History</p>
                                <p className="text-red-600 text-sm mt-1">{error}</p>
                            </div>
                            <button onClick={fetchPredictions} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium"><RefreshCw className="w-4 h-4" /> Retry</button>
                        </div>
                    )}

                    {/* ── Empty State ─────────────────────────────── */}
                    {!loading && !error && predictions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl lg:rounded-3xl border-2 border-dashed border-blue-200 shadow-lg">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-950 to-blue-900 rounded-full flex items-center justify-center mb-6 shadow-xl">
                                <History className="w-12 h-12 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-blue-950 mb-3">No Predictions Found</h3>
                            <p className="text-blue-600 text-center max-w-md mb-6">
                                {singleDate || startDate || endDate
                                    ? "No prediction records match your selected date filters. Try a different date or clear filters."
                                    : "No prediction records saved yet. Go to AI Forecast page and generate predictions to see them here."}
                            </p>
                            {(singleDate || startDate || endDate) && (
                                <button onClick={clearFilters} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-medium">
                                    <X className="w-4 h-4" /> Clear Filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Records List ────────────────────────────── */}
                    {!loading && predictions.length > 0 && (
                        <div className="space-y-4">
                            {predictions.map((pred) => {
                                const isExpanded = expandedId === pred._id;
                                const dieselSaved = pred.totalKw * LITERS_PER_KWH;
                                const costSaved = dieselSaved * DIESEL_PRICE;
                                const co2Avoided = dieselSaved * CO2_PER_LITER;
                                const peakHour = pred.breakdown.reduce(
                                    (max, b) => (b.predicted_kw > max.predicted_kw ? b : max),
                                    { hour: "-", predicted_kw: 0, predicted_temp: 0, saving_lkr: 0 }
                                );

                                return (
                                    <div key={pred._id} className="bg-white rounded-2xl lg:rounded-3xl border-2 border-blue-100 shadow-lg overflow-hidden transition-all hover:shadow-xl">
                                        {/* Record Header (clickable) */}
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : pred._id)}
                                            className="w-full p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left hover:bg-blue-50/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 flex-shrink-0">
                                                    <Calendar className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-blue-950">{formatDateShort(pred.date)}</h3>
                                                    <p className="text-sm text-blue-600">
                                                        {pred.startHour}:00 – {pred.endHour}:00 • {pred.breakdown.length} hours • Saved {new Date(pred.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
                                                <div className="text-center">
                                                    <p className="text-xs text-blue-500 font-medium">Generation</p>
                                                    <p className="text-lg font-bold text-orange-500">{pred.totalKw} kWh</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-blue-500 font-medium">Diesel Saved</p>
                                                    <p className="text-lg font-bold text-blue-600">{dieselSaved.toFixed(1)} L</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-blue-500 font-medium">Savings</p>
                                                    <p className="text-lg font-bold text-emerald-600">Rs. {Math.round(pred.totalSavings).toLocaleString()}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-blue-500 font-medium">CO₂</p>
                                                    <p className="text-lg font-bold text-green-600">{co2Avoided.toFixed(1)} kg</p>
                                                </div>

                                                <div className={`transform transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                                                    <ChevronRight className="w-6 h-6 text-blue-400" />
                                                </div>
                                            </div>
                                        </button>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="border-t-2 border-blue-100">
                                                {/* Quick Stats Bar */}
                                                <div className="bg-gradient-to-r from-blue-950 to-blue-900 p-4 lg:p-5">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <p className="text-blue-300 text-xs font-medium mb-1">Peak Hour</p>
                                                            <p className="text-xl font-bold text-orange-400">{peakHour.hour}</p>
                                                            <p className="text-white/60 text-sm">{peakHour.predicted_kw} kW</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-blue-300 text-xs font-medium mb-1">Diesel Offset</p>
                                                            <p className="text-xl font-bold text-blue-300">{dieselSaved.toFixed(1)} L</p>
                                                            <p className="text-white/60 text-sm">@ Rs. {DIESEL_PRICE}/L</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-blue-300 text-xs font-medium mb-1">Cost Saved</p>
                                                            <p className="text-xl font-bold text-emerald-400">Rs. {Math.round(costSaved).toLocaleString()}</p>
                                                            <p className="text-white/60 text-sm">Diesel offset value</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-blue-300 text-xs font-medium mb-1">CO₂ Avoided</p>
                                                            <p className="text-xl font-bold text-green-400">{co2Avoided.toFixed(1)} kg</p>
                                                            <p className="text-white/60 text-sm">@ {CO2_PER_LITER} kg/L</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Hourly Table */}
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="bg-blue-50">
                                                                <th className="p-3 lg:p-4 text-left text-xs font-bold text-blue-950 uppercase">Time</th>
                                                                <th className="p-3 lg:p-4 text-center text-xs font-bold text-blue-950 uppercase">Temp</th>
                                                                <th className="p-3 lg:p-4 text-center text-xs font-bold text-blue-950 uppercase">Solar (kW)</th>
                                                                <th className="p-3 lg:p-4 text-center text-xs font-bold text-blue-950 uppercase">Diesel Saved (L)</th>
                                                                <th className="p-3 lg:p-4 text-right text-xs font-bold text-blue-950 uppercase">Cost Saved</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {pred.breakdown.map((b, i) => {
                                                                const bDiesel = b.predicted_kw * LITERS_PER_KWH;
                                                                const bCost = bDiesel * DIESEL_PRICE;
                                                                const isPeak = b.predicted_kw === peakHour.predicted_kw;
                                                                return (
                                                                    <tr key={i} className={`border-b border-blue-100 hover:bg-orange-50 transition-colors ${isPeak ? "bg-orange-50" : i % 2 === 0 ? "bg-white" : "bg-blue-50/30"}`}>
                                                                        <td className="p-3 lg:p-4">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPeak ? "bg-orange-500" : "bg-blue-100"}`}>
                                                                                    <Clock className={`w-4 h-4 ${isPeak ? "text-white" : "text-blue-600"}`} />
                                                                                </div>
                                                                                <span className="font-bold text-blue-950">{b.hour}</span>
                                                                                {isPeak && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Peak</span>}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-3 lg:p-4 text-center">
                                                                            <span className="inline-flex items-center bg-blue-950 px-2.5 py-1 rounded-full">
                                                                                <span className="font-semibold text-white text-sm">{b.predicted_temp}°C</span>
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-3 lg:p-4 text-center"><span className="text-lg font-bold text-orange-500">{b.predicted_kw} kW</span></td>
                                                                        <td className="p-3 lg:p-4 text-center"><span className="text-lg font-bold text-blue-600">{bDiesel.toFixed(2)} L</span></td>
                                                                        <td className="p-3 lg:p-4 text-right"><span className="font-bold text-emerald-600">Rs. {Math.round(bCost).toLocaleString()}</span></td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className="bg-blue-950">
                                                                <td className="p-3 lg:p-4 text-white font-bold" colSpan={2}>Total</td>
                                                                <td className="p-3 lg:p-4 text-center"><span className="text-lg font-bold text-orange-400">{pred.totalKw} kWh</span></td>
                                                                <td className="p-3 lg:p-4 text-center"><span className="text-lg font-bold text-blue-300">{dieselSaved.toFixed(1)} L</span></td>
                                                                <td className="p-3 lg:p-4 text-right"><span className="text-lg font-bold text-white">Rs. {Math.round(pred.totalSavings).toLocaleString()}</span></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Download Report CTA ─────────────────────── */}
                    {predictions.length > 0 && (
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-lg shadow-orange-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <FileText className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Download History Report</h3>
                                        <p className="text-orange-100 text-sm mt-1">
                                            Export {predictions.length} records • {uniqueDates.length} days • {totalKwh.toFixed(1)} kWh total
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={downloadCSV} className="flex items-center gap-2 bg-white text-orange-600 px-5 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg">
                                        <Download className="w-5 h-5" /> Download CSV
                                    </button>
                                    <button onClick={printReport} className="flex items-center gap-2 bg-white/20 text-white px-5 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors border border-white/30">
                                        <Printer className="w-5 h-5" /> Print / PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="p-4 sm:p-6 lg:p-8">
                    <div className="bg-blue-950 rounded-2xl p-5 lg:p-6 border-2 border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                <History className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-white font-bold">Prediction History</span>
                                <span className="text-blue-400 text-sm ml-2">v2.0</span>
                            </div>
                        </div>
                        <p className="text-sm text-blue-300">Powered by AI • Solar & Diesel History Records</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
