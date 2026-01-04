import mongoose from 'mongoose'

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: mongoose.Schema.Types.Mixed,
  currentPhase: { type: Number, default: 1 },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.models.Session || mongoose.model('Session', SessionSchema)
