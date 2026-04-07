import mongoose from 'mongoose';

const userStatSchema = new mongoose.Schema(
  {
    userID: { type: String, required: true, unique: true },
    clanID: { type: String, required: true },
    cardTier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Special'], default: 'Bronze' },
    xpTotal: { type: Number, default: 0 },
    attributes: {
      pace: Number,
      shooting: Number,
      passing: Number,
      dribbling: Number,
      defense: Number,
      physical: Number
    },
    lastActivityTimestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const UserStat = mongoose.model('UserStat', userStatSchema);
