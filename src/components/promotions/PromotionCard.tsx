import { Star, Plus, Clock } from 'lucide-react';

export interface PromotionUI {
  id: string | number;
  name: string;
  description?: string;
  items?: string[];
  originalPrice: number;
  discountPrice: number;
  discount?: number;
  image?: string; // emoji o url
  popular?: boolean;
  cookingTime?: number;
}

export default function PromotionCard({
  p,
  onAdd
}: {
  p: PromotionUI;
  onAdd?: (p: PromotionUI) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {p.popular && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-center py-1">
          <span className="text-sm font-semibold inline-flex items-center gap-1">
            <Star size={14} fill="white" /> MÁS POPULAR
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="text-center mb-4">
          <span className="text-4xl">{p.image ?? '🍣'}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{p.name}</h3>
        {p.description && <p className="text-gray-600 text-sm mb-4">{p.description}</p>}

        {p.items?.length ? (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Incluye:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {p.items.map((it, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>{it}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-gray-400 line-through text-sm">
              ${new Intl.NumberFormat('es-CL').format(p.originalPrice)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600">
                ${new Intl.NumberFormat('es-CL').format(p.discountPrice)}
              </span>
              {typeof p.discount === 'number' && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                  -{p.discount}%
                </span>
              )}
            </div>
          </div>
        </div>

        {typeof p.cookingTime === 'number' && (
          <div className="mb-3 text-sm text-gray-600 flex items-center gap-1">
            <Clock size={14} /> Tiempo de preparación: {p.cookingTime} min
          </div>
        )}

        <button
          onClick={() => onAdd?.(p)}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Agregar al Carrito
        </button>
      </div>
    </div>
  );
}
