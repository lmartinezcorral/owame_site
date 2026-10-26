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
      { duration: 380, easing: "cubic-bezier(0.19, 1, 0.22, 1)", fill: "forwards" }
    );
    window.setTimeout(ready, 450);
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

  var locked = [];
  function lockPage(keep) {
    unlockPage();
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === keep || el.tagName === "SCRIPT") return;
      locked.push({ el: el, inert: el.inert });
      el.inert = true;
    });
    document.documentElement.classList.add("is-locked");
  }
  function unlockPage() {
    locked.forEach(function (item) { item.el.inert = item.inert; });
    locked = [];
    document.documentElement.classList.remove("is-locked");
  }

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    menu.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
    lockPage(menu);
    document.getElementById("menuClose").focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    window.setTimeout(function () { menu.hidden = true; }, reduce ? 0 : 280);
    unlockPage();
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
    lockPage(demo);
    var nameField = form.querySelector("[name=nombre]");
    if (nameField) nameField.focus();
  }
  function closeDemo() {
    demo.classList.remove("open");
    window.setTimeout(function () { demo.hidden = true; }, reduce ? 0 : 280);
    unlockPage();
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

  var dock = document.getElementById("dock");
  var heroCta = document.querySelector(".hero-cta");
  var closingCta = document.querySelector(".origin .cta-row");
  if (dock && heroCta && "IntersectionObserver" in window) {
    var heroGone = false;
    var closingShown = false;
    var dockIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === heroCta) heroGone = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        else closingShown = entry.isIntersecting;
      });
      var on = heroGone && !closingShown;
      dock.classList.toggle("is-on", on);
      dock.inert = !on;
    });
    dockIo.observe(heroCta);
    if (closingCta) dockIo.observe(closingCta);
  }

  var slides = [
    { src: "assets/imagenes/producto/producto-agenda.webp", alt: "Vista semanal de la agenda de Owame con las citas de lunes a viernes.", label: "Agenda" },
    { src: "assets/imagenes/producto/producto-expediente.webp", alt: "Nota clínica SOAP en Owame, lista para sellar.", label: "Expediente clínico digital" },
    { src: "assets/imagenes/producto/producto-diagnostico.webp", alt: "Evaluación clínica en Owame con diagnóstico CIE-10 e indicaciones para el paciente.", label: "Diagnóstico CIE-10 e indicaciones" },
    { src: "assets/imagenes/producto/producto-cobro.webp", alt: "Carrito de cobro de Owame con dos sesiones y un total de $1,150.", label: "Cobro" },
    { src: "assets/imagenes/producto/producto-inicio.webp", alt: "Inicio de Owame con accesos a pacientes, agenda, cobro, caja y expediente.", label: "Administración clínica" }
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
    new Image().src = slides[(paseIndex + 1) % slides.length].src;
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
  var pasePaused = false;
  var paseVisible = true;
  function armPase() {
    window.clearInterval(paseTimer);
    if (reduce || !paseImg || pasePaused || !paseVisible || document.hidden) return;
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
    document.addEventListener("visibilitychange", armPase);
    var pauseBtn = document.getElementById("pasePause");
    if (reduce) {
      pauseBtn.hidden = true;
    } else {
      pauseBtn.addEventListener("click", function () {
        pasePaused = !pasePaused;
        pauseBtn.setAttribute("aria-pressed", String(pasePaused));
        armPase();
      });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        paseVisible = entries[0].isIntersecting;
        armPase();
      }, { threshold: 0.25 }).observe(pase);
    }
    new Image().src = slides[1].src;
    armPase();
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (!demo.hidden) closeDemo();
    else if (!menu.hidden) closeMenu();
  });

  function setStatus(text, isError) {
    status.textContent = text;
    status.classList.toggle("is-error", !!isError);
  }
  function leadError(result) {
    var fields = result.body && result.body.details && result.body.details.fieldErrors;
    if (result.status === 0) {
      return { text: "No pudimos conectar con Owame. Revisa tu internet e intenta de nuevo." };
    }
    if (result.status === 429) {
      return { text: "Hiciste varios intentos seguidos. Espera unos minutos e intenta de nuevo." };
    }
    if (result.status === 400) {
      if (fields && fields.email) return { text: "Revisa tu correo: parece incompleto.", field: "email" };
      if (fields && fields.nombre) return { text: "Escribe tu nombre para continuar.", field: "nombre" };
      var apiMsg = result.body && result.body.error;
      return { text: apiMsg && apiMsg !== "Datos inválidos" ? apiMsg : "Revisa los datos del formulario e intenta de nuevo." };
    }
    return { text: "No pudimos registrar tu solicitud por un problema de nuestro lado. Intenta en unos minutos o escríbenos a contacto@newachi.mx." };
  }

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
    setStatus("Registrando la solicitud…", false);
    fetch("/api/v1/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.text().then(function (text) {
          var body = null;
          try { body = text ? JSON.parse(text) : null; } catch (e) { body = null; }
          return { status: res.status, body: body };
        });
      }, function () {
        return { status: 0, body: null };
      })
      .then(function (result) {
        if (result.status === 201 || result.status === 409) {
          var leadId = result.body && result.body.leadId ? result.body.leadId : "";
          var dest = "/saas/demo/";
          if (leadId) dest += "?leadId=" + encodeURIComponent(leadId);
          window.location.href = dest;
          return;
        }
        var err = leadError(result);
        setStatus(err.text, true);
        if (button) button.disabled = false;
        if (err.field && form.elements[err.field]) form.elements[err.field].focus();
      });
  });
})();
