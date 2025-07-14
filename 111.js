(function () {
  const applyColor = () => {
    document.querySelectorAll('p.break-normal.font-bold.tracking-tight.text-xs').forEach(el => {
      if (el.dataset.colorized) return;
      el.style.setProperty("color", "#4ade80", "important");
      el.dataset.colorized = "1";
    });
  };

  const observer = new MutationObserver(applyColor);
  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyColor);
  } else {
    applyColor();
  }
})();
