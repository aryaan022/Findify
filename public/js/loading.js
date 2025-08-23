// Hide loader when page is fully loaded
window.addEventListener("load", () => {
  document.getElementById("loader").classList.add("hidden");
});

// Show loader on link click before navigating
document.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (e) => {
    // Ignore external links
    if (!link.href.startsWith(window.location.origin)) return;

    e.preventDefault();
    const url = link.href;

    // Show loader
    document.getElementById("loader").classList.remove("hidden");

    // Navigate after short delay (match CSS fade)
    setTimeout(() => {
      window.location.href = url;
    }, 300);
  });
});
