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
    if (page === 'article') {
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
        marker = pb;
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
if (location.href !== '/write' && !location.href.includes('/article/')) {
  const getArticles = async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: `/api/articles`,
      });

      if (res.data.status === 'success') {
        return res.data.data;
      }
    } catch (e) {
      console.log(e.response.data.message);
    }
  };

  getArticles().then(function (articles) {
    navigator.geolocation.getCurrentPosition((e) => {
      const { latitude, longitude } = e.coords;
      const map = L.map('map').setView(localStorage.getItem('coords').split(',') || [latitude, longitude], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

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
                                <a class="card" href="/article/${
                                  article.slug
                                }" style="background-image: url('img/articles/${article.img1}')">
                                  <div class="card_top">
                                    <div class="card_top_left">
                                      <img id="pLogga" src="/img/users/user-${article.owner}.jpeg">
                                      <p id="pSkribent">${authorArr[0][0]}. ${authorArr[authorArr.length - 1]}</p>
                                    </div>
                                    <div class="card_top_right">
                                      <p id="pTime">${getDay} ${getMonth} ${getYear}</p>
                                    </div>
                                  </div>
                                  <div class="card_bottom">
                                    <h3 class="card-rubrik" style="background: ${backgroundTopic()}">${article.h}</h3>
                                  </div>
                                </a>
                              </section>
                            `;

        const marker = L.marker([lat, lng], { icon: useMarker('article', article) })
          .addTo(map)
          .bindPopup(L.popup(popupOptions))
          .setPopupContent(articleHTML)
          .openPopup();

        map.addEventListener('zoomend', () => (map.getZoom() >= 13 ? marker.openPopup() : marker.closePopup()));
      });
    });
  });
}

// PREVIEW
if (location.href === '/write') {
  navigator.geolocation.getCurrentPosition((e) => {
    const { latitude, longitude } = e.coords;
    const map = L.map('map').setView([latitude, longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
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
