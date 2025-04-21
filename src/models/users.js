"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = exports.Department = void 0;
const mongoose_1 = require("mongoose");
// Define the department enum
var Department;
(function (Department) {
    Department["CUSTOMER_SERVICE_PRICING"] = "Customer service & Pricing";
    Department["SALES_FLEET"] = "Sales Fleet";
    Department["COURIER"] = "Courier";
    Department["HR_ADMIN"] = "HR & Admin";
    Department["FINANCE"] = "Finance";
    Department["AIR_SEA_OPERATIONS"] = "Air & Sea operations";
})(Department || (exports.Department = Department = {}));
// Define the module enum (same as departments for this case)
var Module;
(function (Module) {
    Module["CUSTOMER_SERVICE_PRICING"] = "Customer service & Pricing";
    Module["SALES_FLEET"] = "Sales Fleet";
    Module["COURIER"] = "Courier";
    Module["HR_ADMIN"] = "HR & Admin";
    Module["FINANCE"] = "Finance";
    Module["AIR_SEA_OPERATIONS"] = "Air & Sea operations";
})(Module || (exports.Module = Module = {}));
// User schema
const userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        validate: {
            validator: function (v) {
                return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(v);
            },
            message: (props) => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Ensures password is not included in queries by default
    },
    department: {
        type: String,
        required: function () {
            return !this.isSuperAdmin; // Department is required only if NOT a super admin
        },
        enum: {
            values: Object.values(Department),
            message: `Department must be one of: ${Object.values(Department).join(', ')}`
        }
    },
    modules: {
        type: [String],
        enum: {
            values: Object.values(Module),
            message: `Module must be one of: ${Object.values(Module).join(', ')}`
        },
        default: function () {
            return [this.department]; // Ensure correct default assignment
        }
    },
    isSuperAdmin: {
        type: Boolean,
        default: false
    },
    isAdministrator: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Middleware to ensure super admins have all modules
userSchema.pre('save', function (next) {
    if (this.isSuperAdmin) {
        this.modules = Object.values(Module);
    }
    next();
});
// Create and export the model
const Users = (0, mongoose_1.model)('ERPUser', userSchema);
exports.default = Users;
