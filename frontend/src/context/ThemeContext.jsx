import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "arr-theme";

// Always start in LIGHT mode
function resolveInitial() {
  return "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return ctx;
}
