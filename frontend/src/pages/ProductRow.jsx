import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import imageService from '../services/imageService';

export default function ProductRow({ product, onEdit, onDelete }) {
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
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-12 h-12 object-cover rounded"
            onError={() => setImageUrl(null)}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs text-gray-400">No Image</span>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{product.name}</div>
        {product.description && (
          <div className="text-sm text-gray-500">{product.description}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{product.category || 'Uncategorized'}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-sm ${product.stock > 0 ? 'text-gray-900' : 'text-red-600'}`}>
          {product.stock}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-500">{product.barcode || '-'}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onEdit(product)}
          className="text-primary-600 hover:text-primary-900 mr-4"
        >
          <Edit className="w-5 h-5 inline" />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="w-5 h-5 inline" />
        </button>
      </td>
    </tr>
  );
}

