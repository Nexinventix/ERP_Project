import type { Request, Response, NextFunction } from "express"
import type { User, Permission } from "../models/users"

interface AuthRequest extends Request {
  user: User
}

export const permissionMiddleware = (requiredPermissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const user = req.user

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        })
        return
      }

      // Super admins have all permissions
      if (user.isSuperAdmin) {
        next()
        return
      }

      // Check if user has any of the required permissions
      const hasPermission = user.hasAnyPermission(requiredPermissions)

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: "Insufficient permissions.",
          requiredPermissions,
          userPermissions: user.permissions,
        })
        return
      }

      next()
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error checking permissions.",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
}

// Helper middleware for checking specific permission
export const hasPermission = (permission: Permission) => {
  return permissionMiddleware([permission])
}

// Helper middleware for admin-only routes
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const user = req.user

  if (!user) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    })
    return
  }

  if (!user.isSuperAdmin && !user.isAdministrator) {
    res.status(403).json({
      success: false,
      message: "Admin access required.",
    })
    return
  }

  next()
}
