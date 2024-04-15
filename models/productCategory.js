const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    lowercase: true,
    get: v => { //format string with beginning letter as uppercase for each word
      let vArr = v.split(' ');
      for (let i = 0; i < vArr.length; i++) {
        //vArr[i] = vArr[i].toLowerCase();
        vArr[i] = vArr[i][0].toUpperCase() + vArr[i].substring(1);
      }
      return vArr.join(' ');
    },
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