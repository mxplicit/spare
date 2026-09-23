// Product Data Loader for Serverless Loading
// This script provides functions to load product data from the JSON file or API

class ProductLoader {
  constructor() {
    this.products = [];
    this.categories = [];
    this.brands = [];
    this.loaded = false;
  }

  // Load product data from JSON file
  async loadFromJSON() {
    try {
      const response = await fetch('/data/products.json');
      const data = await response.json();
      
      this.products = data.products || [];
      this.categories = data.categories || [];
      this.brands = data.brands || [];
      this.loaded = true;
      
      return {
        success: true,
        products: this.products,
        categories: this.categories,
        brands: this.brands
      };
    } catch (error) {
      console.error('Error loading product data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Load product data from API (Cloudflare Functions)
  async loadFromAPI(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/products${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        this.products = data.products || [];
        this.loaded = true;
        return {
          success: true,
          products: this.products,
          total: data.total
        };
      } else {
        return {
          success: false,
          error: data.error
        };
      }
    } catch (error) {
      console.error('Error loading product data from API:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all products
  getProducts() {
    return this.products;
  }

  // Get product by ID
  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  // Get product by slug
  getProductBySlug(slug) {
    return this.products.find(p => p.slug === slug);
  }

  // Get products by category
  getProductsByCategory(categorySlug) {
    return this.products.filter(p => p.category === categorySlug);
  }

  // Get products by brand
  getProductsByBrand(brandSlug) {
    return this.products.filter(p => p.brand.toLowerCase() === brandSlug.toLowerCase());
  }

  // Search products
  searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return this.products.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Get featured products
  getFeaturedProducts() {
    return this.products.filter(p => p.featured);
  }

  // Get products on sale
  getSaleProducts() {
    return this.products.filter(p => p.price < p.regular_price);
  }

  // Get all categories
  getCategories() {
    return this.categories;
  }

  // Get category by slug
  getCategoryBySlug(slug) {
    return this.categories.find(c => c.slug === slug);
  }

  // Get all brands
  getBrands() {
    return this.brands;
  }

  // Get brand by slug
  getBrandBySlug(slug) {
    return this.brands.find(b => b.slug === slug);
  }

  // Filter products with multiple criteria
  filterProducts(filters = {}) {
    let filtered = [...this.products];
    
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters.brand) {
      filtered = filtered.filter(p => p.brand.toLowerCase() === filters.brand.toLowerCase());
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.inStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }
    
    if (filters.featured) {
      filtered = filtered.filter(p => p.featured);
    }
    
    return filtered;
  }

  // Sort products
  sortProducts(products, sortBy = 'name', order = 'asc') {
    const sorted = [...products];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'date':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        case 'popularity':
          comparison = a.reviews_count - b.reviews_count;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }

  // Get product recommendations based on a product
  getRecommendations(productId, limit = 4) {
    const product = this.getProductById(productId);
    if (!product) return [];
    
    // Get products from same category
    const sameCategory = this.getProductsByCategory(product.category)
      .filter(p => p.id !== productId);
    
    // Get products from same brand
    const sameBrand = this.getProductsByBrand(product.brand)
      .filter(p => p.id !== productId);
    
    // Combine and deduplicate
    const recommendations = [...sameCategory, ...sameBrand]
      .filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
    
    // Sort by rating and limit
    return this.sortProducts(recommendations, 'rating', 'desc')
      .slice(0, limit);
  }

  // Check if data is loaded
  isLoaded() {
    return this.loaded;
  }
}

// Create global instance
window.ProductLoader = new ProductLoader();

// Auto-load on page initialization
document.addEventListener('DOMContentLoaded', async function() {
  // Try to load from JSON first, fallback to API
  let result = await window.ProductLoader.loadFromJSON();
  
  if (!result.success) {
    console.log('JSON load failed, trying API...');
    result = await window.ProductLoader.loadFromAPI();
  }
  
  if (result.success) {
    console.log(`Loaded ${window.ProductLoader.getProducts().length} products`);
    // Dispatch custom event for other scripts to use
    document.dispatchEvent(new CustomEvent('productsLoaded', {
      detail: {
        products: window.ProductLoader.getProducts(),
        categories: window.ProductLoader.getCategories(),
        brands: window.ProductLoader.getBrands()
      }
    }));
  } else {
    console.error('Failed to load product data:', result.error);
  }
});