const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  place_name: { type: String, required: true },  
  quantity: { type: Number, required: true },
  image_url: String,
  image : {data: Buffer, contentType: String},
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }
  },
  status: { type: String, enum: ["available", "sold"], default: "available" },
  created_at: { type: Date, default: Date.now }
});

foodSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Food", foodSchema);
