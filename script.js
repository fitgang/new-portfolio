const myWorkSec = document.getElementById("my-work");

const observer = new IntersectionObserver(showElemOnIntersection, { threshold: 0.2 });

observer.observe(myWorkSec);

function showElemOnIntersection(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const section = entry.target;
      section.querySelectorAll(".my-work-card").forEach(card => card.classList.add("show-my-work-card"));
      section.querySelectorAll(".my-work-btn").forEach(btn => btn.classList.add("show-my-work-btn"));
      observer.unobserve(section)
    }
  })
}