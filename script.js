// Este archivo controla el flujo del prototipo; no envía datos a servicios externos.

/** @typedef {{ id: string, prompt: string, options?: string[] }} Question */
/** @typedef {{ id: string, title: string, questions: Question[], asksPeople: boolean }} EmergencyConfig */
/** @typedef {{ reporterId: string, emergency: string, latitude: number | null, longitude: number | null, accuracy: number | null, address: string, landmark: string, people: string, answers: Record<string, string> }} ReportState */

const emergencyConfigs = /** @type {Record<string, EmergencyConfig>} */ ({
  'No responde el paciente': { id: 'no-responde', title: 'No responde', questions: [{ id: 'responds', prompt: '¿Qué ocurre cuando le hablas?', options: ['Responde claramente', 'Responde con dificultad', 'No responde', 'No sé'] }, { id: 'breathing', prompt: '¿Qué observas en su respiración?', options: ['Parece respirar con normalidad', 'Le cuesta respirar', 'No observo respiración normal', 'No sé'] }], asksPeople: false },
  'Sangrado abundante': { id: 'sangrado', title: 'Sangrado abundante', questions: [{ id: 'bleeding', prompt: '¿Qué observas?', options: ['Sangrado abundante visible', 'Hay sangrado, pero no parece abundante', 'No veo sangrado', 'No sé'] }, { id: 'location', prompt: '¿En qué zona observas el sangrado?', options: ['Cabeza o cuello', 'Torso', 'Brazo o mano', 'Pierna o pie', 'Varias zonas', 'No sé'] }], asksPeople: false },
  'Accidente de tránsito con heridos': { id: 'accidente', title: 'Accidente con lesionados', questions: [{ id: 'unresponsive', prompt: '¿Hay personas que no responden cuando les hablas?', options: ['Sí', 'No', 'No sé'] }, { id: 'breathing', prompt: '¿Hay personas a quienes les cueste respirar?', options: ['Sí', 'No', 'No sé'] }, { id: 'bleeding', prompt: '¿Hay sangrado abundante visible?', options: ['Sí', 'No', 'No sé'] }], asksPeople: true },
  'Golpe o lesiones': { id: 'lesion', title: 'Golpe o lesión', questions: [{ id: 'responds', prompt: '¿Qué ocurre cuando le hablas?', options: ['Responde claramente', 'Responde con dificultad', 'No responde', 'No sé'] }, { id: 'bleeding', prompt: '¿Qué observas sobre el sangrado?', options: ['Sangrado abundante visible', 'Hay sangrado, pero no parece abundante', 'No veo sangrado', 'No sé'] }, { id: 'injuryArea', prompt: '¿En qué zona parece estar la lesión?', options: ['Cabeza o cuello', 'Torso', 'Brazo o mano', 'Pierna o pie', 'Varias zonas', 'No sé'] }], asksPeople: true },
  'Convulsiones': { id: 'convulsion', title: 'Convulsiones', questions: [{ id: 'seizing', prompt: '¿Qué observas ahora?', options: ['Tiene movimientos involuntarios', 'Los movimientos ya pararon', 'No observé movimientos', 'No sé'] }, { id: 'consciousness', prompt: '¿Cómo responde la persona?', options: ['Responde cuando le hablan', 'Responde con dificultad', 'No responde', 'No sé'] }, { id: 'episodeDuration', prompt: '¿Cuánto duró el episodio, aproximadamente?', options: ['Menos de 5 minutos', '5 minutos o más', 'No sé'] }, { id: 'breathing', prompt: '¿Qué observas sobre su respiración?', options: ['Parece respirar con normalidad', 'Tiene dificultad para respirar', 'No observo respiración normal', 'No sé'] }], asksPeople: false },
  'Dolor fuerte en el pecho': { id: 'pecho', title: 'Dolor fuerte en el pecho', questions: [{ id: 'consciousness', prompt: '¿Cómo responde la persona?', options: ['Responde con normalidad', 'Responde con dificultad', 'No responde', 'No sé'] }, { id: 'breathing', prompt: '¿Qué observas sobre su respiración?', options: ['Parece respirar con normalidad', 'Tiene dificultad para respirar', 'No observo respiración normal', 'No sé'] }, { id: 'chestPain', prompt: '¿Qué describe o señala la persona?', options: ['Dolor u opresión en el pecho', 'Molestia que se extiende a brazo, espalda, cuello o mandíbula', 'No puede responder; lo observo sin asumir dolor', 'No sé'] }, { id: 'onset', prompt: '¿Cuándo comenzó, según la persona o lo que observaste?', options: ['Hace menos de 10 minutos', 'Hace 10 minutos o más', 'No sé'] }], asksPeople: false },
  'Le cuesta respirar': { id: 'respira', title: 'Le cuesta respirar', questions: [{ id: 'consciousness', prompt: '¿Cómo responde la persona?', options: ['Responde con normalidad', 'Responde con dificultad', 'No responde', 'No sé'] }, { id: 'breathing', prompt: '¿Qué observas sobre su respiración?', options: ['Respira con dificultad', 'Respira muy rápido o con pausas', 'No observo respiración normal', 'No sé'] }, { id: 'speaking', prompt: '¿Puede hablar en frases completas?', options: ['Sí', 'Solo puede decir pocas palabras', 'No puede hablar', 'No sé'] }, { id: 'onset', prompt: '¿Cuándo comenzó la dificultad?', options: ['De repente', 'Poco a poco', 'No sé'] }], asksPeople: false },
  Quemadura: { id: 'quemadura', title: 'Quemadura', questions: [{ id: 'responds', prompt: '¿Qué ocurre cuando le hablas?', options: ['Responde claramente', 'Responde con dificultad', 'No responde', 'No sé'] }, { id: 'burnArea', prompt: '¿Qué zona parece afectada?', options: ['Cara o cuello', 'Torso', 'Brazo o mano', 'Pierna o pie', 'Varias zonas', 'No sé'] }], asksPeople: true },
  'Otra emergencia': { id: 'otra', title: 'Otra emergencia', questions: [{ id: 'eventType', prompt: '¿Qué situación observas?', options: ['Caída o golpe', 'Incendio o quemadura', 'Accidente de tránsito', 'Otra situación', 'No sé'] }, { id: 'responds', prompt: '¿Qué ocurre cuando le hablas?', options: ['Responde claramente', 'Responde con dificultad', 'No responde', 'No sé'] }, { id: 'breathing', prompt: '¿Qué observas en su respiración?', options: ['Parece respirar con normalidad', 'Le cuesta respirar', 'No observo respiración normal', 'No sé'] }, { id: 'bleeding', prompt: '¿Qué observas sobre el sangrado?', options: ['Sangrado abundante visible', 'Hay sangrado, pero no parece abundante', 'No veo sangrado', 'No sé'] }], asksPeople: false },
});

/** @type {ReportState} */
const report = { reporterId: '', emergency: '', latitude: null, longitude: null, accuracy: null, address: '', landmark: '', people: '', answers: {} };
const screenIds = ['inicio', 'identificacion', 'emergencias', 'ubicacion', 'detalles', 'revision', 'resultado'];
const screens = new Map(screenIds.map((id) => [id, document.getElementById(id)]));
const startButton = document.getElementById('start-button');
const identificationForm = document.getElementById('identification-form');
const reporterIdInput = document.getElementById('reporter-id');
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
const healthConsent = document.getElementById('health-consent');
const reviewSummary = document.getElementById('review-summary');
const resultSummary = document.getElementById('result-summary');
const screenCallLink = document.getElementById('screen-call-link');
const downloadReportButton = document.getElementById('download-report');
const exportStatus = document.getElementById('export-status');
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
  screenCallLink?.classList.toggle('hidden', id === 'inicio' || id === 'resultado');
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
    input.required = false;
    input.disabled = !healthConsent.checked;
    input.inputMode = 'numeric';
    input.value = report.people === 'No sé' ? '' : report.people;
    input.setAttribute('aria-describedby', 'people-count-help');
    group.append(label, input);
    const unknownLabel = document.createElement('label');
    unknownLabel.className = 'unknown-answer-label';
    const unknown = document.createElement('input');
    unknown.id = 'people-count-unknown';
    unknown.type = 'checkbox';
    unknown.checked = report.people === 'No sé';
    unknown.disabled = !healthConsent.checked;
    unknownLabel.append(unknown, document.createTextNode(' No sé'));
    group.append(unknownLabel);
    unknown.addEventListener('change', () => {
      input.disabled = !healthConsent.checked || unknown.checked;
      if (unknown.checked) input.value = '';
    });
    const help = document.createElement('small');
    help.id = 'people-count-help';
    help.className = 'question-help';
    help.textContent = '“No sé” significa que no lograste contar a las personas. Marca esa opción si tienes dudas; no adivines.';
    group.append(help);
    questionList.append(group);
  }
  config.questions.forEach(({ id, prompt, options }) => {
    const group = document.createElement('fieldset');
    group.className = 'question-item';
    const legend = document.createElement('legend');
    legend.textContent = prompt;
    const select = document.createElement('select');
    select.name = id;
    select.required = false;
    select.disabled = !healthConsent.checked;
    select.setAttribute('aria-describedby', `${id}-help`);
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecciona una respuesta';
    placeholder.disabled = true;
    placeholder.selected = !report.answers[id];
    select.append(placeholder);
    [...(options || ['Sí', 'No', 'No sé']), 'Prefiero no responder'].forEach((answer) => {
      const option = document.createElement('option');
      option.value = answer;
      option.textContent = answer;
      option.selected = report.answers[id] === answer;
      select.append(option);
    });
    const help = document.createElement('small');
    help.id = `${id}-help`;
    help.className = 'question-help';
    help.textContent = '“No sé” significa que no pudiste observarlo o confirmarlo. Elige esa opción si tienes dudas; no adivines.';
    group.append(legend, select, help);
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
  if (report.reporterId) container.append(summaryRow('Identificación opcional de quien reporta', report.reporterId));
}

startButton?.addEventListener('click', () => {
  clearError();
  showScreen('identificacion');
});

identificationForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  report.reporterId = reporterIdInput.value.trim();
  showScreen('emergencias');
});

healthConsent?.addEventListener('change', () => {
  questionList.querySelectorAll('select, input').forEach((control) => {
    control.disabled = !healthConsent.checked;
    if (!healthConsent.checked) control.value = '';
  });
  if (!healthConsent.checked) report.answers = {};
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
  try {
    const address = addressInput.value.trim();
    const hasCoordinates = Number.isFinite(report.latitude) && Number.isFinite(report.longitude);
    if (!address && !hasCoordinates) {
      locationError.textContent = 'Escribe una dirección o vuelve a intentar obtener tu ubicación.';
      addressInput.focus();
      return;
    }
    if (!emergencyConfigs[report.emergency]) {
      locationError.textContent = 'Selecciona una emergencia antes de continuar.';
      showScreen('emergencias');
      return;
    }
    report.address = address;
    report.landmark = landmarkInput.value.trim();
    locationError.textContent = '';
    renderQuestions();
    showScreen('detalles');
  } catch (error) {
    locationError.textContent = error instanceof Error
      ? `No se pudo continuar: ${error.message}`
      : 'No se pudo continuar. Revisa la información e inténtalo de nuevo.';
  }
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
  if (config.asksPeople && healthConsent.checked && count?.value) {
    const number = Number(count.value);
    if (!Number.isInteger(number) || number < 1 || number > 999) {
      count?.setCustomValidity('Ingresa un número entero entre 1 y 999.');
      count?.reportValidity();
      count?.addEventListener('input', () => count.setCustomValidity(''), { once: true });
      return;
    }
    report.people = String(number);
  } else if (config.asksPeople && healthConsent.checked && questionList.querySelector('#people-count-unknown')?.checked) {
    report.people = 'No sé';
  } else {
    report.people = '';
  }
  /** @type {Record<string, string>} */
  const answers = {};
  if (healthConsent.checked) {
    for (const question of config.questions) {
      const select = detailsForm.elements.namedItem(question.id);
      if (select instanceof HTMLSelectElement && select.value) answers[question.id] = select.value;
    }
  }
  report.answers = answers;
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


downloadReportButton?.addEventListener('click', () => {
  try {
    const config = emergencyConfigs[report.emergency];
    if (!config) throw new Error('No hay un reporte disponible para descargar.');
    const columns = ['Fecha de descarga', 'Emergencia', 'Dirección', 'Punto de referencia', 'Latitud', 'Longitud', 'Precisión (m)', 'Personas afectadas', 'Identificación de quien reporta', ...config.questions.map(({ prompt }) => prompt)];
    const values = [new Date().toLocaleString('es-CO'), config.title, report.address || (report.latitude !== null ? 'Ubicación del dispositivo' : ''), report.landmark, report.latitude ?? '', report.longitude ?? '', report.accuracy ?? '', report.people, report.reporterId, ...config.questions.map(({ id }) => report.answers[id] || 'Sin respuesta')];
    const escapeCsv = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = '\uFEFF' + [columns, values].map((row) => row.map(escapeCsv).join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
    link.download = `reporte-red-de-vida-${timestamp}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    if (exportStatus) exportStatus.textContent = 'Reporte descargado. Puedes abrir el archivo CSV con Excel.';
  } catch (error) {
    if (exportStatus) exportStatus.textContent = error instanceof Error ? error.message : 'No se pudo descargar el reporte.';
  }
});
requiredElement('restart-button').addEventListener('click', () => {
  Object.assign(report, { reporterId: '', emergency: '', latitude: null, longitude: null, accuracy: null, address: '', landmark: '', people: '', answers: {} });
  emergencyGrid?.querySelectorAll('.emergency-card').forEach((card) => {
    card.classList.remove('selected');
    card.setAttribute('aria-pressed', 'false');
  });
  continueEmergencyButton.disabled = true;
  selectionNote.textContent = 'Elige una opción para continuar.';
  locationForm.reset();
  detailsForm.reset();
  identificationForm.reset();
  questionList.replaceChildren();
  clearError();
  showScreen('inicio');
});
