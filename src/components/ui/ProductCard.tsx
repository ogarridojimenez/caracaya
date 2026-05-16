'use client';

import Image from 'next/image';

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
  onOrder?: () => void;
}

export function ProductCard({ name, description, price, image, popular, onOrder }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {popular && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
            POPULAR
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-amber-600">${price.toFixed(2)}</span>
          <button
            onClick={onOrder}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
          >
            Pedir ahora
          </button>
        </div>
      </div>
    </div>
  );
}