// links.js

document.addEventListener('DOMContentLoaded', () => {
  const mapToggle = document.getElementById('map-toggle');
  const mapContainer = document.getElementById('map-container');

  if (mapToggle && mapContainer) {
    mapToggle.addEventListener('click', () => {
      mapContainer.classList.toggle('is-open');
      
      // Optional: scroll into view if opened
      if (mapContainer.classList.contains('is-open')) {
        setTimeout(() => {
          mapContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      }
    });
  }
});
