"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  Fuel, Banknote, Droplets, Leaf, Info, Zap, TrendingUp,
  Clock, Calendar, RefreshCw, Gauge, Factory, Flame,
  TreePine, Wind, Brain, Sparkles, Wifi, WifiOff,
  ChevronRight, AlertCircle, CheckCircle2, Activity, Search, ArrowDown
} from 'lucide-react';

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

interface FuelStats {
  todayKwh: number;
  litersSaved: number;
  moneySaved: number;
  co2Avoided: number;
  treesEquivalent: number;
}

export default function FuelManagement() {
  const [stats, setStats] = useState<FuelStats>({
    todayKwh: 0,
    litersSaved: 0,
    moneySaved: 0,
    co2Avoided: 0,
    treesEquivalent: 0
  });
  const [hourlyData, setHourlyData] = useState<BreakdownItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'loading'>('loading');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ── Predictor State ──
  const [predDate, setPredDate] = useState<string>('');
  const [predStartHour, setPredStartHour] = useState<string>('6');
  const [predEndHour, setPredEndHour] = useState<string>('18');
  const [predLoading, setPredLoading] = useState<boolean>(false);
  const [predError, setPredError] = useState<string | null>(null);
  const [predResult, setPredResult] = useState<PredictionResponse | null>(null);

  // Constants for calculations
  const LITERS_PER_KWH = 0.199;
  const DIESEL_PRICE = 283;
  const CO2_PER_LITER = 2.68;
  const TREES_PER_TON_CO2 = 45;

  // Power Plant Constants
  const STARTUP_DIESEL_MIN = 1000; // Liters for gas turbine startup
  const STARTUP_DIESEL_MAX = 1400;
  const OPERATION_DIESEL_12H = 15000; // Liters for 12 hours operation
  const DIESEL_PER_HOUR = OPERATION_DIESEL_12H / 12; // 1250 L/hr

  // API URL
  const AI_API_URL = 'https://solar-ai-model.onrender.com/predict_range';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch AI Model Predictions - Using correct format from main dashboard
  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    setApiStatus('loading');

    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dateStr,
          start_hour: 6,
          end_hour: 18,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: PredictionResponse = await response.json();

      // Get total kWh from AI prediction
      const totalKwh = data.total_kw;

      // Calculate fuel savings based on predicted kWh
      const litersSaved = totalKwh * LITERS_PER_KWH;
      const moneySaved = litersSaved * DIESEL_PRICE;
      const co2Avoided = litersSaved * CO2_PER_LITER;
      const treesEquivalent = Math.round((co2Avoided / 1000) * TREES_PER_TON_CO2);

      setStats({
        todayKwh: parseFloat(totalKwh.toFixed(2)),
        litersSaved: parseFloat(litersSaved.toFixed(2)),
        moneySaved: parseFloat(moneySaved.toFixed(2)),
        co2Avoided: parseFloat(co2Avoided.toFixed(2)),
        treesEquivalent: treesEquivalent
      });

      setHourlyData(data.breakdown);
      setApiStatus('online');
      setLastUpdated(new Date());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
      setApiStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  // ── Diesel Savings Predictor Handler ──
  const handleDieselPredict = async (): Promise<void> => {
    setPredLoading(true);
    setPredError(null);
    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: predDate,
          start_hour: parseInt(predStartHour),
          end_hour: parseInt(predEndHour),
        }),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data: PredictionResponse = await response.json();
      setPredResult(data);
    } catch (err) {
      setPredError(err instanceof Error ? err.message : 'Failed to get prediction');
    } finally {
      setPredLoading(false);
    }
  };

  const handlePredReset = (): void => {
    setPredResult(null);
    setPredDate('');
    setPredStartHour('6');
    setPredEndHour('18');
    setPredError(null);
  };

  // ── Predictor Calculations ──
  const predHours = Math.max(0, parseInt(predEndHour) - parseInt(predStartHour));
  const predTotalKwh = predResult?.total_kw ?? 0;
  const predDieselSaved = predTotalKwh * LITERS_PER_KWH;
  const predOperationDiesel = predHours * DIESEL_PER_HOUR;
  const predStartupAvg = (STARTUP_DIESEL_MIN + STARTUP_DIESEL_MAX) / 2;
  const predTotalDieselNeeded = predOperationDiesel + predStartupAvg;
  const predNetDieselNeeded = Math.max(0, predTotalDieselNeeded - predDieselSaved);
  const predPercentOffset = predTotalDieselNeeded > 0 ? Math.min(100, (predDieselSaved / predTotalDieselNeeded) * 100) : 0;
  const predCostSaved = predDieselSaved * DIESEL_PRICE;
  const predCo2Saved = predDieselSaved * CO2_PER_LITER;
  const today = new Date().toISOString().split('T')[0];

  // Format functions
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Find peak hour
  const peakHour = hourlyData.reduce((max, item) =>
    item.predicted_kw > max.predicted_kw ? item : max,
    { hour: '-', predicted_kw: 0, predicted_temp: 0, saving_lkr: 0 }
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-950 rounded-full flex items-center justify-center mb-6 mx-auto">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 mb-2">Connecting to AI Model</h3>
            <p className="text-blue-600">Fetching fuel savings data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-3xl p-8 border-2 border-red-200 shadow-xl max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <WifiOff className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-blue-950 mb-3">AI Model Unavailable</h2>
            <p className="text-blue-600 mb-6">{error}</p>
            <button
              onClick={fetchPredictions}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <p className="text-sm text-slate-500 mt-4">
              Server: <code className="bg-slate-100 px-2 py-1 rounded text-xs">{AI_API_URL}</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-950 to-blue-900 border-b-2 border-orange-500 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Fuel className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                      Fuel Savings Analysis
                    </h1>
                    <p className="text-blue-300 text-sm">Diesel offset from solar generation</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Live Clock */}
                <div className="hidden md:flex items-center gap-2 bg-blue-800/50 px-4 py-2 rounded-xl border border-blue-700">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-mono text-lg">{formatTime(currentTime)}</span>
                </div>

                {/* API Status */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${apiStatus === 'online'
                  ? 'bg-green-500/20 border-green-500/30'
                  : 'bg-red-500/20 border-red-500/30'
                  }`}>
                  {apiStatus === 'online' ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">AI Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">AI Offline</span>
                    </>
                  )}
                </div>

                {/* Predict Diesel Button */}
                <button
                  onClick={() => document.getElementById('diesel-predictor')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                >
                  <Fuel className="w-4 h-4" />
                  Predict Diesel Savings
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Refresh Button */}
                <button
                  onClick={fetchPredictions}
                  disabled={loading}
                  className="p-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Date Info */}
          <div className="flex items-center justify-between text-sm text-blue-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(currentTime)}</span>
            </div>
            {lastUpdated && (
              <span className="text-xs">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Solar Generation */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 border-2 border-blue-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <Fuel className="w-5 h-5 text-orange-500 opacity-20" />
              </div>
              <p className="text-blue-600 text-sm font-medium">Total Solar Generation</p>
              <p className="text-3xl font-bold text-blue-950 mt-2">{stats.todayKwh}</p>
              <p className="text-sm text-blue-500 mt-1">kWh today</p>
            </div>

            {/* Diesel Saved */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 border-2 border-blue-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <Fuel className="w-5 h-5 text-blue-600 opacity-20" />
              </div>
              <p className="text-blue-600 text-sm font-medium">Diesel Saved</p>
              <p className="text-3xl font-bold text-blue-950 mt-2">{stats.litersSaved}</p>
              <p className="text-sm text-blue-500 mt-1">Liters</p>
            </div>

            {/* Cost Savings */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 border-2 border-emerald-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <Fuel className="w-5 h-5 text-emerald-500 opacity-20" />
              </div>
              <p className="text-emerald-600 text-sm font-medium">Cost Savings</p>
              <p className="text-3xl font-bold text-emerald-700 mt-2">Rs. {Math.round(stats.moneySaved).toLocaleString()}</p>
              <p className="text-sm text-emerald-600 mt-1">Daily</p>
            </div>

            {/* Peak Hour */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 border-2 border-purple-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <Fuel className="w-5 h-5 text-purple-500 opacity-20" />
              </div>
              <p className="text-purple-600 text-sm font-medium">Peak Hour</p>
              <div className="text-3xl font-bold text-purple-700 mt-2">
                {peakHour?.hour}
              </div>
              <p className="text-sm text-purple-600 mt-1">{peakHour?.predicted_kw} kW</p>
            </div>
          </div>

          {/* Stats Summary Card */}
          <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl lg:rounded-3xl p-8 border-2 border-blue-800 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Fuel Savings */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-blue-300 text-sm font-medium">Fuel Saved</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-400">{stats.litersSaved}</p>
                    <p className="text-white font-medium">Liters</p>
                  </div>
                </div>

                {/* Cost Savings */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-blue-300 text-sm font-medium">Cost Saved</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">Rs. {Math.round(stats.moneySaved).toLocaleString()}</p>
                    <p className="text-white font-medium">LKR</p>
                  </div>
                </div>

                {/* CO2 Avoided */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Wind className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-blue-300 text-sm font-medium">CO₂ Avoided</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">{stats.co2Avoided}</p>
                    <p className="text-white font-medium">kg CO₂</p>
                  </div>
                </div>

                {/* Trees Equivalent */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center">
                      <TreePine className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-blue-300 text-sm font-medium">Trees Equivalent</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-lime-400">{stats.treesEquivalent}</p>
                    <p className="text-white font-medium">Trees</p>
                  </div>
                </div>
              </div>
            </div>

            <Fuel className="absolute -right-10 -bottom-10 text-white/5" size={200} />
          </div>

          {/* Hourly Breakdown Table */}
          <div className="bg-white rounded-2xl lg:rounded-3xl border-2 border-blue-100 overflow-hidden shadow-lg">
            <div className="p-5 lg:p-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-950 to-blue-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Hourly Diesel Savings</h3>
                    <p className="text-xs text-blue-300">Fuel offset per hour based on AI prediction</p>
                  </div>
                </div>
                <span className="text-sm text-blue-300">{hourlyData.length} hours</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-4 text-left text-xs font-bold text-blue-950 uppercase">Time</th>
                    <th className="p-4 text-center text-xs font-bold text-blue-950 uppercase">Temperature</th>
                    <th className="p-4 text-center text-xs font-bold text-blue-950 uppercase">Solar (kW)</th>
                    <th className="p-4 text-center text-xs font-bold text-blue-950 uppercase">Diesel Saved (L)</th>
                    <th className="p-4 text-right text-xs font-bold text-blue-950 uppercase">Cost Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyData.map((row, i) => {
                    const dieselSaved = row.predicted_kw * LITERS_PER_KWH;
                    const costSaved = dieselSaved * DIESEL_PRICE;
                    const isPeak = row.predicted_kw === peakHour?.predicted_kw;

                    return (
                      <tr
                        key={i}
                        className={`border-b border-blue-100 hover:bg-orange-50 transition-colors ${isPeak ? 'bg-orange-50' : i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'
                          }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPeak ? 'bg-orange-500' : 'bg-blue-100'
                              }`}>
                              <Clock className={`w-5 h-5 ${isPeak ? 'text-white' : 'text-blue-600'}`} />
                            </div>
                            <span className="font-bold text-blue-950">{row.hour}</span>
                            {isPeak && (
                              <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Peak</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-2 bg-blue-950 px-3 py-1.5 rounded-full">
                            <span className="font-semibold text-white">{row.predicted_temp}°C</span>
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-orange-500">{row.predicted_kw} kW</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-blue-600">{dieselSaved.toFixed(2)} L</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-bold text-emerald-600">Rs. {Math.round(costSaved).toLocaleString()}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-950">
                    <td className="p-4 text-white font-bold" colSpan={2}>Daily Total</td>
                    <td className="p-4 text-center">
                      <span className="text-lg font-bold text-orange-400">{stats.todayKwh} kWh</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-lg font-bold text-blue-300">{stats.litersSaved} L</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-lg font-bold text-white">Rs. {Math.round(stats.moneySaved).toLocaleString()}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 border-blue-100 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-950">Environmental Impact</h3>
                <p className="text-sm text-blue-600">Benefits from avoiding diesel combustion</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CO2 Avoided */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Wind size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700">CO₂ Avoided</p>
                    <p className="text-xs text-emerald-600">Emissions prevented</p>
                  </div>
                </div>
                <p className="text-4xl font-black text-emerald-600">{stats.co2Avoided}</p>
                <p className="text-lg text-emerald-500 font-medium">kg CO₂</p>
                <p className="text-xs text-emerald-600 mt-2">@ 2.68 kg CO₂ per liter diesel</p>
              </div>

              {/* Trees Equivalent */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <TreePine size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Trees Equivalent</p>
                    <p className="text-xs text-green-600">Annual absorption</p>
                  </div>
                </div>
                <p className="text-4xl font-black text-green-600">{stats.treesEquivalent}</p>
                <p className="text-lg text-green-500 font-medium">Trees</p>
                <div className="flex gap-1 mt-3 flex-wrap">
                  {[...Array(Math.min(stats.treesEquivalent, 8))].map((_, i) => (
                    <TreePine key={i} size={18} className="text-green-500" />
                  ))}
                  {stats.treesEquivalent > 8 && (
                    <span className="text-xs text-green-600 font-medium">+{stats.treesEquivalent - 8}</span>
                  )}
                </div>
              </div>

              {/* Combustion Avoided */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <Flame size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700">Combustion Avoided</p>
                    <p className="text-xs text-red-600">Diesel burning prevented</p>
                  </div>
                </div>
                <p className="text-4xl font-black text-red-600">{stats.litersSaved}</p>
                <p className="text-lg text-red-500 font-medium">Liters</p>
                <p className="text-xs text-red-600 mt-2">Clean solar energy instead</p>
              </div>
            </div>
          </div>

          {/* Calculation Parameters */}
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 border-blue-100 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-950 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-950">Calculation Parameters</h3>
                <p className="text-sm text-blue-600">Conversion factors used</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Solar Output</p>
                <p className="text-2xl font-bold text-orange-500 mt-2">{stats.todayKwh}</p>
                <p className="text-sm text-blue-950 font-medium">kWh</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-950 mt-2">0.199</p>
                <p className="text-sm text-blue-600 font-medium">L/kWh</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Diesel Price</p>
                <p className="text-2xl font-bold text-blue-950 mt-2">Rs. 283</p>
                <p className="text-sm text-blue-600 font-medium">per Liter</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Total Saved</p>
                <p className="text-2xl font-bold text-emerald-500 mt-2">Rs. {Math.round(stats.moneySaved).toLocaleString()}</p>
                <p className="text-sm text-blue-600 font-medium">{stats.litersSaved} L × 283</p>
              </div>
            </div>
          </div>

          {/* Info Footer */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shrink-0">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-purple-800">AI Model Information</h4>
                <p className="text-purple-700 text-sm mt-1 leading-relaxed">
                  Solar generation predictions are from our AI model.
                  Diesel savings calculated using <strong>0.199 L/kWh</strong> conversion rate
                  and current market price of <strong>Rs.283/L</strong>.
                  CO₂ calculations based on <strong>2.68 kg CO₂</strong> per liter of diesel combustion.
                </p>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* ══  NEW: Diesel Savings Predictor Section  ══════ */}
          {/* ═══════════════════════════════════════════════════ */}
          <div id="diesel-predictor" className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl lg:rounded-3xl p-6 lg:p-10 border-2 border-blue-800 relative overflow-hidden scroll-mt-20">
            <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96">
              <div className="absolute inset-0 bg-orange-500 rounded-full opacity-10 blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-1 bg-orange-500 rounded-full"></div>
                <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">AI Powered Prediction</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Diesel Savings Predictor</h2>
              <p className="text-blue-300 text-sm max-w-2xl">
                Select a date and hour range to predict how much diesel your solar panels will offset.
                Based on power plant requirements: {STARTUP_DIESEL_MIN}–{STARTUP_DIESEL_MAX}L startup + {DIESEL_PER_HOUR.toLocaleString()}L/hr operation.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <div className="flex items-center gap-2 bg-blue-800/50 px-3 py-1.5 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-white font-medium">AI Forecast</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-800/50 px-3 py-1.5 rounded-lg">
                  <Factory className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-white font-medium">Gas Turbine Model</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-800/50 px-3 py-1.5 rounded-lg">
                  <Gauge className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-white font-medium">{DIESEL_PER_HOUR.toLocaleString()} L/hr</span>
                </div>
              </div>
            </div>
            <Fuel className="absolute -right-10 -bottom-10 text-white/5" size={200} />
          </div>

          {/* Predictor Input & Results */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            {/* Input Panel */}
            <div className="xl:col-span-4">
              <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 border-blue-100 shadow-lg sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-950 rounded-2xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-blue-950">Prediction Settings</h2>
                    <p className="text-sm text-blue-600">Configure diesel forecast</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-blue-950 mb-3">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={predDate}
                      min={today}
                      className="w-full p-4 rounded-xl border-2 border-blue-200 bg-blue-50 focus:border-orange-500 focus:bg-white outline-none transition-all text-blue-950 font-medium"
                      onChange={(e) => setPredDate(e.target.value)}
                    />
                  </div>

                  {/* Hours */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-blue-950 mb-3">
                        <Clock className="w-4 h-4 text-orange-500" />
                        Start Hour
                      </label>
                      <div className="relative">
                        <input
                          type="number" min="0" max="23"
                          value={predStartHour}
                          className="w-full p-4 rounded-xl border-2 border-blue-200 bg-blue-50 focus:border-orange-500 focus:bg-white outline-none transition-all text-blue-950 font-bold text-center text-xl"
                          onChange={(e) => setPredStartHour(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 text-sm">:00</span>
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-blue-950 mb-3">
                        <Clock className="w-4 h-4 text-orange-500" />
                        End Hour
                      </label>
                      <div className="relative">
                        <input
                          type="number" min="0" max="23"
                          value={predEndHour}
                          className="w-full p-4 rounded-xl border-2 border-blue-200 bg-blue-50 focus:border-orange-500 focus:bg-white outline-none transition-all text-blue-950 font-bold text-center text-xl"
                          onChange={(e) => setPredEndHour(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 text-sm">:00</span>
                      </div>
                    </div>
                  </div>

                  {/* Range Display */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-blue-600 mb-1">Prediction Range</p>
                    <p className="text-lg font-bold text-blue-950">
                      {predStartHour}:00 – {predEndHour}:00
                      <span className="text-sm font-normal text-blue-500 ml-2">({predHours} hours)</span>
                    </p>
                  </div>

                  {/* Power Plant Info */}
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">Power Plant Diesel Usage</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-orange-600">Startup (Gas Turbine)</span>
                        <span className="font-bold text-orange-800">{STARTUP_DIESEL_MIN}–{STARTUP_DIESEL_MAX} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600">Operation ({predHours}h)</span>
                        <span className="font-bold text-orange-800">{predOperationDiesel.toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between border-t border-orange-200 pt-1.5 mt-1.5">
                        <span className="text-orange-700 font-semibold">Total Needed</span>
                        <span className="font-bold text-orange-900">{Math.round(predTotalDieselNeeded).toLocaleString()} L</span>
                      </div>
                    </div>
                  </div>

                  {/* Predict Button */}
                  <button
                    onClick={handleDieselPredict}
                    disabled={predLoading || !predDate}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 text-lg ${predLoading || !predDate
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] shadow-lg shadow-orange-200'
                      }`}
                  >
                    {predLoading ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Predicting...</>
                    ) : (
                      <><Fuel className="w-5 h-5" /> Predict Diesel Savings <ChevronRight className="w-5 h-5" /></>
                    )}
                  </button>

                  {predResult && (
                    <button
                      onClick={handlePredReset}
                      className="w-full py-3 rounded-xl border-2 border-blue-200 text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Reset & New Prediction
                    </button>
                  )}

                  {!predDate && (
                    <p className="text-center text-sm text-blue-500">ⓘ Please select a date to continue</p>
                  )}
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="xl:col-span-8 space-y-6">
              {predError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">{predError}</p>
                    <p className="text-red-600 text-sm">Check connection and try again.</p>
                  </div>
                </div>
              )}

              {predResult ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">AI</span>
                      </div>
                      <p className="text-sm text-blue-600 font-medium">Solar Generation</p>
                      <p className="text-2xl font-bold text-blue-950 mt-1">{predTotalKwh} <span className="text-sm font-medium text-blue-400">kWh</span></p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center"><Droplets className="w-5 h-5 text-white" /></div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Saved</span>
                      </div>
                      <p className="text-sm text-blue-600 font-medium">Diesel Offset</p>
                      <p className="text-2xl font-bold text-blue-950 mt-1">{predDieselSaved.toFixed(1)} <span className="text-sm font-medium text-blue-400">L</span></p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border-2 border-emerald-100 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center"><Banknote className="w-5 h-5 text-white" /></div>
                      </div>
                      <p className="text-sm text-emerald-600 font-medium">Cost Saved</p>
                      <p className="text-2xl font-bold text-emerald-700 mt-1">Rs. {Math.round(predCostSaved).toLocaleString()}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border-2 border-green-100 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center"><Wind className="w-5 h-5 text-white" /></div>
                      </div>
                      <p className="text-sm text-green-600 font-medium">CO₂ Avoided</p>
                      <p className="text-2xl font-bold text-green-700 mt-1">{predCo2Saved.toFixed(1)} <span className="text-sm font-medium text-green-400">kg</span></p>
                    </div>
                  </div>

                  {/* Operational Diesel Insight */}
                  <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-6 lg:p-8 border-2 border-blue-800 shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center"><Factory className="w-5 h-5 text-white" /></div>
                        <div>
                          <h3 className="font-bold text-white">Operational Diesel Analysis</h3>
                          <p className="text-xs text-blue-300">For {predDate} • {predStartHour}:00–{predEndHour}:00 ({predHours}h)</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-blue-300 text-xs font-medium mb-1">Startup Diesel</p>
                          <p className="text-2xl font-bold text-orange-400">{STARTUP_DIESEL_MIN}–{STARTUP_DIESEL_MAX}</p>
                          <p className="text-white/70 text-sm">Liters</p>
                        </div>
                        <div>
                          <p className="text-blue-300 text-xs font-medium mb-1">Operation ({predHours}h)</p>
                          <p className="text-2xl font-bold text-blue-300">{predOperationDiesel.toLocaleString()}</p>
                          <p className="text-white/70 text-sm">Liters</p>
                        </div>
                        <div>
                          <p className="text-blue-300 text-xs font-medium mb-1">Solar Offset</p>
                          <p className="text-2xl font-bold text-emerald-400">−{predDieselSaved.toFixed(1)}</p>
                          <p className="text-white/70 text-sm">Liters saved</p>
                        </div>
                        <div>
                          <p className="text-blue-300 text-xs font-medium mb-1">Net Diesel Needed</p>
                          <p className="text-2xl font-bold text-white">{Math.round(predNetDieselNeeded).toLocaleString()}</p>
                          <p className="text-white/70 text-sm">Liters</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-blue-300">Solar Diesel Offset</span>
                          <span className="text-sm font-bold text-orange-400">{predPercentOffset.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-3 bg-blue-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-700"
                            style={{ width: `${predPercentOffset}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <Gauge className="absolute -right-8 -bottom-8 text-white/5" size={180} />
                  </div>

                  {/* Hourly Diesel Savings Table */}
                  <div className="bg-white rounded-2xl lg:rounded-3xl border-2 border-blue-100 overflow-hidden shadow-lg">
                    <div className="p-5 lg:p-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-950 to-blue-900">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-white" /></div>
                          <div>
                            <h3 className="font-bold text-white">Predicted Hourly Diesel Savings</h3>
                            <p className="text-xs text-blue-300">For {predDate}</p>
                          </div>
                        </div>
                        <span className="text-sm text-blue-300">{predResult.breakdown.length} hours</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-blue-50">
                            <th className="p-4 text-left text-xs font-bold text-blue-950 uppercase">Time</th>
                            <th className="p-4 text-center text-xs font-bold text-blue-950 uppercase">Temp</th>
                            <th className="p-4 text-center text-xs font-bold text-blue-950 uppercase">Solar (kW)</th>
                            <th className="p-4 text-center text-xs font-bold text-blue-950 uppercase">Diesel Saved (L)</th>
                            <th className="p-4 text-right text-xs font-bold text-blue-950 uppercase">Cost Saved</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predResult.breakdown.map((row, i) => {
                            const rowDiesel = row.predicted_kw * LITERS_PER_KWH;
                            const rowCost = rowDiesel * DIESEL_PRICE;
                            return (
                              <tr key={i} className={`border-b border-blue-100 hover:bg-orange-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <Clock className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="font-bold text-blue-950">{row.hour}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <span className="inline-flex items-center bg-blue-950 px-3 py-1 rounded-full">
                                    <span className="font-semibold text-white text-sm">{row.predicted_temp}°C</span>
                                  </span>
                                </td>
                                <td className="p-4 text-center"><span className="text-lg font-bold text-orange-500">{row.predicted_kw} kW</span></td>
                                <td className="p-4 text-center"><span className="text-lg font-bold text-blue-600">{rowDiesel.toFixed(2)} L</span></td>
                                <td className="p-4 text-right"><span className="font-bold text-emerald-600">Rs. {Math.round(rowCost).toLocaleString()}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-950">
                            <td className="p-4 text-white font-bold" colSpan={2}>Prediction Total</td>
                            <td className="p-4 text-center"><span className="text-lg font-bold text-orange-400">{predTotalKwh} kWh</span></td>
                            <td className="p-4 text-center"><span className="text-lg font-bold text-blue-300">{predDieselSaved.toFixed(1)} L</span></td>
                            <td className="p-4 text-right"><span className="text-lg font-bold text-white">Rs. {Math.round(predCostSaved).toLocaleString()}</span></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl lg:rounded-3xl border-2 border-dashed border-blue-200 p-8 shadow-lg">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-950 to-blue-900 rounded-full flex items-center justify-center mb-6 shadow-xl">
                    <Fuel className="w-12 h-12 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-950 mb-3 text-center">Ready to Predict Diesel Savings</h3>
                  <p className="text-blue-600 text-center max-w-md mb-6">
                    Select a date and time range, then click &quot;Predict Diesel Savings&quot;
                    to see how much diesel your solar panels will offset.
                  </p>
                  <div className="flex items-center gap-2 text-orange-500 mb-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Waiting for input...</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>1. Select Date</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>2. Set Hours</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>3. Predict</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="p-4 sm:p-6 lg:p-8">
          <div className="bg-blue-950 rounded-2xl p-5 lg:p-6 border-2 border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Fuel className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold">Fuel Management</span>
                <span className="text-blue-400 text-sm ml-2">v2.0</span>
              </div>
            </div>
            <p className="text-sm text-blue-300 text-center">
              Powered by AI • Solar Energy Prediction Model
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
