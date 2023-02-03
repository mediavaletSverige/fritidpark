/* eslint-disable */

const toUserMenu = document.querySelector('.loggingIn');
const backFromMenu = document.querySelector('#art_btn p');
const userMenuSubmit = document.querySelector('.userMenuSubmit');
const userMenuSubmitButton = document.querySelector('.sparaKnapp');
const userMenuPasswordCurrent = document.getElementById('userMenuPasswordCurrent');
const userMenuPassword = document.getElementById('userMenuPassword');
const userMenuPasswordConfirm = document.getElementById('userMenuPasswordConfirm');
const userMenuLogo = document.getElementById('userMenuLogo');
const userMenuLogoImg = document.querySelector('.logo-big.bytLogga');

toUserMenu.addEventListener('click', function (e) {
  e.preventDefault();
  location.href = `${host}/userMenu`;
});

// Användarmeny gränssnitt + tillbakaknapp

if (location.href === `${host}/userMenu`) {
  document.querySelector('#art_header').textContent = 'användarmeny';
  document.querySelector('main').style.display = 'block';
  backFromMenu.textContent = '🖹';
  backFromMenu.addEventListener('click', () => (location.href = `${host}/articles`));
}

// Mina artiklar gränssnitt + tillbakaknapp

if (location.href === `${host}/myArticles`) {
  document.querySelector('#art_header').textContent = 'mina artiklar';
  document.querySelector('main').style.display = 'block';
  backFromMenu.textContent = '←';
  backFromMenu.addEventListener('click', () => (location.href = `${host}/userMenu`));
}

// Uppdatera namn, epost och lösenord

const updateUserData = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `${host}/api/users/${type === 'data' ? 'updateMe' : 'updateMyPassword'}`,
      data,
    });

    if (res.data.status === 'success') {
      let dot = '';
      setInterval(function () {
        if (dot.length === 3) dot = '';
        userMenuSubmitButton.textContent = `sparar${(dot += '.')}`;
      }, 250);
      setTimeout(function () {
        location.href = `${host}/userMenu`;
      }, 2000);
    }
  } catch (e) {
    document.querySelector('body').innerHTML = `
        <h3 style="color: black; text-align: center; font-size: 2rem;">${e.response.data.message}</h3>
      `;
    setTimeout(function () {
      location.href = `${host}/userMenu`;
    }, 2000);
  }
};

userMenuSubmit.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = userMenuName.value;
  const email = userMenuEmail.value;
  const logo = userMenuLogo.files[0];
  const userMenuForm = new FormData();
  userMenuForm.append('logo', logo);

  const passwordCurrent = userMenuPasswordCurrent.value;
  const password = userMenuPassword.value;
  const passwordConfirm = userMenuPasswordConfirm.value;
  if (
    (name.length > 0 || email.length > 0) &&
    passwordCurrent.length === 0 &&
    password.length === 0 &&
    passwordConfirm.length === 0
  )
    updateUserData({ name, email }, 'data');
  else if (
    logo &&
    name.length === 0 &&
    email.length === 0 &&
    passwordCurrent.length === 0 &&
    password.length === 0 &&
    passwordConfirm.length === 0
  )
    updateUserData(userMenuForm, 'data');
  else updateUserData({ passwordCurrent, password, passwordConfirm }, 'password');
});

// Logga ut

const logout = async () => {
  const res = await axios({
    method: 'GET',
    url: `${host}/api/users/logout`,
  });
  if (res.data.status === 'success') location.reload(true);
  location.href = `${host}/`;
};

document.getElementById('loggingOutBtn').addEventListener('click', () => logout());

// Mina artiklar

document.querySelector('.toMyArticles').addEventListener('click', () => (location.href = `${host}/myArticles`));
