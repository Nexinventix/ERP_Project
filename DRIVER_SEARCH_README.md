# Driver Search API

## Overview

The Driver Search API provides powerful search functionality to find drivers in the fleet management system by driver name or license number. This feature enhances the driver management capabilities by allowing quick and efficient driver lookup.

## Features

- **Multi-field Search**: Search across driver name and license number
- **Case-insensitive**: Search queries are not case-sensitive
- **Partial Matching**: Supports partial text matching
- **Pagination**: Built-in pagination support for large result sets
- **Populated Results**: Returns drivers with populated vehicle information
- **Comprehensive Response**: Includes search metadata and pagination information

## API Endpoint

```
GET /api/driver/drivers/search
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search term for driver name or license number |
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of results per page (max: 50) |

### Authentication

This endpoint requires authentication. Include the authorization header:

```
Authorization: Bearer <your-auth-token>
```

### Permissions

Users must have appropriate permissions to access this endpoint.

## Request Examples

### Basic Search
```bash
curl -X GET "http://localhost:3000/api/driver/drivers/search?query=john" \
  -H "Authorization: Bearer <your-token>"
```

### Search with Pagination
```bash
curl -X GET "http://localhost:3000/api/driver/drivers/search?query=DL-12345&page=1&limit=5" \
  -H "Authorization: Bearer <your-token>"
```

### Search by License Number
```bash
curl -X GET "http://localhost:3000/api/driver/drivers/search?query=DL-12345" \
  -H "Authorization: Bearer <your-token>"
```

## Response Format

### Success Response (200)

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "personalInfo": {
        "name": "John Doe",
        "licenseNumber": "DL-12345",
        "licenseExpiry": "2025-12-31T00:00:00.000Z",
        "contact": "+1234567890",
        "address": "123 Main Street, City, State"
      },
      "certifications": [
        {
          "type": "commercial_license",
          "documentPath": "https://cloudinary.com/...",
          "issueDate": "2020-01-15T00:00:00.000Z",
          "expiryDate": "2025-01-15T00:00:00.000Z"
        }
      ],
      "assignedVehicle": {
        "_id": "507f1f77bcf86cd799439012",
        "make": "Toyota",
        "model": "Corolla",
        "registration": "ABC-123"
      },
      "performanceMetrics": {
        "safetyScore": 95,
        "fuelEfficiency": 88,
        "customerRating": 4.5
      },
      "status": "available",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "totalPages": 1,
    "limit": 10
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Query
```json
{
  "message": "Search query is required and must be a non-empty string"
}
```

#### 401 Unauthorized
```json
{
  "message": "Access token is required"
}
```

#### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```

## Search Logic

The search functionality uses MongoDB's `$or` operator to search across multiple fields:

1. **Driver Name**: Exact or partial match in `personalInfo.name`
2. **License Number**: Exact or partial match in `personalInfo.licenseNumber`

### Search Examples

| Search Query | Will Find Drivers With |
|--------------|------------------------|
| `john` | Name: "John Doe", "Johnny Smith", etc. |
| `doe` | Name: "John Doe", "Jane Doe", etc. |
| `DL-12345` | License: "DL-12345", etc. |
| `DL-123` | License: "DL-12345", "DL-12346", etc. |

## Implementation Details

### Controller Method

The search functionality is implemented in the `DriverController` class:

```typescript
async searchDrivers(req: AuthenticatedRequest, res: Response) {
  // Implementation details...
}
```

### Database Query

The search uses MongoDB aggregation with regex matching:

```javascript
const searchFilter = {
  $or: [
    { 'personalInfo.name': searchRegex },
    { 'personalInfo.licenseNumber': searchRegex }
  ]
};
```

### Validation

The search endpoint includes comprehensive validation:

- Query parameter is required and non-empty
- Query length is between 1-100 characters
- Page and limit parameters are properly parsed
- Input sanitization to prevent injection attacks

## Testing

Use the provided debug endpoint to verify the search functionality:

```bash
curl -X GET "http://localhost:3000/api/driver/drivers/debug" \
  -H "Authorization: Bearer <your-token>"
```

## Security Considerations

1. **Input Validation**: All search parameters are validated and sanitized
2. **Rate Limiting**: Subject to the same rate limiting as other endpoints
3. **Authentication**: Requires valid authentication token
4. **Authorization**: Requires appropriate permissions
5. **SQL Injection Protection**: Uses parameterized queries and input sanitization

## Performance Considerations

1. **Indexing**: Ensure proper indexes on search fields (`personalInfo.name`, `personalInfo.licenseNumber`)
2. **Pagination**: Always use pagination for large datasets
3. **Query Optimization**: The search uses efficient MongoDB regex matching
4. **Caching**: Consider implementing caching for frequently searched terms

## Future Enhancements

Potential improvements for the search functionality:

1. **Advanced Filters**: Add filters for driver status, vehicle assignment, performance metrics
2. **Fuzzy Search**: Implement fuzzy matching for typos
3. **Search Suggestions**: Auto-complete functionality
4. **Search History**: Track and suggest recent searches
5. **Export Results**: Allow exporting search results
6. **Saved Searches**: Allow users to save frequently used searches

## Troubleshooting

### Common Issues

1. **No Results Found**
   - Check if the search query is spelled correctly
   - Try partial matches (e.g., "joh" instead of "john")
   - Verify the driver exists in the database

2. **Authentication Errors**
   - Ensure the auth token is valid and not expired
   - Check if the user has the required permissions

3. **Pagination Issues**
   - Verify page and limit parameters are valid numbers
   - Check if the requested page exists

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=driver:search npm start
```

## Support

For issues or questions regarding the Driver Search API, please refer to:

1. API Documentation: `API_DOCUMENTATION.md`
2. Controller Implementation: `src/controllers/fleetController/driverController.ts`
3. Route Configuration: `src/routes/driver.ts` 