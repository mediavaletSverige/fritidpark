/* eslint-disable */

const articleSlug = JSON.parse(read_art.dataset.article).slug;
const articleOwner = JSON.parse(read_art.dataset.article).owner;
const articleArticle = JSON.parse(read_art.dataset.article);
const articlePrivacy = JSON.parse(read_art.dataset.article).private;
const articlePContainers = document.querySelectorAll('.pParagraphContainer');
const localArticleImages = document.querySelectorAll('.pImg');
let clickedDeleteButtonOnce = false;

// GOES BACK TO ARTICLES WHEN CLICKING THE CLOSE BUTTON
if (window.location.href.includes(articleSlug)) {
  localStorage.setItem('coords', articleArticle.location.coordinates);
  add_button.forEach((button) =>
    button.addEventListener('click', function () {
      if (this.textContent !== '+') {
        localStorage.setItem('articleContainerIsClosed', true);
        window.history.go(-1);
      }
    })
  );
}

// GOES BACK TO ARTICLES
document.querySelector('.toMyArticles2').addEventListener('click', function () {
  window.history.go(-1);
});

// INCLUDES ALL THE PARAGRAPHS
articlePContainers.forEach(function (el, i) {
  el.innerHTML = articleArticle[`p${i + 1}`];
});

// REMOVES SECOND IMAGE IF ONLY ONE ARE PRESENT
window.addEventListener('load', () => {
  const artImg2 = document.querySelector('.artImg2');
  const artFig2 = document.querySelector('.artFig2');
  const artCap2 = document.querySelector('.artCap2');

  if (artImg2.clientHeight < 100) {
    artImg2.style.display = 'none';
    artFig2.style.display = 'none';
    artCap2.style.display = 'none';
  }
});

// THIS CONDITION WILL ONLY WORK IF YOU ARE THE OWNER OF THE ARTICLE
if (window.location.href.includes(articleSlug) && articleOwner === read_art.dataset.user) {
  localStorage.clear();

  // STORES CRUCIAL VALES FOR EDITING ARTICLE
  localStorage.setItem('coords', articleArticle.location.coordinates);
  localStorage.setItem('articleId', JSON.parse(read_art.dataset.article).id);
  localStorage.setItem('goToSlug', JSON.parse(read_art.dataset.article).slug);
  localStorage.setItem('localImg1', localArticleImages[0].src);
  localStorage.setItem('localImg2', localArticleImages[1].src);

  window.addEventListener('load', () =>
    localStorage.setItem(
      'articleImgHeights',
      Array.prototype.map.call(localArticleImages, (node) => node.clientHeight)
    )
  );

  // PUTS AN EDIT, HIDE AND A DELETE BUTTON TO ARTICLE
  const artContainer = document.getElementById('art_container');
  const toEditHTML = '<div id="art_btn" class="main-btn toEdit"><p>🖌</p></div>';
  const toHideHTML = `<div id="art_btn" class="main-btn toHide"><p>${articlePrivacy ? '◎' : '◉'}</p></div>`;
  const toDeleteHTML = '<div id="art_btn" class="main-btn toDelete"><p>✕</p></div>';

  artContainer.insertAdjacentHTML('beforeend', `${toEditHTML}${toHideHTML}${toDeleteHTML}`);
  art_btn.style.borderTopRightRadius = '0';
  artContainer.querySelector('.toEdit').style.borderTopRightRadius = '0';
  artContainer.querySelector('.toEdit').style.borderBottomLeftRadius = '0';
  artContainer.querySelector('.toHide').style.borderTopRightRadius = '0';
  artContainer.querySelector('.toHide').style.borderBottomLeftRadius = '0';
  artContainer.querySelector('.toHide').style.fontSize = '3.5rem';
  artContainer.querySelector('.toHide').querySelector('p').style.marginTop = '.1rem';
  artContainer.querySelector('.toDelete').style.borderBottomLeftRadius = '0';
  artContainer.querySelector('.toDelete').style.backgroundColor = 'rgb(232, 156, 156)';
  artContainer.querySelector('.toDelete').style.borderBottomLeftRadius = '0';
  artContainer.querySelector('.toDelete').style.fontSize = '2rem';
  artContainer.querySelector('.toDelete').querySelector('p').style.marginTop = '-.1rem';

  if (articlePrivacy) artContainer.querySelector('.toHide').style.color = 'rgb(232, 156, 156)';
  if (articlePrivacy) artContainer.querySelector('.toHide').querySelector('p').style.textShadow = '0 0 .15rem black';
  if (articlePrivacy) read_art.style.filter = 'grayscale(75%)';

  document.querySelector('.toEdit').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/edit';
  });

  // DELETES ARTICLE IF YOU CLICK THE BUTTON TWICE
  document.querySelector('.toDelete').addEventListener('click', function (e) {
    if (clickedDeleteButtonOnce) {
      const deleteArticle = async () => {
        try {
          const res = await fetch(`/api/articles/${localStorage.getItem('articleId')}`, {
            method: 'DELETE',
          });

          window.location.href = `/myArticles`;
        } catch (e) {
          console.log(e.message);
        }
      };

      deleteArticle();
    }
    artContainer.querySelector('.toDelete').style.backgroundColor = 'red';
    setTimeout(() => {
      clickedDeleteButtonOnce = false;
      artContainer.querySelector('.toDelete').style.backgroundColor = 'rgb(232, 156, 156)';
    }, 2000);
    clickedDeleteButtonOnce = true;
  });

  // MAKES ARTICLE EITHER PRIVATE OR PUBLIC
  const data = {
    private: articlePrivacy ? false : true,
  };

  // FETCH
  async function updateArticle(data) {
    try {
      const res = await fetch(`/api/articles/privacy/${localStorage.getItem('articleId')}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (json.status === 'success') {
        setTimeout(() => (window.location.href = `/article/${localStorage.getItem('goToSlug')}`), 500);
      }
    } catch (e) {
      setTimeout(() => (window.location.href = `/article/${localStorage.getItem('goToSlug')}`), 500);
    }
  }

  document.querySelector('.toHide').addEventListener('click', () => updateArticle(data));
}
