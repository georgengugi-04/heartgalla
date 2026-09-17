export type Artist = {
  id: string;
  name: string;
  slug: string;
  portrait: string | null;
  coverImage: string;
  bio: string | null;        // null = not yet written, never fabricate
  statement: string | null;
  location: string;
  socialLinks: { instagram?: string; tiktok?: string };
  featured: boolean;
  status: "confirmed" | "pending"; // pending = placeholder, flagged to editor
};

export type Artwork = {
  id: string;
  title: string;
  slug: string;
  artistId: string;
  image: string;
  images?: string[];
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  description: string | null;
  price: number | null;       // null => "Price on request"
  currency: "KES";
  availability: "available" | "sold" | "unlisted";
  collection: string | null;
  featured: boolean;
  tags: string[];
};

export type Story = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  category: "Studio" | "People" | "Places" | "Process" | "Culture" | "Style" | "Collecting" | "Kenyan Art";
  artists: string[];
};
