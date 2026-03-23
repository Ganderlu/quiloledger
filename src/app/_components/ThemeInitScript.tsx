import Script from "next/script";

export function ThemeInitScript() {
  const code = `(function(){
  try {
    var key = "qlx-theme";
    var stored = localStorage.getItem(key);
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored ? stored === "dark" : prefersDark;
    var root = document.documentElement;
    if (isDark) root.classList.add("dark"); else root.classList.remove("dark");
    root.style.colorScheme = isDark ? "dark" : "light";
  } catch (e) {}
})();`;

  return (
    <Script id="qlx-theme-init" strategy="beforeInteractive">
      {code}
    </Script>
  );
}
