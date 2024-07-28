const container = document.getElementById("bottom");
let currentCity = "";

function createCard(title, description) {
  return `
    <div class="card" onclick="goToCityInfo('${title}')">
      <img src="assets/images/neon.avif" alt="card-image5" class="card-image" />
      <div class="cardText">
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
    </div>
  `;
}

function goToCityInfo(title) {
  window.location.href = `/cityInfo?city=${encodeURIComponent(title)}`;
}

function fetchCities() {
  fetch("ma.json")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((city) => {
        const card = createCard(city.city, city.admin_name);
        container.innerHTML += card;
      });
    })
    .catch((error) => {
      console.error("Error fetching cities:", error);
    });
}

fetchCities();
