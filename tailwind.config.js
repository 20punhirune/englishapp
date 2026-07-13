/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Play CDN と同じ見た目に寄せつつ、外部フォントなしで動くようにフォールバックを用意
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Noto Sans JP",
          "Meiryo",
          "sans-serif",
        ],
      },
      keyframes: {
        "pulse-fast": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.05)" },
        },
      },
      animation: {
        "pulse-fast": "pulse-fast 0.6s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
