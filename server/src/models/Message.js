import mongoose from 'mongoose';
import { MAX_MESSAGE_LENGTH } from '../config/constants.js';

const { Schema, model } = mongoose;

/** A message belongs either to a group (`group`) or to a direct chat (`recipient`). */
export default model('Message', new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User' },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  text: { type: String, required: true, maxlength: MAX_MESSAGE_LENGTH },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }));
