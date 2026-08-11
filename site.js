document.getElementById("year").textContent = new Date().getFullYear();

const header = document.querySelector(".site-header");
const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".section, .merged-intro, .benefits-section, .visit-section, .final-cta").forEach((section) => {
  section.classList.add("reveal");
  observer.observe(section);
});
