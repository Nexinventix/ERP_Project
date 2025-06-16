import { Schema, model, Document } from 'mongoose';

// Define the department enum
// export enum Department {
//   CUSTOMER_SERVICE_PRICING = 'Customer service & Pricing',
//   SALES_FLEET = 'Sales Fleet',
//   COURIER = 'Courier',
//   HR_ADMIN = 'HR & Admin',
//   FINANCE = 'Finance',
//   AIR_SEA_OPERATIONS = 'Air & Sea operations'
// }

// Define the department enum
export enum Department {
  FLEET = "Fleet",
  FINANCE = "Finance",
  LOGISTICS = "Logistics",
  CRM = "CRM",
  AIR_SEA_OPERATIONS = "Air & Sea Operations",
  PRICING_QUOTATION = "Pricing & Quotation",
}

// Interface for User document
// export interface User extends Document {
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   email: string;
//   password: string; // Added password field
//   department: Department;
//   modules: Module[];
//   isSuperAdmin: boolean;
//   isAdministrator: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// Interface for User document
export interface User extends Document {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  password: string
  department: Department
  permissions: Permission[]
  isSuperAdmin: boolean
  isAdministrator: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  hasPermission(permission: Permission): boolean
  hasAnyPermission(permissions: Permission[]): boolean
}

// Define all available permissions
export enum Permission {
  // Fleet Department Permissions
  VIEW_FLEET_MODULE = "view_fleet",
  ADD_DRIVER = "add_driver",
  EDIT_DRIVER = "edit_driver",
  DELETE_DRIVER = "delete_driver",
  CREATE_TRIP = "create_trip",
  EDIT_TRIP = "edit_trip",
  DELETE_TRIP = "delete_trip",
  ASSIGN_VEHICLE = "assign_vehicle",
  TRACK_VEHICLE = "track_vehicle",
  ADD_ASSET_VEHICLE = "add_asset_vehicle",
  CREATE_MAINTENANCE_REQUEST = "create_maintenance_request",
  VIEW_FLEET_REPORT = "view_fleet_report",

  // Finance Department Permissions
  VIEW_FINANCE_MODULE = "view_finance",
  VIEW_FINANCIAL_REPORTS = "view_financial_reports",
  CREATE_INVOICE = "create_invoice",
  EDIT_INVOICE = "edit_invoice",
  DELETE_INVOICE = "delete_invoice",
  MANAGE_PAYROLL = "manage_payroll",
  APPROVE_BUDGET = "approve_budget",
  TRACK_EXPENSES = "track_expenses",
  MANAGE_ACCOUNTS = "manage_accounts",

  // Logistics Department Permissions
  VIEW_LOGISTICS_MODULE = "view_logistics",
  CREATE_DELIVERY_ORDER = "create_delivery_order",
  EDIT_DELIVERY_ORDER = "edit_delivery_order",
  CANCEL_DELIVERY = "cancel_delivery",
  TRACK_SHIPMENT = "track_shipment",
  MANAGE_WAREHOUSE_INVENTORY = "manage_warehouse_inventory",
  ASSIGN_DELIVERY_PERSONNEL = "assign_delivery_personnel",
  SCHEDULE_PICKUP = "schedule_pickup",
  VIEW_LOGISTICS_REPORT = "view_logistics_report",

  // CRM Department Permissions
  VIEW_CRM_MODULE = "view_crm",
  ADD_NEW_CUSTOMER = "add_new_customer",
  EDIT_CUSTOMER_INFORMATION = "edit_customer_information",
  DELETE_CUSTOMER = "delete_customer",
  TRACK_CUSTOMER_INTERACTION = "track_customer_interaction",
  ASSIGN_SALES_REPRESENTATIVE = "assign_sales_representative",
  VIEW_CUSTOMER_FEEDBACK = "view_customer_feedback",
  GENERATE_QUOTE = "generate_quote",
  EDIT_QUOTE = "edit_quote",
  CHANGE_QUOTE_STATUS = "change_quote_status",
  DELETE_QUOTE = "delete_quote",
  GENERATE_CRM_REPORTS = "generate_crm_reports",

  // Air & Sea Operations Permissions
  VIEW_AIR_SEA_OPERATIONS_MODULE = "view_air_sea_operations",
  CREATE_SHIPMENT_JOB_FILE = "create_shipment_job_file",
  UPLOAD_DOCUMENTS = "upload_documents",
  DELETE_JOB_FILE = "delete_job_file",
  DELETE_DOCUMENT = "delete_document",
  GENERATE_OPERATIONS_INVOICE = "generate_operations_invoice",
  CLOSE_JOB_FILE = "close_job_file",
  GENERATE_OPERATIONS_REPORT = "generate_operations_report",

  // Pricing & Quotation Department Permissions
  VIEW_PRICING_QUOTATION_MODULE = "view_pricing_quotation",
  ADD_PRICING_CUSTOMER = "add_pricing_customer",
  EDIT_PRICING_CUSTOMER_INFO = "edit_pricing_customer_info",
  DELETE_PRICING_CUSTOMER = "delete_pricing_customer",
  ASSIGN_PRICING_SALES_REP = "assign_pricing_sales_rep",
  GENERATE_PRICING_QUOTE = "generate_pricing_quote",
  EDIT_PRICING_QUOTE = "edit_pricing_quote",
  CHANGE_PRICING_QUOTE_STATUS = "change_pricing_quote_status",
  DELETE_PRICING_QUOTE = "delete_pricing_quote",
  GENERATE_QUOTE_SUMMARY_REPORTS = "generate_quote_summary_reports",
}

// Default permissions for each department
export const DEPARTMENT_DEFAULT_PERMISSIONS: Record<Department, Permission[]> = {
  [Department.FLEET]: [Permission.VIEW_FLEET_MODULE],
  [Department.FINANCE]: [Permission.VIEW_FINANCE_MODULE],
  [Department.LOGISTICS]: [Permission.VIEW_LOGISTICS_MODULE],
  [Department.CRM]: [Permission.VIEW_CRM_MODULE],
  [Department.AIR_SEA_OPERATIONS]: [Permission.VIEW_AIR_SEA_OPERATIONS_MODULE],
  [Department.PRICING_QUOTATION]: [Permission.VIEW_PRICING_QUOTATION_MODULE],
}

// User schema
// const userSchema = new Schema<User>(
//   {
//     firstName: {
//       type: String,
//       required: [true, 'First name is required'],
//       trim: true,
//       maxlength: [50, 'First name cannot exceed 50 characters']
//     },
//     lastName: {
//       type: String,
//       required: [true, 'Last name is required'],
//       trim: true,
//       maxlength: [50, 'Last name cannot exceed 50 characters']
//     },
//     phoneNumber: {
//       type: String,
//       required: [true, 'Phone number is required'],
//       unique: true,
//       validate: {
//         validator: function (v: string) {
//           return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(v);
//         },
//         message: (props) => `${props.value} is not a valid phone number!`
//       }
//     },
//     email: {
//       type: String,
//       required: [true, 'Email is required'],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       validate: {
//         validator: function (v: string) {
//           return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
//         },
//         message: (props) => `${props.value} is not a valid email address!`
//       }
//     },
//     password: {
//       type: String,
//       required: [true, 'Password is required'],
//       minlength: [6, 'Password must be at least 6 characters'],
//       select: false // Ensures password is not included in queries by default
//     },
//     department: {
//         type: String,
//         required: function (this: User) {
//           return !this.isSuperAdmin; // Department is required only if NOT a super admin
//         },
//         enum: {
//           values: Object.values(Department) as string[],
//           message: `Department must be one of: ${Object.values(Department).join(', ')}`
//         }
//       },
//     modules: {
//       type: [String],
//       enum: {
//         values: Object.values(Module) as string[],
//         message: `Module must be one of: ${Object.values(Module).join(', ')}`
//       },
//       default: function (this: User) {
//         return [this.department as unknown as Module]; // Ensure correct default assignment
//       }
//     },
//     isSuperAdmin: {
//       type: Boolean,
//       default: false
//     },
//     isAdministrator: {
//       type: Boolean,
//       default: false
//     }
//   },
//   {
//     timestamps: true
//   }
// );

// Middleware to ensure super admins have all modules
// userSchema.pre<User>('save', function (next) {
//   if (this.isSuperAdmin) {
//     this.modules = Object.values(Module);
//   }
//   next();
// });

// Create and export the model
// const Users = model<User>('ERPUser', userSchema);
// export default Users;

// User schema
const userSchema = new Schema<User>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      validate: {
        validator: (v: string) => /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(v),
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    department: {
      type: String,
      required: function (this: User) {
        return !this.isSuperAdmin
      },
      enum: {
        values: Object.values(Department) as string[],
        message: `Department must be one of: ${Object.values(Department).join(", ")}`,
      },
    },
    permissions: {
      type: [String],
      enum: {
        values: Object.values(Permission) as string[],
        message: `Permission must be one of the valid permissions`,
      },
      default: function (this: User) {
        if (this.isSuperAdmin) {
          return Object.values(Permission)
        }
        return [] // Default to empty array instead of department defaults
      },
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isAdministrator: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Instance methods
userSchema.methods.hasPermission = function (permission: Permission): boolean {
  if (this.isSuperAdmin) return true
  return this.permissions.includes(permission)
}

userSchema.methods.hasAnyPermission = function (permissions: Permission[]): boolean {
  if (this.isSuperAdmin) return true
  return permissions.some((permission) => this.permissions.includes(permission))
}

// Update the pre-save middleware to not set default permissions based on department
// Middleware to ensure super admins have all permissions
userSchema.pre<User>("save", function (next) {
  if (this.isSuperAdmin) {
    this.permissions = Object.values(Permission)
  }
  // Remove the else clause that was setting department default permissions
  next()
})

// Create and export the model
const Users = model<User>("ERPUser", userSchema)
export default Users

