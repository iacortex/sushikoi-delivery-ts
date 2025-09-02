import { Sushi, ShoppingCart } from 'lucide-react';

export default function Header({ onCartClick }: { onCartClick?: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sushi />
          <span className="font-black">SushiKoi</span>
        </div>
        <button
          onClick={onCartClick}
          className="text-white/90 hover:text-white"
        >
          <ShoppingCart />
        </button>
      </div>
    </header>
  );
}
