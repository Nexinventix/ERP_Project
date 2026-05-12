"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEPARTMENT_DEFAULT_PERMISSIONS = exports.Permission = exports.Department = void 0;
const mongoose_1 = require("mongoose");
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
var Department;
(function (Department) {
    Department["FLEET"] = "Fleet";
    Department["FINANCE"] = "Finance";
    Department["LOGISTICS"] = "Logistics";
    Department["CRM"] = "CRM";
    Department["AIR_SEA_OPERATIONS"] = "Air & Sea Operations";
    Department["PRICING_QUOTATION"] = "Pricing & Quotation";
    Department["SALES"] = "Sales";
})(Department || (exports.Department = Department = {}));
// Define all available permissions
var Permission;
(function (Permission) {
    // Fleet Department Permissions
    Permission["VIEW_FLEET_MODULE"] = "view_fleet";
    Permission["ADD_DRIVER"] = "add_driver";
    Permission["EDIT_DRIVER"] = "edit_driver";
    Permission["DELETE_DRIVER"] = "delete_driver";
    Permission["CREATE_TRIP"] = "create_trip";
    Permission["EDIT_TRIP"] = "edit_trip";
    Permission["DELETE_TRIP"] = "delete_trip";
    Permission["ASSIGN_VEHICLE"] = "assign_vehicle";
    Permission["TRACK_VEHICLE"] = "track_vehicle";
    Permission["ADD_ASSET_VEHICLE"] = "add_asset_vehicle";
    Permission["CREATE_MAINTENANCE_REQUEST"] = "create_maintenance_request";
    Permission["VIEW_FLEET_REPORT"] = "view_fleet_report";
    // Finance Department Permissions
    Permission["VIEW_FINANCE_MODULE"] = "view_finance";
    Permission["VIEW_FINANCIAL_REPORTS"] = "view_financial_reports";
    Permission["CREATE_INVOICE"] = "create_invoice";
    Permission["EDIT_INVOICE"] = "edit_invoice";
    Permission["DELETE_INVOICE"] = "delete_invoice";
    Permission["MANAGE_PAYROLL"] = "manage_payroll";
    Permission["APPROVE_BUDGET"] = "approve_budget";
    Permission["TRACK_EXPENSES"] = "track_expenses";
    Permission["MANAGE_ACCOUNTS"] = "manage_accounts";
    // Logistics Department Permissions
    Permission["VIEW_LOGISTICS_MODULE"] = "view_logistics";
    Permission["CREATE_DELIVERY_ORDER"] = "create_delivery_order";
    Permission["EDIT_DELIVERY_ORDER"] = "edit_delivery_order";
    Permission["CANCEL_DELIVERY"] = "cancel_delivery";
    Permission["TRACK_SHIPMENT"] = "track_shipment";
    Permission["MANAGE_WAREHOUSE_INVENTORY"] = "manage_warehouse_inventory";
    Permission["ASSIGN_DELIVERY_PERSONNEL"] = "assign_delivery_personnel";
    Permission["SCHEDULE_PICKUP"] = "schedule_pickup";
    Permission["VIEW_LOGISTICS_REPORT"] = "view_logistics_report";
    // CRM Department Permissions
    Permission["VIEW_CRM_MODULE"] = "view_crm";
    Permission["ADD_NEW_CUSTOMER"] = "add_new_customer";
    Permission["EDIT_CUSTOMER_INFORMATION"] = "edit_customer_information";
    Permission["DELETE_CUSTOMER"] = "delete_customer";
    Permission["TRACK_CUSTOMER_INTERACTION"] = "track_customer_interaction";
    Permission["ASSIGN_SALES_REPRESENTATIVE"] = "assign_sales_representative";
    Permission["VIEW_CUSTOMER_FEEDBACK"] = "view_customer_feedback";
    Permission["GENERATE_QUOTE"] = "generate_quote";
    Permission["EDIT_QUOTE"] = "edit_quote";
    Permission["CHANGE_QUOTE_STATUS"] = "change_quote_status";
    Permission["DELETE_QUOTE"] = "delete_quote";
    Permission["GENERATE_CRM_REPORTS"] = "generate_crm_reports";
    // Air & Sea Operations Permissions
    Permission["VIEW_AIR_SEA_OPERATIONS_MODULE"] = "view_air_sea_operations";
    Permission["CREATE_SHIPMENT_JOB_FILE"] = "create_shipment_job_file";
    Permission["UPLOAD_DOCUMENTS"] = "upload_documents";
    Permission["DELETE_JOB_FILE"] = "delete_job_file";
    Permission["DELETE_DOCUMENT"] = "delete_document";
    Permission["GENERATE_OPERATIONS_INVOICE"] = "generate_operations_invoice";
    Permission["CLOSE_JOB_FILE"] = "close_job_file";
    Permission["GENERATE_OPERATIONS_REPORT"] = "generate_operations_report";
    // Pricing & Quotation Department Permissions
    Permission["VIEW_PRICING_QUOTATION_MODULE"] = "view_pricing_quotation";
    Permission["ADD_PRICING_CUSTOMER"] = "add_pricing_customer";
    Permission["EDIT_PRICING_CUSTOMER_INFO"] = "edit_pricing_customer_info";
    Permission["DELETE_PRICING_CUSTOMER"] = "delete_pricing_customer";
    Permission["ASSIGN_PRICING_SALES_REP"] = "assign_pricing_sales_rep";
    Permission["GENERATE_PRICING_QUOTE"] = "generate_pricing_quote";
    Permission["EDIT_PRICING_QUOTE"] = "edit_pricing_quote";
    Permission["CHANGE_PRICING_QUOTE_STATUS"] = "change_pricing_quote_status";
    Permission["DELETE_PRICING_QUOTE"] = "delete_pricing_quote";
    Permission["GENERATE_QUOTE_SUMMARY_REPORTS"] = "generate_quote_summary_reports";
    // Sales Department Permissions
    Permission["VIEW_SALES_MODULE"] = "view_sales";
})(Permission || (exports.Permission = Permission = {}));
// Default permissions for each department
exports.DEPARTMENT_DEFAULT_PERMISSIONS = {
    [Department.FLEET]: [Permission.VIEW_FLEET_MODULE],
    [Department.FINANCE]: [Permission.VIEW_FINANCE_MODULE],
    [Department.LOGISTICS]: [Permission.VIEW_LOGISTICS_MODULE],
    [Department.CRM]: [Permission.VIEW_CRM_MODULE],
    [Department.AIR_SEA_OPERATIONS]: [Permission.VIEW_AIR_SEA_OPERATIONS_MODULE],
    [Department.PRICING_QUOTATION]: [Permission.VIEW_PRICING_QUOTATION_MODULE],
    [Department.SALES]: [Permission.VIEW_SALES_MODULE],
};
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
const userSchema = new mongoose_1.Schema({
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
            validator: (v) => /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(v),
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
            validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
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
        required: function () {
            return !this.isSuperAdmin;
        },
        enum: {
            values: Object.values(Department),
            message: `Department must be one of: ${Object.values(Department).join(", ")}`,
        },
    },
    permissions: {
        type: [String],
        enum: {
            values: Object.values(Permission),
            message: `Permission must be one of the valid permissions`,
        },
        default: function () {
            if (this.isSuperAdmin) {
                return Object.values(Permission);
            }
            return []; // Default to empty array instead of department defaults
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
}, {
    timestamps: true,
});
// Instance methods
userSchema.methods.hasPermission = function (permission) {
    if (this.isSuperAdmin)
        return true;
    return this.permissions.includes(permission);
};
userSchema.methods.hasAnyPermission = function (permissions) {
    if (this.isSuperAdmin)
        return true;
    return permissions.some((permission) => this.permissions.includes(permission));
};
// Update the pre-save middleware to not set default permissions based on department
// Middleware to ensure super admins have all permissions
userSchema.pre("save", function (next) {
    if (this.isSuperAdmin) {
        this.permissions = Object.values(Permission);
    }
    // Remove the else clause that was setting department default permissions
    next();
});
// Create and export the model
const Users = (0, mongoose_1.model)("ERPUser", userSchema);
exports.default = Users;
