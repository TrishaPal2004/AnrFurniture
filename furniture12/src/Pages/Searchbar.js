import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, X, Loader2 } from 'lucide-react';

const DynamicProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      handleSearch(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setShowResults(true);

    try {
      const res = await fetch(`https://anrfurniture-2.onrender.com/api/pdt/q=${query}`);
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProductSelect = (product) => {
    const updatedRecent = [product.name, ...recentSearches.filter(r => r !== product.name)].slice(0, 5);
    setRecentSearches(updatedRecent);
    setSearchTerm('');
    setShowResults(false);
    console.log('Selected:', product);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="search-container relative">
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
            <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
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
                        src={product.image || '/api/placeholder/48/48'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/48/48';
                        }}
                      />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className="text-lg font-semibold text-blue-600">${product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No products found for "{searchTerm}"</p>
                <p className="text-sm">Try different keywords</p>
              </div>
            )}

            {/* Recent Searches */}
            {!searchTerm && recentSearches.length > 0 && (
              <div className="border-t border-gray-100 py-2">
                <p className="text-xs font-medium text-gray-500 px-4 py-2">Recent Searches</p>
                {recentSearches.map((recent, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSearchTerm(recent);
                      handleSearch(recent);
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
    </div>
  );
};

export default DynamicProductSearch;
