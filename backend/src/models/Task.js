const { Schema, model } = require('mongoose');

const TaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    // NUEVO
    priority: { type: String, enum: ['low', 'med', 'high'], default: 'low' },
    dueDate: { type: Date, default: null },

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = model('Task', TaskSchema);
