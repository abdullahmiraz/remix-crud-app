import mongoose from "mongoose";

export interface IItem {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new mongoose.Schema<IItem>(
  {
    name: { type: String, required: true },
    description: String,
  },
  { timestamps: true }
);

export const Item =
  mongoose.models.Item || mongoose.model<IItem>("Item", itemSchema);
