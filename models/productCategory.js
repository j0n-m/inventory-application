const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
  },
  description: {
    type: String,
  }
})
productCategorySchema.virtual("url").get(function () {
  return `/catalog/category/${this._id}`;
});

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);
module.exports = ProductCategory;