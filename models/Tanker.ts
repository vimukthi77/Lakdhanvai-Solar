import mongoose, { Schema, Document, Model } from 'mongoose';

export type TankerStatus = 'PENDING_ENTRY' | 'PENDING_SAFETY' | 'READY_TO_UNLOAD' | 'COMPLETED' | 'REJECTED';
export type SafetyStatus = 'PASSED' | 'FAILED' | 'PENDING';
export type ProductType = 'Diesel' | 'Petrol' | 'Kerosene';

export interface ITanker extends Document {
  // Status tracking
  status: TankerStatus;
  
  // Gate Security Entry (OCR Data)
  invoiceNo: string;
  orderReference: string;
  productType: ProductType;
  quantityLiters: number;
  vehicleNo: string;
  invoiceImage?: string; // URL to scanned image
  
  // Safety Officer Review
  safetyCheckedBy?: mongoose.Types.ObjectId;
  safetyCheckDate?: Date;
  safetyStatus?: SafetyStatus;
  safetyNotes?: string;
  
  // Unloading Operator Entry
  unloadedBy?: mongoose.Types.ObjectId;
  startPumpReading: number;
  endPumpReading: number;
  netDelivered?: number; // Auto-calculated: endPumpReading - startPumpReading
  unloadDate?: Date;
  bayNumber?: string;
  
  // Metadata
  createdBy: mongoose.Types.ObjectId; // Gate Security User._id
  createdAt: Date;
  updatedAt: Date;
}

const TankerSchema = new Schema<ITanker>(
  {
    status: {
      type: String,
      enum: ['PENDING_ENTRY', 'PENDING_SAFETY', 'READY_TO_UNLOAD', 'COMPLETED', 'REJECTED'],
      default: 'PENDING_ENTRY',
      required: true,
    },
    
    // Gate Security Entry
    invoiceNo: {
      type: String,
      required: [true, 'Invoice number is required'],
      trim: true,
      unique: true,
    },
    orderReference: {
      type: String,
      required: [true, 'Order reference is required'],
      trim: true,
    },
    productType: {
      type: String,
      enum: ['Diesel', 'Petrol', 'Kerosene'],
      required: [true, 'Product type is required'],
    },
    quantityLiters: {
      type: Number,
      required: [true, 'Quantity in liters is required'],
      min: [0, 'Quantity must be positive'],
    },
    vehicleNo: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true,
      uppercase: true,
    },
    invoiceImage: {
      type: String,
      default: null,
    },
    
    // Safety Officer Review
    safetyCheckedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    safetyCheckDate: {
      type: Date,
      default: null,
    },
    safetyStatus: {
      type: String,
      enum: ['PASSED', 'FAILED', 'PENDING'],
      default: 'PENDING',
    },
    safetyNotes: {
      type: String,
      default: '',
    },
    
    // Unloading Operator
    unloadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    startPumpReading: {
      type: Number,
      default: 0,
    },
    endPumpReading: {
      type: Number,
      default: 0,
    },
    netDelivered: {
      type: Number,
      default: null,
    },
    unloadDate: {
      type: Date,
      default: null,
    },
    bayNumber: {
      type: String,
      default: '',
    },
    
    // Metadata
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TankerSchema.index({ status: 1 });
TankerSchema.index({ vehicleNo: 1 });
TankerSchema.index({ invoiceNo: 1 });
TankerSchema.index({ createdAt: -1 });
TankerSchema.index({ safetyStatus: 1, status: 1 });
TankerSchema.index({ createdBy: 1, createdAt: -1 });

// Pre-save hook to auto-calculate netDelivered
TankerSchema.pre('save', function (next) {
  if (this.startPumpReading > 0 && this.endPumpReading > 0) {
    this.netDelivered = this.endPumpReading - this.startPumpReading;
  }
  next();
});

const Tanker: Model<ITanker> =
  mongoose.models.Tanker || mongoose.model<ITanker>('Tanker', TankerSchema);

export default Tanker;
