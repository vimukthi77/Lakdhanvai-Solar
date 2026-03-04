"use client";

import React, { useState } from 'react';
import {
  Mail,
  MessageSquare,
  Bell,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Loader2,
  Phone,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Activity,
  TrendingUp
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

interface PredictionData {
  date: string;
  totalKw: number;
  totalSavings: number;
  peakHour: string;
  peakKw: number;
  avgTemp: number;
}

export default function NotificationsPage() {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [reportStatus, setReportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [lastPrediction, setLastPrediction] = useState<PredictionData | null>(null);
  const [reportResult, setReportResult] = useState<{sms: boolean; email: boolean} | null>(null);

  // Send Test SMS (Simple)
  const sendTestSMS = async () => {
    setSendingSMS(true);
    setSmsStatus('idle');
    setStatusMessage('');
    
    try {
      const response = await fetch('/api/test-sms');
      const result = await response.json();
      
      setSmsStatus(result.success ? 'success' : 'error');
      setStatusMessage(result.message);
    } catch (error) {
      setSmsStatus('error');
      setStatusMessage('Failed to connect to server');
    }
    
    setSendingSMS(false);
  };

  // Send REAL Prediction SMS
  const sendRealPredictionSMS = async () => {
    setSendingSMS(true);
    setSmsStatus('idle');
    setStatusMessage('Fetching AI prediction...');
    
    try {
      const response = await fetch('/api/test-sms', { method: 'POST' });
      const result = await response.json();
      
      setSmsStatus(result.success ? 'success' : 'error');
      setStatusMessage(result.message);
      
      if (result.prediction) {
        setLastPrediction(result.prediction);
      }
    } catch (error) {
      setSmsStatus('error');
      setStatusMessage('Failed to connect to server');
    }
    
    setSendingSMS(false);
  };

  // Send Test Email
  const sendTestEmail = async () => {
    setSendingEmail(true);
    setEmailStatus('idle');
    setStatusMessage('');
    
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test' }),
      });
      const result = await response.json();
      
      setEmailStatus(result.success ? 'success' : 'error');
      setStatusMessage(result.message);
    } catch (error) {
      setEmailStatus('error');
      setStatusMessage('Failed to connect to server');
    }
    
    setSendingEmail(false);
  };

  // Trigger Full Morning Report (SMS + Email)
  const triggerMorningReport = async () => {
    setSendingReport(true);
    setReportStatus('idle');
    setReportResult(null);
    setStatusMessage('🤖 Connecting to AI model...');
    
    try {
      const response = await fetch('/api/cron/morning-report', { method: 'POST' });
      const result = await response.json();
      
      setReportStatus(result.success ? 'success' : 'error');
      
      if (result.success) {
        setReportResult(result.notifications);
        setLastPrediction({
          date: result.date,
          totalKw: result.prediction.totalKw,
          totalSavings: result.prediction.totalSavings,
          peakHour: result.prediction.peakHour,
          peakKw: result.prediction.peakKw,
          avgTemp: result.prediction.avgTemp,
        });
        setStatusMessage('Report generated successfully!');
      } else {
        setStatusMessage(result.error || 'Failed to generate report');
      }
    } catch (error) {
      setReportStatus('error');
      setStatusMessage('Failed to connect to server');
    }
    
    setSendingReport(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-950 to-blue-900 border-b-2 border-orange-500 sticky top-0 z-40">
          <div className="px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Notifications</h1>
                  <p className="text-blue-300 text-sm">SMS & Email Alerts • Real AI Data</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-xl border border-green-500/30">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">AI Connected</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-6">
          
          {/* Main Action Card - Trigger Report */}
          <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 rounded-3xl p-8 border-2 border-blue-800 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Send AI Report Now</h2>
                  <p className="text-blue-300">
                    Fetch real prediction & send via SMS + Email
                  </p>
                </div>
              </div>

              <button
                onClick={triggerMorningReport}
                disabled={sendingReport}
                className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/30"
              >
                {sendingReport ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {statusMessage || 'Generating Report...'}
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    Generate & Send Today&apos;s Report
                  </>
                )}
              </button>

              {/* Report Result */}
              {reportStatus === 'success' && reportResult && (
                <div className="mt-6 bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <span className="text-white font-semibold">Report Sent Successfully!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${reportResult.sms ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">SMS</span>
                        {reportResult.sms ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                        )}
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl ${reportResult.email ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">Email</span>
                        {reportResult.email ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {reportStatus === 'error' && (
                <div className="mt-6 bg-red-500/20 rounded-2xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <span className="text-red-200">{statusMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Last Prediction Data */}
          {lastPrediction && (
            <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-blue-950">Latest AI Prediction</h3>
                <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">Live Data</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                  <p className="text-sm text-orange-600 font-medium">Energy</p>
                  <p className="text-2xl font-bold text-orange-600">{lastPrediction.totalKw} kWh</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">Savings</p>
                  <p className="text-2xl font-bold text-green-600">Rs.{lastPrediction.totalSavings.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Peak Hour</p>
                  <p className="text-2xl font-bold text-blue-600">{lastPrediction.peakHour}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <p className="text-sm text-purple-600 font-medium">Avg Temp</p>
                  <p className="text-2xl font-bold text-purple-600">{lastPrediction.avgTemp}°C</p>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Info */}
          <div className="bg-blue-950 rounded-2xl p-6 border-2 border-blue-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Automated Daily Report</h3>
                <p className="text-blue-300">
                  Every day at <span className="text-orange-400 font-bold text-xl">8:00 AM</span> Sri Lanka Time
                </p>
                <p className="text-blue-400 text-sm mt-1">
                  📱 SMS to 0750569545 + 📧 Email to jayasooriyashehan4@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Individual Test Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SMS Card */}
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-950">SMS Notifications</h3>
                    <p className="text-blue-600 text-sm">Notify.lk</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 text-xs font-semibold">Active</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 mb-4 flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="text-blue-950 font-semibold">0750 569 545</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={sendTestSMS}
                  disabled={sendingSMS}
                  className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
                >
                  {sendingSMS ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Test SMS
                </button>
                <button
                  onClick={sendRealPredictionSMS}
                  disabled={sendingSMS}
                  className="py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
                >
                  {sendingSMS ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Real Data
                </button>
              </div>

              {smsStatus === 'success' && (
                <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">SMS sent to 0750569545!</span>
                </div>
              )}
              {smsStatus === 'error' && (
                <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{statusMessage}</span>
                </div>
              )}
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-950 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-950">Email Notifications</h3>
                    <p className="text-blue-600 text-sm">Gmail SMTP</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 text-xs font-semibold">Active</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 mb-4 flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-blue-950 font-medium text-sm">jayasooriyashehan4@gmail.com</span>
              </div>

              <button
                onClick={sendTestEmail}
                disabled={sendingEmail}
                className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Test Email
              </button>

              {emailStatus === 'success' && (
                <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Email sent!</span>
                </div>
              )}
              {emailStatus === 'error' && (
                <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{statusMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* SMS Preview */}
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-lg">
            <h3 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              SMS Preview (Modern Format)
            </h3>
            <div className="bg-gray-900 rounded-2xl p-6 font-mono text-sm text-green-400 leading-relaxed">
              <pre className="whitespace-pre-wrap">
{`☀️ LAKDHANVI SOLAR
━━━━━━━━━━━━━━━━━
📅 Mon, Jan 15, 2024

⚡ 156.8 kWh
💰 Rs.5,488
🔥 Peak: 12:00 (18.5kW)
🌡️ 32°C
🌱 CO₂: 78.4kg

━━━━━━━━━━━━━━━━━
🤖 AI Powered Report`}
              </pre>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}