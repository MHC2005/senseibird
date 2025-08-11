import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { 
    bg:"#0a0c0f",
    header:"#0b111a",
    panel:"#0b111a",
    accent:"#e11d48",
    ink:"#fca5a5",
    inkStrong:"#fecaca"
  } } },
  plugins: [],
};
export default config;
