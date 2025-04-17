// models/Driver.ts
import mongoose, { Schema } from 'mongoose';

export interface Driver extends Document {
    firstName: string;
    lastName: string;
    licenseNumber: string;
    phoneNumber: string;
    email: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

const DriverSchema: Schema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            minlength: 2,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            minlength: 2,
        },
        licenseNumber: {
            type: String,
            required: [true, 'License number is required'],
            unique: true,
            uppercase: true,
            match: /^[A-Z0-9\-]+$/, // Alphanumeric with dashes
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            match: /^\+?\d{10,15}$/, // International format
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            match: /^\S+@\S+\.\S+$/,
        },
        address: {
            type: String,
            maxlength: 300,
        },
    },
    { timestamps: true }
);

export default mongoose.model<Driver>('Driver', DriverSchema);
