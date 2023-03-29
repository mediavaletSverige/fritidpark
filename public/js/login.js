/* eslint-disable */

// HIDE ELEMENTS
if (window.location.href.at(-1) === '/') {
  main.style.display = 'none';
  userLogoContainer.style.display = 'none';
  top_menu_textContainer.style.display = 'none';
  bottom_menu_textContainer.style.display = 'none';
  footer.lastElementChild.style.display = 'none';
}

// CONSTANTS
const headC = document.querySelectorAll('.head-container');
const eyes = document.querySelectorAll('.eye');
const leftEye = document.querySelector('.left-eye');
const rightEye = document.querySelector('.right-eye');
const eyeLids = document.querySelectorAll('.eyelid');
const eyeBalls = document.querySelectorAll('.eyeball');
const eyeBrows = document.querySelectorAll('.eyebrow');
const nose = document.querySelector('.nose');
const mouth = document.querySelector('.mouth');
const body = document.querySelector('body');

const logoutTimer = async () => {
  const res = await fetch('/api/users/logout', {
    method: 'GET',
  });
  const data = await res.json();
  if (data.status === 'success') {
    location.reload(true);
    window.location.href = `/`;
  }
};

// LOGGING OUT AFTER A CERTAIN TIME HAS PASSED
if (window.location.href.at(-1) !== '/') {
  const timeInit = 5 * 60;
  let timeLeft = timeInit;

  setInterval(function () {
    timeLeft -= 1;

    if (timeLeft === 59) {
      const dialog = document.createElement('dialog');
      dialog.setAttribute('class', 'countdownDialog');
      body.append(dialog);
      dialog.insertAdjacentHTML('beforeend', `<p>${timeLeft}</p>`);
      p.textContent = timeLeft;
      dialog.showModal();
    }
    if (timeLeft < 60) {
      const p = document.querySelector('dialog > p');
      p.textContent = timeLeft;
    }

    if (timeLeft > 59) {
      document.querySelector('dialog')?.remove();
    }

    if (timeLeft === 0) logoutTimer();
  }, 1000);

  document.addEventListener('mousemove', () => (timeLeft = timeInit));
  document.addEventListener('input', () => (timeLeft = timeInit));
}

// LOGGING OUT WHEN LEAVING PAGE
window.addEventListener('unload', logoutTimer);

// UTILITY FUNCTIONS
const setRootProperty = (name, value) => document.documentElement.style.setProperty(name, value);
const getRootProperty = (name) => getComputedStyle(document.documentElement).getPropertyValue(name);

const setKeyframeProperty = (name, rule, style, value) =>
  (Array.from(document.styleSheets[11].cssRules)
    [style]((rule) => rule.name === name)[0]
    .findRule(rule).style.filter = value);

const eyeShadowFactory = (eye, listener, shadow) => {
  document
    .querySelector(`.${eye}-eye`)
    .addEventListener(listener, () =>
      setKeyframeProperty(
        `${eye}EyeMovement`,
        'to',
        'filter',
        `drop-shadow(0 ${shadow[0]}rem ${shadow[1]}rem rgba(0, 0, 0, .5))`
      )
    );
};

const mouthMessage = async function (el, text) {
  el.insertAdjacentHTML('afterend', `<p></p>`);
  const p = el.nextElementSibling;

  if (!text.length) {
    setInterval(function () {
      if (p.textContent.length === 3) p.textContent = '';
      p.textContent += '.';
    }, 500);
  }

  for (let i = 0; i < text.length; i++) {
    await new Promise((res) => setTimeout(res, 150));
    p.textContent += text[i];
  }
};

// UTIITY FUNCTION VALUES
const hScale = getRootProperty('--head-scale');

// CONTROLLING HEAD MOVEMENT
const headMovement = function (e) {
  // EYEBROWS
  setKeyframeProperty('leftEyebrowMovement', 'to', 'filter', 'none');
  setKeyframeProperty('rightEyebrowMovement', 'to', 'filter', 'none');
  eyeBrows.forEach((eyeBrow) => (eyeBrow.style.borderTop = `${1 * hScale}px solid rgba(0,0,0,.5)`));
  eyeBrows.forEach((eyeBrow) => (eyeBrow.style.borderBottom = `${1 * hScale}px solid white`));
  eyeBrows.forEach((eyeBrow) => (eyeBrow.style.backgroundColor = 'var(--park-color)'));

  // EYES
  eyes.forEach((eye) => eye.addEventListener('mouseenter', (e) => (e.target.style.scale = 1.1)));
  eyes.forEach((eye) => eye.addEventListener('mouseleave', (e) => (e.target.style.scale = 'inherit')));
  eyes.forEach((eye) => eye.addEventListener('mouseleave', (e) => (e.target.style.color = 'black')));
  eyeShadowFactory('left', 'mouseenter', [0.125 * hScale, 0.5 * hScale]);
  eyeShadowFactory('right', 'mouseenter', [0.125 * hScale, 0.5 * hScale]);
  eyeShadowFactory('left', 'mouseleave', [0.1 * hScale, 0.25 * hScale]);
  eyeShadowFactory('right', 'mouseleave', [0.1 * hScale, 0.25 * hScale]);
  eyeShadowFactory('left', 'mouseup', [0.125 * hScale, 0.5 * hScale]);
  eyeShadowFactory('right', 'mouseup', [0.125 * hScale, 0.5 * hScale]);
  eyeShadowFactory('left', 'mousedown', [0.1 * hScale, 0.25 * hScale]);
  eyeShadowFactory('right', 'mousedown', [0.1 * hScale, 0.25 * hScale]);

  // EYELIDS
  eyeLids.forEach((eyeLid) => (eyeLid.style.top = `${-4.25 * hScale}rem`));
  eyeLids.forEach((eyeLid) => (eyeLid.style.background = '#b2c29d'));
  eyeLids[0].style.rotate = '1deg';
  eyeLids[1].style.rotate = '-1deg';

  // EYEBALLS
  eyeBalls.forEach((eyeBall) => (eyeBall.style.color = 'black'));
  eyeBalls.forEach((eyeBall) => (eyeBall.style.cursor = 'pointer'));
  eyeBalls.forEach((eyeBall) => (eyeBall.style.userSelect = 'none'));
  eyeBalls.forEach((eyeBall) => (eyeBall.onmouseenter = (e) => (e.target.style.color = 'orangered')));
  eyeBalls.forEach((eyeBall) => (eyeBall.onmouseleave = (e) => (e.target.style.color = 'inherit')));
  eyeBalls[0].style.fontSize = `${2 * hScale}rem`;
  eyeBalls[0].style.top = `${-0.65 * hScale}rem`;
  eyeBalls[0].style.fontWeight = 'bold';
  eyeBalls[1].style.top = `${-0.65 * hScale}rem`;
  eyeBalls[1].style.fontWeight = 'bold';

  // NOSE
  setKeyframeProperty('noseMovement', 'to', 'filter', 'none');
  nose.style.borderTop = `${1 * hScale}px solid black`;
  nose.style.borderBottom = `${1 * hScale}px solid white`;

  // MOUTH
  mouth.style.padding = 'none';
  mouth.style.clipPath = 'none';
  mouth.style.background = 'var(--bad-color)';
  mouth.style.fontSize = `${0.1 * hScale}rem`;
  mouth.style.pointerEvents = 'none';
  mouth.style.borderTop = `${1 * hScale}px solid rgba(0,0,0,.5)`;
  mouth.style.borderInline = `${1 * hScale}px solid rgba(255,255,255,.5)`;
  mouth.style.borderBottom = `${1 * hScale}px solid white`;

  const mouthListenerFactory = (source, target, listener, message = '', position = [13.65 * hScale, 8 * hScale]) => {
    source.addEventListener(listener, async (e) => {
      await new Promise((res) => res(target.nextElementSibling.remove()));
      await new Promise((res) => res(mouthMessage(this, message)));
      target.nextElementSibling.style.top = `${position[0]}rem`;
      target.nextElementSibling.style.left = `${position[1]}rem`;
    });
  };

  // LOGGING IN
  const [email, password] = mouth.value.split(' ');
  (async () => {
    const res = await fetch(`/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log(data.status);
    if (data.status === 'success') {
      // EYES
      mouthListenerFactory(leftEye, mouth, 'mouseover', 'min sida', [13.8 * hScale, 8 * hScale]);
      mouthListenerFactory(rightEye, mouth, 'mouseover', 'artiklar', [13.8 * hScale, 8 * hScale]);
      mouthListenerFactory(leftEye, mouth, 'mouseout');
      mouthListenerFactory(rightEye, mouth, 'mouseout');
      leftEye.addEventListener('click', function () {
        window.location.href = '/min-sida';
      });
      rightEye.addEventListener('click', function () {
        window.location.href = '/artiklar';
      });

      // EYEBALLS
      eyeBalls[0].style.top = `${-0.8 * hScale}rem`;
      eyeBalls[1].style.top = `${-0.85 * hScale}rem`;
      eyeBalls[0].style.left = `${-0.03 * hScale}rem`;
      eyeBalls[0].style.fontSize = `${2.5 * hScale}rem`;
      eyeBalls[0].textContent = '⚙';
      eyeBalls[1].textContent = '📚︎';
      // MOUTH
      mouthMessage(this, 'välkommen');
      mouth.nextElementSibling.style.top = `${13.8 * hScale}rem`;
      mouth.nextElementSibling.style.left = `${7.6 * hScale}rem`;
    }

    if (data.status === 'fail') {
      // EYES
      mouthListenerFactory(leftEye, mouth, 'mouseover', 'glömt ditt lösenord?', [13.35 * hScale, 8 * hScale]);
      mouthListenerFactory(rightEye, mouth, 'mouseover', 'bli medlem', [13.35 * hScale, 8 * hScale]);
      mouthListenerFactory(leftEye, mouth, 'mouseout');
      mouthListenerFactory(rightEye, mouth, 'mouseout');

      // EYEBALLS
      eyeBalls[0].style.fontSize = `${1.5 * hScale}rem`;
      eyeBalls[1].style.fontSize = `${2 * hScale}rem`;
      eyeBalls[0].textContent = '?';
      eyeBalls[1].textContent = '+';
      eyeBalls[0].style.webkitTextStrokeWidth = `${0.1 * hScale}rem`;
      eyeBalls[1].style.webkitTextStrokeWidth = `${0.1 * hScale}rem`;
      setRootProperty('--bad-color', 'rgba(255, 64, 0, 0.9)');
      setRootProperty('--park-color', 'rgba(255, 64, 0, 0.9)');

      // MOUTH
      mouthMessage(this, 'åtkomst nekad!');
      mouth.nextElementSibling.style.top = `${13.35 * hScale}rem`;
      mouth.nextElementSibling.style.left = `${8 * hScale}rem`;
    }
  })();
};

// ANIMATION ON MOUTH CLICK
mouth?.addEventListener('click', function (e) {
  // EYELIDS
  eyeLids[0].style.rotate = '-5deg';
  eyeLids[1].style.rotate = '5deg';
  eyeLids.forEach((eyeLid) => {
    eyeLid.style.top = `${-2 * hScale}rem`;
    eyeLid.style.transition = 'none';
  });

  // EYEBALLS
  eyeBalls.forEach((eyeBall) => (eyeBall.textContent = '\u25CF'));

  // LAST ITERATION OF HEAD ANIMATION
  this.addEventListener('animationiteration', () => {
    if (this.clientWidth > 80) {
      setRootProperty('--head-animation-pause-state', 'paused');
      this.addEventListener('change', headMovement);
      setKeyframeProperty('leftEyeMovement', 'to', 'filter', 'drop-shadow(0 .1rem 0.25rem rgba(0, 0, 0, 0.5))');
      setKeyframeProperty('rightEyeMovement', 'to', 'filter', 'drop-shadow(0 .1rem 0.25rem rgba(0, 0, 0, 0.5))');
      mouth.readOnly = false;
    }
  });
});
