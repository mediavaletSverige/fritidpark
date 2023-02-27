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
  window.location.href = `/userMenu`;
});

// USER MENU WITH BACK BUTTON
if (window.location.href.includes('/userMenu')) {
  document.querySelector('#art_header').textContent = 'användarmeny';
  document.querySelector('main').style.display = 'block';
  backFromMenu.textContent = '🖹';
  backFromMenu.addEventListener('click', () => (window.location.href = `/articles`));
}

// MY ARTICLES WITH BACK BUTTON
if (window.location.href.includes('/myArticles')) {
  document.querySelector('#art_header').textContent = 'mina artiklar';
  document.querySelector('main').style.display = 'block';
  backFromMenu.textContent = '←';
  backFromMenu.addEventListener('click', () => (window.location.href = `/userMenu`));
}

// UPDATE NAME, MAIL AND PASSWORD
const updateUserData = async (data, type) => {
  try {
    const res = await fetch(`/api/users/${type === 'data' ? 'updateMe' : 'updateMyPassword'}`, {
      method: 'PATCH',
      headers:
        data instanceof FormData
          ? data
          : {
              'Content-Type': 'application/json',
            },
      body: data instanceof FormData ? data : JSON.stringify(data),
    });

    const response = await res.json();

    if (response.status === 'success') {
      let dot = '';
      setInterval(function () {
        if (dot.length === 3) dot = '';
        userMenuSubmitButton.textContent = `sparar${(dot += '.')}`;
      }, 250);
      setTimeout(function () {
        window.location.href = `/userMenu`;
      }, 2000);
    }
  } catch (e) {
    document.querySelector('body').innerHTML = `
        <h3 style="color: black; text-align: center; font-size: 2rem;">${e}</h3>
      `;
    setTimeout(function () {
      window.location.href = `/userMenu`;
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

// LOG OUT
const logout = async () => {
  const res = await fetch('/api/users/logout', {
    method: 'GET',
  });
  const data = await res.json();
  if (data.status === 'success') {
    location.reload(true);
    window.location.href = `/`;
  }
};

document.getElementById('loggingOutBtn').addEventListener('click', () => logout());

// MY ARTICLES
document.querySelector('.toMyArticles').addEventListener('click', () => (window.location.href = `/myArticles`));
