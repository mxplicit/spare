# Cloudflare Pages Deployment Guide

This guide explains how to deploy the Bumbleb static website to Cloudflare Pages with serverless functions.

## Prerequisites

- Cloudflare account
- Git repository with the website files
- (Optional) Cloudflare D1 database for order/product storage

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository contains:
- All website files in the root directory
- `functions/` directory with serverless functions
- `_headers` file for HTTP headers configuration
- `_redirects` file for URL redirects configuration

### 2. Create Cloudflare Pages Project

1. Go to the Cloudflare Dashboard
2. Navigate to Pages > Create a project
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: (Leave empty for static sites)
   - **Build output directory**: `/` (root directory)
   - **Environment variables**: Add any required API keys or configuration

### 3. Configure Functions

Cloudflare Pages Functions are automatically deployed from the `functions/` directory:

- `functions/api/order.js` - Handles order submission and lookup
- `functions/api/products.js` - Provides product data

### 4. Set Up D1 Database (Optional)

For persistent order storage:

1. Create a D1 database in Cloudflare Dashboard
2. Create tables using the SQL schema below
3. Bind the database to your Pages project in the dashboard

```sql
-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL,
  order_notes TEXT,
  cart_data TEXT NOT NULL, -- JSON string
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- Products table (optional, for dynamic product management)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT,
  description TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  brand TEXT,
  model TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);
```

### 5. Environment Variables

Configure these environment variables in Cloudflare Pages:

- `ORDER_EMAIL_TO`: Destination email for order notifications
- `ORDER_EMAIL_FROM`: Sender email for order confirmations
- `STRIPE_SECRET_KEY`: For payment processing (if using Stripe)
- `DATABASE_URL`: D1 database connection string (if applicable)

### 6. Custom Domain (Optional)

1. Go to your Pages project settings
2. Navigate to Custom Domains
3. Add your custom domain
4. Configure DNS records as instructed by Cloudflare

## Available Functions

### POST /api/order
Submit a new order

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "country": "US",
  "orderNotes": "Optional notes",
  "cart": [...],
  "orderTotal": "$100.00"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "ORD-1234567890-abc123",
  "message": "Order received successfully"
}
```

### GET /api/order?order_id=ORDER_ID
Look up an existing order

**Response:**
```json
{
  "success": true,
  "order": {
    "orderId": "ORD-1234567890-abc123",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z",
    ...
  }
}
```

### GET /api/products
Get product list with optional filters

**Query Parameters:**
- `category`: Filter by product category
- `product_id`: Get specific product
- `search`: Search products by name/description

**Response:**
```json
{
  "success": true,
  "products": [...],
  "total": 10
}
```

## Static Site Configuration

### _headers File
Controls HTTP headers for security and caching:

- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Cache control for static assets (CSS, JS, images)

### _redirects File
Controls URL redirects:

- Handles trailing slashes
- Can redirect old paths to new paths
- Supports SPA routing if needed

## Testing

Test your deployment:

1. Visit your Cloudflare Pages URL
2. Test add-to-cart functionality
3. Test checkout process
4. Verify order submission
5. Check email notifications (if configured)

## Monitoring

- Use Cloudflare Analytics to monitor traffic
- Check function logs in the Cloudflare Dashboard
- Set up uptime monitoring for critical functions

## Troubleshooting

### Functions Not Working
- Check function syntax and exports
- Verify function file placement in `functions/` directory
- Check Cloudflare function logs

### Database Connection Issues
- Verify D1 database binding
- Check database permissions
- Test SQL queries in D1 console

### Build Failures
- Check file paths and permissions
- Verify Git repository structure
- Review build logs in Cloudflare Dashboard

## Performance Optimization

- Enable Cloudflare CDN caching
- Use image optimization
- Minify CSS and JavaScript
- Enable gzip compression
- Use Cloudflare Workers for additional processing

## Security

- Use HTTPS (automatic with Cloudflare)
- Implement rate limiting on functions
- Validate all input data
- Use environment variables for sensitive data
- Keep dependencies updated

## Scaling

- Cloudflare Pages automatically scales
- Consider using Cloudflare D1 for database scaling
- Implement caching strategies for high traffic
- Use Cloudflare Load Balancers for multi-region deployment