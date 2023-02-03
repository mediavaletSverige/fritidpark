/* eslint-disable */

'use strict';

// CHANGES THE BOTTOM MENY BUTTON
const changeMenuText = function (button, w = false, h = false, text = '') {
  window.addEventListener('resize', () => {
    const W = document.documentElement.clientWidth;
    const H = document.documentElement.clientHeight;
    if (W <= w || H <= h) {
      button[0].textContent = text;
    } else if (W > w || H > h) {
      button[0].textContent = 'ANNONSER';
      button[1].textContent = '\u2935';
    }
  });
};

changeMenuText(top_menu_text, 450);
changeMenuText(bottom_menu_text, 550, 700);

// ADD AND CLOSES ARTICLE
const addAndCloseArticle = function () {
  add_button.forEach((c) =>
    c.addEventListener('click', function (e) {
      const h = (p1, p2, p3, p4) => {
        p[0].textContent = p1;
        p[1].textContent = p1;
        p[0].style.color = p2;
        p[1].style.color = p2;
        add_button[0].style.backgroundColor = p3;
        add_button[1].style.backgroundColor = p3;
        main.style.display = p4;
      };
      p[0].textContent && p[1].textContent === '\u00D7'
        ? h('\u002B', 'white', '#e9cbb0', 'none')
        : h('\u00D7', '#e9cbb0', 'white', 'block');
    })
  );
};

addAndCloseArticle();

// CHANGES MAIN BUTTON, HEADERS AND LINKS
function changeMainButton() {
  art_btn.addEventListener('click', function (e) {
    if (e.currentTarget.querySelector('p').textContent === '🖌') {
      localStorage.clear();
      e.currentTarget.querySelector('p').textContent = '🖹';
      artHeader.textContent = 'Nytt inlägg';
      location.href = '/write';
    } else if (e.currentTarget.querySelector('p').textContent === '🖹') {
      location.href = '/articles';
      e.currentTarget.querySelector('p').textContent = '🖌';
      artHeader.textContent = 'Artiklar';
    }
  });
}

changeMainButton();

// WAVY FOOTER AND HEADER
const wavyDiv = function (el, steps, waves) {
  let clipPath = '';
  for (let i = 0; i < steps + 1; i++) {
    clipPath = clipPath + `${(100 / steps) * i}% ${100 * (0.2 + 0.2 * Math.sin((2 * waves * Math.PI * i) / steps))}%,`;
  }
  clipPath = clipPath + '100% 100%,0 100%';
  clipPath = `polygon(${clipPath})`;
  el.style['clip-path'] = clipPath;
};

wavyDiv(header, 50, 1);
wavyDiv(footer, 50, 1);

// RESPONSIVE WAVES
const responsiveWaves = function (w = false, h = false) {
  window.addEventListener('resize', () => {
    const W = document.documentElement.clientWidth;
    const H = document.documentElement.clientHeight;
    if (W <= w || H <= h) {
      wavyDiv(header, 50, 0.5);
      wavyDiv(footer, 50, 0.5);
    } else if (W > w || H > h) {
      wavyDiv(header, 50, 1);
      wavyDiv(footer, 50, 1);
    }
  });
};

responsiveWaves(450, 700);

// RESPONSIVE BUTTONS
const responsiveAddButtons = function (w = false, h = false) {
  window.addEventListener('resize', () => {
    const W = document.documentElement.clientWidth;
    const H = document.documentElement.clientHeight;
    if (W <= w) {
      add_button[0].classList.add('hidden');
      add_button[1].classList.remove('hidden');
    } else if (W > w) {
      add_button[0].classList.remove('hidden');
      add_button[1].classList.add('hidden');
    }
  });
};

responsiveAddButtons(450);

// CLOSES ARTICLE CONTAINER WHEN COMING FROM SLUG (SEE ARTICLES.JS)
if (location.href === `${host}/articles`) {
  if (localStorage.getItem('articleContainerIsClosed') === 'true') {
    main.style.display = 'none';
    add_button.forEach(function (button) {
      button.style.backgroundColor = '#e9cbb0';
      button.querySelector('p').textContent = '+';
      button.querySelector('p').style.color = 'white';
    });
    localStorage.setItem('articleContainerIsClosed', false);
  }
}
