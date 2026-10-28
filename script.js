// JavaScript conecta las acciones del usuario con lo que aparece en pantalla.
const startButton = document.querySelector('#start-button');
const backButton = document.querySelector('#back-button');
const welcomeScreen = document.querySelector('#inicio');
const selectionScreen = document.querySelector('#emergencias');
const selectionNote = document.querySelector('#selection-note');
const emergencyCards = document.querySelectorAll('.emergency-card');

startButton.addEventListener('click', () => {
  welcomeScreen.classList.add('hidden');
  selectionScreen.classList.remove('hidden');
  document.querySelector('#emergency-title').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

backButton.addEventListener('click', () => {
  selectionScreen.classList.add('hidden');
  welcomeScreen.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

emergencyCards.forEach((card) => {
  card.addEventListener('click', () => {
    emergencyCards.forEach((item) => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed', 'false');
    });

    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
    selectionNote.textContent = `Seleccionaste: ${card.dataset.emergency}. En el siguiente paso agregaremos la ubicación.`;
  });
});

// Cada tarjeta empieza sin seleccionar para que el estado sea claro con teclado.
emergencyCards.forEach((card) => card.setAttribute('aria-pressed', 'false'));
