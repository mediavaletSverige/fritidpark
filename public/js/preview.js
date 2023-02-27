/* eslint-disable */

imgs = document.getElementsByClassName('pImg');
const localImages = (n) => `article-${localStorage.getItem('articleId')}-img${n}.jpeg`;

const timeObj = {
  day: 'numeric',
  month: 'short',
  year: '2-digit',
};

const time = new Date().toLocaleString('sv-SE', timeObj);

['change', 'input'].forEach((el) => document.addEventListener(el, previewHTML));

// ACCURATE IMAGE DISPLAY
if (checkParam('edit')) {
  previewImage1 = `https://storage.cloud.google.com/fp_storage/public/img/articles/${localImages(1)}`;
  previewImage2 =
    pImgs < 2 ? null : `https://storage.cloud.google.com/fp_storage/public/img/articles/${localImages(2)}`;
}

// DISPLAYS ARTICLE IN EDIT MODE AND SHOWS REAL TIME CHANGES
if (checkParam('edit')) {
  const instantPreview = (delay) => Promise.resolve(setTimeout(() => previewHTML(), delay));
  instantPreview(300).then(() => instantPreview(400));
}

// DISPLAYS ARTICLE BACKGROUND
const checkTopic = function () {
  let color;
  let f = 'rgba(233, 203, 176, 0.75)';
  let p = 'rgba(178, 194, 157, 0.75)';
  let b = 'rgba(144, 204, 203, 0.75)';
  if (fritidInp.checked && !parkInp.checked && !badInp.checked) color = f;
  else if (!fritidInp.checked && parkInp.checked && !badInp.checked) color = p;
  else if (!fritidInp.checked && !parkInp.checked && badInp.checked) color = b;
  else if (fritidInp.checked && parkInp.checked && !badInp.checked) color = `linear-gradient(${f}, ${p})`;
  else if (fritidInp.checked && !parkInp.checked && badInp.checked) color = `linear-gradient(${f}, ${b})`;
  else if (!fritidInp.checked && parkInp.checked && badInp.checked) color = `linear-gradient(${p}, ${b})`;
  else if (fritidInp.checked && parkInp.checked && badInp.checked) color = `linear-gradient(${f}, ${p}, ${b})`;
  else color = 'transparent';
  return color;
};

// DISPLAYS ARTICLE WHEN WRITING, EDITING AND READING
function previewHTML() {
  preview.style.background = checkTopic();
  preview.innerHTML = `
        <div id="pCredWrapper">
          <img id="pLogga" src="https://storage.cloud.google.com/fp_storage/public/img/users/user-${writeUserId}.jpeg" alt="logga" />
          <span class="dot"></span>
          <p id="pSkribent">${skribent.value}</p>
          <span class="dot"></span>
          <p id="pTime">${time}</p>
        </div>
        <hr>
        <h3 id="pRubrik">${rubrik.value}</h3>
        <div class="pParagraphContainer">${insertText(paragraf1.value)}</div>
        <figure id="pFig1">
          <img class="pImg" src="${previewImage1}" alt="${previewImage1}"/>
          <figcaption id="pFig">${bildtext.value}</figcaption>
        </figure>
        <div class="pParagraphContainer pPC2">${insertText(paragraf2.value)}</div>
        <q id="pQuote">${insertText(citat.value)}</q>
        <figure id="pFig2">
          <img class="pImg" src="${previewImage2}" alt="${previewImage2}"/>
          <figcaption id="pFig">${bildtext2.value}</figcaption>
        </figure>
        <div class="pParagraphContainer pPC3">${insertText(paragraf3.value)}</div>
        <hr>
        <div id="pTags">${insertTags()}</div>
        `;

  // REMOVES FIGURES
  const firstFig = document.querySelector('#pFig1');
  const secondFig = document.querySelector('#pFig2');

  previewImage1 === null && firstFig.remove();
  previewImage2 === null && secondFig.remove();

  // ADDS BUTTONS AND REMOVES ARTICLES IN EDIT MODE
  if (checkParam('edit')) {
    imgs[1].insertAdjacentHTML(
      'afterend',
      '<div class="add_button deleteButton"><p class="add_button_text deleteButtonText">×</p></div>'
    );
    imgs[1].nextElementSibling.addEventListener('click', function (e) {
      pImgs = imgs.length - 1;
      checkImageLength('edit', imgs.length - 1);

      e.currentTarget.parentElement.remove();

      if (imgs.length === 1) {
        imgs[0].parentElement.setAttribute('id', 'pFig1');
        previewImage1 = imgs[0].src;
        previewImage2 = null;
      }

      if (imgs.length === 0) {
        previewImage1 = null;
        previewImage2 = null;
      }
    });
  }

  // REMOVES NON NECESSARY TAGS
  void (function checkTextContent(...elements) {
    const p2 = elements.forEach((el) => {
      const pEl = preview.querySelector(el);
      if (pEl.textContent) return;
      pEl.remove();
    });
  })('q', '.pPC2', '.pPC3');

  // DISPLAYS TAGS
  function insertTags() {
    const tagArray = taggar.value.match(/[A-ZÅÄÖa-zåäö\d]+/gi);
    if (!tagArray) return '';
    return tagArray.map((c) => `<a class="pTag" href="#">${c}</a>`).join('');
  }

  // PUTS ALL THE PARAGRAPH VALUES INSIDE LOCALSTORAGE FOR ACCESSIBILITY
  localStorage.setItem('p1', insertText(paragraf1.value).replace(/\n/g, ''));
  localStorage.setItem('p2', insertText(paragraf2.value).replace(/\n/g, ''));
  localStorage.setItem('p3', insertText(paragraf3.value).replace(/\n/g, ''));
}

// SWAPPING IMAGES
exchangeImg.addEventListener('click', (e) => {
  e.preventDefault();

  previewImage1 = imgs[1].src;
  previewImage2 = imgs[0].src;

  let tempFigCaption = bildtext.value;
  bildtext.value = bildtext2.value;
  bildtext2.value = tempFigCaption;
  previewHTML();
});
