"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  AlertCircle,
  CheckCircle,
  Truck,
  FileText,
} from "lucide-react";

interface TankerFormData {
  invoiceNo: string;
  orderReference: string;
  productType: "Diesel" | "Petrol" | "Kerosene";
  quantityLiters: number;
  vehicleNo: string;
  invoiceImage?: string;
}

export default function GateSecurityDashboard() {
  const router = useRouter();
  const [formData, setFormData] = useState<TankerFormData>({
    invoiceNo: "",
    orderReference: "",
    productType: "Diesel",
    quantityLiters: 0,
    vehicleNo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"form" | "review" | "submitted">("form");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "quantityLiters" ? parseFloat(value) || 0 : value.toUpperCase(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/tanker/entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create tanker entry");
      }

      setSuccess("Tanker entry created successfully!");
      setStep("submitted");

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          invoiceNo: "",
          orderReference: "",
          productType: "Diesel",
          quantityLiters: 0,
          vehicleNo: "",
        });
        setStep("form");
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-[#F97316] rounded-[12px] flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Gate Security</h1>
        </div>
        <p className="text-gray-400 ml-16">Tanker Entry & Invoice Scanning</p>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto">
        {step === "form" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 lg:p-8 shadow-2xl">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-[12px] flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-500 font-medium">Error</p>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Invoice Section */}
              <div className="bg-white/5 rounded-[16px] p-6 border border-white/10">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#F97316]" />
                  Invoice Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Invoice Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      name="invoiceNo"
                      value={formData.invoiceNo}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-[8px] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                      placeholder="INV-2024-001"
                    />
                  </div>

                  {/* Order Reference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order Reference
                    </label>
                    <input
                      type="text"
                      name="orderReference"
                      value={formData.orderReference}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-[8px] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                      placeholder="ORD-2024-001"
                    />
                  </div>
                </div>
              </div>

              {/* Product Section */}
              <div className="bg-white/5 rounded-[16px] p-6 border border-white/10">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#F97316]" />
                  Product Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Product Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Type
                    </label>
                    <select
                      name="productType"
                      value={formData.productType}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-[8px] px-4 py-3 text-white focus:outline-none focus:border-[#F97316] transition-colors"
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Kerosene">Kerosene</option>
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity (Liters)
                    </label>
                    <input
                      type="number"
                      name="quantityLiters"
                      value={formData.quantityLiters}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full bg-white/10 border border-white/20 rounded-[8px] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors"
                      placeholder="0"
                    />
                  </div>

                  {/* Vehicle Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      name="vehicleNo"
                      value={formData.vehicleNo}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-[8px] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316] transition-colors uppercase"
                      placeholder="ABC-1234"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep("review")}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-[8px] font-medium text-white transition-colors"
                >
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#F97316] hover:bg-[#f27a1a] disabled:opacity-50 rounded-[8px] font-bold text-white transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Entry"}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "review" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 lg:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Review Entry</h2>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-[12px] p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Invoice No</p>
                  <p className="text-white font-bold text-lg">
                    {formData.invoiceNo}
                  </p>
                </div>
                <div className="bg-white/5 rounded-[12px] p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Order Reference</p>
                  <p className="text-white font-bold text-lg">
                    {formData.orderReference}
                  </p>
                </div>
                <div className="bg-white/5 rounded-[12px] p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Product Type</p>
                  <p className="text-white font-bold text-lg">
                    {formData.productType}
                  </p>
                </div>
                <div className="bg-white/5 rounded-[12px] p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Quantity</p>
                  <p className="text-[#F97316] font-bold text-lg">
                    {formData.quantityLiters.toLocaleString()} L
                  </p>
                </div>
                <div className="bg-white/5 rounded-[12px] p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Vehicle No</p>
                  <p className="text-white font-bold text-lg">
                    {formData.vehicleNo}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep("form")}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-[8px] font-medium text-white transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#F97316] hover:bg-[#f27a1a] disabled:opacity-50 rounded-[8px] font-bold text-white transition-colors disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        )}

        {step === "submitted" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-[24px] p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              Entry Submitted Successfully!
            </h2>
            <p className="text-gray-300">
              The tanker has been registered and is awaiting safety inspection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
