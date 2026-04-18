import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
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
        brand: {
          50:  "#F5F5FE",
          100: "#EDEDFC",
          200: "#D8D8F8",
          300: "#B8B8EE",
          400: "#8090E0",
          500: "#4D5EDB",
          600: "#2D3DD0",
          700: "#1A28C1",
          800: "#1520A0",
          900: "#101880",
          950: "#0A1060",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #F5F5FE 0%, #EDEDFC 50%, #F5F5FE 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(26,40,193,0.05), rgba(77,94,219,0.02))",
        "brand-gradient": "linear-gradient(135deg, #1A28C1, #2D3DD0)",
        "glow-gradient": "radial-gradient(ellipse at center, rgba(26,40,193,0.12) 0%, transparent 70%)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "bounce-slow": "bounce 3s infinite",
        "typewriter": "typewriter 3s steps(40) forwards",
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
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
          "100%": { boxShadow: "0 0 60px rgba(99,102,241,0.8)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        slideInLeft: {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        fadeInUp: {
          from: { transform: "translateY(30px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "brand": "0 0 30px rgba(26,40,193,0.2)",
        "brand-lg": "0 0 60px rgba(26,40,193,0.3)",
        "card": "0 4px 24px rgba(26,40,193,0.06)",
        "card-hover": "0 8px 40px rgba(26,40,193,0.10)",
        "glass": "0 8px 32px rgba(26,40,193,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        "glow-sm": "0 0 15px rgba(26,40,193,0.15)",
        "glow-md": "0 0 30px rgba(26,40,193,0.2)",
        "glow-lg": "0 0 60px rgba(26,40,193,0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
