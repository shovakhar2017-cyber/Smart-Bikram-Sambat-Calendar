export type Language = 'np' | 'en';
export type Theme = 'light' | 'dark' | 'custom';
export type Layout = 'minimal' | 'decorative';

export interface Holiday {
  date: string; // BS date string "YYYY-MM-DD"
  nameNp: string;
  nameEn: string;
  descriptionNp?: string;
  descriptionEn?: string;
  isPublic: boolean;
}

export interface Quote {
  textNp: string;
  textEn: string;
  authorNp: string;
  authorEn: string;
}

export interface CalendarSettings {
  language: Language;
  theme: Theme;
  layout: Layout;
  imageFit?: 'cover' | 'contain';
  imageZoom?: number;
  customColor?: string;
  coverImage?: string; // Global cover image (legacy)
  monthImages?: Record<string, string>; // Map of "YYYY-MM" to base64 image
}
