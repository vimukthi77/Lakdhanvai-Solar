import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for breakdown items
export interface IBreakdownItem {
  hour: string;
  predicted_kw: number;
  predicted_temp: number;
  saving_lkr: number;
}

// Interface for Prediction document
export interface IPrediction extends Document {
  date: string;
  startHour: number;
  endHour: number;
  totalKw: number;
  totalSavings: number;
  breakdown: IBreakdownItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Breakdown Schema
const BreakdownSchema = new Schema<IBreakdownItem>({
  hour: { type: String, required: true },
  predicted_kw: { type: Number, required: true },
  predicted_temp: { type: Number, required: true },
  saving_lkr: { type: Number, required: true },
});

// Main Prediction Schema
const PredictionSchema = new Schema<IPrediction>(
  {
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    startHour: {
      type: Number,
      required: [true, 'Start hour is required'],
      min: 0,
      max: 23,
    },
    endHour: {
      type: Number,
      required: [true, 'End hour is required'],
      min: 0,
      max: 23,
    },
    totalKw: {
      type: Number,
      required: true,
      default: 0,
    },
    totalSavings: {
      type: Number,
      required: true,
      default: 0,
    },
    breakdown: {
      type: [BreakdownSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
PredictionSchema.index({ date: 1 });
PredictionSchema.index({ createdAt: -1 });

// Prevent model recompilation error in Next.js
const Prediction: Model<IPrediction> =
  mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', PredictionSchema);

export default Prediction;