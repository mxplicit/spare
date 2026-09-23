// Cloudflare Pages Function for handling orders
// This function receives order data from the checkout form

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  
  if (request.method === 'POST') {
    try {
      const orderData = await request.json();
      
      // Validate required fields
      if (!orderData.firstName || !orderData.lastName || !orderData.email || 
          !orderData.phone || !orderData.address || !orderData.city || 
          !orderData.state || !orderData.zip || !orderData.country) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // Generate order ID
      const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      // Add timestamp and order ID
      orderData.orderId = orderId;
      orderData.createdAt = new Date().toISOString();
      orderData.status = 'pending';
      
      return new Response(JSON.stringify({
        success: true,
        orderId: orderId,
        message: 'Order received successfully'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
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
  
  if (request.method === 'GET') {
    const orderId = url.searchParams.get('order_id');
    
    if (!orderId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order ID required'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Order lookup not implemented in demo mode'
    }), {
      status: 501,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
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