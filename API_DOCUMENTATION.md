# ERP Project API Documentation

_Last updated: 2025-04-25_

---

## Table of Contents
- [Authentication & Users](#authentication--users)
- [Fleet Management](#fleet-management)
- [Driver Management](#driver-management)
- [Trip Management](#trip-management)
- [Fuel Log](#fuel-log)
- [Maintenance](#maintenance)
- [Notifications](#notifications)

---

## Authentication & Users

**Base Route:** `/api/user`

| Method | Endpoint                        | Description                       | Auth Required |
|--------|---------------------------------|-----------------------------------|--------------|
| POST   | `/login`                        | User login                        | No           |
| PATCH  | `/update-password`              | Update user password              | Yes          |
| POST   | `/create-user`                  | Create a new user                 | Yes (Admin)  |
| POST   | `/create-superadmin`            | Create a super admin              | Yes (Admin)  |
| GET    | `/users`                        | Get all users                     | Yes (Admin)  |
| POST   | `/signup-superadmin`            | Signup as super admin             | No           |
| PATCH  | `/update-user/:userId`          | Update user details               | Yes (Admin)  |
| DELETE | `/delete-user/:userId`          | Delete a user                     | Yes (Admin)  |
| PATCH  | `/grant-permissions/:userId`    | Grant permissions to a user       | Yes (Admin)  |
| PATCH  | `/revoke-permissions/:userId`   | Revoke user permissions           | Yes (Admin)  |
| PATCH  | `/make-admin/:userId`           | Make a user an administrator      | Yes (Admin)  |
| PATCH  | `/remove-admin/:userId`         | Remove admin rights from a user   | Yes (Admin)  |

### Example: Create User
- **POST** `/api/user/create-user`
- **Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "email": "john@example.com",
  "department": "IT",
  "modules": ["fleet", "finance"],
  "isSuperAdmin": false,
  "isAdministrator": true
}
```
- **Response:**
```json
{
  "message": "User created successfully, an email has been sent."
}
```

---

## Fleet Management

**Base Route:** `/api/fleet`

| Method | Endpoint                                   | Description                          | Auth Required |
|--------|--------------------------------------------|--------------------------------------|--------------|
| POST   | `/vehicles`                                | Add a new vehicle (with file upload) | Yes          |
| PATCH  | `/vehicles/:vehicleId/assign`              | Assign vehicle                       | Yes          |
| PATCH  | `/vehicles/:vehicleId/status`              | Update vehicle status                | Yes          |
| GET    | `/vehicles`                                | Get all vehicles                     | Yes          |
| PATCH  | `/vehicles/:vehicleId/assign-project`      | Assign vehicle to projects           | Yes          |
| PATCH  | `/vehicles/:vehicleId/assign-client`       | Assign vehicle to clients            | Yes          |
| PATCH  | `/vehicles/:vehicleId/assign-location`     | Assign vehicle to locations          | Yes          |

### Example: Add Vehicle
- **POST** `/api/fleet/vehicles`
- **Request (multipart/form-data):**
  - Fields: `make`, `model`, `registration`, `type`, `location`, `plateNumber`, `currentDriver`, `projects`, `clients`, `locations`
  - Files: certifications (optional)
- **Response:**
```json
{
  "message": "Vehicle added successfully",
  "vehicle": {
    "_id": "...",
    "make": "Toyota",
    "model": "Corolla",
    "registration": "ABC-123",
    "type": "sedan",
    "plateNumber": "XYZ-987",
    "status": "active",
    ...
  }
}
```

---

## Driver Management

**Base Route:** `/api/driver`

| Method | Endpoint                               | Description                        | Auth Required |
|--------|----------------------------------------|------------------------------------|--------------|
| POST   | `/drivers`                             | Add a new driver (with file upload)| Yes          |
| PATCH  | `/drivers/:driverId/:vehicleId`        | Assign driver to vehicle           | Yes          |
| PATCH  | `/drivers/:driverId/status`            | Update driver status               | Yes          |
| PATCH  | `/drivers/:driverId/performance`       | Update driver performance metrics  | Yes          |
| GET    | `/drivers`                             | Get all drivers                    | Yes          |
| GET    | `/drivers/:driverId`                   | Get driver details                 | Yes          |

### Example: Add Driver
- **POST** `/api/driver/drivers`
- **Request (multipart/form-data):**
  - Fields: `firstName`, `lastName`, `licenseNumber`, `phoneNumber`, `email`, etc.
  - Files: certifications (optional)
- **Response:**
```json
{
  "message": "Driver added successfully",
  "driver": {
    "_id": "...",
    "firstName": "Jane",
    "lastName": "Doe",
    "licenseNumber": "DL-12345",
    ...
  }
}
```

---

## Trip Management

**Base Route:** `/api/trip`

| Method | Endpoint                               | Description                        | Auth Required |
|--------|----------------------------------------|------------------------------------|--------------|
| POST   | `/trips`                               | Create a new trip                  | Yes          |
| PATCH  | `/trips/:tripId/status`                | Update trip status                 | Yes          |
| GET    | `/trips`                               | Get all trips                      | Yes          |
| GET    | `/trips/vehicle/:vehicleId`            | Get trips for a vehicle            | Yes          |
| GET    | `/trips/driver/:driverId`              | Get trips for a driver             | Yes          |
| GET    | `/trips/statistics`                    | Get trip statistics                | Yes          |

### Example: Create Trip
- **POST** `/api/trip/trips`
- **Request Body:**
```json
{
  "vehicleId": "...",
  "driverId": "...",
  "startLocation": "Warehouse A",
  "endLocation": "Client B",
  "startTime": "2025-04-25T10:00:00Z",
  "distance": 120,
  "cargo": "Electronics",
  "passengers": 2,
  "revenue": 5000
}
```
- **Response:**
```json
{
  "message": "Trip created successfully",
  "trip": {
    "_id": "...",
    "vehicle": "...",
    "driver": "...",
    "startLocation": "Warehouse A",
    "endLocation": "Client B",
    "startTime": "2025-04-25T10:00:00Z",
    "distance": 120,
    "cargo": "Electronics",
    "passengers": 2,
    "revenue": 5000,
    "status": "scheduled"
  }
}
```

---

## Fuel Log

**Base Route:** `/api/fuelLog`

| Method | Endpoint                                   | Description                        | Auth Required |
|--------|--------------------------------------------|------------------------------------|--------------|
| POST   | `/fuel-logs`                               | Add a new fuel log                 | Yes          |
| GET    | `/fuel-logs/vehicle/:vehicleId`            | Get fuel logs for a vehicle        | Yes          |
| GET    | `/fuel-logs/consumption`                   | Get fuel consumption report        | Yes          |
| GET    | `/fuel-logs/efficiency/:vehicleId`         | Get fuel efficiency trends         | Yes          |

### Example: Add Fuel Log
- **POST** `/api/fuelLog/fuel-logs`
- **Request Body:**
```json
{
  "vehicleId": "...",
  "driverId": "...",
  "location": "Station X",
  "fuelType": "diesel",
  "quantity": 50,
  "costPerUnit": 2.5,
  "mileage": 600
}
```
- **Response:**
```json
{
  "message": "Fuel log added successfully",
  "fuelLog": {
    "_id": "...",
    "vehicle": "...",
    "driver": "...",
    "location": "Station X",
    "fuelType": "diesel",
    "quantity": 50,
    "costPerUnit": 2.5,
    "totalCost": 125,
    "mileage": 600,
    "fuelEfficiency": 12
  }
}
```

---

## Maintenance

**Base Route:** `/api/maintenance`

| Method | Endpoint                                   | Description                        | Auth Required |
|--------|--------------------------------------------|------------------------------------|--------------|
| POST   | `/maintenance`                             | Schedule maintenance               | Yes          |
| PATCH  | `/maintenance/:maintenanceId/status`       | Update maintenance status          | Yes          |
| GET    | `/maintenance/vehicle/:vehicleId`          | Get maintenance history for vehicle| Yes          |
| GET    | `/maintenance/upcoming`                    | Get upcoming maintenance           | Yes          |

### Example: Schedule Maintenance
- **POST** `/api/maintenance/maintenance`
- **Request Body:**
```json
{
  "vehicleId": "...",
  "type": "oil change",
  "description": "Routine oil change",
  "scheduledDate": "2025-05-01T09:00:00Z",
  "mileage": 15000,
  "cost": 100,
  "parts": ["oil filter", "engine oil"],
  "nextMaintenanceDate": "2025-11-01T09:00:00Z",
  "nextMaintenanceMileage": 20000
}
```
- **Response:**
```json
{
  "message": "Maintenance scheduled successfully",
  "maintenance": {
    "_id": "...",
    "vehicle": "...",
    "type": "oil change",
    "description": "Routine oil change",
    "scheduledDate": "2025-05-01T09:00:00Z",
    "mileage": 15000,
    "cost": 100,
    "parts": ["oil filter", "engine oil"],
    "status": "scheduled",
    "nextMaintenanceDate": "2025-11-01T09:00:00Z",
    "nextMaintenanceMileage": 20000
  }
}
```

---

## Notifications

**Base Route:** `/api/notification`

| Method | Endpoint                                   | Description                        | Auth Required |
|--------|--------------------------------------------|------------------------------------|--------------|
| GET    | `/`                                       | Get all notifications              | Yes          |
| GET    | `/unread`                                 | Get unread notifications           | Yes          |
| PATCH  | `/:notificationId/read`                   | Mark notification as read          | Yes          |
| PATCH  | `/read-all`                               | Mark all notifications as read     | Yes          |
| DELETE | `/:notificationId`                        | Delete a notification              | Yes          |

### Example: Mark Notification as Read
- **PATCH** `/api/notification/:notificationId/read`
- **Response:**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "_id": "...",
    "read": true,
    ...
  }
}
```

---

## Notes
- All endpoints marked as "Auth Required: Yes" require a valid authentication token (typically via a Bearer token in the `Authorization` header).
- File uploads (for vehicles, drivers) use `multipart/form-data`.
- For more details on request/response fields, refer to the controller TypeScript definitions or request further breakdown.
