const mongoose = require('mongoose');
const currency = require('currency.js');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    minLength: 2,
    required: true
  },
  price: {
    type: Number,
    set: v => currency(v),
    get: v => currency(v),
    required: true,
    min: 0,
    max: 999.99,
  },
  quantity: {
    type: Number,
    validate: {
      validator: function (value) {
        return Number.isInteger(value);
      },
      message: value => `The number ${value} is not a valid whole number.`
    },
    required: true,
    min: 0,
    max: 999,
  },
  description: {
    type: String,
  },
  category: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ProductCategory'
    }
  ]
})
productSchema.virtual("url").get(function () {
  return `/catalog/product/${this._id}`;
})

const Product = mongoose.model("Product", productSchema);
module.exports = Product;