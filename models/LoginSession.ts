import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoginSession extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    userName: string;
    userRole: string;
    loginTime: Date;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const LoginSessionSchema = new Schema<ILoginSession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        userRole: {
            type: String,
            required: true,
        },
        loginTime: {
            type: Date,
            default: Date.now,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
LoginSessionSchema.index({ userId: 1, loginTime: -1 });
LoginSessionSchema.index({ loginTime: -1 });

const LoginSession: Model<ILoginSession> =
    mongoose.models.LoginSession ||
    mongoose.model<ILoginSession>('LoginSession', LoginSessionSchema);

export default LoginSession;
