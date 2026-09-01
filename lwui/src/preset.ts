import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * LWAB Ecosystem Design System — shared Tailwind preset (v1.1.0).
 *
 * Every app in the ecosystem consumes this preset so utility names
 * (bg-card, text-muted-foreground, shadow-card, animate-fade-in, ...)
 * mean exactly the same thing everywhere.
 *
 * Usage in an app's tailwind.config.ts:
 *   import lwabPreset from "./src/design-system/tailwind.preset";
 *   export default { presets: [lwabPreset], content: [...] } satisfies Config;
 *
 * Pair it with src/design-system/tokens.css imported at the top of index.css.
 */
const lwabPreset = {
  darkMode: ["class"],
  content: [],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        kanban: {
          todo: "hsl(var(--kanban-todo))",
          progress: "hsl(var(--kanban-progress))",
          review: "hsl(var(--kanban-review))",
          done: "hsl(var(--kanban-done))",
        },
        pass: {
          red: "hsl(var(--pass-red))",
          yellow: "hsl(var(--pass-yellow))",
          green: "hsl(var(--pass-green))",
          blue: "hsl(var(--pass-blue))",
          purple: "hsl(var(--pass-purple))",
          orange: "hsl(var(--pass-orange))",
          gray: "hsl(var(--pass-gray))",
        },

        navy: {
          950: "hsl(var(--navy-950))",
          900: "hsl(var(--navy-900))",
          800: "hsl(var(--navy-800))",
          700: "hsl(var(--navy-700))",
          600: "hsl(var(--navy-600))",
        },
        // Gold scale — historically named "teal" across the fleet.
        teal: {
          500: "hsl(var(--teal-500))",
          400: "hsl(var(--teal-400))",
          300: "hsl(var(--teal-300))",
        },
        gold: {
          500: "hsl(var(--teal-500))",
          400: "hsl(var(--teal-400))",
          300: "hsl(var(--teal-300))",
        },
        // KPI card tones — token-backed, never raw palette colors.
        tone: {
          gold: "hsl(var(--tone-gold))",
          teal: "hsl(var(--tone-teal))",
          violet: "hsl(var(--tone-violet))",
          emerald: "hsl(var(--tone-emerald))",
          blue: "hsl(var(--tone-blue))",
          amber: "hsl(var(--tone-amber))",
        },
        status: {
          success: "hsl(var(--status-success))",
          warning: "hsl(var(--status-warning))",
          error: "hsl(var(--status-error))",
          info: "hsl(var(--status-info))",
          requested: "hsl(var(--status-requested))",
          pending: "hsl(var(--status-pending))",
          confirmed: "hsl(var(--status-confirmed))",
          "in-transit": "hsl(var(--status-in-transit))",
          delivered: "hsl(var(--status-delivered))",
          cancelled: "hsl(var(--status-cancelled))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        glow: "0 0 15px hsl(var(--teal-400) / 0.25)",
        "glow-lg": "0 0 40px hsl(var(--teal-400) / 0.3)",
        glass: "0 8px 32px hsl(var(--glass-shadow))",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-card": "var(--gradient-card)",
        "gradient-sidebar": "var(--gradient-sidebar)",
      },
      backdropBlur: { xs: "2px" },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out forwards",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default lwabPreset;
