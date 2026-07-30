/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  fontFamily: {
  title: ["Tektur", "sans-serif"]
  },
  plugins: [require("tailwindcss-animate")],
  colors: {
  background: "#024028",
  primary: "#0d9c57",
  text: "#ffffff",
  }
  
}

