/* eslint-disable */

//UTILITY FUNCTIONS
function tryCatchConstant(constant) {
  try {
    if (!constant) throw new TypeError();
    return constant;
  } catch (err) {
    err.message = `Constant for later use!`;
    console.error(err.message);
  }
}

//HTML CONSTANTS
const top_menu_textContainer = document.getElementById('article_menu-top');
const bottom_menu_textContainer = document.getElementById('article_menu-bottom');
const top_menu_text = document.getElementById('article_menu-top').querySelectorAll('p');
const bottom_menu_text = document.getElementById('article_menu-bottom').querySelectorAll('p');
const main = document.querySelector('main');
const add_button = document.querySelectorAll('.add_button');
const p = document.querySelectorAll('.add_button > p');
const art_btn = document.getElementById('art_btn');
const read_art = document.getElementById('read_art');
const write_art = document.getElementById('write_art');
const header = document.querySelector('header');
const footer = document.querySelector('footer');
const userLogoContainer = document.getElementById('logo-wrap');
const articleContainer = document.querySelector('article');
const articleLogo = document.getElementById('pLogga');
const articleTags = document.querySelectorAll('.pTag');

//FORM CONSTANTS
const formEmail = document.getElementById('form-email');
const formPassword = document.getElementById('form-password');
const artHeader = document.getElementById('art_header');
const artHeaderButton = document.getElementById('art_header_button');
const btnFileNew = document.getElementById('btn-file-new');
const btnFileOld = document.getElementById('btn-file-old');
const btnFileNewLbl = btnFileNew?.nextElementSibling;
const exchangeImg = document.getElementById('btn-exchange-img');
const skribent = document.querySelector('input[placeholder=skribent]');
const koordinater = document.querySelector('input[placeholder=koordinater]');
const rubrik = document.querySelector('input[placeholder=rubrik]');
const bildtext = document.getElementById('bildtext');
const bildtext2 = document.getElementById('bildtext2');
const taggar = document.getElementById('taggar');
const paragraf1 = document.getElementById('p1');
const paragraf2 = document.getElementById('p2');
const paragraf3 = document.getElementById('p3');
const citat = document.getElementById('citat');

const spara = document.getElementById('spara');
const publicera = document.getElementById('publicera');
const submit = document.querySelector('button[type=submit]');
const reset = document.querySelector('button[type=reset]');

const preview = document.getElementById('preview');
const formCat = document.getElementById('form_cat');
const fritidInp = document.getElementById('fritid-inp');
const parkInp = document.getElementById('park-inp');
const badInp = document.getElementById('bad-inp');
