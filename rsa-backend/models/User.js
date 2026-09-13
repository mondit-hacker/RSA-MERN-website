'use strict';
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const userSchema = new mongoose.Schema({
  firstName:  { type: String, required: true, trim: true, maxlength: 50 },
  lastName:   { type: String, required: true, trim: true, maxlength: 50 },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  phone:      { type: String, trim: true },
  password:   { type: String, required: true, minlength: 6, select: false },
  role:       { type: String, enum: ['student','teacher','hr','manager','admin','developer'], default: 'student', index: true },
  isEmailVerified:      { type: Boolean, default: false },
  emailVerifyToken:     { type: String, select: false },
  emailVerifyExpires:   { type: Date, select: false },
  passwordResetToken:   { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  passwordChangedAt:    { type: Date },
  loginAttempts:  { type: Number, default: 0 },
  lockUntil:      { type: Date },
  isLocked:       { type: Boolean, default: false },
  isActive:       { type: Boolean, default: true, index: true },
  isDeleted:      { type: Boolean, default: false, index: true },
  deletedAt:      { type: Date },
  deletedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  avatar:         { type: String, default: null },
  profile:        { type: mongoose.Schema.Types.ObjectId, refPath: 'profileModel' },
  profileModel:   { type: String, enum: ['Student','Teacher','Staff'] },
  mustChangePassword: { type: Boolean, default: false },
  lastLoginAt:    { type: Date },
  lastLoginIP:    { type: String },
}, { timestamps: true, versionKey: false });

userSchema.index({ role: 1, isActive: 1, isDeleted: 1 });

userSchema.virtual('fullName').get(function() { return `${this.firstName} ${this.lastName}`; });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10));
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword   = async function(p) { return bcrypt.compare(p, this.password); };
userSchema.methods.changedPasswordAfter = function(iat) { return this.passwordChangedAt ? iat < parseInt(this.passwordChangedAt.getTime()/1000,10) : false; };
userSchema.methods.incrementLoginAttempts = async function() {
  const MAX = parseInt(process.env.MAX_LOGIN_ATTEMPTS||'5',10), LOCK = parseInt(process.env.LOCK_TIME_MINUTES||'30',10);
  this.loginAttempts += 1;
  if (this.loginAttempts >= MAX) { this.isLocked = true; this.lockUntil = new Date(Date.now()+LOCK*60000); }
  return this.save({ validateBeforeSave: false });
};
userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts=0; this.isLocked=false; this.lockUntil=undefined;
  return this.save({ validateBeforeSave: false });
};
userSchema.methods.createEmailVerifyToken = function() {
  const t = crypto.randomBytes(32).toString('hex');
  this.emailVerifyToken = crypto.createHash('sha256').update(t).digest('hex');
  this.emailVerifyExpires = new Date(Date.now() + parseInt(process.env.EMAIL_VERIFY_EXPIRES_HOURS||'24',10)*3600000);
  return t;
};
userSchema.methods.createPasswordResetToken = function() {
  const t = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(t).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + parseInt(process.env.PASSWORD_RESET_EXPIRES_MINUTES||'30',10)*60000);
  return t;
};
userSchema.methods.toJSON = function() {
  const o = this.toObject();
  ['password','emailVerifyToken','emailVerifyExpires','passwordResetToken','passwordResetExpires','loginAttempts','lockUntil'].forEach(k => delete o[k]);
  return o;
};

module.exports = mongoose.model('User', userSchema);
