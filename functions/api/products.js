// Cloudflare Pages Function for product data
// This function provides product data for the static site

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  
  if (request.method === 'GET') {
    try {
      const category = url.searchParams.get('category');
      const productId = url.searchParams.get('product_id');
      const search = url.searchParams.get('search');
      
      // Sample product data (in production, load from database)
      const sampleProducts = [
        {
          id: 'prod-001',
          name: 'Engine Oil Filter',
          price: 25.99,
          category: 'engine-parts',
          description: 'High-quality engine oil filter for optimal engine performance',
          image: '/product-images/engine-oil-filter.jpg',
          stock: 50,
          brand: 'Generic',
          model: 'Universal'
        },
        {
          id: 'prod-002', 
          name: 'Brake Pads Set',
          price: 89.99,
          category: 'brake-disks-pads',
          description: 'Premium brake pads for safe and reliable stopping',
          image: '/product-images/brake-pads.jpg',
          stock: 30,
          brand: 'PremiumBrake',
          model: 'Universal'
        }
      ];
      
      // Filter by product ID if provided
      if (productId) {
        const product = sampleProducts.find(p => p.id === productId);
        if (product) {
          return new Response(JSON.stringify({
            success: true,
            product: product
          }), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } else {
          return new Response(JSON.stringify({
            success: false,
            error: 'Product not found'
          }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      
      // Filter by category if provided
      let filteredProducts = sampleProducts;
      if (category) {
        filteredProducts = sampleProducts.filter(p => p.category === category);
      }
      
      // Filter by search term if provided
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }
      
      return new Response(JSON.stringify({
        success: true,
        products: filteredProducts,
        total: filteredProducts.length
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: 'Method not allowed'
  }), {
    status: 405,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}