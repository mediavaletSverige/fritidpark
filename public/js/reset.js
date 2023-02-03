/* eslint-disable */

reset.addEventListener('click', () => {
  preview.innerHTML = '';
  btnFileNewLbl.textContent = 'välj 1 eller 2 bilder';
  img = null;
  spara.setAttribute('disabled', '');
  publicera.setAttribute('disabled', '');
});
