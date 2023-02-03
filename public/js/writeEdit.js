/* eslint-disable */

const articleImgHeightsLength =
  localStorage.length &&
  localStorage
    .getItem('articleImgHeights')
    .split(',')
    .filter((el) => +el > 100).length;

pImgs = articleImgHeightsLength;
const checkParam = (param) => window.location.href === `/${param}`;

let previewImage1;
let previewImage2;

let img1;
let img2;

let file1;
let file2;

let imgs = null;

// INSERTS BR TAGS BETWEEN P TAGS (IN BOTH PREVIEW AND DATA)

function insertText(el) {
  if (!el) {
    return el;
  } else {
    return el
      .match(/(^.+|^\s*$)/gm)
      .map((c) => (!c ? `<br class="pBr">` : `<p class="pParagraph">${c}</p>`))
      .join('');
  }
}

// SELECTS THE HIDDEN FILE BUTTON

btnFileNew.addEventListener('click', function (e) {
  e.preventDefault();
  btnFileOld.click();
});

// CHANGING EXCHANGE BUTTON AND TEXT DEPENDING ON HOW MANY IMAGES ARE PRESENT AND RESETS IMAGES

function checkImageLength(param, len) {
  if (location.href === `${host}/${param}`) {
    const dispExchangeBtn = function (p1 = 'none') {
      exchangeImg.style.display = p1;
      if (checkParam('write')) {
        bildtext2.style.display = len > 1 ? 'block' : 'none';
      }
      if (checkParam('edit')) {
        bildtext.style.display = 'block';
        bildtext2.style.display = 'block';
      }
    };
    len > 1 ? dispExchangeBtn('inline-block') : dispExchangeBtn('none');
    btnFileNewLbl.textContent = len < 1 ? 'välj 1 eller 2 bilder' : `Du har valt ${len} bild${len > 1 ? 'er' : ''}`;
  }
}

// SELECTS FILE IMAGES AND CHECKS LENGTH

btnFileOld.addEventListener('change', function (e) {
  file1 = btnFileOld.files[0];
  file2 = btnFileOld.files[1];
  totalLength = this.files.length + pImgs;

  checkImageLength('write', this.files.length);
  checkImageLength('edit', totalLength);

  if (this.files.length > 2 || pImgs > 1 || this.files.length + pImgs > 2) {
    alert('Använd dig av max 2 bilder!');
    location.reload(true);
  }

  if (checkParam('write')) {
    if (file1) img1 = URL.createObjectURL(file1);
    if (file2) img2 = URL.createObjectURL(file2);
  }

  if (checkParam('edit')) {
    if (file1) img2 = URL.createObjectURL(file1);
  }

  // ACCURATE IMAGE DISPLAY

  if (checkParam('write')) {
    previewImage1 = img1;
    previewImage2 = this.files.length === 1 ? null : img2;
  }

  if (this.files.length === 1 && imgs.length === 1) {
    previewImage2 = img2;
  }

  if (this.files.length === 2 && imgs.length === 0) {
    previewImage1 = img1;
    previewImage2 = img2;
  }
});

// ENABLE AND DISABLE "SPARA" AND "PUBLICERA" BUTTONS (WRITE & EDIT)

write_art.addEventListener('change', () => {
  void (function publishSave(...buttons) {
    buttons.forEach((button) => {
      const elements = {
        //a: /(?!#)[a-zäöå\d-]+/.test(formEmail.value),
        //b: /\w{8}/.test(formPassword.value),
        c: img1,
        d: skribent.value,
        e: koordinater.value,
        f: rubrik.value,
        g: /^(#[a-zäöåÄÖÅ\d-]+\s?)+$/.test(taggar.value),
        h: paragraf1.value,
        i: [fritidInp, parkInp, badInp].some((el) => el.checked),
      };

      if (location.href === `${host}/edit`) delete elements.c;

      if (Object.values(elements).every((c) => !!c)) {
        button.removeAttribute('disabled');
      } else {
        button.setAttribute('disabled', '');
      }
    });
  })(spara, publicera);
});
