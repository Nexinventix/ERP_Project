# Fleet Vehicle Search API

## Overview

The Fleet Vehicle Search API provides a powerful search functionality to find vehicles in the fleet management system by vehicle name (make/model) or registration number. This feature enhances the fleet management capabilities by allowing quick and efficient vehicle lookup.

## Features

- **Multi-field Search**: Search across vehicle make, model, registration number, and plate number
- **Case-insensitive**: Search queries are not case-sensitive
- **Partial Matching**: Supports partial text matching
- **Pagination**: Built-in pagination support for large result sets
- **Populated Results**: Returns vehicles with populated driver and maintenance information
- **Comprehensive Response**: Includes search metadata and pagination information

## API Endpoint

```
GET /api/fleet/vehicles/search
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search term for vehicle make, model, registration, or plate number |
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of results per page (max: 50) |

### Authentication

This endpoint requires authentication. Include the authorization header:

```
Authorization: Bearer <your-auth-token>
```

### Permissions

Users must have the `VIEW_FLEET_MODULE` permission to access this endpoint.

## Request Examples

### Basic Search
```bash
curl -X GET "http://localhost:3000/api/fleet/vehicles/search?query=toyota" \
  -H "Authorization: Bearer <your-token>"
```

### Search with Pagination
```bash
curl -X GET "http://localhost:3000/api/fleet/vehicles/search?query=ABC-123&page=1&limit=5" \
  -H "Authorization: Bearer <your-token>"
```

### Search by Registration Number
```bash
curl -X GET "http://localhost:3000/api/fleet/vehicles/search?query=XYZ-987" \
  -H "Authorization: Bearer <your-token>"
```

## Response Format

### Success Response (200)

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "make": "Toyota",
      "model": "Corolla",
      "registration": "ABC-123",
      "plateNumber": "XYZ-987",
      "type": "Car",
      "location": "Main Garage",
      "status": "active",
      "departments": ["Sales Fleet"],
      "currentDriver": {
        "_id": "507f1f77bcf86cd799439012",
        "personalInfo": {
          "name": "John Doe",
          "licenseNumber": "DL-12345"
        },
        "status": "available"
      },
      "maintenanceSchedule": [],
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
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

1. **Vehicle Make**: Exact or partial match
2. **Vehicle Model**: Exact or partial match  
3. **Registration Number**: Exact or partial match
4. **Plate Number**: Exact or partial match
5. **Combined Make + Model**: Searches the concatenated make and model

### Search Examples

| Search Query | Will Find Vehicles With |
|--------------|------------------------|
| `toyota` | Make: "Toyota", Model: "Toyota Corolla", etc. |
| `corolla` | Model: "Corolla", Make: "Toyota Corolla", etc. |
| `ABC-123` | Registration: "ABC-123", Plate: "ABC-123", etc. |
| `honda` | Make: "Honda", Model: "Honda Civic", etc. |

## Implementation Details

### Controller Method

The search functionality is implemented in the `FleetController` class:

```typescript
searchVehicles: AsyncRequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  // Implementation details...
}
```

### Database Query

The search uses MongoDB aggregation with regex matching:

```javascript
const searchFilter = {
  $or: [
    { make: searchRegex },
    { model: searchRegex },
    { registration: searchRegex },
    { plateNumber: searchRegex },
    { $expr: { $regexMatch: { input: { $concat: ['$make', ' ', '$model'] }, regex: searchRegex.source, options: 'i' } } }
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

Use the provided test script to verify the search functionality:

```bash
node test_search.js
```

The test script includes:
- Basic search functionality tests
- Pagination tests
- Error handling tests

## Security Considerations

1. **Input Validation**: All search parameters are validated and sanitized
2. **Rate Limiting**: Subject to the same rate limiting as other endpoints
3. **Authentication**: Requires valid authentication token
4. **Authorization**: Requires appropriate permissions
5. **SQL Injection Protection**: Uses parameterized queries and input sanitization

## Performance Considerations

1. **Indexing**: Ensure proper indexes on search fields (make, model, registration, plateNumber)
2. **Pagination**: Always use pagination for large datasets
3. **Query Optimization**: The search uses efficient MongoDB regex matching
4. **Caching**: Consider implementing caching for frequently searched terms

## Future Enhancements

Potential improvements for the search functionality:

1. **Advanced Filters**: Add filters for vehicle type, status, department
2. **Fuzzy Search**: Implement fuzzy matching for typos
3. **Search Suggestions**: Auto-complete functionality
4. **Search History**: Track and suggest recent searches
5. **Export Results**: Allow exporting search results
6. **Saved Searches**: Allow users to save frequently used searches

## Troubleshooting

### Common Issues

1. **No Results Found**
   - Check if the search query is spelled correctly
   - Try partial matches (e.g., "toy" instead of "toyota")
   - Verify the vehicle exists in the database

2. **Authentication Errors**
   - Ensure the auth token is valid and not expired
   - Check if the user has the required permissions

3. **Pagination Issues**
   - Verify page and limit parameters are valid numbers
   - Check if the requested page exists

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=fleet:search npm start
```

## Support

For issues or questions regarding the Fleet Vehicle Search API, please refer to:

1. API Documentation: `API_DOCUMENTATION.md`
2. Test Script: `test_search.js`
3. Controller Implementation: `src/controllers/fleetController/fleetSetUpConfig.ts`
4. Route Configuration: `src/routes/fleet.ts` 