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
  demo.querySelectorAll("[data-close-demo]").forEach(function (el) {
    el.addEventListener("click", closeDemo);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (!demo.hidden) closeDemo();
    else if (!menu.hidden) closeMenu();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var body = [
      "Nombre: " + data.get("nombre"),
      "Correo: " + data.get("correo"),
      "Práctica: " + data.get("practica"),
      "",
      "Solicitud de demo de Owame."
    ].join("\n");
    status.textContent = "Se abre tu correo para enviar la solicitud a contacto@newachi.mx.";
    window.location.href = "mailto:contacto@newachi.mx?subject=" +
      encodeURIComponent("Demo Owame") + "&body=" + encodeURIComponent(body);
  });
})();
