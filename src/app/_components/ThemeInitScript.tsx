import Script from "next/script";

export function ThemeInitScript() {
  const code = `(function(){
  try {
    var key = "qlx-theme";
    var stored = localStorage.getItem(key);
    // Dark is the default appearance for the whole product; light is opt-in.
    var isDark = stored ? stored === "dark" : true;
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
