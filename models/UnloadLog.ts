import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUnloadLog extends Document {
  tankerId: mongoose.Types.ObjectId;
  operatorId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  startPumpReading: number;
  endPumpReading: number;
  netDelivered: number;
  productType: string;
  bayNumber: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UnloadLogSchema = new Schema<IUnloadLog>(
  {
    tankerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tanker',
      required: [true, 'Tanker ID is required'],
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Operator ID is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    startPumpReading: {
      type: Number,
      required: [true, 'Start pump reading is required'],
      min: [0, 'Reading must be non-negative'],
    },
    endPumpReading: {
      type: Number,
      required: [true, 'End pump reading is required'],
      min: [0, 'Reading must be non-negative'],
    },
    netDelivered: {
      type: Number,
      required: [true, 'Net delivered quantity is required'],
      min: [0, 'Quantity must be positive'],
    },
    productType: {
      type: String,
      enum: ['Diesel', 'Petrol', 'Kerosene'],
      required: [true, 'Product type is required'],
    },
    bayNumber: {
      type: String,
      required: [true, 'Bay number is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UnloadLogSchema.index({ tankerId: 1 });
UnloadLogSchema.index({ operatorId: 1 });
UnloadLogSchema.index({ createdAt: -1 });
UnloadLogSchema.index({ productType: 1, createdAt: -1 });

const UnloadLog: Model<IUnloadLog> =
  mongoose.models.UnloadLog || mongoose.model<IUnloadLog>('UnloadLog', UnloadLogSchema);

export default UnloadLog;
