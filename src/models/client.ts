import { Schema, model, Document } from 'mongoose';

export interface IClient extends Document {
  contactPerson?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  email?: string;
  phone?: string;
  address?: string;
  companyName?: string;
  industry?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
  contactPerson: { type: String, trim: true },
  contactPersonEmail: { type: String, trim: true },
  contactPersonPhone: { type: String, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  companyName: { type: String, trim: true },
  industry: { type: String, trim: true },
  notes: { type: String, trim: true },
}, {
  timestamps: true
});

export const Client = model<IClient>('Client', ClientSchema);
