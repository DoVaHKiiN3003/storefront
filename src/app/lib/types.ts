export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  priceLabel: string;
  category: string;
  image: string;
  images: string[];
  description: string;
  details: string[];
  materials: string;
  dimensions: string;
  origin: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}
