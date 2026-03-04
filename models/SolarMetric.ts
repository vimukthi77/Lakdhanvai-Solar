import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISolarMetric extends Document {
  date: Date;
  totalDieselReceived: number; // Liters
  currentStockLevel: number; // Liters
  fuelUsedToday: number; // Liters
  solarKwh: number;
  dieselSavedLiters: number; // solarKwh * 0.199
  costSavings: number; // solarKwh * 56.35 (LKR)
  createdAt: Date;
  updatedAt: Date;
}

const SolarMetricSchema = new Schema<ISolarMetric>(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
      unique: true,
    },
    totalDieselReceived: {
      type: Number,
      required: [true, 'Total diesel received is required'],
      default: 0,
      min: [0, 'Must be non-negative'],
    },
    currentStockLevel: {
      type: Number,
      required: [true, 'Current stock level is required'],
      default: 0,
      min: [0, 'Must be non-negative'],
    },
    fuelUsedToday: {
      type: Number,
      required: [true, 'Fuel used is required'],
      default: 0,
      min: [0, 'Must be non-negative'],
    },
    solarKwh: {
      type: Number,
      required: [true, 'Solar kWh is required'],
      default: 0,
      min: [0, 'Must be non-negative'],
    },
    dieselSavedLiters: {
      type: Number,
      required: [true, 'Diesel saved is required'],
      default: 0,
      min: [0, 'Must be non-negative'],
    },
    costSavings: {
      type: Number,
      required: [true, 'Cost savings is required'],
      default: 0,
      min: [0, 'Must be non-negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SolarMetricSchema.index({ date: -1 });
SolarMetricSchema.index({ createdAt: -1 });

const SolarMetric: Model<ISolarMetric> =
  mongoose.models.SolarMetric || mongoose.model<ISolarMetric>('SolarMetric', SolarMetricSchema);

export default SolarMetric;
