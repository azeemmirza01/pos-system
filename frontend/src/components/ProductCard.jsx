import { useState, useEffect } from 'react';
import imageService from '../services/imageService';

export default function ProductCard({ product, onAddToCart }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      if (product.image_url) {
        const url = await imageService.getImageUrl(product.image_url);
        setImageUrl(url);
      }
    };
    loadImage();
  }, [product.image_url]);

  return (
    <div
      onClick={() => onAddToCart(product)}
      className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md cursor-pointer transition-all"
    >
      <div className="aspect-square mb-2 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageUrl(null)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs">No Image</span>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-2 truncate">{product.category || 'Uncategorized'}</p>
      <p className="text-lg font-bold text-primary-600">${product.price.toFixed(2)}</p>
      <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
    </div>
  );
}

