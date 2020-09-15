const mongoose = require('mongoose');

let UserSchema = mongoose.Schema({
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  email: {
    type: String
  },
  username: {
    type: String
  },
  password: {
    type: String
  },
  role: {
    type: String
  }
});

module.exports = mongoose.model('User', UserSchema);
