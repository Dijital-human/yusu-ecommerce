import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Store interfaces / Store interfeysləri
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer' | 'moderator';
  avatar?: string;
}

interface CartItem {
  id: string;
  productId: string;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface SiteSettings {
  // General settings / Ümumi tənzimləmələr
  siteName: {
    az: string;
    en: string;
    ru: string;
  };
  siteDescription: {
    az: string;
    en: string;
    ru: string;
  };
  logo: string;
  favicon: string;
  
  // Colors / Rənglər
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
  };
  
  // Typography / Tipografiya
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  
  // Layout / Layout
  layout: {
    headerHeight: string;
    footerHeight: string;
    sidebarWidth: string;
    maxWidth: string;
    padding: string;
  };
  
  // SEO / SEO
  seo: {
    title: {
      az: string;
      en: string;
      ru: string;
    };
    description: {
      az: string;
      en: string;
      ru: string;
    };
    keywords: string[];
    ogImage: string;
  };
  
  // Social media / Sosial media
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
  };
  
  // Contact / Əlaqə
  contact: {
    email: string;
    phone: string;
    address: {
      az: string;
      en: string;
      ru: string;
    };
    workingHours: {
      az: string;
      en: string;
      ru: string;
    };
  };
}

interface AdminState {
  // User state / İstifadəçi vəziyyəti
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Site settings / Sayt tənzimləmələri
  siteSettings: SiteSettings;
  
  // Cart state / Səbət vəziyyəti
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  
  // UI state / UI vəziyyəti
  isDarkMode: boolean;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Admin panel state / Admin panel vəziyyəti
  selectedPage: string;
  selectedComponent: string | null;
  isEditing: boolean;
  previewMode: boolean;
  
  // Actions / Əməliyyatlar
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  
  setSelectedPage: (page: string) => void;
  setSelectedComponent: (component: string | null) => void;
  setEditing: (isEditing: boolean) => void;
  setPreviewMode: (previewMode: boolean) => void;
}

// Default site settings / Varsayılan sayt tənzimləmələri
const defaultSiteSettings: SiteSettings = {
  siteName: {
    az: 'E-commerce Platform',
    en: 'E-commerce Platform',
    ru: 'E-commerce Platform',
  },
  siteDescription: {
    az: 'Müasir e-ticarət platforması',
    en: 'Modern e-commerce platform',
    ru: 'Современная платформа электронной коммерции',
  },
  logo: '',
  favicon: '',
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
  },
  typography: {
    fontFamily: 'Inter',
    headingFont: 'Inter',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  layout: {
    headerHeight: '4rem',
    footerHeight: 'auto',
    sidebarWidth: '16rem',
    maxWidth: '1280px',
    padding: '1rem',
  },
  seo: {
    title: {
      az: 'E-commerce Platform',
      en: 'E-commerce Platform',
      ru: 'E-commerce Platform',
    },
    description: {
      az: 'Müasir e-ticarət platforması',
      en: 'Modern e-commerce platform',
      ru: 'Современная платформа электронной коммерции',
    },
    keywords: ['e-commerce', 'online shop', 'e-ticarət'],
    ogImage: '',
  },
  socialMedia: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
  },
  contact: {
    email: 'info@example.com',
    phone: '+994 50 123 45 67',
    address: {
      az: 'Bakı, Azərbaycan',
      en: 'Baku, Azerbaijan',
      ru: 'Баку, Азербайджан',
    },
    workingHours: {
      az: 'Bazar ertəsi - Cümə: 09:00 - 18:00',
      en: 'Monday - Friday: 09:00 - 18:00',
      ru: 'Понедельник - Пятница: 09:00 - 18:00',
    },
  },
};

// Create store / Store yarat
export const useStore = create<AdminState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state / İlkin vəziyyət
        user: null,
        isAuthenticated: false,
        isLoading: false,
        siteSettings: defaultSiteSettings,
        cart: [],
        cartTotal: 0,
        cartCount: 0,
        isDarkMode: false,
        sidebarOpen: true,
        mobileMenuOpen: false,
        selectedPage: 'dashboard',
        selectedComponent: null,
        isEditing: false,
        previewMode: false,
        
        // User actions / İstifadəçi əməliyyatları
        setUser: (user) => set({ user }),
        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        setLoading: (isLoading) => set({ isLoading }),
        
        // Site settings actions / Sayt tənzimləmə əməliyyatları
        updateSiteSettings: (settings) =>
          set((state) => ({
            siteSettings: { ...state.siteSettings, ...settings },
          })),
        
        // Cart actions / Səbət əməliyyatları
        addToCart: (item) =>
          set((state) => {
            const existingItem = state.cart.find(
              (cartItem) =>
                cartItem.productId === item.productId &&
                cartItem.variant === item.variant
            );
            
            if (existingItem) {
              const updatedCart = state.cart.map((cartItem) =>
                cartItem.id === existingItem.id
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem
              );
              
              const cartTotal = updatedCart.reduce(
                (total, cartItem) => total + cartItem.price * cartItem.quantity,
                0
              );
              
              return {
                cart: updatedCart,
                cartTotal,
                cartCount: updatedCart.reduce(
                  (count, cartItem) => count + cartItem.quantity,
                  0
                ),
              };
            } else {
              const newItem = {
                ...item,
                id: `${item.productId}-${item.variant || 'default'}-${Date.now()}`,
              };
              
              const updatedCart = [...state.cart, newItem];
              const cartTotal = updatedCart.reduce(
                (total, cartItem) => total + cartItem.price * cartItem.quantity,
                0
              );
              
              return {
                cart: updatedCart,
                cartTotal,
                cartCount: updatedCart.reduce(
                  (count, cartItem) => count + cartItem.quantity,
                  0
                ),
              };
            }
          }),
        
        removeFromCart: (id) =>
          set((state) => {
            const updatedCart = state.cart.filter((item) => item.id !== id);
            const cartTotal = updatedCart.reduce(
              (total, cartItem) => total + cartItem.price * cartItem.quantity,
              0
            );
            
            return {
              cart: updatedCart,
              cartTotal,
              cartCount: updatedCart.reduce(
                (count, cartItem) => count + cartItem.quantity,
                0
              ),
            };
          }),
        
        updateCartItem: (id, quantity) =>
          set((state) => {
            if (quantity <= 0) {
              return get().removeFromCart(id);
            }
            
            const updatedCart = state.cart.map((item) =>
              item.id === id ? { ...item, quantity } : item
            );
            
            const cartTotal = updatedCart.reduce(
              (total, cartItem) => total + cartItem.price * cartItem.quantity,
              0
            );
            
            return {
              cart: updatedCart,
              cartTotal,
              cartCount: updatedCart.reduce(
                (count, cartItem) => count + cartItem.quantity,
                0
              ),
            };
          }),
        
        clearCart: () =>
          set({
            cart: [],
            cartTotal: 0,
            cartCount: 0,
          }),
        
        // UI actions / UI əməliyyatları
        toggleDarkMode: () =>
          set((state) => {
            const newDarkMode = !state.isDarkMode;
            
            // Update document class / Document sinifini yenilə
            if (typeof window !== 'undefined') {
              if (newDarkMode) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }
            
            return { isDarkMode: newDarkMode };
          }),
        
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        
        toggleMobileMenu: () =>
          set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
        
        // Admin panel actions / Admin panel əməliyyatları
        setSelectedPage: (page) => set({ selectedPage: page }),
        setSelectedComponent: (component) => set({ selectedComponent: component }),
        setEditing: (isEditing) => set({ isEditing }),
        setPreviewMode: (previewMode) => set({ previewMode }),
      }),
      {
        name: 'ecommerce-store', // localStorage key / localStorage açarı
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          siteSettings: state.siteSettings,
          cart: state.cart,
          isDarkMode: state.isDarkMode,
        }),
      }
    ),
    {
      name: 'ecommerce-store', // DevTools name / DevTools adı
    }
  )
);

// Selectors / Seçicilər
export const useUser = () => useStore((state) => state.user);
export const useIsAuthenticated = () => useStore((state) => state.isAuthenticated);
export const useIsLoading = () => useStore((state) => state.isLoading);
export const useSiteSettings = () => useStore((state) => state.siteSettings);
export const useCart = () => useStore((state) => state.cart);
export const useCartTotal = () => useStore((state) => state.cartTotal);
export const useCartCount = () => useStore((state) => state.cartCount);
export const useIsDarkMode = () => useStore((state) => state.isDarkMode);
export const useSidebarOpen = () => useStore((state) => state.sidebarOpen);
export const useMobileMenuOpen = () => useStore((state) => state.mobileMenuOpen);
export const useSelectedPage = () => useStore((state) => state.selectedPage);
export const useSelectedComponent = () => useStore((state) => state.selectedComponent);
export const useIsEditing = () => useStore((state) => state.isEditing);
export const usePreviewMode = () => useStore((state) => state.previewMode);

// Actions / Əməliyyatlar
export const useUserActions = () => useStore((state) => ({
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
  setLoading: state.setLoading,
}));

export const useSiteSettingsActions = () => useStore((state) => ({
  updateSiteSettings: state.updateSiteSettings,
}));

export const useCartActions = () => useStore((state) => ({
  addToCart: state.addToCart,
  removeFromCart: state.removeFromCart,
  updateCartItem: state.updateCartItem,
  clearCart: state.clearCart,
}));

export const useUIActions = () => useStore((state) => ({
  toggleDarkMode: state.toggleDarkMode,
  toggleSidebar: state.toggleSidebar,
  toggleMobileMenu: state.toggleMobileMenu,
}));

export const useAdminActions = () => useStore((state) => ({
  setSelectedPage: state.setSelectedPage,
  setSelectedComponent: state.setSelectedComponent,
  setEditing: state.setEditing,
  setPreviewMode: state.setPreviewMode,
}));
