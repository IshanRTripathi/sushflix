// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  displayName: {
    type: String
  },


    googleId: {
      type: String,
    
    },
    email: {
        type: String,
        
        required: true,
        unique: true,
    },
    password: {
      type: String,
      required: true,
    },    
    isCreator: {
      type: Boolean,
      default: false
  },
  profilePic: {
      type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);