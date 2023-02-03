/* eslint-disable */

const writeForm = document.getElementById('writeForm');
const writeUserId = writeForm.dataset.userid;

if (window.location.href === 'http://127.0.0.1:3000/write') {
  //localStorage.clear();
  document.querySelector('#art_header').textContent = 'nytt inlägg';
  backFromMenu.textContent = '🖹';
  backFromMenu.addEventListener('click', () => (window.location.href = 'http://127.0.0.1:3000/articles'));

  // CHECKS IF IMAGES HAS BEEN SWAPPED

  let imageIsSwapped = false;
  exchangeImg.addEventListener('click', (e) => {
    if (imageIsSwapped) {
      imageIsSwapped = false;
    } else imageIsSwapped = true;
  });

  writeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let img1 = !imageIsSwapped ? btnFileOld.files[0] : btnFileOld.files[1];
    let img2 = imageIsSwapped ? btnFileOld.files[0] : btnFileOld.files[1];
    let fig1 = bildtext.value;
    let fig2 = bildtext2.value;
    const author = skribent.value;
    const location = koordinater.value.split(',').map((el) => +el);
    const h = rubrik.value;
    const tags = taggar.value.match(/[a-zäöåÄÖÅ\d-]+/g);
    const topics = ['fritid', 'park', 'bad'].filter((_, i) => [fritidInp.checked, parkInp.checked, badInp.checked][i]);
    const q = citat.value;
    const p1 = localStorage.getItem('p1');
    const p2 = localStorage.getItem('p2');
    const p3 = localStorage.getItem('p3');

    const writeFormData = new FormData();
    writeFormData.append('img1', img1);

    if (btnFileOld.files.length > 1) writeFormData.append('img2', img2);

    const data = {
      img1: '',
      img2: '',
      fig1,
      fig2,
      author,
      location: { coordinates: location },
      h,
      tags,
      topics,
      q,
      p1,
      p2,
      p3,
    };

    const createArticle = async (data) => {
      try {
        const res = await axios({
          method: 'POST',
          url: 'http://127.0.0.1:3000/api/articles',
          data,
        });

        if (res.data.status === 'success') {
          localStorage.setItem('goToSlug', res.data.data.slug);
          return res.data.data.id;
        }
      } catch (e) {
        console.log(e.response.data.message);
      }
    };

    const returnedDataId = createArticle(data);

    async function updateArticle(data) {
      try {
        const articleId = await returnedDataId;
        const res = await axios({
          method: 'PATCH',
          url: `http://127.0.0.1:3000/api/articles/images/${articleId}`,
          data,
        });
        if (res.data.status === 'success') {
          setTimeout(
            () => (window.location.href = `http://127.0.0.1:3000/article/${localStorage.getItem('goToSlug')}`),
            1500
          );
        }
      } catch (e) {
        console.log(res.status);
      }
    }
    updateArticle(writeFormData);
  });
}
