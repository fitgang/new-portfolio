// An array of objects containing the details of several projects which will be shown in '#my-work' section
import { projects, techs } from "./projects.js";

// DOM
const myWorkSec = document.getElementById("my-work"),
  carouselArrows = myWorkSec.querySelectorAll(".carousel-arrows"),
  introSec = document.getElementById("introduction"),
  contactSec = document.getElementById("contact"),
  changeFormBtn = document.getElementById("change-form-btn");

// Create UI
renderProjectsInMyWorkSec();
renderTechList();

// EVENT LISTENERS

// Changes card shown
carouselArrows.forEach(arrow => arrow.addEventListener("click", (e) => {
  if (e.target.id.includes("left")) {
    showProjectCard(false);
    return
  }
  showProjectCard(true);
}));

// Change form UI
changeFormBtn.addEventListener("click", function() {
  const btn = this;
  let text = btn.innerText,
    from,
    to;

  if (text.search(/review/i) >= 0) {
    from = "message";
    to = "review";

  } else {
    to = "message";
    from = "review";
  }

  changeForm(from, to);
  btn.querySelector(".visible.content").innerText = text.replace(new RegExp(to, "i"), from)
});

// Show project cards when parent is viewed
const myWorkSecObserver = new IntersectionObserver(showElemOnIntersection, { threshold: 0.01 });
myWorkSecObserver.observe(myWorkSec);

// Change position of local link (contact btn) when specific sections are in view
const contactBtnObserver = new IntersectionObserver(moveBtnOnIntersection);
contactBtnObserver.observe(introSec);
contactBtnObserver.observe(contactSec);

// Renders the 'myWork' section
function renderProjectsInMyWorkSec() {
  const container = myWorkSec.querySelector("#my-work-cards");

  // Create cards and append
  projects.forEach((project) => {
    const card = createCardComponent(project);
    container.appendChild(card);
  });

  // Show one project
  container.firstElementChild.classList.add("active");
}

// input-object, output-elem node
function createCardComponent(project) {
  const li = document.createElement("li"),
    a = document.createElement("a"),
    h3 = document.createElement("h3"),
    p = document.createElement("p");

  h3.className = "capitalize";
  h3.innerText = project.heading;

  p.innerHTML = `${project.description}<br>Tech Used: ${project.tech}`;

  a.target = "_blank";
  a.href = project.link;
  a.append(h3, p);

  li.className = "my-work-card";
  li.appendChild(a);

  return li;
}

// Renders '#my-tech-list'
function renderTechList() {
  const list = document.getElementById("my-tech-list");
  techs.forEach(tech => {
    const comp = createListComponent(tech);
    list.append(comp.title, comp.description);
  })
}

// input-object, output-object of two elem node
function createListComponent(tech) {
  const dt = document.createElement("dt"),
    i = document.createElement("i"),
    dd = document.createElement("dd");

  i.className = `${tech.icon} icon`;
  dt.append(i, tech.name);
  dt.addEventListener("click", toggleContentDisplay); // EVENT LISTENER

  dd.innerHTML = tech.description;
  return { title: dt, description: dd }
}

function showProjectCard(bool) {

  // bool = true means show next card, false means previous card
  const activeCard = myWorkSec.querySelector(".my-work-card.active");

  // Hide active card
  activeCard.classList.remove("active");

  if (bool) {

    // Show next card
    let nextCard;

    // Check if the active card is the last one
    if (activeCard.nextElementSibling) nextCard = activeCard.nextElementSibling;
    else nextCard = activeCard.parentElement.firstElementChild;
    nextCard.classList.add("active")
    return
  }

  // Show previous card
  let nextCard;

  // Check if the active card is the last one
  if (activeCard.previousElementSibling) nextCard = activeCard.previousElementSibling;
  else nextCard = activeCard.parentElement.lastElementChild;
  nextCard.classList.add("active")
}

function toggleContentDisplay(e) {

  // Check for active content
  const activeTitle = document.querySelector("dt.active");
  if (activeTitle) {

    // Hide node
    activeTitle.classList.remove("active");
    activeTitle.nextElementSibling.style.maxHeight = null;

    // Check if active content is the requested content to hide by user 
    if (activeTitle.isSameNode(e.target)) return;
  }

  // Show requested content
  const title = e.target,
    con = title.nextElementSibling;
  con.style.maxHeight = con.scrollHeight + "px";
  title.classList.add("active");
}

// Shows elements when a specific section is viewed
function showElemOnIntersection(entries, observer) {
  const entry = entries[0];

  if (entry.isIntersecting) {

    // Show elements
    entry.target.classList.add("show");
    observer.unobserve(entry.target)
  }
}

// Positions a button according to the section viewed
function moveBtnOnIntersection(entries) {
  const entry = entries[0],
    btn = document.getElementById("cta-for-contact");

  if (entry.isIntersecting) {

    // position the button in the 'introduction' section
    btn.classList.remove("position");
    return;
  }

  // fix the button on bottom right of viewport
  btn.classList.add("position");
}

// Changes the from UI and related elements
// 'from' and 'to' are form names as strings
function changeForm(from, to) {
  const container = contactSec.querySelector("#contact-forms"),
    formToHide = container.querySelector(`#${from}-form`),
    formToShow = container.querySelector(`#${to}-form`),
    halfDuration = 250;

  formToHide.classList.add("hide");
  setTimeout(() => {
    formToHide.classList.add("none");
    formToShow.classList.remove("none");
  }, halfDuration);
  setTimeout(() => {
    formToShow.classList.remove("hide")
  }, halfDuration * 2);
}