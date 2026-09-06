const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-]+([.][\w-]+)*@[\w-]+([.][\w-]+)*\.[\w]{2,3}$/, "Invalid email address!"],
        unique: [true,"Email already exists!"]
    },
    name: {
        type: String,
        required: [true, "Name is Reqiured!"],
    },
    password: {
        type: String,
        required: [true, "Password is Required!"],
        minlength: [6, "Password must be at least 6 characters long!"],
        trim: true,
        select: false,
    },
    systemUser:{
        type: Boolean,
        default: false,
        immutable: true,
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
});

userSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;