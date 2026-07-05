const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.lucide) {
  window.lucide.createIcons({
    attrs: {
      "aria-hidden": "true"
    }
  });
}

const header = document.querySelector(".site-header");
const navItems = [...document.querySelectorAll(".nav-item")];
const sections = [...document.querySelectorAll("main section[id]")];

function updateHeader() {
  header?.classList.toggle("scrolled", window.scrollY > 32);
}

function updateActiveNav() {
  let current = sections[0]?.id || "";
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.38) {
      current = section.id;
    }
  }

  for (const item of navItems) {
    item.classList.toggle("active", item.getAttribute("href") === `#${current}`);
  }
}

let scrollQueued = false;
window.addEventListener("scroll", () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    updateHeader();
    updateActiveNav();
    scrollQueued = false;
  });
}, { passive: true });

updateHeader();
updateActiveNav();

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  }
}, {
  threshold: 0.12,
  rootMargin: "0px 0px -32px 0px"
});

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

document.querySelectorAll(".btn-glass").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    button.style.setProperty("--x", `${x}%`);
    button.style.setProperty("--y", `${y}%`);
  });
});

document.querySelectorAll(".glass-panel").forEach((panel) => {
  panel.addEventListener("pointermove", (event) => {
    const rect = panel.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    panel.style.setProperty("--glow-x", `${x}px`);
    panel.style.setProperty("--glow-y", `${y}px`);

    if (!isFinePointer || prefersReducedMotion || panel.classList.contains("device-frame") === false) {
      return;
    }

    const rotateX = ((y / rect.height) - 0.5) * -5;
    const rotateY = ((x / rect.width) - 0.5) * 5;
    panel.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  });

  panel.addEventListener("pointerleave", () => {
    panel.style.transform = "";
  });
});

if (isFinePointer) {
  const cursorOuter = document.getElementById("cursorOuter");
  const cursorInner = document.getElementById("cursorInner");
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let outerX = targetX;
  let outerY = targetY;

  document.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    if (cursorInner) {
      cursorInner.style.left = `${targetX}px`;
      cursorInner.style.top = `${targetY}px`;
    }
  });

  const loop = () => {
    outerX += (targetX - outerX) * 0.16;
    outerY += (targetY - outerY) * 0.16;
    if (cursorOuter) {
      cursorOuter.style.left = `${outerX}px`;
      cursorOuter.style.top = `${outerY}px`;
    }
    requestAnimationFrame(loop);
  };
  loop();

  const interactiveSelector = "a, button, .glass-panel, [data-glass]";
  document.querySelectorAll(interactiveSelector).forEach((element) => {
    element.addEventListener("pointerenter", () => cursorOuter?.classList.add("interactive"));
    element.addEventListener("pointerleave", () => cursorOuter?.classList.remove("interactive", "pressing"));
    element.addEventListener("pointerdown", () => cursorOuter?.classList.add("pressing"));
    element.addEventListener("pointerup", () => cursorOuter?.classList.remove("pressing"));
  });
}
