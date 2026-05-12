"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.hasPermission = exports.permissionMiddleware = void 0;
const permissionMiddleware = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required.",
                });
                return;
            }
            // Super admins have all permissions
            if (user.isSuperAdmin) {
                next();
                return;
            }
            // Check if user has any of the required permissions
            const hasPermission = user.hasAnyPermission(requiredPermissions);
            if (!hasPermission) {
                res.status(403).json({
                    success: false,
                    message: "Insufficient permissions.",
                    requiredPermissions,
                    userPermissions: user.permissions,
                });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Error checking permissions.",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };
};
exports.permissionMiddleware = permissionMiddleware;
// Helper middleware for checking specific permission
const hasPermission = (permission) => {
    return (0, exports.permissionMiddleware)([permission]);
};
exports.hasPermission = hasPermission;
// Helper middleware for admin-only routes
const adminOnly = (req, res, next) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({
            success: false,
            message: "Authentication required.",
        });
        return;
    }
    if (!user.isSuperAdmin && !user.isAdministrator) {
        res.status(403).json({
            success: false,
            message: "Admin access required.",
        });
        return;
    }
    next();
};
exports.adminOnly = adminOnly;
