(function () {
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var loader = document.getElementById("loader");
  var fill = document.getElementById("loaderFill");
  var menu = document.getElementById("menu");
  var burger = document.getElementById("burger");
  var demo = document.getElementById("demo");
  var form = document.getElementById("demoForm");
  var status = document.getElementById("demoStatus");
  var lastFocus = null;

  function ready() {
    document.documentElement.classList.add("is-ready");
    if (!loader) return;
    loader.classList.add("is-out");
    window.setTimeout(function () { loader.remove(); }, reduce ? 0 : 480);
  }

  if (reduce || !fill) {
    ready();
  } else {
    fill.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 900, easing: "cubic-bezier(0.19, 1, 0.22, 1)", fill: "forwards" }
    );
    window.setTimeout(ready, 1100);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".rise").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".rise").forEach(function (el) { el.classList.add("is-in"); });
  }

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    menu.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
    document.getElementById("menuClose").focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    window.setTimeout(function () { menu.hidden = true; }, reduce ? 0 : 280);
    burger.focus();
  }
  burger.addEventListener("click", openMenu);
  document.getElementById("menuClose").addEventListener("click", closeMenu);
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (!link.hasAttribute("data-open-demo")) closeMenu();
    });
  });

  function openDemo() {
    lastFocus = document.activeElement;
    closeMenu();
    demo.hidden = false;
    demo.classList.add("open");
    var nameField = form.querySelector("[name=nombre]");
    if (nameField) nameField.focus();
  }
  function closeDemo() {
    demo.classList.remove("open");
    window.setTimeout(function () { demo.hidden = true; }, reduce ? 0 : 280);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll("[data-open-demo]").forEach(function (el) {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      openDemo();
    });
  });
  var openOnLoad =
    new URLSearchParams(window.location.search).get("probar") === "1" ||
    window.location.hash === "#demo";
  if (openOnLoad) openDemo();
  demo.querySelectorAll("[data-close-demo]").forEach(function (el) {
    el.addEventListener("click", closeDemo);
  });

  var slides = [
    { src: "assets/imagenes/18.png", alt: "Manos sobre una laptop con un calendario y una lista ilustrados.", label: "Agenda" },
    { src: "assets/imagenes/16.png", alt: "Profesional con bata frente a una laptop y marcas de verificación ilustradas.", label: "Cobro" },
    { src: "assets/imagenes/15.png", alt: "Profesional con bata señalando iconos clínicos ilustrados.", label: "Administración clínica" },
    { src: "assets/imagenes/2.png", alt: "Persona con un teléfono y una laptop, con un gráfico de asistencia ilustrado.", label: "Recetas" },
    { src: "assets/imagenes/11.png", alt: "Profesional en consulta señalando un panel de signos ilustrado, con laptop y tableta.", label: "Expediente clínico digital" }
  ];
  var paseImg = document.getElementById("paseImg");
  var paseCap = document.getElementById("paseCap");
  var paseDots = document.getElementById("paseDots");
  var paseIndex = 0;
  var paseTimer = 0;
  var paseWait = null;
  function paintSlide() {
    var slide = slides[paseIndex];
    paseImg.src = slide.src;
    paseImg.alt = slide.alt;
    if (paseCap) paseCap.textContent = slide.label;
    if (!paseDots) return;
    paseDots.querySelectorAll("button").forEach(function (dot, n) {
      if (n === paseIndex) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }
  function showSlide(next) {
    if (!paseImg) return;
    var target = (next + slides.length) % slides.length;
    function apply() {
      paseIndex = target;
      paintSlide();
      paseImg.classList.remove("is-out");
    }
    if (reduce) {
      apply();
      return;
    }
    window.clearTimeout(paseWait);
    paseImg.classList.add("is-out");
    paseWait = window.setTimeout(apply, 280);
  }
  function armPase() {
    window.clearInterval(paseTimer);
    if (reduce || !paseImg) return;
    paseTimer = window.setInterval(function () { showSlide(paseIndex + 1); }, 4200);
  }
  if (paseDots && paseImg) {
    slides.forEach(function (slide, n) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", slide.label);
      if (n === 0) dot.setAttribute("aria-current", "true");
      dot.addEventListener("click", function () { showSlide(n); armPase(); });
      paseDots.appendChild(dot);
    });
    document.getElementById("pasePrev").addEventListener("click", function () { showSlide(paseIndex - 1); armPase(); });
    document.getElementById("paseNext").addEventListener("click", function () { showSlide(paseIndex + 1); armPase(); });
    var pase = document.getElementById("plataforma");
    pase.addEventListener("mouseenter", function () { window.clearInterval(paseTimer); });
    pase.addEventListener("mouseleave", armPase);
    pase.addEventListener("focusin", function () { window.clearInterval(paseTimer); });
    pase.addEventListener("focusout", armPase);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) window.clearInterval(paseTimer);
      else armPase();
    });
    armPase();
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (!demo.hidden) closeDemo();
    else if (!menu.hidden) closeMenu();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var honeypot = String(data.get("website") || "");
    var rol = String(data.get("rol") || "").trim();
    var telefono = String(data.get("telefono") || "").trim();
    var clinica = String(data.get("nombreClinica") || "").trim();
    var payload = {
      nombre: String(data.get("nombre") || "").trim(),
      email: String(data.get("email") || "").trim(),
      consentPrivacy: true,
      consentMarketing: false,
      consentPrivacyVersion: "2026-07-01",
      honeypot: honeypot
    };
    if (telefono) payload.telefono = telefono;
    if (rol) payload.rol = rol;
    if (clinica) payload.nombreClinica = clinica;
    var button = form.querySelector("button[type=submit]");
    if (button) button.disabled = true;
    status.textContent = "Registrando la solicitud…";
    fetch("/api/v1/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (body) {
          return { ok: res.ok, status: res.status, body: body };
        });
      })
      .then(function (result) {
        if (result.status === 201 || result.status === 409) {
          var leadId = result.body && result.body.leadId ? result.body.leadId : "";
          var dest = "/saas/demo/";
          if (leadId) dest += "?leadId=" + encodeURIComponent(leadId);
          window.location.href = dest;
          return;
        }
        var msg = (result.body && result.body.error) || "No pudimos registrar tu solicitud. Intenta de nuevo.";
        status.textContent = msg;
        if (button) button.disabled = false;
      })
      .catch(function () {
        status.textContent = "No pudimos registrar tu solicitud. Revisa tu conexión e intenta de nuevo.";
        if (button) button.disabled = false;
      });
  });
})();
