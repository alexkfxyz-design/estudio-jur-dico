/* =========================================================
   PANEL DE ADMINISTRACIÓN
   Todo el contenido del sitio se edita desde aquí.
   ========================================================= */
let D = Store.load();
let vista = 'dashboard';
let dirty = false;
let pendingNew = null;
let confirmResolver = null;
let citaFiltro = 'todas', citaQ = '';
let msgFiltro = 'todos', msgQ = '';
const msgAbiertos = new Set();

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const content = $('#content');

const ESTADOS = ['pendiente', 'confirmada', 'atendida', 'cancelada'];
const ESTADO_PLURAL = { todas: 'Todas', pendiente: 'Pendientes', confirmada: 'Confirmadas', atendida: 'Atendidas', cancelada: 'Canceladas' };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------------- Menú lateral ---------------- */
const NAV = [
  { id: 'dashboard', l: 'Inicio', i: '🏠' },
  { id: 'citas', l: 'Citas', i: '📅', n: () => D.citas.filter(c => c.estado === 'pendiente').length },
  { id: 'mensajes', l: 'Mensajes', i: '✉️', n: () => D.mensajes.filter(m => !m.leido).length },
  { g: 'Contenido del sitio' },
  { id: 'general', l: 'Datos generales', i: '⚙️' },
  { id: 'perfil', l: 'Perfil y biografía', i: '👤' },
  { id: 'areas', l: 'Áreas de práctica', i: '⚖️' },
  { g: 'Portafolio' },
  { id: 'casos', l: 'Casos de éxito', i: '📁' },
  { id: 'experiencia', l: 'Experiencia', i: '💼' },
  { id: 'formacion', l: 'Formación', i: '🎓' },
  { id: 'certificaciones', l: 'Certificaciones', i: '🏅' },
  { g: 'Publicaciones' },
  { id: 'blog', l: 'Blog', i: '📝' },
  { id: 'testimonios', l: 'Testimonios', i: '💬' },
  { id: 'faq', l: 'Preguntas frecuentes', i: '❓' },
  { g: 'Sistema' },
  { id: 'ajustes', l: 'Ajustes y respaldo', i: '🛠️' }
];

/* ---------------- Definición de las listas editables ---------------- */
const CRUD = {
  areas: {
    titulo: 'Áreas de práctica', desc: 'Servicios que aparecen en la web y en el formulario de citas.', singular: 'área',
    main: 'titulo', sub: x => recortar(x.descripcion, 90), icon: x => x.icono || '⚖️',
    fields: [
      { k: 'icono', l: 'Ícono (emoji)', ph: '⚖️', help: 'Copia y pega un emoji: ⚖️ 📜 👨‍👩‍👧 💼 🏢 🏠 🚗 🧾 🏛️' },
      { k: 'titulo', l: 'Nombre del área', req: true },
      { k: 'descripcion', l: 'Descripción', t: 'textarea', rows: 3, req: true }
    ]
  },
  casos: {
    titulo: 'Casos de éxito', desc: 'Casos representativos del portafolio. Evita publicar datos personales de clientes.', singular: 'caso',
    main: 'titulo', sub: x => [x.area, x.anio, x.resultado].filter(Boolean).join(' · '), img: 'imagen', icon: () => '📁',
    fields: [
      { k: 'titulo', l: 'Título del caso', req: true, full: true },
      { k: 'area', l: 'Área', t: 'select', opts: () => D.areas.map(a => a.titulo) },
      { k: 'anio', l: 'Año', ph: '2026' },
      { k: 'resultado', l: 'Resultado obtenido', ph: 'Sentencia favorable', full: true },
      { k: 'resumen', l: 'Resumen corto (se ve en la tarjeta)', t: 'textarea', rows: 2, req: true },
      { k: 'descripcion', l: 'Descripción completa', t: 'textarea', rows: 7, help: 'Deja una línea en blanco para separar párrafos.' },
      { k: 'imagen', l: 'Imagen (opcional)', t: 'image', wide: true, max: 1200 }
    ]
  },
  experiencia: {
    titulo: 'Experiencia profesional', desc: 'Línea de tiempo de la trayectoria. El orden de la lista es el orden en la web.', singular: 'experiencia',
    main: 'cargo', sub: x => [x.lugar, x.periodo].filter(Boolean).join(' · '), icon: () => '💼',
    fields: [
      { k: 'cargo', l: 'Cargo', req: true },
      { k: 'periodo', l: 'Periodo', ph: '2018 – Actualidad' },
      { k: 'lugar', l: 'Institución / empresa', req: true, full: true },
      { k: 'descripcion', l: 'Descripción', t: 'textarea', rows: 3 }
    ]
  },
  formacion: {
    titulo: 'Formación académica', desc: 'Títulos, maestrías, diplomados y estudios.', singular: 'estudio',
    main: 'titulo', sub: x => [x.institucion, x.anio].filter(Boolean).join(' · '), icon: () => '🎓',
    fields: [
      { k: 'titulo', l: 'Grado / título', req: true, full: true },
      { k: 'institucion', l: 'Institución', req: true },
      { k: 'anio', l: 'Año', ph: '2014' },
      { k: 'descripcion', l: 'Detalle (opcional)', t: 'textarea', rows: 2 }
    ]
  },
  certificaciones: {
    titulo: 'Certificaciones y reconocimientos', desc: 'Puedes subir una foto del certificado; en la web se puede ampliar.', singular: 'certificación',
    main: 'nombre', sub: x => [x.entidad, x.anio].filter(Boolean).join(' · '), img: 'imagen', icon: () => '🏅',
    fields: [
      { k: 'nombre', l: 'Nombre del certificado', req: true, full: true },
      { k: 'entidad', l: 'Entidad que lo otorga' },
      { k: 'anio', l: 'Año' },
      { k: 'imagen', l: 'Imagen del certificado', t: 'image', wide: true, max: 1400 }
    ]
  },
  blog: {
    titulo: 'Blog', desc: 'Artículos publicados. Se ordenan solos por fecha (el más reciente primero).', singular: 'artículo',
    main: 'titulo', sub: x => [fmtFecha(x.fecha, true), x.categoria].filter(Boolean).join(' · '), img: 'imagen', icon: () => '📝',
    noOrder: true, sort: (a, b) => String(b.fecha).localeCompare(String(a.fecha)), defaults: () => ({ fecha: hoyISO() }),
    fields: [
      { k: 'titulo', l: 'Título', req: true, full: true },
      { k: 'categoria', l: 'Categoría', ph: 'Laboral' },
      { k: 'fecha', l: 'Fecha de publicación', t: 'date', req: true },
      { k: 'resumen', l: 'Resumen (se ve en la tarjeta)', t: 'textarea', rows: 2, req: true },
      { k: 'contenido', l: 'Contenido del artículo', t: 'textarea', rows: 12, req: true, help: 'Deja una línea en blanco para separar párrafos.' },
      { k: 'imagen', l: 'Imagen de portada', t: 'image', wide: true, max: 1400 }
    ]
  },
  testimonios: {
    titulo: 'Testimonios', desc: 'Opiniones de clientes que aparecen en el carrusel.', singular: 'testimonio',
    main: 'nombre', sub: x => `${'★'.repeat(+x.estrellas || 5)} · ${recortar(x.texto, 70)}`, img: 'foto', icon: x => inicialesDe(x.nombre),
    defaults: () => ({ estrellas: '5' }),
    fields: [
      { k: 'nombre', l: 'Nombre', req: true, help: 'Puedes usar solo nombre e inicial: "María Q."' },
      { k: 'cargo', l: 'Detalle', ph: 'Caso laboral' },
      { k: 'texto', l: 'Testimonio', t: 'textarea', rows: 4, req: true },
      { k: 'estrellas', l: 'Calificación', t: 'select', placeholder: false, opts: [{ v: '5', l: '★★★★★' }, { v: '4', l: '★★★★☆' }, { v: '3', l: '★★★☆☆' }, { v: '2', l: '★★☆☆☆' }, { v: '1', l: '★☆☆☆☆' }] },
      { k: 'foto', l: 'Foto (opcional)', t: 'image', max: 400 }
    ]
  },
  faq: {
    titulo: 'Preguntas frecuentes', desc: 'Preguntas y respuestas de la sección FAQ.', singular: 'pregunta',
    main: 'pregunta', sub: x => recortar(x.respuesta, 90), icon: () => '❓',
    fields: [
      { k: 'pregunta', l: 'Pregunta', req: true, full: true },
      { k: 'respuesta', l: 'Respuesta', t: 'textarea', rows: 4, req: true }
    ]
  }
};

/* ---------------- Formularios de configuración ---------------- */
const GENERAL = [
  { titulo: 'Identidad', sub: 'Cómo aparece el abogado en todo el sitio.', fields: [
    { k: 'nombre', l: 'Nombre completo', req: true },
    { k: 'titulo', l: 'Subtítulo', ph: 'Abogado · Estudio Jurídico' },
    { k: 'colegiatura', l: 'N.° de colegiatura', ph: 'CAA N.° 0000' },
    { k: 'iniciales', l: 'Iniciales del logo', help: '2 o 3 letras. También se usan si no hay foto.' },
    { k: 'foto', l: 'Foto profesional', t: 'image', max: 900, help: 'Recomendado: foto vertical, fondo neutro.' }
  ] },
  { titulo: 'Portada', sub: 'Lo primero que ve el visitante.', fields: [
    { k: 'eyebrow', l: 'Texto superior', full: true },
    { k: 'heroTitulo', l: 'Título principal', req: true, full: true },
    { k: 'slogan', l: 'Frase de presentación', t: 'textarea', rows: 2 },
    { k: 'fondoHero', l: 'Imagen de fondo (opcional)', t: 'image', wide: true, max: 1800, help: 'Se muestra suave detrás del color principal.' }
  ] },
  { titulo: 'Contacto y horarios', sub: 'Datos de contacto y horario para la agenda de citas.', fields: [
    { k: 'telefono', l: 'Teléfono', t: 'tel' },
    { k: 'whatsapp', l: 'WhatsApp', help: 'Con código de país, sin espacios. Ej: 51954123456' },
    { k: 'mensajeWhatsapp', l: 'Mensaje predeterminado de WhatsApp', full: true },
    { k: 'email', l: 'Correo', t: 'email' },
    { k: 'direccion', l: 'Dirección de la oficina', help: 'Se usa también para el mapa.' },
    { k: 'horario', l: 'Horario (texto que se muestra)', full: true },
    { k: 'horaInicio', l: 'Agenda: hora de inicio (L-V)', t: 'number', min: 0, max: 23, help: 'Formato 24 h. Ej: 9' },
    { k: 'horaFin', l: 'Agenda: hora de cierre (L-V)', t: 'number', min: 1, max: 24, help: 'Ej: 18 (la última cita sería a las 5 p. m.)' },
    { k: 'atiendeSabados', l: 'Aceptar citas los sábados', t: 'toggle' },
    { k: 'horaFinSabado', l: 'Sábado: hora de cierre', t: 'number', min: 1, max: 24 }
  ] },
  { titulo: 'Redes sociales', sub: 'Deja vacío lo que no uses; el ícono no aparecerá.', fields: [
    { k: 'facebook', l: 'Facebook', t: 'url', ph: 'https://facebook.com/…' },
    { k: 'instagram', l: 'Instagram', t: 'url', ph: 'https://instagram.com/…' },
    { k: 'linkedin', l: 'LinkedIn', t: 'url', ph: 'https://linkedin.com/in/…' },
    { k: 'tiktok', l: 'TikTok', t: 'url', ph: 'https://tiktok.com/@…' }
  ] },
  { titulo: 'Apariencia y secciones', sub: 'Colores de la marca y secciones visibles.', fields: [
    { k: 'colorPrimario', l: 'Color principal', t: 'color' },
    { k: 'colorAcento', l: 'Color de acento', t: 'color' },
    { k: 'secCitas', l: 'Mostrar agenda de citas', t: 'toggle' },
    { k: 'secTestimonios', l: 'Mostrar testimonios', t: 'toggle' },
    { k: 'secBlog', l: 'Mostrar blog', t: 'toggle' },
    { k: 'secFaq', l: 'Mostrar preguntas frecuentes', t: 'toggle' }
  ] },
  { titulo: 'Currículum (CV)', sub: 'Botón "Descargar CV" del portafolio. Si lo dejas vacío, el botón se oculta.', fields: [
    { k: 'cv', l: 'Archivo PDF', t: 'pdf' }
  ] }
];

const PERFIL = [
  { titulo: 'Biografía', sub: 'Texto de la sección "Sobre mí".', fields: [
    { k: 'bio', l: 'Biografía', t: 'textarea', rows: 9, help: 'Deja una línea en blanco para separar párrafos.' },
    { k: 'mision', l: 'Frase destacada / misión', t: 'textarea', rows: 2 },
    { k: 'enfoque', l: 'Valores o enfoque', full: true, help: 'Separa con · o con comas. Cada uno aparece como una etiqueta.' },
    { k: 'idiomas', l: 'Idiomas', full: true }
  ] },
  { titulo: 'Cifras destacadas', sub: 'Contadores animados de la portada.', fields: [
    { k: 'anios', l: 'Años de experiencia', t: 'number', min: 0 },
    { k: 'casos', l: 'Casos atendidos', t: 'number', min: 0 },
    { k: 'clientes', l: 'Clientes satisfechos', t: 'number', min: 0 },
    { k: 'exito', l: '% de resultados favorables', t: 'number', min: 0, max: 100 }
  ] }
];

const CITA_FIELDS = [
  { k: 'nombre', l: 'Nombre del cliente', req: true },
  { k: 'telefono', l: 'Teléfono', t: 'tel', req: true },
  { k: 'email', l: 'Correo', t: 'email' },
  { k: 'area', l: 'Área', t: 'select', opts: () => [...D.areas.map(a => a.titulo), 'Otro / No estoy seguro'] },
  { k: 'fecha', l: 'Fecha', t: 'date', req: true },
  { k: 'hora', l: 'Hora', t: 'time', req: true },
  { k: 'modalidad', l: 'Modalidad', t: 'select', placeholder: false, opts: ['Presencial', 'Virtual'] },
  { k: 'estado', l: 'Estado', t: 'select', placeholder: false, opts: ESTADOS.map(e => ({ v: e, l: cap(e) })) },
  { k: 'mensaje', l: 'Notas', t: 'textarea', rows: 3 }
];

/* =========================================================
   CONSTRUCCIÓN DE CAMPOS
   ========================================================= */
function campo(f, v) {
  const id = 'f_' + f.k, t = f.t || 'text', req = f.req ? 'required' : '';
  v = v ?? '';
  const help = f.help ? `<small>${f.help}</small>` : '';
  const full = f.full || ['textarea', 'image', 'pdf'].includes(t) ? 'full' : '';
  const label = `<label for="${id}">${f.l}${f.req ? ' <span style="color:var(--danger)">*</span>' : ''}</label>`;
  let input;

  switch (t) {
    case 'textarea':
      input = `<textarea id="${id}" name="${f.k}" rows="${f.rows || 4}" ${req} placeholder="${esc(f.ph || '')}">${esc(v)}</textarea>`; break;
    case 'select': {
      let opts = (typeof f.opts === 'function' ? f.opts() : f.opts).map(o => typeof o === 'string' ? { v: o, l: o } : o);
      if (v !== '' && !opts.some(o => String(o.v) === String(v))) opts.unshift({ v, l: v });
      input = `<select id="${id}" name="${f.k}" ${req}>${f.placeholder === false ? '' : '<option value="">— Seleccionar —</option>'}${opts.map(o => `<option value="${esc(o.v)}" ${String(o.v) === String(v) ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
      break;
    }
    case 'toggle':
      return `<div class="field ${f.full ? 'full' : ''}"><label class="switch-row"><span>${f.l}</span><span class="switch"><input type="checkbox" name="${f.k}" ${v !== false ? 'checked' : ''}><i></i></span></label>${help}</div>`;
    case 'color':
      input = `<div class="color-field"><input type="color" data-sync value="${esc(v || '#000000')}" aria-label="${esc(f.l)}"><input type="text" id="${id}" name="${f.k}" value="${esc(v)}" pattern="^#[0-9a-fA-F]{6}$" placeholder="#000000"></div>`; break;
    case 'image':
      input = `<div class="img-field ${f.wide ? 'wide' : ''}" data-kind="image" data-max="${f.max || 1000}">
        <div class="img-prev">${v ? `<img src="${esc(v)}" alt="">` : 'Sin imagen'}</div>
        <div class="img-actions">
          <label class="btn btn-sm btn-outline file-btn">📷 Subir imagen<input type="file" accept="image/*"></label>
          <button type="button" class="btn btn-sm btn-ghost" data-clear>Quitar</button>
          <div class="url"><input type="url" data-url placeholder="…o pega el enlace de una imagen" value="${v && !String(v).startsWith('data:') ? esc(v) : ''}"></div>
          <input type="hidden" name="${f.k}" value="${esc(v)}">
        </div></div>`; break;
    case 'pdf':
      input = `<div class="img-field" data-kind="pdf">
        <div class="img-prev">${v ? '<span style="font-size:2.2rem">📄</span>' : 'Sin archivo'}</div>
        <div class="img-actions">
          <label class="btn btn-sm btn-outline file-btn">📄 Subir PDF<input type="file" accept="application/pdf"></label>
          <button type="button" class="btn btn-sm btn-ghost" data-clear>Quitar</button>
          <div class="url"><input type="url" data-url placeholder="…o pega un enlace (Google Drive, Dropbox)" value="${v && !String(v).startsWith('data:') ? esc(v) : ''}"></div>
          <input type="hidden" name="${f.k}" value="${esc(v)}">
        </div></div>
        <small>Máximo 1,5 MB. Para archivos más pesados usa un enlace.</small>`; break;
    default: {
      const extra = ['min', 'max', 'step'].filter(a => f[a] !== undefined).map(a => `${a}="${f[a]}"`).join(' ');
      input = `<input id="${id}" name="${f.k}" type="${t}" value="${esc(v)}" ${req} ${extra} placeholder="${esc(f.ph || '')}">`;
    }
  }
  return `<div class="field ${full}">${label}${input}${help}</div>`;
}

function leerCampos(form, fields) {
  const o = {};
  fields.forEach(f => {
    const el = form.elements[f.k];
    if (!el) return;
    if (f.t === 'toggle') o[f.k] = el.checked;
    else if (f.t === 'number') o[f.k] = el.value === '' ? 0 : Number(el.value);
    else o[f.k] = String(el.value).trim();
  });
  return o;
}

/* ---------------- Imágenes y archivos ---------------- */
function comprimirImagen(file, max = 1000, q = 0.82) {
  return new Promise((res, rej) => {
    if (!file.type.startsWith('image/')) return rej(new Error('El archivo no es una imagen.'));
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      if (file.size > 600 * 1024) return rej(new Error('La imagen es muy pesada (máx. 600 KB para SVG/GIF).'));
      return leerArchivo(file).then(res, rej);
    }
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > max) { h = Math.round(h * max / w); w = max; }
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      res(file.type === 'image/png' ? cv.toDataURL('image/webp', q) : cv.toDataURL('image/jpeg', q));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('No se pudo leer la imagen.')); };
    img.src = url;
  });
}

function leerArchivo(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error('No se pudo leer el archivo.'));
    r.readAsDataURL(file);
  });
}

function setArchivo(f, v) {
  f.querySelector('input[type=hidden]').value = v;
  const prev = f.querySelector('.img-prev');
  if (f.dataset.kind === 'pdf') prev.innerHTML = v ? '<span style="font-size:2.2rem">📄</span>' : 'Sin archivo';
  else prev.innerHTML = v ? `<img src="${esc(v)}" alt="">` : 'Sin imagen';
  const url = f.querySelector('[data-url]');
  if (url) url.value = v && !v.startsWith('data:') ? v : '';
  f.closest('form')?.dispatchEvent(new Event('input', { bubbles: true }));
}

/* =========================================================
   GUARDADO, MODAL, TOAST
   ========================================================= */
function persist(msg = 'Cambios guardados') {
  if (Store.save(D)) { if (msg) toast(msg); renderSidebar(); return true; }
  toast('No hay espacio suficiente en el navegador. Usa imágenes más livianas o elimina algunas.', true);
  D = Store.load();
  return false;
}

let toastT;
function toast(msg, error) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('error', !!error);
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 3500);
}

function abrirModal(titulo, html, size) {
  $('#modalTitle').textContent = titulo;
  $('#modalBody').innerHTML = html;
  $('#modalBox').className = 'modal-box' + (size ? ' ' + size : '');
  $('#modal').classList.add('open');
  setTimeout(() => $('#modalBody input:not([type=hidden]):not([type=file]), #modalBody textarea')?.focus(), 60);
}

function cerrarModal() {
  $('#modal').classList.remove('open');
  if (confirmResolver) { const r = confirmResolver; confirmResolver = null; r(false); }
}

function confirmar(titulo, texto, ok = 'Eliminar') {
  return new Promise(res => {
    abrirModal(titulo, `<p class="confirm-text">${texto}</p>
      <div class="modal-foot"><button class="btn btn-ghost" data-cf="0">Cancelar</button><button class="btn btn-danger" data-cf="1">${ok}</button></div>`, 'sm');
    confirmResolver = res;
  });
}

/* =========================================================
   NAVEGACIÓN
   ========================================================= */
function renderSidebar() {
  const c = D.config;
  $('#sideMark').textContent = c.iniciales || inicialesDe(c.nombre);
  $('#sideName').textContent = c.nombre;
  $('#sideNav').innerHTML = NAV.map(n => {
    if (n.g) return `<div class="side-group">${n.g}</div>`;
    const cnt = n.n ? n.n() : 0;
    return `<a href="#/${n.id}" class="side-item ${vista === n.id ? 'active' : ''}" data-nav><span class="ico">${n.i}</span>${n.l}${cnt ? `<span class="count">${cnt}</span>` : ''}</a>`;
  }).join('');
}

function setHeader(titulo, desc, acciones = '') {
  $('#viewTitle').textContent = titulo;
  $('#viewDesc').textContent = desc || '';
  $('#topActions').innerHTML = acciones;
  document.title = `${titulo} · Panel de administración`;
}

const VISTAS = {
  dashboard: vDashboard, citas: vCitas, mensajes: vMensajes,
  general: () => vConfig('general'), perfil: () => vConfig('perfil'), ajustes: vAjustes
};
Object.keys(CRUD).forEach(k => VISTAS[k] = () => vCrud(k));

function route() {
  const id = location.hash.replace(/^#\/?/, '') || 'dashboard';
  vista = VISTAS[id] ? id : 'dashboard';
  dirty = false;
  renderVista();
  window.scrollTo(0, 0);
}

function renderVista() {
  renderSidebar();
  VISTAS[vista]();
}

/* =========================================================
   VISTA: INICIO
   ========================================================= */
function vDashboard() {
  const hoy = hoyISO(), c = D.config;
  const pend = D.citas.filter(x => x.estado === 'pendiente').length;
  const citasHoy = D.citas.filter(x => x.fecha === hoy && x.estado !== 'cancelada').length;
  const noLeidos = D.mensajes.filter(m => !m.leido).length;
  const proximas = D.citas.filter(x => x.fecha >= hoy && ['pendiente', 'confirmada'].includes(x.estado)).sort(ordenCitas).slice(0, 5);
  const ultimos = [...D.mensajes].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).slice(0, 4);
  const kb = Store.sizeKB(D), pct = Math.min(100, Math.round(kb / 5000 * 100));

  setHeader('Inicio', 'Resumen de la actividad del sitio.');
  content.innerHTML = `
    <div class="card welcome">
      <div><h2>Hola, ${esc(c.nombre.split(' ').slice(0, 2).join(' '))} 👋</h2><p>Desde aquí gestionas todo el contenido de tu sitio web.</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-gold" data-nuevo="blog">+ Nuevo artículo</button>
        <button class="btn btn-gold" data-nuevo="casos">+ Nuevo caso</button>
        <a class="btn" style="border-color:rgba(255,255,255,.35);color:#fff" href="index.html" target="_blank">Ver sitio ↗</a>
      </div>
    </div>

    <div class="stats-grid">
      <a href="#/citas" class="stat-card"><span class="stat-ico">📅</span><div><strong>${pend}</strong><span>Citas pendientes</span></div></a>
      <a href="#/citas" class="stat-card"><span class="stat-ico">⏰</span><div><strong>${citasHoy}</strong><span>Citas para hoy</span></div></a>
      <a href="#/mensajes" class="stat-card"><span class="stat-ico">✉️</span><div><strong>${noLeidos}</strong><span>Mensajes sin leer</span></div></a>
      <a href="#/casos" class="stat-card"><span class="stat-ico">📁</span><div><strong>${D.casos.length}</strong><span>Casos publicados</span></div></a>
      <a href="#/blog" class="stat-card"><span class="stat-ico">📝</span><div><strong>${D.blog.length}</strong><span>Artículos</span></div></a>
    </div>

    <div class="dash-grid">
      <div class="card">
        <div class="card-head"><div><h3>Próximas citas</h3><p class="sub">Pendientes y confirmadas</p></div><a href="#/citas" class="btn btn-sm btn-outline">Ver todas</a></div>
        ${proximas.length ? `<div class="mini-list">${proximas.map(x => {
          const [y, m, d] = x.fecha.split('-').map(Number);
          const mes = new Date(y, m - 1, d).toLocaleDateString('es-PE', { month: 'short' });
          return `<div class="mini-item">
            <div class="mini-date"><b>${d}</b><small>${mes}</small></div>
            <div class="grow"><strong>${esc(x.nombre)}${x.fecha === hoy ? '<span class="hoy-tag">HOY</span>' : ''}</strong><small>${fmtHora(x.hora)} · ${esc(x.area || 'Sin área')} · ${esc(x.modalidad)}</small></div>
            <span class="pill e-${x.estado}">${cap(x.estado)}</span>
          </div>`;
        }).join('')}</div>` : '<p class="sub">No hay citas próximas.</p>'}
      </div>
      <div>
        <div class="card">
          <div class="card-head"><div><h3>Últimos mensajes</h3></div><a href="#/mensajes" class="btn btn-sm btn-outline">Ver todos</a></div>
          ${ultimos.length ? `<div class="mini-list">${ultimos.map(m => `
            <a href="#/mensajes" class="mini-item" data-open-msg="${m.id}">
              ${m.leido ? '' : '<span class="dot-new"></span>'}
              <div class="grow"><strong>${esc(m.nombre)}</strong><small>${esc(m.asunto)}</small></div>
              <small class="sub">${fmtFecha(m.fecha, true)}</small>
            </a>`).join('')}</div>` : '<p class="sub">Sin mensajes todavía.</p>'}
        </div>
        <div class="card">
          <h3>Espacio de almacenamiento</h3>
          <div class="storage"><div class="bar ${pct > 80 ? 'alto' : ''}"><span style="width:${pct}%"></span></div>
          <small class="sub">${kb} KB usados de ~5.000 KB (${pct}%)</small></div>
        </div>
      </div>
    </div>`;
}

/* =========================================================
   VISTA: CITAS
   ========================================================= */
function ordenCitas(a, b) {
  const hoy = hoyISO();
  const fa = a.fecha >= hoy, fb = b.fecha >= hoy;
  if (fa !== fb) return fa ? -1 : 1;
  const ka = a.fecha + a.hora, kb = b.fecha + b.hora;
  return fa ? ka.localeCompare(kb) : kb.localeCompare(ka);
}

function vCitas() {
  setHeader('Citas', 'Solicitudes de la web y citas registradas manualmente.', `<button class="btn btn-gold" data-cita-new>+ Registrar cita</button>`);
  const n = s => s === 'todas' ? D.citas.length : D.citas.filter(c => c.estado === s).length;
  content.innerHTML = `
    <div class="filters">
      <div class="seg">${['todas', ...ESTADOS].map(s => `<button class="${s === citaFiltro ? 'active' : ''}" data-cita-filtro="${s}">${ESTADO_PLURAL[s]}<span class="n">${n(s)}</span></button>`).join('')}</div>
      <input type="search" id="citaBuscar" placeholder="🔍 Buscar cliente, teléfono…" value="${esc(citaQ)}">
    </div>
    <div id="citaTabla"></div>`;
  renderCitaTabla();
}

function renderCitaTabla() {
  const hoy = hoyISO(), q = citaQ.toLowerCase();
  const lista = D.citas.filter(c => (citaFiltro === 'todas' || c.estado === citaFiltro) &&
    (!q || [c.nombre, c.telefono, c.email, c.area].join(' ').toLowerCase().includes(q))).sort(ordenCitas);
  if (!lista.length) { $('#citaTabla').innerHTML = `<div class="empty-state"><div class="big">📅</div>No hay citas en esta vista.</div>`; return; }
  $('#citaTabla').innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>Fecha y hora</th><th>Cliente</th><th>Área</th><th>Detalle</th><th>Estado</th><th></th></tr></thead>
    <tbody>${lista.map(c => `
      <tr style="${c.fecha < hoy ? 'opacity:.65' : ''}">
        <td><strong>${fmtFecha(c.fecha, true)}</strong>${c.fecha === hoy ? '<span class="hoy-tag">HOY</span>' : ''}<small>${fmtHora(c.hora)}</small></td>
        <td><strong>${esc(c.nombre)}</strong><small>${esc(c.telefono)}</small>${c.email ? `<small>${esc(c.email)}</small>` : ''}</td>
        <td>${esc(c.area || '—')}<small>${esc(c.modalidad || '')}</small></td>
        <td class="td-msg" title="${esc(c.mensaje)}">${esc(recortar(c.mensaje, 80)) || '—'}</td>
        <td><select class="estado e-${c.estado}" data-estado="${c.id}">${ESTADOS.map(e => `<option value="${e}" ${e === c.estado ? 'selected' : ''}>${cap(e)}</option>`).join('')}</select></td>
        <td><div class="row-actions">
          ${c.telefono ? `<a class="icon-btn" title="Escribir por WhatsApp" target="_blank" rel="noopener" href="${waLink(c.telefono, mensajeCita(c))}">💬</a>` : ''}
          <button class="icon-btn" title="Editar" data-cita-edit="${c.id}">✎</button>
          <button class="icon-btn danger" title="Eliminar" data-cita-del="${c.id}">🗑</button>
        </div></td>
      </tr>`).join('')}</tbody></table></div>`;
}

function mensajeCita(c) {
  const ab = D.config.nombre;
  if (c.estado === 'cancelada') return `Hola ${c.nombre}, le escribe ${ab}. Le comunico que su cita del ${fmtFecha(c.fecha)} fue cancelada. ¿Desea reprogramarla?`;
  if (c.estado === 'atendida') return `Hola ${c.nombre}, le escribe ${ab}. Gracias por su visita. Quedo atento a cualquier consulta.`;
  return `Hola ${c.nombre}, le escribe ${ab}. Le confirmo su cita para el ${fmtFecha(c.fecha)} a las ${fmtHora(c.hora)} (${c.modalidad || 'Presencial'}).${c.modalidad === 'Virtual' ? ' Le enviaré el enlace de la videollamada antes de la reunión.' : ` Dirección: ${D.config.direccion}.`}`;
}

function abrirFormCita(id) {
  const item = id ? D.citas.find(c => c.id === id) : { fecha: hoyISO(), hora: '10:00', modalidad: 'Presencial', estado: 'confirmada' };
  abrirModal(id ? 'Editar cita' : 'Registrar cita', `
    <form id="citaForm"><div class="form-grid">${CITA_FIELDS.map(f => campo(f, item[f.k])).join('')}</div>
    <div class="modal-foot"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary">Guardar cita</button></div></form>`);
  $('#citaForm').onsubmit = e => {
    e.preventDefault();
    const v = leerCampos(e.target, CITA_FIELDS);
    const choque = D.citas.find(c => c.id !== id && c.fecha === v.fecha && c.hora === v.hora && c.estado !== 'cancelada');
    if (choque && v.estado !== 'cancelada') { toast(`Ese horario ya está ocupado por ${choque.nombre}.`, true); return; }
    if (id) Object.assign(item, v);
    else D.citas.push({ id: uid(), ...v, creado: new Date().toISOString() });
    if (persist(id ? 'Cita actualizada' : 'Cita registrada')) { cerrarModal(); renderVista(); }
  };
}

/* =========================================================
   VISTA: MENSAJES
   ========================================================= */
function vMensajes() {
  const noLeidos = D.mensajes.filter(m => !m.leido).length;
  setHeader('Mensajes', 'Consultas recibidas desde el formulario de contacto.', noLeidos ? `<button class="btn btn-outline" data-msg-allread>✓ Marcar todo como leído</button>` : '');
  const cnt = { todos: D.mensajes.length, noleidos: noLeidos, leidos: D.mensajes.length - noLeidos };
  content.innerHTML = `
    <div class="filters">
      <div class="seg">${[['todos', 'Todos'], ['noleidos', 'Sin leer'], ['leidos', 'Leídos']].map(([k, l]) => `<button class="${k === msgFiltro ? 'active' : ''}" data-msg-filtro="${k}">${l}<span class="n">${cnt[k]}</span></button>`).join('')}</div>
      <input type="search" id="msgBuscar" placeholder="🔍 Buscar…" value="${esc(msgQ)}">
    </div>
    <div id="msgLista"></div>`;
  renderMsgLista();
}

function renderMsgLista() {
  const q = msgQ.toLowerCase();
  const lista = [...D.mensajes].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
    .filter(m => msgFiltro === 'todos' || (msgFiltro === 'noleidos' ? !m.leido : m.leido))
    .filter(m => !q || [m.nombre, m.email, m.asunto, m.mensaje].join(' ').toLowerCase().includes(q));
  if (!lista.length) { $('#msgLista').innerHTML = `<div class="empty-state"><div class="big">✉️</div>No hay mensajes en esta vista.</div>`; return; }
  $('#msgLista').innerHTML = lista.map(m => {
    const fecha = new Date(m.fecha);
    const fechaTxt = isNaN(fecha) ? '' : fecha.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `<div class="msg ${m.leido ? '' : 'unread'} ${msgAbiertos.has(m.id) ? 'open' : ''}">
      <div class="msg-head" data-msg-toggle="${m.id}">
        <span class="msg-avatar">${esc(inicialesDe(m.nombre))}</span>
        <div class="grow"><strong>${esc(m.nombre)}</strong><small>${esc(m.asunto)} — ${esc(recortar(m.mensaje, 70))}</small></div>
        ${m.leido ? '' : '<span class="dot-new" title="Sin leer"></span>'}
        <span class="msg-date">${fechaTxt}</span>
      </div>
      <div class="msg-body">
        <div class="msg-meta"><span>✉️ ${esc(m.email)}</span>${m.telefono ? `<span>📞 ${esc(m.telefono)}</span>` : ''}<span>📌 ${esc(m.asunto)}</span></div>
        <p>${esc(m.mensaje)}</p>
        <div class="msg-actions">
          <a class="btn btn-sm btn-primary" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: ' + m.asunto)}&body=${encodeURIComponent(`Estimado(a) ${m.nombre}:\n\n`)}">Responder por correo</a>
          ${m.telefono ? `<a class="btn btn-sm btn-wa" target="_blank" rel="noopener" href="${waLink(m.telefono, `Hola ${m.nombre}, le escribe ${D.config.nombre} respecto a su consulta: "${m.asunto}".`)}">WhatsApp</a>` : ''}
          <button class="btn btn-sm btn-outline" data-msg-unread="${m.id}">Marcar como no leído</button>
          <button class="btn btn-sm btn-danger" data-msg-del="${m.id}">Eliminar</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* =========================================================
   VISTA: DATOS GENERALES / PERFIL
   ========================================================= */
function vConfig(tipo) {
  const grupos = tipo === 'general' ? GENERAL : PERFIL;
  const datos = tipo === 'general' ? D.config : D.perfil;
  setHeader(tipo === 'general' ? 'Datos generales' : 'Perfil y biografía',
    tipo === 'general' ? 'Identidad, portada, contacto, redes, colores y CV.' : 'Contenido de la sección "Sobre mí" y cifras de la portada.',
    `<a href="index.html" target="_blank" class="btn btn-outline">Ver sitio ↗</a>`);
  content.innerHTML = `<form id="cfgForm" novalidate>
    ${grupos.map(g => `<div class="card"><div class="card-head"><div><h3>${g.titulo}</h3><p class="sub">${g.sub || ''}</p></div></div>
      <div class="form-grid">${g.fields.map(f => campo(f, datos[f.k])).join('')}</div></div>`).join('')}
    <div class="save-bar"><span class="dirty-note">● Tienes cambios sin guardar</span><button type="button" class="btn btn-ghost" data-descartar>Descartar</button><button class="btn btn-primary" type="submit">Guardar cambios</button></div>
  </form>`;
  const form = $('#cfgForm');
  form.addEventListener('input', () => { dirty = true; form.classList.add('dirty'); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const v = leerCampos(form, grupos.flatMap(g => g.fields));
    if (tipo === 'general') {
      if (v.horaFin <= v.horaInicio) { toast('La hora de cierre debe ser mayor a la de inicio.', true); return; }
      if (v.whatsapp) v.whatsapp = v.whatsapp.replace(/\D/g, '');
      ['colorPrimario', 'colorAcento'].forEach(k => { if (!/^#[0-9a-f]{6}$/i.test(v[k])) v[k] = DEFAULT_DATA.config[k]; });
    }
    Object.assign(datos, v);
    if (persist()) { dirty = false; form.classList.remove('dirty'); aplicarTema(D.config); renderSidebar(); }
  });
}

/* =========================================================
   VISTA: LISTAS (CRUD genérico)
   ========================================================= */
function vCrud(key) {
  const cfg = CRUD[key];
  const items = cfg.sort ? [...D[key]].sort(cfg.sort) : D[key];
  setHeader(cfg.titulo, cfg.desc, `<button class="btn btn-gold" data-crud-new="${key}">+ Agregar ${cfg.singular}</button>`);
  content.innerHTML = items.length ? `
    <div class="list">${items.map((it, i) => `
      <div class="row">
        <div class="row-thumb">${cfg.img && it[cfg.img] ? `<img src="${esc(it[cfg.img])}" alt="">` : esc(cfg.icon(it))}</div>
        <div class="row-main"><strong>${esc(it[cfg.main])}</strong><small>${esc(cfg.sub(it))}</small></div>
        <div class="row-actions">
          ${cfg.noOrder ? '' : `
          <button class="icon-btn" title="Subir" data-move="${key}:${i}:-1" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button class="icon-btn" title="Bajar" data-move="${key}:${i}:1" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>`}
          <button class="icon-btn" title="Editar" data-edit="${key}:${it.id}">✎</button>
          <button class="icon-btn danger" title="Eliminar" data-del="${key}:${it.id}">🗑</button>
        </div>
      </div>`).join('')}
    </div>
    <p class="sub" style="margin-top:14px">${cfg.noOrder ? '' : 'Usa las flechas para cambiar el orden en que aparecen en la web. '}${items.length} ${items.length === 1 ? 'elemento' : 'elementos'}.</p>`
    : `<div class="empty-state"><div class="big">${esc(cfg.icon({ nombre: '?' }))}</div>Todavía no hay elementos.<br><br><button class="btn btn-gold" data-crud-new="${key}">+ Agregar ${cfg.singular}</button></div>`;
  if (pendingNew === key) { pendingNew = null; abrirFormCrud(key); }
}

function abrirFormCrud(key, id) {
  const cfg = CRUD[key];
  const item = id ? D[key].find(x => x.id === id) : (cfg.defaults ? cfg.defaults() : {});
  if (!item) return;
  abrirModal(`${id ? 'Editar' : 'Agregar'} ${cfg.singular}`, `
    <form id="crudForm"><div class="form-grid">${cfg.fields.map(f => campo(f, item[f.k])).join('')}</div>
    <div class="modal-foot"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary">${id ? 'Guardar cambios' : 'Agregar'}</button></div></form>`);
  $('#crudForm').onsubmit = e => {
    e.preventDefault();
    const v = leerCampos(e.target, cfg.fields);
    if (id) Object.assign(item, v);
    else D[key].push({ id: uid(), ...v });
    if (persist(id ? 'Cambios guardados' : `${cap(cfg.singular)} agregado(a)`)) { cerrarModal(); renderVista(); }
  };
}

/* =========================================================
   VISTA: AJUSTES
   ========================================================= */
function vAjustes() {
  setHeader('Ajustes y respaldo', 'Acceso al panel, copias de seguridad y limpieza de datos.');
  const kb = Store.sizeKB(D), pct = Math.min(100, Math.round(kb / 5000 * 100));
  content.innerHTML = `<div class="settings-grid">
    <div class="card">
      <h3>Acceso al panel</h3><p class="sub">Cambia el usuario o la contraseña.</p>
      <form id="accForm" style="margin-top:16px"><div class="form-grid">
        ${campo({ k: 'usuario', l: 'Usuario', req: true }, D.admin.usuario)}
        ${campo({ k: 'actual', l: 'Contraseña actual', t: 'password', req: true }, '')}
        ${campo({ k: 'nueva', l: 'Nueva contraseña', t: 'password', help: 'Mínimo 6 caracteres. Vacío = no cambiar.' }, '')}
        ${campo({ k: 'repetir', l: 'Repetir nueva', t: 'password' }, '')}
      </div><div class="modal-foot"><button class="btn btn-primary">Actualizar acceso</button></div></form>
      <div class="note warn">Proyecto de demostración: el acceso se guarda en el navegador. Para producción conviene un login con servidor (por ejemplo, Firebase Auth).</div>
    </div>
    <div class="card">
      <h3>Copia de seguridad</h3>
      <p class="sub">Descarga todo el contenido en un archivo .json y restáuralo cuando quieras (sirve para pasar los datos a otra computadora o navegador).</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
        <button class="btn btn-primary" data-export>⬇ Exportar datos</button>
        <label class="btn btn-outline file-btn">⬆ Importar datos<input type="file" id="importFile" accept="application/json,.json"></label>
      </div>
      <div class="storage" style="margin-top:24px"><h3>Espacio usado</h3>
        <div class="bar ${pct > 80 ? 'alto' : ''}"><span style="width:${pct}%"></span></div>
        <small class="sub">${kb} KB de ~5.000 KB (${pct}%). Las imágenes se comprimen automáticamente al subirlas.</small>
      </div>
      <div class="note">Los cambios se guardan en este navegador. Si abres el sitio en otro dispositivo, usa Exportar / Importar.</div>
    </div>
    <div class="card danger-zone">
      <h3>Limpiar datos de prueba</h3><p class="sub">Elimina todas las citas y mensajes. Útil antes de entregar el sitio.</p>
      <div style="margin-top:16px"><button class="btn btn-danger" data-limpiar>Borrar citas y mensajes</button></div>
    </div>
    <div class="card danger-zone">
      <h3>Restablecer demostración</h3><p class="sub">Devuelve todo el contenido (y el acceso admin/admin123) al ejemplo original.</p>
      <div style="margin-top:16px"><button class="btn btn-danger" data-reset>Restablecer todo</button></div>
    </div>
  </div>`;

  $('#accForm').onsubmit = e => {
    e.preventDefault();
    const f = e.target.elements;
    if (f.actual.value !== D.admin.clave) { toast('La contraseña actual no es correcta.', true); return; }
    if (f.nueva.value) {
      if (f.nueva.value.length < 6) { toast('La nueva contraseña debe tener al menos 6 caracteres.', true); return; }
      if (f.nueva.value !== f.repetir.value) { toast('Las contraseñas nuevas no coinciden.', true); return; }
      D.admin.clave = f.nueva.value;
    }
    D.admin.usuario = f.usuario.value.trim();
    if (persist('Acceso actualizado')) e.target.reset(), (f.usuario.value = D.admin.usuario);
  };
}

function exportar() {
  const blob = new Blob([JSON.stringify(D, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `respaldo-sitio-${hoyISO()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Respaldo descargado');
}

async function importar(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object' || !data.config || !Array.isArray(data.areas)) throw new Error();
    if (!await confirmar('Importar respaldo', 'Se reemplazará todo el contenido actual por el del archivo. ¿Continuar?', 'Importar')) return;
    const anterior = D;
    D = { ...Store.load(), ...data };
    if (!Store.save(D)) { D = anterior; toast('El archivo es demasiado grande para este navegador.', true); return; }
    D = Store.load();
    aplicarTema(D.config);
    toast('Datos importados correctamente');
    renderVista();
  } catch { toast('El archivo no es un respaldo válido.', true); }
}

/* =========================================================
   EVENTOS GLOBALES
   ========================================================= */
document.addEventListener('click', async e => {
  const t = e.target, b = s => t.closest(s);
  let el;

  if ((el = b('[data-cf]'))) { const r = confirmResolver; confirmResolver = null; cerrarModal(); r && r(el.dataset.cf === '1'); return; }
  if (b('[data-close]')) { cerrarModal(); return; }
  if (b('[data-nav]')) cerrarSidebar();

  if ((el = b('[data-nuevo]'))) { pendingNew = el.dataset.nuevo; location.hash = '#/' + el.dataset.nuevo; return; }
  if ((el = b('[data-crud-new]'))) { abrirFormCrud(el.dataset.crudNew); return; }
  if ((el = b('[data-edit]'))) { const [k, id] = el.dataset.edit.split(':'); abrirFormCrud(k, id); return; }
  if ((el = b('[data-del]'))) {
    const [k, id] = el.dataset.del.split(':');
    const it = D[k].find(x => x.id === id);
    if (it && await confirmar('Eliminar', `¿Seguro que deseas eliminar <strong>${esc(it[CRUD[k].main])}</strong>? Esta acción no se puede deshacer.`)) {
      D[k] = D[k].filter(x => x.id !== id); persist('Eliminado'); renderVista();
    }
    return;
  }
  if ((el = b('[data-move]'))) {
    const [k, i, d] = el.dataset.move.split(':');
    const a = D[k], i1 = +i, i2 = i1 + (+d);
    if (i2 < 0 || i2 >= a.length) return;
    [a[i1], a[i2]] = [a[i2], a[i1]];
    persist('Orden actualizado'); renderVista(); return;
  }
  if ((el = b('.img-field [data-clear]'))) { setArchivo(el.closest('.img-field'), ''); return; }

  // Citas
  if (b('[data-cita-new]')) { abrirFormCita(); return; }
  if ((el = b('[data-cita-edit]'))) { abrirFormCita(el.dataset.citaEdit); return; }
  if ((el = b('[data-cita-del]'))) {
    const c = D.citas.find(x => x.id === el.dataset.citaDel);
    if (c && await confirmar('Eliminar cita', `¿Eliminar la cita de <strong>${esc(c.nombre)}</strong> del ${fmtFecha(c.fecha)}?`)) {
      D.citas = D.citas.filter(x => x.id !== c.id); persist('Cita eliminada'); renderVista();
    }
    return;
  }
  if ((el = b('[data-cita-filtro]'))) { citaFiltro = el.dataset.citaFiltro; vCitas(); return; }

  // Mensajes
  if ((el = b('[data-msg-filtro]'))) { msgFiltro = el.dataset.msgFiltro; vMensajes(); return; }
  if ((el = b('[data-msg-toggle]'))) {
    const id = el.dataset.msgToggle, m = D.mensajes.find(x => x.id === id);
    msgAbiertos.has(id) ? msgAbiertos.delete(id) : msgAbiertos.add(id);
    if (m && !m.leido) { m.leido = true; persist(null); vMensajes(); }
    else el.parentElement.classList.toggle('open');
    return;
  }
  if ((el = b('[data-msg-unread]'))) { const m = D.mensajes.find(x => x.id === el.dataset.msgUnread); m.leido = false; msgAbiertos.delete(m.id); persist('Marcado como no leído'); vMensajes(); return; }
  if ((el = b('[data-msg-del]'))) {
    const m = D.mensajes.find(x => x.id === el.dataset.msgDel);
    if (m && await confirmar('Eliminar mensaje', `¿Eliminar el mensaje de <strong>${esc(m.nombre)}</strong>?`)) {
      D.mensajes = D.mensajes.filter(x => x.id !== m.id); persist('Mensaje eliminado'); vMensajes();
    }
    return;
  }
  if (b('[data-msg-allread]')) { D.mensajes.forEach(m => m.leido = true); persist('Todos los mensajes marcados como leídos'); vMensajes(); return; }
  if ((el = b('[data-open-msg]'))) { msgAbiertos.add(el.dataset.openMsg); return; }

  // Configuración
  if (b('[data-descartar]')) { dirty = false; renderVista(); toast('Cambios descartados'); return; }
  if (b('[data-export]')) { exportar(); return; }
  if (b('[data-limpiar]')) {
    if (await confirmar('Borrar citas y mensajes', 'Se eliminarán <strong>todas</strong> las citas y mensajes.', 'Borrar todo')) {
      D.citas = []; D.mensajes = []; persist('Citas y mensajes eliminados'); renderVista();
    }
    return;
  }
  if (b('[data-reset]')) {
    if (await confirmar('Restablecer demostración', 'Todo el contenido volverá al ejemplo original y el acceso será <code>admin</code> / <code>admin123</code>.', 'Restablecer')) {
      Store.reset(); D = Store.load(); Store.save(D); aplicarTema(D.config); toast('Demostración restablecida'); renderVista();
    }
  }
});

document.addEventListener('change', async e => {
  const t = e.target;
  if (t.matches('.img-field input[type=file]')) {
    const f = t.closest('.img-field'), file = t.files[0];
    if (!file) return;
    f.classList.add('uploading');
    try {
      if (f.dataset.kind === 'pdf') {
        if (file.type !== 'application/pdf') throw new Error('El archivo debe ser PDF.');
        if (file.size > 1.5 * 1024 * 1024) throw new Error('El PDF pesa más de 1,5 MB. Comprímelo o pega un enlace de Google Drive.');
        setArchivo(f, await leerArchivo(file));
      } else {
        setArchivo(f, await comprimirImagen(file, +f.dataset.max || 1000));
      }
    } catch (err) { toast(err.message, true); }
    f.classList.remove('uploading');
    t.value = '';
    return;
  }
  if (t.matches('[data-url]')) { setArchivo(t.closest('.img-field'), t.value.trim()); return; }
  if (t.matches('[data-estado]')) {
    const c = D.citas.find(x => x.id === t.dataset.estado);
    if (!c) return;
    c.estado = t.value;
    persist(`Cita marcada como ${t.value}`);
    vCitas();
    return;
  }
  if (t.id === 'importFile' && t.files[0]) { await importar(t.files[0]); t.value = ''; }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.matches('input[type=color][data-sync]')) t.parentElement.querySelector('input[type=text]').value = t.value;
  if (t.matches('.color-field input[type=text]') && /^#[0-9a-f]{6}$/i.test(t.value)) t.parentElement.querySelector('input[type=color]').value = t.value;
  if (t.id === 'citaBuscar') { citaQ = t.value; renderCitaTabla(); }
  if (t.id === 'msgBuscar') { msgQ = t.value; renderMsgLista(); }
});

document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modal').classList.contains('open')) cerrarModal(); });
$('#modal').addEventListener('mousedown', e => { if (e.target.id === 'modal') cerrarModal(); });
$('#modalClose').addEventListener('click', cerrarModal);

// Sidebar móvil
function cerrarSidebar() { $('#sidebar').classList.remove('open'); $('#sideOverlay').classList.remove('show'); }
$('#menuBtn').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#sideOverlay').classList.add('show'); });
$('#sideOverlay').addEventListener('click', cerrarSidebar);

// Cambio de sección (avisa si hay cambios sin guardar)
window.addEventListener('hashchange', () => {
  if (dirty && !confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) {
    history.replaceState(null, '', '#/' + vista);
    return;
  }
  route();
});
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

// Si llega una cita o mensaje desde el sitio (otra pestaña), se actualiza solo
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !$('#login').hidden) return;
  const antes = { c: D.citas.length, m: D.mensajes.length };
  D = Store.load();
  renderSidebar();
  if (D.citas.length > antes.c) toast('📅 ¡Nueva solicitud de cita recibida!');
  else if (D.mensajes.length > antes.m) toast('✉️ ¡Nuevo mensaje recibido!');
  if (!dirty && !$('#modal').classList.contains('open') && ['dashboard', 'citas', 'mensajes'].includes(vista)) renderVista();
});

/* =========================================================
   LOGIN
   ========================================================= */
function mostrarApp() {
  $('#login').hidden = true;
  $('#app').hidden = false;
  aplicarTema(D.config);
  route();
}

$('#loginForm').addEventListener('submit', e => {
  e.preventDefault();
  D = Store.load();
  const f = e.target.elements;
  if (f.usuario.value.trim() === D.admin.usuario && f.clave.value === D.admin.clave) {
    sessionStorage.setItem(SESSION_KEY, '1');
    $('#loginError').textContent = '';
    mostrarApp();
  } else {
    $('#loginError').textContent = 'Usuario o contraseña incorrectos.';
    f.clave.value = '';
    f.clave.focus();
  }
});

$('#logoutBtn').addEventListener('click', () => {
  if (dirty && !confirm('Tienes cambios sin guardar. ¿Cerrar sesión de todas formas?')) return;
  dirty = false;
  sessionStorage.removeItem(SESSION_KEY);
  location.hash = '';
  location.reload();
});

// Inicio
aplicarTema(D.config);
const esDemo = D.admin.usuario === DEFAULT_DATA.admin.usuario && D.admin.clave === DEFAULT_DATA.admin.clave;
$('.demo-hint').hidden = !esDemo;
if (sessionStorage.getItem(SESSION_KEY) === '1') mostrarApp();
