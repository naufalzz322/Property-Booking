/**
 * Design Tokens - Accessible Color System
 * Based on WCAG 2.2 AA compliance (4.5:1 contrast ratio)
 *
 * Colors follow Tailwind naming conventions for easy migration
 */

export const colors = {
  // Primary - Brand Gold (#D4A853)
  // Note: Use ONLY for decorative/backgrounds, NOT for text on light backgrounds
  gold: {
    DEFAULT: "#D4A853",
    50: "#FDF8EF",
    100: "#F9EBD4",
    200: "#F2D7A8",
    300: "#EBC37D",
    400: "#E4AF52",
    500: "#D4A853", // Primary
    600: "#A98E5A",
    700: "#7F683D",
    800: "#544425",
    900: "#2A2110",
  },

  // Amber - Use for warnings, pending states
  // Fixed: Use darker shades for text contrast
  amber: {
    // Background colors (safe on white)
    bg: {
      50: "#FFFBEB",
      100: "#FEF3C7",
      200: "#FDE68A",
    },
    // Text colors - DARKER for WCAG AA compliance
    text: {
      600: "#92400E", // Was #D97706 - FAILING contrast
      700: "#78350F", // Darker for better contrast
      800: "#92400E",
      900: "#78350F",
    },
    // For UI elements on dark backgrounds
    ui: {
      400: "#FBBF24",
      500: "#F59E0B",
      600: "#D97706",
    },
  },

  // Emerald - Use for success, active states
  // Fixed: Use darker shades for text contrast
  emerald: {
    // Background colors (safe on white)
    bg: {
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
    },
    // Text colors - DARKER for WCAG AA compliance
    text: {
      600: "#166534", // Was #16A34A - MARGINAL contrast
      700: "#14532D", // Even darker
      800: "#166534",
      900: "#14532D",
    },
    // For UI elements on dark backgrounds
    ui: {
      400: "#34D399",
      500: "#10B981",
      600: "#059669",
    },
  },

  // Status Badge Colors (Background/Text pairs)
  // All pairs verified for WCAG AA contrast
  status: {
    // Booking Status
    pending: {
      bg: "bg-amber-100",
      text: "text-amber-800", // Changed from amber-700 to amber-800
      border: "border-amber-200",
    },
    confirmed: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
    },
    checkedIn: {
      bg: "bg-emerald-100",
      text: "text-emerald-800", // Changed from emerald-700
      border: "border-emerald-200",
    },
    completed: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
    },

    // Unit Status
    available: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
    },
    booked: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
    },
    occupied: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
    },
    maintenance: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
    },

    // Invoice Status
    unpaid: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
    },
    paid: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
    },
    overdue: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
    },
  },

  // Primary brand - for CTAs and primary actions
  primary: {
    bg: "bg-gold-500 hover:bg-gold-600 text-white",
    outline: "border-2 border-gold-500 text-gold-700 hover:bg-gold-50",
  },
} as const;

/**
 * Helper function to get status badge classes
 */
export function getStatusBadgeClasses(status: string, type: 'booking' | 'unit' | 'invoice' = 'booking') {
  const statusMap: Record<string, keyof typeof colors.status> = {
    // Booking
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CHECKED_IN: 'checkedIn',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
    CANCELLED: 'completed',
    // Unit
    AVAILABLE: 'available',
    BOOKED: 'booked',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
    // Invoice
    UNPAID: 'unpaid',
    PAID: 'paid',
    OVERDUE: 'overdue',
  };

  const key = statusMap[status.toUpperCase()] || 'pending';
  return colors.status[key];
}
