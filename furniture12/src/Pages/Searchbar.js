import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingBag, X, Loader2, Clock, TrendingUp } from 'lucide-react';

const BeautifulProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setIsLoading(true);
    setShowResults(true);
    try {
      const response = await fetch(`https://anrfurniture-2.onrender.com/api/pdt/q?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchProducts, 300), []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleProductSelect = (product) => {
    const newRecent = [product.name, ...recentSearches.filter(s => s !== product.name)].slice(0, 5);
    setRecentSearches(newRecent);
    console.log('Selected product:', product);
    window.location.href = `/zoom/${product._id}`;
  };

  const clearSearch = () => setSearchTerm('');

  const trendingSearches = ['Sofa', 'Dining Table', 'Bed', 'Chair', 'Wardrobe'];

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
      <div className="search-container" style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-4px', bottom: '-4px', left: '-4px', right: '-4px', background: 'linear-gradient(to right, #9333ea, #3b82f6, #14b8a6)', borderRadius: '16px', filter: 'blur(8px)', opacity: isFocused ? 1 : 0, transition: 'opacity 1s' }}></div>
          <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px' }}>
              <div>
                <Search style={{ height: '28px', width: '28px', color: isFocused ? '#3b82f6' : '#9ca3af', transition: 'color 0.3s' }} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => {
                  setIsFocused(true);
                  if (searchTerm) setShowResults(true);
                }}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder="Search for furniture, decor, and more..."
                style={{ flex: 1, marginLeft: '16px', fontSize: '20px', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#111827', fontWeight: '500' }}
              />
              {searchTerm && (
                <button onClick={clearSearch} style={{ padding: '8px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '9999px' }}>
                  <X style={{ height: '20px', width: '20px' }} />
                </button>
              )}
            </div>
          </div>
        </div>

        {showResults && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '12px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', boxShadow: '0 16px 48px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: '32rem', overflow: 'hidden', backdropFilter: 'blur(4px)' }}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                <div style={{ position: 'relative' }}>
                  <Loader2 style={{ height: '32px', width: '32px', animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
                </div>
                <span style={{ marginLeft: '12px', fontSize: '20px', color: '#6b7280', fontWeight: 500 }}>Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', maxHeight: '24rem', overflowY: 'auto', marginTop: '16px' }}>
                  {searchResults.map(product => (
                    <div key={product._id} onClick={() => handleProductSelect(product)} style={{ cursor: 'pointer', padding: '12px', border: '1px solid #f3f4f6', borderRadius: '12px', background: '#f9fafb', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img
                        src={product.images?.[0] || '/api/placeholder/64/64'}
                        alt={product.name}
                        style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }}
                        onError={(e) => (e.target.src = '/api/placeholder/64/64')}
                      />
                      <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px', textAlign: 'center' }}>{product.name}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>{product.category} • {product.material}</p>
                      {product.size && <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Size: {product.size}</p>}
                      <p style={{ marginTop: '8px', fontSize: '18px', fontWeight: 'bold', background: 'linear-gradient(to right, #3b82f6, #9333ea)', WebkitBackgroundClip: 'text', color: 'transparent' }}>${product.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <ShoppingBag style={{ height: '64px', width: '64px', color: '#d1d5db', marginBottom: '16px' }} />
                <p style={{ fontSize: '20px', fontWeight: '500', color: '#6b7280' }}>No products found</p>
                <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                  No results for "<span style={{ fontWeight: '500', color: '#6b7280' }}>{searchTerm}</span>"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {!showResults && (
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>🔍 Search through thousands of furniture pieces • Quick and smart results</p>
        </div>
      )}
    </div>
  );
};

export default BeautifulProductSearch;
