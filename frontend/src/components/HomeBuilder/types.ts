export interface ComponentConfig {
  id: string;
  type: string;
  props: any;
  order: number;
}

export interface LayoutConfig {
  id: string;
  name: string;
  components: ComponentConfig[];
  version: number;
  lastModified: string;
}

export interface ComponentDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultProps: any;
}

export interface ComponentLibraryItem {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  preview: React.ReactNode;
}

// Tipos específicos para cada componente
export interface HeroBannerProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  link?: string;
}

export interface ServiceCardsProps {
  title: string;
  services: ServiceCardProps[];
  columns?: number;
}

export interface ContactFormProps {
  title: string;
  subtitle: string;
  fields: string[];
  submitText?: string;
  emailTo?: string;
}

export interface TestimonialProps {
  name: string;
  text: string;
  rating: number;
  avatar?: string;
  position?: string;
}

export interface TestimonialsProps {
  title: string;
  testimonials: TestimonialProps[];
  showRating?: boolean;
}

export interface StatProps {
  label: string;
  value: string;
  icon?: string;
}

export interface StatsProps {
  title: string;
  stats: StatProps[];
  columns?: number;
  showIcons?: boolean;
}

export interface ImageGalleryProps {
  title: string;
  images: string[];
  columns?: number;
  showCaptions?: boolean;
}

export interface MapProps {
  title: string;
  address: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
}

export interface TextBlockProps {
  title: string;
  content: string;
  alignment?: 'left' | 'center' | 'right';
  fontSize?: 'small' | 'medium' | 'large';
}

export interface ButtonProps {
  text: string;
  link: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export interface DividerProps {
  type: 'solid' | 'dashed' | 'dotted';
  color?: string;
  thickness?: number;
}

export interface SpacerProps {
  height: number;
}

// Union type para todas las props de componentes
export type ComponentProps = 
  | HeroBannerProps
  | ServiceCardsProps
  | ContactFormProps
  | TestimonialsProps
  | StatsProps
  | ImageGalleryProps
  | MapProps
  | TextBlockProps
  | ButtonProps
  | DividerProps
  | SpacerProps;

// Configuración de propiedades editables
export interface PropertyConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'image' | 'array' | 'boolean';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ComponentMeta {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  properties: PropertyConfig[];
  defaultProps: any;
} 