import { Schema, model, Types, Document } from 'mongoose';

export interface INotification extends Document {
  vehicle: Types.ObjectId;
  type: 'maintenance_due' | 'maintenance_close' | string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default model<INotification>('Notification', NotificationSchema);
