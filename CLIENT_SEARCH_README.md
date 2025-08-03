# Client Search API

## Overview

The Client Search API provides powerful search functionality to find clients in the fleet management system by company name, contact person, or email. This feature enhances the client management capabilities by allowing quick and efficient client lookup.

## Features

- **Multi-field Search**: Search across company name, contact person, and email addresses
- **Case-insensitive**: Search queries are not case-sensitive
- **Partial Matching**: Supports partial text matching
- **Pagination**: Built-in pagination support for large result sets
- **Comprehensive Response**: Includes search metadata and pagination information

## API Endpoint

```
GET /api/client/search
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search term for company name, contact person, or email |
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
curl -X GET "http://localhost:3000/api/client/search?query=abc" \
  -H "Authorization: Bearer <your-token>"
```

### Search with Pagination
```bash
curl -X GET "http://localhost:3000/api/client/search?query=john&page=1&limit=5" \
  -H "Authorization: Bearer <your-token>"
```

### Search by Email
```bash
curl -X GET "http://localhost:3000/api/client/search?query=info@abccorp.com" \
  -H "Authorization: Bearer <your-token>"
```

## Response Format

### Success Response (200)

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "companyName": "ABC Corporation",
      "contactPerson": "John Smith",
      "contactPersonEmail": "john@abccorp.com",
      "contactPersonPhone": "+1234567890",
      "email": "info@abccorp.com",
      "phone": "+1234567890",
      "address": "123 Business St, City, State",
      "industry": "Technology",
      "notes": "Premium client with high priority",
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

1. **Company Name**: Exact or partial match in `companyName`
2. **Contact Person**: Exact or partial match in `contactPerson`
3. **Email**: Exact or partial match in `email`
4. **Contact Person Email**: Exact or partial match in `contactPersonEmail`

### Search Examples

| Search Query | Will Find Clients With |
|--------------|------------------------|
| `abc` | Company: "ABC Corporation", etc. |
| `john` | Contact: "John Smith", etc. |
| `info@abccorp.com` | Email: "info@abccorp.com", etc. |
| `corp` | Company: "ABC Corporation", "XYZ Corp", etc. |

## Implementation Details

### Controller Method

The search functionality is implemented in the `clients.ts` controller:

```typescript
export async function searchClients(req: AuthenticatedRequest, res: Response) {
  // Implementation details...
}
```

### Database Query

The search uses MongoDB aggregation with regex matching:

```javascript
const searchFilter = {
  $or: [
    { companyName: searchRegex },
    { contactPerson: searchRegex },
    { email: searchRegex },
    { contactPersonEmail: searchRegex }
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
curl -X GET "http://localhost:3000/api/client/debug" \
  -H "Authorization: Bearer <your-token>"
```

## Security Considerations

1. **Input Validation**: All search parameters are validated and sanitized
2. **Rate Limiting**: Subject to the same rate limiting as other endpoints
3. **Authentication**: Requires valid authentication token
4. **Authorization**: Requires appropriate permissions
5. **SQL Injection Protection**: Uses parameterized queries and input sanitization

## Performance Considerations

1. **Indexing**: Ensure proper indexes on search fields (`companyName`, `contactPerson`, `email`, `contactPersonEmail`)
2. **Pagination**: Always use pagination for large datasets
3. **Query Optimization**: The search uses efficient MongoDB regex matching
4. **Caching**: Consider implementing caching for frequently searched terms

## Future Enhancements

Potential improvements for the search functionality:

1. **Advanced Filters**: Add filters for industry, location, client status
2. **Fuzzy Search**: Implement fuzzy matching for typos
3. **Search Suggestions**: Auto-complete functionality
4. **Search History**: Track and suggest recent searches
5. **Export Results**: Allow exporting search results
6. **Saved Searches**: Allow users to save frequently used searches

## Troubleshooting

### Common Issues

1. **No Results Found**
   - Check if the search query is spelled correctly
   - Try partial matches (e.g., "ab" instead of "abc")
   - Verify the client exists in the database

2. **Authentication Errors**
   - Ensure the auth token is valid and not expired
   - Check if the user has the required permissions

3. **Pagination Issues**
   - Verify page and limit parameters are valid numbers
   - Check if the requested page exists

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=client:search npm start
```

## Support

For issues or questions regarding the Client Search API, please refer to:

1. API Documentation: `API_DOCUMENTATION.md`
2. Controller Implementation: `src/controllers/clients.ts`
3. Route Configuration: `src/routes/client.ts` 