"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Truck,
  FileText,
} from "lucide-react";

interface Tanker {
  _id: string;
  invoiceNo: string;
  orderReference: string;
  productType: string;
  quantityLiters: number;
  vehicleNo: string;
  status: string;
  safetyStatus: string;
  createdAt: string;
  createdBy: { name: string; email: string };
}

export default function SafetyOfficerDashboard() {
  const [tankers, setTankers] = useState<Tanker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTanker, setSelectedTanker] = useState<Tanker | null>(null);
  const [safetyNotes, setSafetyNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingTankers();
  }, []);

  const fetchPendingTankers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/tanker/pending-safety", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tankers");
      }

      setTankers(data.data);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSafetyCheck = async (
    tankerId: string,
    passed: boolean
  ) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`/api/tanker/${tankerId}/safety-check`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          safetyStatus: passed ? "PASSED" : "FAILED",
          safetyNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update safety check");
      }

      // Remove from list and refresh
      setSelectedTanker(null);
      setSafetyNotes("");
      fetchPendingTankers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-[#F97316] rounded-[12px] flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Safety Officer</h1>
        </div>
        <p className="text-gray-400 ml-16">
          Inspect tankers and approve for unloading
        </p>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-[12px] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-500 font-medium">Error</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tankers List */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              Pending Safety Checks ({tankers.length})
            </h2>

            {tankers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-400">All tankers have been inspected!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tankers.map((tanker) => (
                  <div
                    key={tanker._id}
                    onClick={() => setSelectedTanker(tanker)}
                    className={`p-4 rounded-[12px] border cursor-pointer transition-colors ${
                      selectedTanker?._id === tanker._id
                        ? "bg-[#F97316]/10 border-[#F97316]"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-bold">
                          {tanker.invoiceNo}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {tanker.vehicleNo}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-400 text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Product</p>
                        <p className="text-white font-medium">
                          {tanker.productType}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Quantity</p>
                        <p className="text-[#F97316] font-bold">
                          {tanker.quantityLiters.toLocaleString()}L
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Submitted By</p>
                        <p className="text-white text-xs">
                          {tanker.createdBy.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedTanker && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl h-fit sticky top-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F97316]" />
              Inspection Details
            </h3>

            <div className="space-y-4 mb-6">
              {/* Invoice Section */}
              <div className="bg-white/5 rounded-[12px] p-3 border border-white/10">
                <p className="text-gray-400 text-xs mb-1">Invoice Number</p>
                <p className="text-white font-bold">
                  {selectedTanker.invoiceNo}
                </p>
              </div>

              {/* Vehicle Section */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-[12px] p-3 border border-white/10">
                  <p className="text-gray-400 text-xs mb-1">Vehicle</p>
                  <p className="text-white font-bold text-sm">
                    {selectedTanker.vehicleNo}
                  </p>
                </div>
                <div className="bg-white/5 rounded-[12px] p-3 border border-white/10">
                  <p className="text-gray-400 text-xs mb-1">Product</p>
                  <p className="text-white font-bold text-sm">
                    {selectedTanker.productType}
                  </p>
                </div>
              </div>

              {/* Quantity */}
              <div className="bg-white/5 rounded-[12px] p-3 border border-white/10">
                <p className="text-gray-400 text-xs mb-1">Quantity</p>
                <p className="text-[#F97316] font-bold text-xl">
                  {selectedTanker.quantityLiters.toLocaleString()} L
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Inspection Notes
                </label>
                <textarea
                  value={safetyNotes}
                  onChange={(e) => setSafetyNotes(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-[8px] px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#F97316] resize-none"
                  placeholder="Record your inspection findings..."
                  rows={4}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() =>
                  handleSafetyCheck(selectedTanker._id, true)
                }
                disabled={submitting}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-[8px] font-bold text-white transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                {submitting ? "Submitting..." : "Approve (PASSED)"}
              </button>
              <button
                onClick={() =>
                  handleSafetyCheck(selectedTanker._id, false)
                }
                disabled={submitting}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-[8px] font-bold text-white transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                {submitting ? "Submitting..." : "Reject (FAILED)"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
