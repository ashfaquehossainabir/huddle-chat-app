import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export default model('Group', new Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }));
