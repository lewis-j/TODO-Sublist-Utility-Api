const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
});

const ListSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  items: [ItemSchema],
  userId: { type: String, required: true },
});

module.exports = mongoose.model("List", ListSchema);
