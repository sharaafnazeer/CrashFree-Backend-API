const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password : { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: false, default: '' },
    status: { type: Number, required: true, default: 0 },
    lastLocation: { type: Object, required: false},
    driving: { type: Boolean, required: true, default: false },
    firebaseToken: { type: String, required: false },
})

userSchema.pre(
    'save',
    async function(next) {
      const user = this;
      const hash = await bcrypt.hash(this.password, 10);
  
      this.password = hash;
      next();
    }
);

userSchema.methods.isValidPassword = async function(password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);
  
    return compare;
  }

module.exports = mongoose.model('users', userSchema);