import mongoose from 'mongoose';

const clanPowerHistorySchema = new mongoose.Schema(
  {
    clanID: { type: String, required: true },
    power: { type: Number, required: true },
    snapshotAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const ClanPowerHistory = mongoose.model('ClanPowerHistory', clanPowerHistorySchema);
