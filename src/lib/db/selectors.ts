/**
 * Prisma Selectors / Prisma Seçiciləri
 * Centralized Prisma select and include patterns
 * Mərkəzləşdirilmiş Prisma select və include pattern-ləri
 */

import { Prisma } from '@prisma/client';

/**
 * Product select patterns / Məhsul seçim pattern-ləri
 */
export const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  originalPrice: true,
  images: true,
  stock: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

/**
 * Product include patterns / Məhsul daxil etmə pattern-ləri
 */
export const productIncludeBasic = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  reviews: {
    select: {
      rating: true,
    },
  },
} satisfies Prisma.ProductInclude;

export const productIncludeDetailed = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  reviews: {
    select: {
      id: true,
      rating: true,
      comment: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
} satisfies Prisma.ProductInclude;

/**
 * Order include patterns / Sifariş daxil etmə pattern-ləri
 */
export const orderIncludeBasic = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  courier: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          images: true,
          price: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;

export const orderIncludeDetailed = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  courier: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          stock: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;

/**
 * Category include patterns / Kateqoriya daxil etmə pattern-ləri
 */
export const categoryIncludeBasic = {
  parent: true,
  children: {
    where: { isActive: true },
  },
  _count: {
    select: {
      products: {
        where: { isActive: true },
      },
    },
  },
} satisfies Prisma.CategoryInclude;

export const categoryIncludeWithProducts = {
  parent: true,
  children: {
    where: { isActive: true },
    include: {
      products: {
        where: { isActive: true },
        take: 4,
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
      },
    },
  },
  _count: {
    select: {
      products: {
        where: { isActive: true },
      },
    },
  },
} satisfies Prisma.CategoryInclude;

/**
 * Wishlist include patterns / İstək siyahısı daxil etmə pattern-ləri
 */
export const wishlistInclude = {
  product: {
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.WishlistItemInclude;

/**
 * Cart include patterns / Səbət daxil etmə pattern-ləri
 */
export const cartInclude = {
  product: {
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.CartItemInclude;

