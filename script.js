// Este archivo controla el flujo del prototipo; no envía datos a servicios externos.

/** @typedef {{ id: string, prompt: string }} Question */
/** @typedef {{ id: string, title: string, questions: Question[], asksPeople: boolean }} EmergencyConfig */
/** @typedef {{ emergency: string, latitude: number | null, longitude: number | null, accuracy: number | null, address: string, landmark: string, people: string, answers: Record<string, string>, photo: File | null }} ReportState */

const emergencyConfigs = /** @type {Record<string, EmergencyConfig>} */ ({
  'No responde el paciente': { id: 'no-responde', title: 'No responde', questions: [{ id: 'responds', prompt: '¿Responde cuando le hablan?' }, { id: 'breathing', prompt: '¿Se observa que respira?' }], asksPeople: false },
  'Le cuesta respirar': { id: 'respira', title: 'Le cuesta respirar', questions: [{ id: 'responds', prompt: '¿Está consciente y responde?' }, { id: 'breathing', prompt: '¿Se observa que respira?' }], asksPeople: false },
  'Sangrado abundante': { id: 'sangrado', title: 'Sangrado abundante', questions: [{ id: 'bleeding', prompt: '¿Hay sangrado abundante visible?' }], asksPeople: false },
  'Accidente de tránsito con heridos': { id: 'accidente', title: 'Accidente con lesionados', questions: [{ id: 'unresponsive', prompt: '¿Hay personas que no responden?' }, { id: 'breathing', prompt: '¿Hay personas con dificultad para respirar?' }, { id: 'bleeding', prompt: '¿Hay personas con sangrado abundante?' }], asksPeople: true },
  'Golpe o lesiones': { id: 'lesion', title: 'Golpe o lesión', questions: [{ id: 'responds', prompt: '¿Responde la persona?' }, { id: 'bleeding', prompt: '¿Hay sangrado abundante?' }], asksPeople: true },
  'Convulsiones': { id: 'convulsion', title: 'Convulsiones', questions: [{ id: 'seizing', prompt: '¿Está convulsionando ahora?' }, { id: 'responds', prompt: '¿Responde?' }], asksPeople: false },
  'Dolor fuerte en el pecho': { id: 'pecho', title: 'Dolor fuerte en el pecho', questions: [{ id: 'responds', prompt: '¿Responde?' }, { id: 'breathing', prompt: '¿Tiene dificultad para respirar?' }], asksPeople: false },
  Quemadura: { id: 'quemadura', title: 'Quemadura', questions: [{ id: 'responds', prompt: '¿Responde la persona?' }], asksPeople: true },
  'Otra emergencia': { id: 'otra', title: 'Otra emergencia', questions: [{ id: 'responds', prompt: '¿Responde la persona?' }, { id: 'breathing', prompt: '¿Hay dificultad para respirar?' }, { id: 'bleeding', prompt: '¿Hay sangrado abundante?' }], asksPeople: false },
});

/** @type {ReportState} */
const report = { emergency: '', latitude: null, longitude: null, accuracy: null, address: '', landmark: '', people: '', answers: {}, photo: null };
const screenIds = ['inicio', 'emergencias', 'ubicacion', 'detalles', 'revision', 'resultado'];
const screens = new Map(screenIds.map((id) => [id, document.getElementById(id)]));
const startButton = document.getElementById('start-button');
const emergencyGrid = document.getElementById('emergency-grid');
const selectionNote = document.getElementById('selection-note');
const continueEmergencyButton = document.getElementById('to-location');
const locationForm = document.getElementById('location-form');
const addressInput = document.getElementById('address');
const landmarkInput = document.getElementById('landmark');
const locationStatus = document.getElementById('location-status');
const locationError = document.getElementById('location-error');
const locateButton = document.getElementById('locate-button');
const detailsForm = document.getElementById('details-form');
const questionList = document.getElementById('question-list');
const detailsEmergency = document.getElementById('details-emergency');
const photoInput = document.getElementById('photo');
const photoError = document.getElementById('photo-error');
const reviewSummary = document.getElementById('review-summary');
const resultSummary = document.getElementById('result-summary');
let locationRequestId = 0;

/** @param {string} id */
function requiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Falta el elemento requerido: #${id}`);
  return element;
}

/** @param {string} id */
function showScreen(id) {
  const target = screens.get(id);
  if (!target) {
    showError('No fue posible abrir esta pantalla. Vuelve a iniciar el reporte.');
    return;
  }
  if (id !== 'ubicacion') {
    locationRequestId += 1;
    if (locateButton) locateButton.disabled = false;
  }
  screens.forEach((screen, screenId) => screen?.classList.toggle('hidden', screenId !== id));
  const heading = target.querySelector('h2');
  if (heading) heading.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** @param {string} message */
function showError(message) {
  const notice = requiredElement('global-error');
  notice.textContent = message;
  notice.classList.remove('hidden');
  notice.focus();
}

function clearError() {
  const notice = document.getElementById('global-error');
  if (notice) {
    notice.textContent = '';
    notice.classList.add('hidden');
  }
}

/** @param {string} label @param {string} value */
function summaryRow(label, value) {
  const row = document.createElement('div');
  row.className = 'summary-row';
  const term = document.createElement('strong');
  term.textContent = label;
  const description = document.createElement('p');
  description.textContent = value;
  row.append(term, description);
  return row;
}

function getLocationLabel() {
  if (report.latitude !== null && report.longitude !== null) {
    const accuracy = report.accuracy !== null ? `, precisión aproximada ${Math.round(report.accuracy)} m` : '';
    return `Ubicación estimada por el dispositivo (${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}${accuracy})`;
  }
  return report.address.trim();
}

function renderQuestions() {
  const config = emergencyConfigs[report.emergency];
  if (!config) {
    showError('Selecciona una emergencia antes de continuar.');
    showScreen('emergencias');
    return;
  }
  detailsEmergency.textContent = `Situación seleccionada: ${config.title}. Responde según lo que puedas observar; puedes elegir “No sé”.`;
  questionList.replaceChildren();
  if (config.asksPeople) {
    const group = document.createElement('div');
    group.className = 'question-item';
    const label = document.createElement('label');
    label.htmlFor = 'people-count';
    label.textContent = '¿Cuántas personas están afectadas?';
    const input = document.createElement('input');
    input.id = 'people-count';
    input.name = 'people';
    input.type = 'number';
    input.min = '1';
    input.max = '999';
    input.step = '1';
    input.required = true;
    input.inputMode = 'numeric';
    input.value = report.people;
    group.append(label, input);
    questionList.append(group);
  }
  config.questions.forEach(({ id, prompt }) => {
    const group = document.createElement('fieldset');
    group.className = 'question-item';
    const legend = document.createElement('legend');
    legend.textContent = prompt;
    const select = document.createElement('select');
    select.name = id;
    select.required = true;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecciona una respuesta';
    placeholder.disabled = true;
    placeholder.selected = !report.answers[id];
    select.append(placeholder);
    ['Sí', 'No', 'No sé'].forEach((answer) => {
      const option = document.createElement('option');
      option.value = answer;
      option.textContent = answer;
      option.selected = report.answers[id] === answer;
      select.append(option);
    });
    group.append(legend, select);
    questionList.append(group);
  });
}

function renderSummary(container) {
  container.replaceChildren();
  const config = emergencyConfigs[report.emergency];
  if (!config) throw new Error('No hay una emergencia seleccionada para mostrar.');
  container.append(summaryRow('Emergencia', config.title));
  container.append(summaryRow('Ubicación', getLocationLabel()));
  if (report.landmark.trim()) container.append(summaryRow('Punto de referencia', report.landmark.trim()));
  if (report.people) container.append(summaryRow('Personas afectadas', report.people));
  config.questions.forEach(({ id, prompt }) => {
    if (report.answers[id]) container.append(summaryRow(prompt, report.answers[id]));
  });
  container.append(summaryRow('Fotografía', report.photo ? 'Adjunta en esta sesión' : 'No se adjuntó'));
}

startButton?.addEventListener('click', () => {
  clearError();
  showScreen('emergencias');
});

document.getElementById('back-button')?.addEventListener('click', () => {
  clearError();
  showScreen('inicio');
});

document.querySelectorAll('[data-back]').forEach((button) => {
  button.addEventListener('click', () => {
    clearError();
    const destination = button.getAttribute('data-back');
    if (destination) showScreen(destination);
  });
});

emergencyGrid?.querySelectorAll('.emergency-card').forEach((card) => {
  card.setAttribute('aria-pressed', 'false');
  card.addEventListener('click', () => {
    const emergency = card.getAttribute('data-emergency');
    if (!emergency || !emergencyConfigs[emergency]) {
      selectionNote.textContent = 'No se pudo reconocer esta opción. Selecciona otra.';
      return;
    }
    if (report.emergency !== emergency) {
      // Las respuestas dependen de la emergencia elegida; evita reutilizar respuestas incompatibles.
      report.answers = {};
      report.people = '';
    }
    report.emergency = emergency;
    emergencyGrid.querySelectorAll('.emergency-card').forEach((item) => {
      const selected = item === card;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    selectionNote.textContent = `Seleccionaste: ${emergency}. Puedes cambiarla antes de continuar.`;
    continueEmergencyButton.disabled = false;
  });
});

continueEmergencyButton?.addEventListener('click', () => {
  if (!report.emergency) {
    selectionNote.textContent = 'Elige una emergencia para continuar.';
    return;
  }
  addressInput.value = report.address;
  landmarkInput.value = report.landmark;
  locationError.textContent = '';
  showScreen('ubicacion');
  if (report.latitude === null) requestLocation();
});

function requestLocation() {
  if (!navigator.geolocation) {
    locationStatus.textContent = 'Este navegador no ofrece ubicación automática. Puedes escribirla manualmente.';
    return;
  }
  locateButton.disabled = true;
  const requestId = ++locationRequestId;
  locationStatus.textContent = 'Obteniendo ubicación. Si no está disponible, puedes escribirla manualmente.';
  try {
    navigator.geolocation.getCurrentPosition(
    (position) => {
      if (requestId !== locationRequestId) return;
      const { latitude, longitude, accuracy } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        report.latitude = null;
        report.longitude = null;
        report.accuracy = null;
        locationStatus.textContent = 'La ubicación recibida no es válida. Puedes escribirla manualmente.';
        locateButton.disabled = false;
        return;
      }
      report.latitude = latitude;
      report.longitude = longitude;
      report.accuracy = Number.isFinite(accuracy) ? accuracy : null;
      locationStatus.textContent = Number.isFinite(accuracy)
        ? `Ubicación disponible (precisión aproximada: ${Math.round(accuracy)} m). Confirma para continuar.`
        : 'Ubicación disponible. Confirma para continuar.';
      locateButton.disabled = false;
    },
    (error) => {
      if (requestId !== locationRequestId) return;
      report.latitude = null;
      report.longitude = null;
      report.accuracy = null;
      const messages = {
        1: 'No se concedió el permiso de ubicación. Puedes continuar escribiendo una dirección.',
        2: 'No fue posible obtener la ubicación. Puedes continuar escribiendo una dirección.',
        3: 'La ubicación tardó demasiado. Puedes continuar escribiendo una dirección.',
      };
      locationStatus.textContent = messages[error.code] || 'Ocurrió un error con la ubicación. Puedes escribirla manualmente.';
      locateButton.disabled = false;
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  } catch {
    report.latitude = null;
    report.longitude = null;
    report.accuracy = null;
    locationStatus.textContent = 'No se pudo iniciar la ubicación automática. Puedes escribirla manualmente.';
    locateButton.disabled = false;
  }
}

locateButton?.addEventListener('click', requestLocation);

locationForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  clearError();
  const address = addressInput.value.trim();
  if (!address && report.latitude === null) {
    locationError.textContent = 'Escribe una dirección o vuelve a intentar obtener tu ubicación.';
    addressInput.focus();
    return;
  }
  report.address = address;
  report.landmark = landmarkInput.value.trim();
  locationError.textContent = '';
  renderQuestions();
  showScreen('detalles');
});

detailsForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  clearError();
  const config = emergencyConfigs[report.emergency];
  if (!config) {
    showError('Selecciona una emergencia antes de revisar.');
    showScreen('emergencias');
    return;
  }
  const count = questionList.querySelector('#people-count');
  if (config.asksPeople) {
    const number = Number(count?.value);
    if (!Number.isInteger(number) || number < 1 || number > 999) {
      count?.setCustomValidity('Ingresa un número entero entre 1 y 999.');
      count?.reportValidity();
      count?.addEventListener('input', () => count.setCustomValidity(''), { once: true });
      return;
    }
    report.people = String(number);
  } else {
    report.people = '';
  }
  /** @type {Record<string, string>} */
  const answers = {};
  for (const question of config.questions) {
    const select = detailsForm.elements.namedItem(question.id);
    if (!(select instanceof HTMLSelectElement) || !select.value) {
      if (select instanceof HTMLSelectElement) select.focus();
      return;
    }
    answers[question.id] = select.value;
  }
  report.answers = answers;
  const file = photoInput.files?.[0] || null;
  if (file && (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024)) {
    photoError.textContent = 'Elige una imagen de hasta 8 MB o continúa sin fotografía.';
    photoInput.focus();
    return;
  }
  report.photo = file;
  photoError.textContent = '';
  try {
    renderSummary(reviewSummary);
    showScreen('revision');
  } catch (error) {
    showError(error instanceof Error ? error.message : 'No fue posible preparar el resumen.');
  }
});

document.querySelectorAll('[data-edit]').forEach((button) => {
  button.addEventListener('click', () => {
    const destination = button.getAttribute('data-edit');
    if (destination === 'emergencias') showScreen(destination);
    else if (destination === 'ubicacion') showScreen(destination);
    else if (destination === 'detalles') {
      renderQuestions();
      showScreen(destination);
    }
  });
});

requiredElement('complete-button').addEventListener('click', () => {
  try {
    renderSummary(resultSummary);
    showScreen('resultado');
  } catch (error) {
    showError(error instanceof Error ? error.message : 'No fue posible completar la simulación.');
  }
});

requiredElement('restart-button').addEventListener('click', () => {
  Object.assign(report, { emergency: '', latitude: null, longitude: null, accuracy: null, address: '', landmark: '', people: '', answers: {}, photo: null });
  emergencyGrid?.querySelectorAll('.emergency-card').forEach((card) => {
    card.classList.remove('selected');
    card.setAttribute('aria-pressed', 'false');
  });
  continueEmergencyButton.disabled = true;
  selectionNote.textContent = 'Elige una opción para continuar.';
  locationForm.reset();
  detailsForm.reset();
  clearError();
  showScreen('inicio');
});

