/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/components/kanban/*.jsx"],
  theme: {
    extend: {
      colors: {
        mainBackgroundColor: "#FFF",
        columnBackgroundColor: "#1976d2 ",
      },
    },
  },
  plugins: [],
};
