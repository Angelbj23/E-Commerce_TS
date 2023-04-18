import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {type: String, required: true},
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  rank: {type: Number, required: true},
  reviews: {type: [String], required: true}
});

export const Product = mongoose.model("Product", ProductSchema);

//name, category, subcategory, price, rank, reviews