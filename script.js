const screens = [...document.querySelectorAll("[data-screen]")];
const navButtons = [...document.querySelectorAll("[data-screen-target]")];
const railButtons = [...document.querySelectorAll(".rail-item")];
const sheets = [...document.querySelectorAll("[data-sheet]")];
const sheetButtons = [...document.querySelectorAll("[data-sheet-target]")];
const closeSheetButtons = [...document.querySelectorAll("[data-close-sheet]")];
const matchModal = document.querySelector(".match-modal");
const profileCard = document.querySelector("#profileCard");
const discoverName = document.querySelector("#discoverName");
const discoverCity = document.querySelector("#discoverCity");

const profiles = [
  {
    name: "Fatima, 32",
    city: "Karachi, Pakistan",
    tags: ["Widow", "Teacher", "2 children"],
    photo:
      "linear-gradient(0deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.42) 34%, transparent 62%), url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80') center/cover",
  },
  {
    name: "Sana, 31",
    city: "Lahore, Pakistan",
    tags: ["Divorced", "Doctor", "Family verified"],
    photo:
      "linear-gradient(0deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.42) 34%, transparent 62%), url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80') center/cover",
  },
  {
    name: "Maryam, 40",
    city: "Islamabad, Pakistan",
    tags: ["Widow", "Business owner", "No children"],
    photo:
      "linear-gradient(0deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.42) 34%, transparent 62%), url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80') center/cover",
  },
];

let profileIndex = 0;

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });

  railButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.screenTarget === name);
  });

  document.querySelectorAll(".bottom-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.screenTarget === name);
  });

  closeSheets();
  closeMatch();
}

function openSheet(name) {
  sheets.forEach((sheet) => {
    const open = sheet.dataset.sheet === name;
    sheet.classList.toggle("open", open);
    sheet.setAttribute("aria-hidden", String(!open));
  });
}

function closeSheets() {
  sheets.forEach((sheet) => {
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
  });
}

function openMatch() {
  matchModal.classList.add("open");
  matchModal.setAttribute("aria-hidden", "false");
}

function closeMatch() {
  matchModal.classList.remove("open");
  matchModal.setAttribute("aria-hidden", "true");
}

function updateProfile() {
  const profile = profiles[profileIndex % profiles.length];
  const media = profileCard?.querySelector(".profile-media");
  const tags = profileCard?.querySelector(".tag-row");

  if (!profileCard || !media || !tags || !discoverName || !discoverCity) return;

  discoverName.textContent = profile.name;
  discoverCity.textContent = profile.city;
  media.style.background = profile.photo;
  tags.innerHTML = profile.tags.map((tag) => `<span>${tag}</span>`).join("");
}

function handleSwipe(type) {
  if (!profileCard) return;

  profileCard.classList.remove("swipe-like", "swipe-pass");
  profileCard.classList.add(type === "pass" ? "swipe-pass" : "swipe-like");

  window.setTimeout(() => {
    profileCard.classList.remove("swipe-like", "swipe-pass");
    if (type === "like" && profileIndex === 0) {
      openMatch();
    }
    profileIndex += 1;
    updateProfile();
  }, 260);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.screenTarget));
});

sheetButtons.forEach((button) => {
  button.addEventListener("click", () => openSheet(button.dataset.sheetTarget));
});

closeSheetButtons.forEach((button) => {
  button.addEventListener("click", closeSheets);
});

sheets.forEach((sheet) => {
  sheet.addEventListener("click", (event) => {
    if (event.target === sheet) closeSheets();
  });
});

document.querySelectorAll("[data-swipe]").forEach((button) => {
  button.addEventListener("click", () => handleSwipe(button.dataset.swipe));
});

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-choice]").forEach((choice) => {
      choice.classList.toggle("selected", choice === button);
    });

    const polygamyOption = document.querySelector(".polygamy-option");
    if (polygamyOption) {
      polygamyOption.style.display = button.dataset.choice === "female" ? "none" : "flex";
    }
  });
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => chip.classList.toggle("selected"));
});

document.querySelectorAll(".icebreakers button").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.querySelector(".chat-input input");
    if (input) input.value = button.textContent;
  });
});

document.querySelector(".chat-input")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector("input");
  if (!input || !input.value.trim()) return;

  const stack = document.querySelector(".message-stack");
  const message = document.createElement("div");
  message.className = "message sent";
  message.innerHTML = `<p>${input.value}</p><small>Now · Sent</small>`;
  stack?.appendChild(message);
  input.value = "";
  message.scrollIntoView({ block: "end", behavior: "smooth" });
});

document.querySelectorAll("[data-close-match]").forEach((button) => {
  button.addEventListener("click", closeMatch);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSheets();
    closeMatch();
  }
});

updateProfile();
