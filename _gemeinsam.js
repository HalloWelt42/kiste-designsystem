// Gemeinsames Verhalten aller Mockup-Seiten. Kein Framework, nur was ein Mockup braucht:
// Thema, Fassung aus version.json, aktiver Navigationseintrag, aktiver Eintrag im Baum,
// Zustandsleuchte und kleine Durchklick-Schalter. Alles Weitere steht in der jeweiligen Seite.
(() => {
  const wurzel = document.documentElement;
  const body = document.body;
  const SPEICHER = "kiste.mockup.thema";

  // ---- Thema ------------------------------------------------------------------------------
  const system = () => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dunkel" : "hell");
  const knoepfe = () => document.querySelectorAll("[data-thema-knopf]");
  const zeigen = () => knoepfe().forEach((k) => k.classList.toggle("aktiv", k.dataset.themaKnopf === wurzel.dataset.thema));
  zeigen();
  knoepfe().forEach((k) => {
    k.addEventListener("click", () => {
      const wahl = k.dataset.themaKnopf;
      try { localStorage.setItem(SPEICHER, wahl); } catch (e) {}
      wurzel.dataset.thema = wahl === "system" ? system() : wahl;
      zeigen();
      document.dispatchEvent(new CustomEvent("thema", { detail: wurzel.dataset.thema }));
    });
  });

  // Ein einzelner Knopf wechselt zwischen hell und dunkel (Seitenleiste am Rechner, Mehr am Handy).
  document.querySelectorAll("[data-thema-wechsel]").forEach((k) => {
    k.addEventListener("click", () => {
      const wahl = wurzel.dataset.thema === "dunkel" ? "hell" : "dunkel";
      try { localStorage.setItem(SPEICHER, wahl); } catch (e) {}
      wurzel.dataset.thema = wahl;
      zeigen();
      document.dispatchEvent(new CustomEvent("thema", { detail: wahl }));
    });
  });

  // ---- Fassung aus der einzigen Quelle ---------------------------------------------------------
  fetch("version.json").then((r) => r.json()).then((v) => {
    document.querySelectorAll("[data-fassung]").forEach((el) => (el.textContent = "v" + v.version));
  }).catch(() => {});

  // ---- Aktiver Navigationseintrag aus <body data-seite="..."> ------------------------------------
  const seite = body.dataset.seite;
  if (seite) {
    document.querySelectorAll(".h-leiste-eintrag[data-seite], .r-nav-eintrag[data-seite]").forEach((a) =>
      a.classList.toggle("aktiv", a.dataset.seite === seite));
  }

  // ---- Baum am Rechner: <body data-baum="R4K2"> markiert den Eintrag und klappt die Vorfahren auf --
  const code = body.dataset.baum;
  if (code) {
    const zeile = document.querySelector(`.r-baumzeile[data-code="${code}"]`);
    if (zeile) {
      zeile.classList.add("aktiv");
      let knoten = zeile.closest(".r-baumknoten");
      while (knoten) {
        knoten.classList.add("offen");
        knoten = knoten.parentElement ? knoten.parentElement.closest(".r-baumknoten") : null;
      }
    }
  }

  // ---- Zustandsleuchte: <body data-leuchte="verbunden|last|getrennt"> -----------------------------
  const leuchte = body.dataset.leuchte;
  if (leuchte) {
    document.querySelectorAll(".r-leuchte, .h-leuchte").forEach((el) => {
      if (el.dataset.fest !== undefined) return;
      el.classList.remove("verbunden", "last", "getrennt");
      el.classList.add(leuchte);
    });
  }

  // ---- Durchklick-Schalter: data-schalte="#ziel" schaltet eine Klasse (Vorgabe "offen") ------------
  document.querySelectorAll("[data-schalte]").forEach((k) => {
    k.addEventListener("click", (ev) => {
      ev.preventDefault();
      const ziel = document.querySelector(k.dataset.schalte);
      if (ziel) ziel.classList.toggle(k.dataset.klasse || "offen");
    });
  });

  // ---- Ein- und Ausblenden: data-zeige="#blatt, #schleier" schaltet das Merkmal hidden ---------------
  document.querySelectorAll("[data-zeige]").forEach((k) => {
    k.addEventListener("click", (ev) => {
      ev.preventDefault();
      document.querySelectorAll(k.dataset.zeige).forEach((ziel) => (ziel.hidden = !ziel.hidden));
    });
  });

  // ---- Handy: Hülle und Blätter weichen der Bildschirmtastatur, das Feld rollt in die Mitte ---------
  const sicht = window.visualViewport;
  if (sicht && wurzel.dataset.oberflaeche === "handy") {
    const setzen = () => {
      const verdeckt = Math.max(0, Math.round(window.innerHeight - sicht.offsetTop - sicht.height));
      wurzel.style.setProperty("--h-tastatur", verdeckt + "px");
      wurzel.classList.toggle("tastatur-offen", verdeckt > 80);
      if (sicht.offsetTop > 0) window.scrollTo(0, 0);
    };
    sicht.addEventListener("resize", setzen);
    sicht.addEventListener("scroll", setzen);
    setzen();
    document.addEventListener("focusin", (ev) => {
      if (!ev.target.matches("input, textarea")) return;
      setTimeout(() => ev.target.scrollIntoView({ block: "center", behavior: "smooth" }), 250);
    });
  }

  // ---- Handy: der kurze Titel im Kopf erscheint, sobald der große Titel hinausgerollt ist -----------
  const rollfeld = document.querySelector(".h-huelle > .h-rollfeld");
  const grosserTitel = rollfeld && rollfeld.querySelector(".h-titelblock h1");
  if (grosserTitel && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => rollfeld.parentElement.classList.toggle("gerollt", !e.isIntersecting), { root: rollfeld }).observe(grosserTitel);
  }

  // ---- Verweise ins Leere tun in einem Mockup nichts ------------------------------------------------
  document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (ev) => ev.preventDefault()));
})();
