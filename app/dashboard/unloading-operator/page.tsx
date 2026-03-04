"use client";

import { useState, useEffect } from "react";
import {
  DropletIcon,
  CheckCircle,
  AlertCircle,
  Truck,
  Gauge,
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
}

interface UnloadData {
  tankerId: string;
  startPumpReading: number;
  endPumpReading: number;
  bayNumber: string;
  notes: string;
}

export default function UnloadingOperatorDashboard() {
  const [tankers, setTankers] = useState<Tanker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTanker, setSelectedTanker] = useState<Tanker | null>(null);
  const [unloadData, setUnloadData] = useState<UnloadData>({
    tankerId: "",
    startPumpReading: 0,
    endPumpReading: 0,
    bayNumber: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReadyTankers();
  }, []);

  const fetchReadyTankers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/tanker/ready-unload", {
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

  const handleSelectTanker = (tanker: Tanker) => {
    setSelectedTanker(tanker);
    setUnloadData({
      tankerId: tanker._id,
      startPumpReading: 0,
      endPumpReading: 0,
      bayNumber: "",
      notes: "",
    });
    setSuccess("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUnloadData({
      ...unloadData,
      [name]:
        name === "startPumpReading" || name === "endPumpReading"
          ? parseFloat(value) || 0
          : value,
    });
  };

  const handleSubmitUnload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate readings
    if (unloadData.endPumpReading <= unloadData.startPumpReading) {
      setError("End pump reading must be greater than start pump reading");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `/api/tanker/${unloadData.tankerId}/unload`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            startPumpReading: unloadData.startPumpReading,
            endPumpReading: unloadData.endPumpReading,
            bayNumber: unloadData.bayNumber,
            notes: unloadData.notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to record unloading");
      }

      setSuccess(
        `Unloading completed! Net delivered: ${data.data.netDelivered} liters`
      );

      // Clear and refresh
      setTimeout(() => {
        setSelectedTanker(null);
        setUnloadData({
          tankerId: "",
          startPumpReading: 0,
          endPumpReading: 0,
          bayNumber: "",
          notes: "",
        });
        setSuccess("");
        fetchReadyTankers();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const netDelivered =
    unloadData.endPumpReading - unloadData.startPumpReading;

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
            <DropletIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Unloading Operator
          </h1>
        </div>
        <p className="text-gray-400 ml-16">Record meter readings and complete unloading</p>
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

      {success && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-[12px] flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-green-400 font-medium">Success</p>
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tankers List */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              Ready for Unloading ({tankers.length})
            </h2>

            {tankers.length === 0 ? (
              <div className="text-center py-12">
                <DropletIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">
                  No tankers ready for unloading
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tankers.map((tanker) => (
                  <div
                    key={tanker._id}
                    onClick={() => handleSelectTanker(tanker)}
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
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Ready
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
                        <p className="text-gray-500">Invoiced</p>
                        <p className="text-[#F97316] font-bold">
                          {tanker.quantityLiters.toLocaleString()}L
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className="text-green-400 text-xs font-medium">
                          {tanker.safetyStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Unload Form */}
        {selectedTanker && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl h-fit sticky top-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-[#F97316]" />
              Record Unloading
            </h3>

            <form onSubmit={handleSubmitUnload} className="space-y-4">
              {/* Tanker Info */}
              <div className="bg-white/5 rounded-[12px] p-3 border border-white/10">
                <p className="text-gray-400 text-xs mb-1">Invoice</p>
                <p className="text-white font-bold">
                  {selectedTanker.invoiceNo}
                </p>
              </div>

              {/* Bay Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bay Number
                </label>
                <input
                  type="text"
                  name="bayNumber"
                  value={unloadData.bayNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-[8px] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                  placeholder="Bay-01"
                />
              </div>

              {/* Start Reading */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Pump Reading
                </label>
                <input
                  type="number"
                  name="startPumpReading"
                  value={unloadData.startPumpReading}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="w-full bg-white/10 border border-white/20 rounded-[8px] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                  placeholder="0.00"
                />
              </div>

              {/* End Reading */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Pump Reading
                </label>
                <input
                  type="number"
                  name="endPumpReading"
                  value={unloadData.endPumpReading}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="w-full bg-white/10 border border-white/20 rounded-[8px] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                  placeholder="0.00"
                />
              </div>

              {/* Net Delivered Display */}
              {netDelivered > 0 && (
                <div className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-[12px] p-4">
                  <p className="text-gray-400 text-sm mb-1">Net Delivered</p>
                  <p className="text-[#F97316] font-bold text-2xl">
                    {netDelivered.toLocaleString()} L
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={unloadData.notes}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-[8px] px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#F97316] resize-none"
                  placeholder="Any observations..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || netDelivered <= 0}
                className="w-full px-4 py-3 bg-[#F97316] hover:bg-[#f27a1a] disabled:opacity-50 rounded-[8px] font-bold text-white transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                {submitting
                  ? "Completing..."
                  : `Complete Unload (${netDelivered.toLocaleString()}L)`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
