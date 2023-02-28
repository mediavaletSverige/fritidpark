/* eslint-disable */

const editForm = document.getElementById('writeForm');
const editUserId = editForm.dataset.userid;

if (window.location.href.includes('/edit')) {
  document.querySelector('#art_header').textContent = 'redigera artikel';
  document.querySelector('main').style.display = 'block';
  backFromMenu.textContent = '←';

  // DISPLAYS INITIAL IMAGE COUNT ON LABEL
  (() => checkImageLength('edit', articleImgHeightsLength))();

  // GOES BACK TO ARTICLES
  art_btn.addEventListener('click', function () {
    window.history.go(-1);
  });

  // RESETS ARTICLE TO INITIAL STATE
  reset.addEventListener('click', function (e) {
    e.preventDefault();
    location.reload(true);
  });

  // FETCHES ARTICLE FROM API
  const getArticle = async (articleId) => {
    try {
      const res = await fetch(`/api/articles/${articleId}`).then((response) => response.json());

      if (res.status === 'success') {
        // FETCHES THE ARTICLE AS AN OBJECT
        const articleData = res.data.data;

        // ASSIGNS ARTICLE VALUES
        skribent.value = articleData.author;
        rubrik.value = articleData.h;
        koordinater.value = articleData.location.coordinates.join(',');
        koordinater.style.fontSize = '1rem';
        koordinater.style.color = 'gray';
        bildtext.value = articleData.fig1;
        bildtext2.value = articleData.fig2;
        citat.value = articleData.q;
        paragraf1.value = articleData.p1;
        paragraf2.value = articleData.p2;
        paragraf3.value = articleData.p3;

        // DISPLAYS ALL PARARAPHS PROPERLY IN ALL INPUT FIELDS
        const removeTagsFromParagraph = function (p) {
          const tags = p.match(/<[^<>]+>/g);
          let text = p;
          for (let i = 0; i < tags.length; i++) {
            text = tags[i] !== '<br class="pBr">' ? text.replace(tags[i], '') : text.replace(tags[i], '\n\n');
          }
          return text;
        };

        paragraf1.value = removeTagsFromParagraph(articleData.p1);
        if (paragraf2.value) paragraf2.value = removeTagsFromParagraph(articleData.p2);
        if (paragraf3.value) paragraf3.value = removeTagsFromParagraph(articleData.p3);

        // DISPLAYS ALL TAGS PROPERLY IN INPUT FIELD
        taggar.value = articleData.tags.map((el) => `#${el}`).join(' ');

        // CHECKS THE CORRECT TOPIC(S)
        articleData.topics.includes('fritid') && fritidInp.setAttribute('checked', true);
        articleData.topics.includes('park') && parkInp.setAttribute('checked', true);
        articleData.topics.includes('bad') && badInp.setAttribute('checked', true);

        img1 = previewImage1;
        img2 = previewImage2 || previewImage1.replace('img1', 'img2');

        // SWAPPING IMAGES
        let imageIsSwappedForEdit = false;

        exchangeImg.addEventListener('click', (e) => {
          e.preventDefault();
          if (imageIsSwappedForEdit) {
            img1 = imgs[1].src;
            img2 = imgs[0].src;
            imageIsSwappedForEdit = true;
          }
          if (!imageIsSwappedForEdit) {
            img1 = imgs[0].src;
            img2 = imgs[1].src;
            imageIsSwappedForEdit = false;
          }
        });

        // SUBMITS THE CHANGES TO THE API
        editForm.addEventListener('submit', (e) => {
          e.preventDefault();

          // CREATES CONSTANTS FROM INPUTS
          let fig1 = bildtext.value;
          let fig2 = bildtext2.value;
          const author = skribent.value;
          const location = koordinater.value.split(',').map((el) => +el);
          const h = rubrik.value;
          const tags = taggar.value.match(/[a-zäöåÄÖÅ\d-]+/g);
          const topics = ['fritid', 'park', 'bad'].filter(
            (_, i) => [fritidInp.checked, parkInp.checked, badInp.checked][i]
          );
          const q = citat.value;
          const p1 = insertText(paragraf1.value).replace(/\n/g, '');
          const p2 = insertText(paragraf2.value).replace(/\n/g, '');
          const p3 = insertText(paragraf3.value).replace(/\n/g, '');

          // CONVERTS IMAGES

          img1 = img1.includes('img')
            ? img1.replace('https://storage.cloud.google.com/fp_storage/public/img/articles/', '')
            : img1;

          img2 = img2.includes('img')
            ? img2.replace('https://storage.cloud.google.com/fp_storage/public/img/articles/', '')
            : img2;

          const editFormData = new FormData();

          if (btnFileOld.files.length === 1) {
            if (/storage/.test(previewImage1) && /blob/.test(previewImage2)) {
              editFormData.append('img2', btnFileOld.files[0]);
            }
            if (/blob/.test(previewImage1) && /storage/.test(previewImage2)) {
              editFormData.append('img1', btnFileOld.files[0]);
            }
          }

          // CREATES AN DATA OBJECT FROM THE VALUES ABOVE
          const data = {
            IMAGE_LEN: [imgs[0]?.src.includes('img'), imgs[1]?.src.includes('img')].filter((el) => !!el).length,
            FILE_LEN: btnFileOld.files.length,
            img1,
            img2,
            fig1,
            fig2,
            author,
            h,
            tags,
            topics,
            q,
            p1,
            p2,
            p3,
          };

          // PATCHES DATA TO API EXCEPT IMAGES
          const updateArticle = async () => {
            try {
              const res = await fetch(`/api/articles/${articleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });

              const json = await res.json();

              if (json.status === 'success') {
                console.log('data');
              }
            } catch (err) {
              console.log(err.message);
            }
          };

          updateArticle();

          // THE SECOND PATCH WITH ONLY FILE IMAGES

          console.log(...editFormData);

          const updateArticleImages = async (data) => {
            try {
              const res = await fetch(`/api/articles/existingimages/${articleId}`, {
                method: 'PATCH',
                body: data,
              });

              const json = await res.json();
              if (json.status === 'success') {
                console.log('images');
                //setTimeout(() => (window.location.href = `/article/${localStorage.getItem('goToSlug')}`), 2500);
              }
            } catch (err) {
              console.log(err.massage);
              //setTimeout(() => (window.location.href = `/article/${localStorage.getItem('goToSlug')}`), 2500);
            }
          };

          updateArticleImages(editFormData);
        });
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  getArticle(localStorage.getItem('articleId'));
}
