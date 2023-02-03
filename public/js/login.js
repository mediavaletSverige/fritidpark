/* eslint-disable */

const dialog = document.querySelector('dialog');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('form-email');
const loginPassword = document.getElementById('form-password');
const userLogo = document.querySelector('#logo-wrap .logo-big');

if (location.href === `${host}/`) {
  main.style.display = 'none';
}

dialog.showModal();

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `${host}/api/users/login`,
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      dialog.innerHTML = `
        <h3 style="color: white;">Välkommen till:</h3>
        <div style="display: flex;">
          <img src='/img/images/fp_logo.svg' width='20px'>
          <p style="color: white; font-size:2rem;">fritid & park i Sverige</p>
        </div>
      `;
      setTimeout(function () {
        location.href = '/articles';
      }, 2000);
    }
  } catch (e) {
    dialog.innerHTML = `
        <h3 style="color: white; text-align: center; font-size: 2rem;">Du har ingivit fel användarnamn eller lösenord!</h3>
        <h3 style="color: white; text-align: center; font-size: 2rem;">Försök igen!</h3>
      `;
    setTimeout(function () {
      location.href = '/login';
    }, 2000);
  }
};

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  login(loginEmail.value, loginPassword.value);
});
