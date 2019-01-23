const mongoose = require('mongoose');

const { Schema } = mongoose;

const ItemSchema = new Schema({
  authorName: { type: String, required: true },
  authorId: { type: String, required: true },
  isOrdered: { type: Boolean, default: false },
  name: { type: String, required: true },
  createdAt: { type: String, required: true },
  votes: [{ type: String }]
});

module.exports = mongoose.model('Item', ItemSchema);