/* eslint-disable */

function useMarker(page, type = null) {
  const checkMarker = function () {
    let marker;
    const f = '/img/images/marker-icon-2x-orange.png';
    const p = '/img/images/marker-icon-2x-green.png';
    const b = '/img/images/marker-icon-2x-blue.png';
    const fp = '/img/images/marker-icon-2x-yellow.png';
    const fb = '/img/images/marker-icon-2x-gold.png';
    const pb = '/img/images/marker-icon-2x-violet.png';
    const fpb = '/img/images/marker-icon-2x-red.png';
    if (page === 'preview') {
      if (fritidInp.checked && !parkInp.checked && !badInp.checked) marker = f;
      else if (!fritidInp.checked && parkInp.checked && !badInp.checked) marker = p;
      else if (!fritidInp.checked && !parkInp.checked && badInp.checked) marker = b;
      else if (fritidInp.checked && parkInp.checked && !badInp.checked) marker = fp;
      else if (fritidInp.checked && !parkInp.checked && badInp.checked) marker = fb;
      else if (!fritidInp.checked && parkInp.checked && badInp.checked) marker = pb;
      else if (fritidInp.checked && parkInp.checked && badInp.checked) marker = fpb;
      else marker = '/img/images/marker-icon-2x-grey.png';
    }
    if (page === 'artikel') {
      const length = type.topics.length;
      const topics = type.topics;
      const isPrivate = type.private;
      if (isPrivate === false && length === 1 && topics.includes('fritid')) marker = f;
      else if (isPrivate === false && length === 1 && topics.includes('park')) marker = p;
      else if (isPrivate === false && length === 1 && topics.includes('bad')) marker = b;
      else if (isPrivate === false && length === 2 && topics.includes('fritid') && topics.includes('park')) marker = fp;
      else if (isPrivate === false && length === 2 && topics.includes('fritid') && topics.includes('bad')) marker = fb;
      else if (isPrivate === false && length === 2 && topics.includes('park') && topics.includes('bad')) marker = pb;
      else if (
        isPrivate === false &&
        length === 3 &&
        topics.includes('fritid') &&
        topics.includes('park') &&
        topics.includes('park')
      )
        marker = fpb;
      else if (isPrivate === true) marker = '/img/images/marker-icon-2x-grey.png';
    }

    return marker;
  };

  return L.icon({
    iconUrl: checkMarker(),
    shadowUrl: '/img/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

// ARTICLES
if (!window.location.href.includes('/write')) {
  const getArticles = async () => {
    try {
      const res = await fetch(`/api/articles`, {
        method: 'GET',
      });

      const data = await res.json();
      if (data.status === 'success') {
        return data.data;
      }
    } catch (e) {
      console.log(e);
    }
  };

  getArticles().then(function (articles) {
    navigator.geolocation.getCurrentPosition((e) => {
      const { latitude, longitude } = e.coords;
      const coordinates = localStorage
        .getItem('coords')
        .split(',')
        .map((el) => +el) || [latitude, longitude];

      const map = L.map('map', { zoomSnap: 0.25, minZoom: 2.75 }).setView(coordinates, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      var bounds = L.latLngBounds(L.latLng(-89.98155760646617, -180), L.latLng(89.99346179538875, 180));

      map.setMaxBounds(bounds);
      map.on('drag', () => map.panInsideBounds(bounds, { animate: false }));

      const popupOptions = { autoClose: false, minWidth: 1, closeOnClick: false };

      articles.forEach(function (article) {
        const lat = article.location.coordinates[0];
        const lng = article.location.coordinates[1];

        // POPUP BACKGROUND VARIABLES
        const backgroundTopic = () => {
          let f = 'rgba(233, 203, 176, 0.75)';
          let p = 'rgba(178, 194, 157, 0.75)';
          let b = 'rgba(144, 204, 203, 0.75)';
          let F = article.topics.includes('fritid');
          let P = article.topics.includes('park');
          let B = article.topics.includes('bad');
          return F && !P && !B
            ? f
            : !F && P && !B
            ? p
            : !F && !P && B
            ? b
            : F && P && !B
            ? `linear-gradient(${f}, ${p})`
            : F && !P && B
            ? `linear-gradient(${f}, ${b})`
            : !F && P && B
            ? `linear-gradient(${p}, ${b})`
            : F && P && B
            ? `linear-gradient(${f}, ${p}, ${b})`
            : 'transparent';
        };

        const authorArr = article.author.split(' ');
        const date = new Date(article.date);
        const getDay = date.getDate();
        const getMonth = date.toLocaleDateString('sv-SE', { month: 'short' });
        const getYear = date.toLocaleDateString('sv-SE', { year: '2-digit' });

        const articleHTML = `<section class="card-container">
                                <a class="card leaflet-card" href="/artikel/${
                                  article.slug
                                }" style="background-image: url('https://storage.cloud.google.com/fp_storage/public/img/articles/${
          article.img1
        }')">
                                    <div class="leaflet-logo-container">
                                      <img id="pLogga" class="leaflet-pLogga" src="https://storage.cloud.google.com/fp_storage/public/img/users/user-${
                                        article.owner
                                      }.jpeg">
                                      <h3 class="card-rubrik leaflet-card-rubrik" style="background: ${backgroundTopic()}">${
          article.h
        }</h3>
                                    </div>
                                </a>
                              </section>
                            `;

        const marker = L.marker([lat, lng], { icon: useMarker('artikel', article) })
          .addTo(map)
          .bindPopup(L.popup(popupOptions))
          .setPopupContent(articleHTML)
          .openPopup();

        map.on('zoomstart', () => (map.getZoom() >= 13 ? marker.openPopup() : marker.closePopup()));
      });

      // GOES TO THE LAST VISITED COORDINATES
      if (coordinates) {
        map.setView(coordinates);
      }
    });
  });
}

// PREVIEW
if (window.location.href.includes('/write') || window.location.href[window.location.href.length - 1] === '/') {
  navigator.geolocation.getCurrentPosition((e) => {
    const { latitude, longitude } = e.coords;
    const map = L.map('map', { zoomSnap: 0.25, minZoom: 2.75 }).setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    if (window.location.href[window.location.href.length - 1] === '/') {
      L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.png', {
        attribution:
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
      }).addTo(map);
    }

    let previewMarker;

    map.on('click', function (e) {
      if (previewMarker) map.removeLayer(previewMarker);
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      previewMarker = new L.marker([lat, lng], { icon: useMarker('preview') }).addTo(map);
      koordinater.value = [lat, lng];
      koordinater.style.fontSize = '1rem';
      koordinater.style.color = 'gray';
    });

    formCat.addEventListener('change', function () {
      const layersIdx = Object.entries(map._layers)[1][0];
      const { lat, lng } = map._layers[layersIdx]._latlng;
      if (previewMarker) map.removeLayer(previewMarker);
      previewMarker = new L.marker([lat, lng], { icon: useMarker('preview') }).addTo(map);
    });

    // RESETS MARKER
    reset.addEventListener('click', () => map.removeLayer(previewMarker));
  });
}
