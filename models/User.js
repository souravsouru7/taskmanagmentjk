const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'designer', 'project_manager', 'sales_representative', 'employee'],
        default: 'employee'
    },
    department: {
        type: String,
        enum: ['Design', 'Project Management', 'Sales', 'Administration', 'Other'],
        required: true
    },
    permissions: [{
        type: String,
        enum: ['create_project', 'edit_project', 'delete_project', 'view_all_tasks', 'manage_users', 'view_reports']
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        
        console.log('Hashing password for user:', this.email);
        
        // Check if the password is already hashed (typically a bcrypt hash is 60 chars)
        if (this.password.length < 30) {
            console.log('Password appears to be plaintext, hashing it');
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } else {
            console.log('Password appears to be already hashed, skipping hash operation');
        }
        
        next();
    } catch (error) {
        console.error('Error in password hashing middleware:', error);
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Comparing passwords for user:', this.email);
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password comparison result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

// Method to get user's dashboard route based on role
userSchema.methods.getDashboardRoute = function() {
    switch(this.role) {
        case 'admin':
            return '/admin/dashboard';
        case 'designer':
            return '/design/dashboard';
        case 'project_manager':
            return '/projects/dashboard';
        case 'sales_representative':
            return '/sales/dashboard';
        default:
            return '/tasks';
    }
};

module.exports = mongoose.model('User', userSchema); 