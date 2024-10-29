# API Documentation

## Authentication

### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### POST /api/auth/login
Authenticate user and get token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "isCreator": false
  }
}
```

## Content

### POST /api/content/upload
Upload new content (requires authentication).

**Request Body (multipart/form-data):**
- title: string
- description: string
- isExclusive: boolean
- mediaType: 'video' | 'image'
- thumbnail: File
- media: File

**Response:**
```json
{
  "contentId": "content_id",
  "message": "Content uploaded successfully"
}
```

### GET /api/content/:id
Get content by ID.

**Response:**
```json
{
  "id": "content_id",
  "title": "Content Title",
  "description": "Content Description",
  "mediaType": "video",
  "mediaUrl": "https://...",
  "thumbnailUrl": "https://...",
  "isExclusive": false,
  "likes": 0,
  "views": 0,
  "creator": {
    "username": "creator",
    "name": "Creator Name",
    "avatarUrl": "https://..."
  }
}
```

## Subscriptions

### POST /api/subscriptions/create
Create a new subscription (requires authentication).

**Request Body:**
```json
{
  "planId": "plan_id"
}
```

**Response:**
```json
{
  "sessionUrl": "https://checkout.stripe.com/..."
}
```

### GET /api/subscriptions/status/:creatorId
Check subscription status for a creator (requires authentication).

**Response:**
```json
{
  "isSubscribed": true,
  "subscription": {
    "id": "subscription_id",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Categories

### GET /api/categories
Get all content categories.

**Response:**
```json
[
  {
    "id": "category_id",
    "name": "Category Name",
    "description": "Category Description",
    "imageUrl": "https://...",
    "contentCount": 10
  }
]
```

### GET /api/categories/:id/content
Get content for a specific category.

**Response:**
```json
{
  "category": {
    "id": "category_id",
    "name": "Category Name"
  },
  "contents": [
    {
      "id": "content_id",
      "title": "Content Title",
      "thumbnailUrl": "https://...",
      "creator": {
        "username": "creator",
        "name": "Creator Name"
      }
    }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```