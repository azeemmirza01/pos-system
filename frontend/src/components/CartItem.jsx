import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import imageService from '../services/imageService';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      if (item.image_url) {
        const url = await imageService.getImageUrl(item.image_url);
        setImageUrl(url);
      }
    };
    loadImage();
  }, [item.image_url]);

  return (
    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
      {/* Product Image */}
      <div className="flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.product_name}
            className="w-16 h-16 object-cover rounded border border-gray-200"
            onError={() => setImageUrl(null)}
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded border border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-400">No Image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 truncate">{item.product_name}</p>
        <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
        <p className="text-sm font-semibold text-primary-600 mt-1">${item.total.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
          className="p-1.5 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
          className="p-1.5 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => onRemove(item.product_id)}
          className="p-1.5 hover:bg-red-100 rounded text-red-600 border border-red-200 transition-colors ml-2"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

