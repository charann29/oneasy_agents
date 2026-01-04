import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  channel: { type: String, enum: ['web', 'whatsapp'], default: 'web' },
  createdAt: { type: Date, default: Date.now },
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }]
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
