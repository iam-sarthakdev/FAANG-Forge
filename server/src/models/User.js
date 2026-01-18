import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    avatar: {
        type: String,
        default: null
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'dark'
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        reminderFrequency: {
            type: String,
            enum: ['daily', 'weekly'],
            default: 'daily'
        }
    },
    stats: {
        totalProblems: {
            type: Number,
            default: 0
        },
        totalRevisions: {
            type: Number,
            default: 0
        },
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        lastActive: {
            type: Date,
            default: null
        }
    },
    systemDesign: {
        completedTopics: [{
            type: String
        }]
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

export default User;
