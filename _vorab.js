// Läuft vor dem ersten Zeichnen, damit nichts aufblitzt: Thema (?thema= > Merkzettel > System) und,
// nur in der Geräteansicht, die sicheren Bereiche eines großen Handys (?sicher=1).
(() => {
  const wurzel = document.documentElement;
  const param = new URLSearchParams(location.search);
  const wunsch = param.get("thema");
  let wahl = wunsch === "hell" || wunsch === "dunkel" || wunsch === "system" ? wunsch : null;
  if (!wahl) {
    try { wahl = localStorage.getItem("kiste.mockup.thema") || "system"; } catch (e) { wahl = "system"; }
  }
  const dunkel = window.matchMedia("(prefers-color-scheme: dark)").matches;
  wurzel.dataset.thema = wahl === "system" ? (dunkel ? "dunkel" : "hell") : wahl;
  if (param.get("roh") === "1") wurzel.dataset.roh = "1";
  if (param.get("sicher") === "1") {
    wurzel.style.setProperty("--h-sicher-oben", "59px");
    wurzel.style.setProperty("--h-sicher-unten", "34px");
  }
  // Eine Handy-Seite im breiten Fenster gehört in den Geräterahmen (außer mit ?roh=1 oder im Rahmen selbst).
  const allein = window.self === window.top;
  if (wurzel.dataset.oberflaeche === "handy" && allein && window.innerWidth > 600 && param.get("roh") !== "1") {
    const datei = location.pathname.split("/").pop();
    location.replace("geraet.html?seite=" + encodeURIComponent(datei));
  }
})();
