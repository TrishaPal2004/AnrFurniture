import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingBag, X, Loader2 } from 'lucide-react';

const DynamicProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Debounce function to avoid too many API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Function to call your backend API
  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      console.log('Searching for:', query);
      const response = await fetch(`https://anrfurniture-2.onrender.com/api/pdt/q?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`Search failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Search results:', data);
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };



  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => searchProducts(query), 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    // Add to recent searches
    const newRecent = [product.name, ...recentSearches.filter(s => s !== product.name)].slice(0, 5);
    setRecentSearches(newRecent);
    
    // Clear search
    setSearchTerm('');
    setShowResults(false);
    
    // Navigate to product page or handle selection
    console.log('Selected product:', product);
    // window.location.href = `/product/${product._id}`;
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Handle clicking outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="search-container relative">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm && setShowResults(true)}
            placeholder="Search for products..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
          />
          
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductSelect(product)}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={product.images?.[0] || '/api/placeholder/48/48'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/48/48';
                        }}
                      />
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.category}
                      </p>
                    </div>
                    
                    <div className="ml-3 flex-shrink-0">
                      <span className="text-lg font-semibold text-blue-600">
                        ${product.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="py-8 text-center text-gray-500">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No products found for "{searchTerm}"</p>
                <p className="text-sm">Try different keywords</p>
              </div>
            ) : null}

            {/* Recent Searches */}
            {!searchTerm && recentSearches.length > 0 && (
              <div className="border-t border-gray-100 py-2">
                <p className="text-xs font-medium text-gray-500 px-4 py-2">Recent Searches</p>
                {recentSearches.map((recent, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSearchTerm(recent);
                      searchProducts(recent);
                    }}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                  >
                    {recent}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Demo Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Backend Integration Guide:</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>API Endpoint:</strong> <code>/api/products/search?q=searchterm</code></p>
          <p><strong>Method:</strong> GET</p>
          <p><strong>Response:</strong> <code>{`{ "products": [...] }`}</code></p>
          <p><strong>MongoDB Query Example:</strong></p>
          <pre className="bg-blue-100 p-2 rounded text-xs mt-2 overflow-x-auto">
{`// In your Node.js backend
const searchProducts = async (query) => {
  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  }).limit(10);
  return products;
};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DynamicProductSearch;