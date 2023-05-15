const User = require('../models/userModel');

const users = [
  {
    name: 'Maron X',
    email: 'dev@maronx.com',
    role: 'admin',
    active: true,
    photo: 'default.jpg',
    phoneCode: '+20',
    phone: '01064053748',
    password: 'password',
    passwordConfirm: 'password'
  }
];

module.exports = [
  {
    model: User,
    documents: users
  }
];
