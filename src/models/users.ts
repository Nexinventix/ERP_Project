import { Schema, model, Document } from 'mongoose';

// Define the department enum
export enum Department {
  CUSTOMER_SERVICE_PRICING = 'Customer service & Pricing',
  SALES_FLEET = 'Sales Fleet',
  COURIER = 'Courier',
  HR_ADMIN = 'HR & Admin',
  FINANCE = 'Finance',
  AIR_SEA_OPERATIONS = 'Air & Sea operations'
}

// Define the module enum (same as departments for this case)
export enum Module {
  CUSTOMER_SERVICE_PRICING = 'Customer service & Pricing',
  SALES_FLEET = 'Sales Fleet',
  COURIER = 'Courier',
  HR_ADMIN = 'HR & Admin',
  FINANCE = 'Finance',
  AIR_SEA_OPERATIONS = 'Air & Sea operations'
}

// Interface for User document
export interface User extends Document {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string; // Added password field
  department: Department;
  modules: Module[];
  isSuperAdmin: boolean;
  isAdministrator: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const userSchema = new Schema<User>(
  {
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
        validator: function (v: string) {
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
        validator: function (v: string) {
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
        required: function (this: User) {
          return !this.isSuperAdmin; // Department is required only if NOT a super admin
        },
        enum: {
          values: Object.values(Department) as string[],
          message: `Department must be one of: ${Object.values(Department).join(', ')}`
        }
      },
    modules: {
      type: [String],
      enum: {
        values: Object.values(Module) as string[],
        message: `Module must be one of: ${Object.values(Module).join(', ')}`
      },
      default: function (this: User) {
        return [this.department as unknown as Module]; // Ensure correct default assignment
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
  },
  {
    timestamps: true
  }
);

// Middleware to ensure super admins have all modules
userSchema.pre<User>('save', function (next) {
  if (this.isSuperAdmin) {
    this.modules = Object.values(Module);
  }
  next();
});

// Create and export the model
const Users = model<User>('ERPUser', userSchema);
export default Users;
