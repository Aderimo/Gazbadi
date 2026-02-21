// ============================================
// Travel Atlas - TypeScript Tip Tanımlamaları
// ============================================

// Genel içerik gövdesi
export interface ContentBody {
  title: string;
  summary: string;
}

// Content_Item temel arayüzü
export interface ContentItem {
  id: string;
  slug: string;
  type: 'location' | 'blog' | 'recommendation' | 'friend-experience';
  status: 'draft' | 'published' | 'unpublished';
  createdAt: string;
  updatedAt: string;
  coverImage: string;
  seo: {
    tr: { title: string; description: string };
    en: { title: string; description: string };
  };
  content: {
    tr: ContentBody;
    en: ContentBody;
  };
}

// Lokasyon içerik gövdesi
export interface LocationContent extends ContentBody {
  city: string;
  country: string;
  introduction: string;
  transportation: string;
  accommodation: string;
  museums: string;
  historicalPlaces: string;
  restaurants: string;
  dailyRoutePlan: RoutePlanDay[];
  estimatedBudget: BudgetItem[];
  coordinates: { lat: number; lng: number };
  gallery: string[];
}

// Blog içerik gövdesi
export interface BlogContent extends ContentBody {
  title: string;
  body: string;
  tags: string[];
}

// Arkadaş deneyimi içerik gövdesi
export interface FriendExperienceContent extends ContentBody {
  friendName: string;
  visitedLocations: { name: string; slug?: string }[];
  narrative: string;
  locationComments: { locationName: string; comment: string }[];
  gallery: string[];
}

// Günlük rota planı
export interface RoutePlanDay {
  day: number;
  title: string;
  activities: string[];
  routePoints: RoutePoint[];
}

// Rota noktası (harita marker + bilgi)
export interface RoutePoint {
  name: string;
  coordinates: { lat: number; lng: number };
  description: string;
  tips: string;
  order: number;
}

// Bütçe kalemi
export interface BudgetItem {
  category: string;
  amount: number;
  currency: string;
  note: string;
}

// Harita marker verisi
export interface MapMarker {
  slug: string;
  title: string;
  coordinates: { lat: number; lng: number };
  coverImage: string;
  color?: 'red' | 'blue' | 'default';
  description?: string;
  tips?: string;
}

// Harita rota çizgisi
export interface MapRoute {
  points: { lat: number; lng: number }[];
  color: string;
  label?: string;
}

// Admin kimlik doğrulama
export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  token: string | null;
}

// i18n çeviri yapısı
export interface Translations {
  [key: string]: string | Translations;
}

// LanguageProvider context değeri
export interface LanguageContextValue {
  locale: 'tr' | 'en';
  setLocale: (locale: 'tr' | 'en') => void;
  t: (key: string) => string;
}

// ============================================
// Bileşen Props Arayüzleri
// ============================================

// ContentCard (genel kart bileşeni)
export interface ContentCardProps {
  item: ContentItem;
  locale: 'tr' | 'en';
  variant?: 'default' | 'featured' | 'compact';
}

// ImageManager (admin)
export interface ImageManagerProps {
  onImageSelect: (imagePath: string) => void;
  currentImage?: string;
}

// MapCoordinatePicker (admin)
export interface MapCoordinatePickerProps {
  initialCoordinates?: { lat: number; lng: number };
  onCoordinateChange: (coords: { lat: number; lng: number }) => void;
}

// RoutePointEditor (admin - rota noktası düzenleme)
export interface RoutePointEditorProps {
  routePoints: RoutePoint[];
  onRoutePointsChange: (points: RoutePoint[]) => void;
}

// RouteMap (lokasyon detay - rota haritası)
export interface RouteMapProps {
  center: { lat: number; lng: number };
  routePoints: RoutePoint[];
  zoom?: number;
}

// FriendExperienceEditor (admin)
export interface FriendExperienceEditorProps {
  experience?: ContentItem;
  onSave: (data: ContentItem) => void;
}
