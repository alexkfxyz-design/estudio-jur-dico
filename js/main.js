/* =========================================================
   SITIO PÚBLICO – renderiza todo desde los datos del admin
   ========================================================= */
let D = Store.load();
let casoFiltro = 'Todos';
let blogFiltro = 'Todos';
let testiIndex = 0;
let testiTimer = null;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const ICONOS_RED = {
  facebook: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8V6c0-.9.6-1 1-1h3V1h-4c-3.6 0-4 2.7-4 4.4V8H7v4h3v11h4V12h3.4l.6-4z"/></svg>',
  instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/></svg>',
  tiktok: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.2v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.6a5.8 5.8 0 1 0 5 5.8V9a7.4 7.4 0 0 0 4.3 1.4V7.2a4.3 4.3 0 0 1-3.2-1.4z"/></svg>'
};

/* ---------------- Render general ---------------- */
function render() {
  D = Store.load();
  const c = D.config;
  aplicarTema(c);
  document.title = `${c.nombre} | ${c.titulo}`;
  const ini = c.iniciales || inicialesDe(c.nombre);
  $('#brandMark').textContent = ini;
  $('#brandName').textContent = c.nombre;
  $('#brandSub').textContent = c.titulo;

  renderHero();
  renderSobre();
  renderAreas();
  renderPortafolio();
  renderTestimonios();
  renderBlog();
  renderFaq();
  renderCitas();
  renderContacto();
  renderFooter();
  toggleSecciones();
  observarReveal();
}

function fotoHTML(c) {
  return c.foto
    ? `<img src="${esc(c.foto)}" alt="${esc(c.nombre)}">`
    : `<div class="photo-ph"><span>${esc(c.iniciales || inicialesDe(c.nombre))}</span></div>`;
}

function toggleSecciones() {
  const c = D.config;
  $$('[data-sec]').forEach(el => el.classList.toggle('hidden-sec', c[el.dataset.sec] === false));
}

/* ---------------- Hero ---------------- */
function renderHero() {
  const c = D.config, p = D.perfil;
  const hero = $('#inicio');
  hero.style.setProperty('--hero-img', c.fondoHero ? `url("${c.fondoHero}")` : 'none');
  $('#heroEyebrow').textContent = c.eyebrow;
  $('#heroTitle').textContent = c.heroTitulo;
  $('#heroText').textContent = c.slogan;
  $('#heroWa').href = waLink(c.whatsapp, c.mensajeWhatsapp);
  $('#heroPhoto').innerHTML = fotoHTML(c);
  $('#heroBadge').innerHTML = `<strong>${esc(c.nombre)}</strong><span>${esc(c.colegiatura)}</span>`;
  $('#heroBadge').style.display = c.colegiatura ? '' : 'none';

  const stats = [
    [p.anios, '+', 'Años de experiencia'],
    [p.casos, '+', 'Casos atendidos'],
    [p.clientes, '+', 'Clientes satisfechos'],
    [p.exito, '%', 'Resultados favorables']
  ];
  $('#stats').innerHTML = stats.map(([n, s, l]) =>
    `<div class="stat"><strong data-count="${Number(n) || 0}" data-suffix="${s}">${Number(n) || 0}${s}</strong><span>${l}</span></div>`
  ).join('');
  animarContadores();
}

function animarContadores() {
  const el = $('#stats');
  const run = () => $$('[data-count]', el).forEach(n => {
    const fin = +n.dataset.count, suf = n.dataset.suffix, t0 = performance.now(), dur = 1600;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      n.textContent = Math.round(fin * e).toLocaleString('es-PE') + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: .4 });
  io.observe(el);
}

/* ---------------- Sobre mí ---------------- */
function renderSobre() {
  const c = D.config, p = D.perfil;
  $('#sobreImg').innerHTML = fotoHTML(c);
  $('#sobreCol').textContent = c.colegiatura || 'Abogado colegiado';
  $('#sobreNombre').textContent = c.nombre;
  $('#sobreBio').innerHTML = nl2p(p.bio);
  $('#sobreMision').textContent = p.mision;
  $('#sobreMision').style.display = p.mision ? '' : 'none';
  $('#sobreEnfoque').innerHTML = String(p.enfoque || '').split(/[·,\n]/).map(s => s.trim()).filter(Boolean)
    .map(s => `<li>${esc(s)}</li>`).join('');
  $('#sobreIdiomas').textContent = p.idiomas;
  $('.idiomas').style.display = p.idiomas ? '' : 'none';
}

/* ---------------- Áreas ---------------- */
function renderAreas() {
  $('#areasGrid').innerHTML = D.areas.length ? D.areas.map(a => `
    <article class="area-card reveal">
      <div class="area-icon">${esc(a.icono || '⚖️')}</div>
      <h3>${esc(a.titulo)}</h3>
      <p>${esc(a.descripcion)}</p>
      <a href="#citas" class="link-arrow" data-area="${esc(a.titulo)}">Consultar este caso →</a>
    </article>`).join('') : '<p class="empty">Pronto publicaremos nuestras áreas de práctica.</p>';
}

function iconoArea(nombre) {
  const a = D.areas.find(x => x.titulo === nombre);
  return a ? a.icono : '⚖️';
}

/* ---------------- Portafolio ---------------- */
function renderPortafolio() {
  const c = D.config;
  const cv = $('#cvBtn');
  if (c.cv) { cv.href = c.cv; cv.setAttribute('download', `CV-${c.nombre.replace(/[^\wáéíóúñ]+/gi, '-')}.pdf`); cv.style.display = ''; }
  else cv.style.display = 'none';

  renderCasos();

  $('#timeline').innerHTML = D.experiencia.length ? D.experiencia.map(e => `
    <li>
      <span class="tl-periodo">${esc(e.periodo)}</span>
      <h3>${esc(e.cargo)}</h3>
      <div class="tl-lugar">${esc(e.lugar)}</div>
      ${e.descripcion ? `<p>${esc(e.descripcion)}</p>` : ''}
    </li>`).join('') : '<p class="empty">Sin información todavía.</p>';

  $('#formacionGrid').innerHTML = D.formacion.length ? D.formacion.map(f => `
    <div class="form-card">
      <div class="form-icon">🎓</div>
      <div>
        <h3>${esc(f.titulo)}</h3>
        <p>${esc(f.institucion)}</p>
        ${f.descripcion ? `<p>${esc(f.descripcion)}</p>` : ''}
        ${f.anio ? `<span class="anio">${esc(f.anio)}</span>` : ''}
      </div>
    </div>`).join('') : '<p class="empty">Sin información todavía.</p>';

  $('#certGrid').innerHTML = D.certificaciones.length ? D.certificaciones.map(z => `
    <div class="cert-card">
      <div class="cert-img" ${z.imagen ? `data-zoom="${z.id}"` : ''}>${z.imagen ? `<img src="${esc(z.imagen)}" alt="${esc(z.nombre)}" loading="lazy">` : '<span class="ph">🏅</span>'}</div>
      <div class="cert-body">
        <h3>${esc(z.nombre)}</h3>
        <p>${esc(z.entidad)}${z.anio ? ' · ' + esc(z.anio) : ''}</p>
      </div>
    </div>`).join('') : '<p class="empty">Sin certificaciones publicadas.</p>';
}

function renderCasos() {
  const areas = ['Todos', ...new Set(D.casos.map(c => c.area).filter(Boolean))];
  if (!areas.includes(casoFiltro)) casoFiltro = 'Todos';
  $('#casoFiltros').innerHTML = areas.length > 2 ? areas.map(a =>
    `<button class="chip ${a === casoFiltro ? 'active' : ''}" data-filtro-caso="${esc(a)}">${esc(a)}</button>`).join('') : '';
  const lista = D.casos.filter(c => casoFiltro === 'Todos' || c.area === casoFiltro);
  $('#casosGrid').innerHTML = lista.length ? lista.map(c => `
    <article class="caso-card" data-caso="${c.id}" tabindex="0">
      <div class="caso-img">${c.imagen ? `<img src="${esc(c.imagen)}" alt="" loading="lazy">` : `<span class="ph">${esc(iconoArea(c.area))}</span>`}</div>
      <div class="caso-body">
        <div class="caso-meta"><span class="tag">${esc(c.area || 'General')}</span><span>${esc(c.anio)}</span></div>
        <h3>${esc(c.titulo)}</h3>
        <p>${esc(c.resumen)}</p>
        <div class="caso-foot">
          ${c.resultado ? `<span class="badge-ok">✓ ${esc(c.resultado)}</span>` : '<span></span>'}
          <span class="link-arrow">Ver caso →</span>
        </div>
      </div>
    </article>`).join('') : '<p class="empty">Aún no hay casos publicados.</p>';
}

function abrirCaso(id) {
  const c = D.casos.find(x => x.id === id);
  if (!c) return;
  abrirModal(`
    <div class="caso-modal">
      ${c.imagen ? `<div class="caso-img-full"><img src="${esc(c.imagen)}" alt=""></div>` : ''}
      <div class="meta"><span class="tag">${esc(c.area)}</span><span>${esc(c.anio)}</span></div>
      <h2>${esc(c.titulo)}</h2>
      ${c.resultado ? `<div class="resultado">✓ Resultado: ${esc(c.resultado)}</div>` : ''}
      <div class="desc">${nl2p(c.descripcion || c.resumen)}</div>
      <div class="article-cta">
        <span>¿Tienes un caso similar?</span>
        <a href="#citas" class="btn btn-gold btn-sm" data-close data-area="${esc(c.area)}">Agendar consulta</a>
      </div>
    </div>`);
}

/* ---------------- Testimonios ---------------- */
function renderTestimonios() {
  const t = D.testimonios;
  clearInterval(testiTimer);
  if (!t.length) { $('#testiTrack').innerHTML = '<p class="empty">Aún no hay testimonios.</p>'; $('#testiDots').innerHTML = ''; return; }
  $('#testiTrack').innerHTML = t.map(x => {
    const n = Math.max(1, Math.min(5, +x.estrellas || 5));
    return `<figure class="testi">
      <div class="stars">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</div>
      <blockquote>“${esc(x.texto)}”</blockquote>
      <figcaption>
        ${x.foto ? `<img src="${esc(x.foto)}" alt="">` : `<span class="avatar">${esc(inicialesDe(x.nombre))}</span>`}
        <div><strong>${esc(x.nombre)}</strong><small>${esc(x.cargo)}</small></div>
      </figcaption>
    </figure>`;
  }).join('');
  $('#testiDots').innerHTML = t.length > 1 ? t.map((_, i) => `<button aria-label="Testimonio ${i + 1}" data-dot="${i}"></button>`).join('') : '';
  $$('.testi-nav').forEach(b => b.style.visibility = t.length > 1 ? '' : 'hidden');
  irTesti(Math.min(testiIndex, t.length - 1));
  if (t.length > 1) testiTimer = setInterval(() => irTesti(testiIndex + 1), 7000);
}

function irTesti(i) {
  const n = D.testimonios.length;
  if (!n) return;
  testiIndex = (i + n) % n;
  $('#testiTrack').style.transform = `translateX(-${testiIndex * 100}%)`;
  $$('#testiDots button').forEach((b, k) => b.classList.toggle('active', k === testiIndex));
}

/* ---------------- Blog ---------------- */
function renderBlog() {
  const posts = [...D.blog].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  const cats = ['Todos', ...new Set(posts.map(p => p.categoria).filter(Boolean))];
  if (!cats.includes(blogFiltro)) blogFiltro = 'Todos';
  $('#blogFiltros').innerHTML = cats.length > 2 ? cats.map(c =>
    `<button class="chip ${c === blogFiltro ? 'active' : ''}" data-filtro-blog="${esc(c)}">${esc(c)}</button>`).join('') : '';
  const lista = posts.filter(p => blogFiltro === 'Todos' || p.categoria === blogFiltro);
  $('#blogGrid').innerHTML = lista.length ? lista.map(p => `
    <article class="post" data-post="${p.id}" tabindex="0">
      <div class="post-img">${p.imagen ? `<img src="${esc(p.imagen)}" alt="" loading="lazy">` : '<span class="ph">§</span>'}</div>
      <div class="post-body">
        <div class="post-meta">${p.categoria ? `<span class="tag">${esc(p.categoria)}</span>` : ''}<span>${fmtFecha(p.fecha)}</span></div>
        <h3>${esc(p.titulo)}</h3>
        <p>${esc(recortar(p.resumen, 150))}</p>
        <span class="link-arrow">Leer artículo →</span>
      </div>
    </article>`).join('') : '<p class="empty">Aún no hay artículos publicados.</p>';
}

function abrirPost(id) {
  const p = D.blog.find(x => x.id === id);
  if (!p) return;
  abrirModal(`
    <article class="article-modal">
      ${p.imagen ? `<div class="art-img"><img src="${esc(p.imagen)}" alt=""></div>` : ''}
      <div class="post-meta">${p.categoria ? `<span class="tag">${esc(p.categoria)}</span>` : ''}<span>${fmtFecha(p.fecha)}</span></div>
      <h2>${esc(p.titulo)}</h2>
      <div class="art-content">${nl2p(p.contenido || p.resumen)}</div>
      <div class="article-cta">
        <span>¿Necesitas asesoría sobre este tema?</span>
        <a href="#citas" class="btn btn-gold btn-sm" data-close>Agendar consulta</a>
      </div>
    </article>`);
}

/* ---------------- FAQ ---------------- */
function renderFaq() {
  $('#faqList').innerHTML = D.faq.length ? D.faq.map((q, i) => `
    <details class="faq-item" ${i === 0 ? 'open' : ''}>
      <summary>${esc(q.pregunta)}</summary>
      <p>${esc(q.respuesta)}</p>
    </details>`).join('') : '<p class="empty">Sin preguntas publicadas.</p>';
}

/* ---------------- Citas ---------------- */
function renderCitas() {
  const sel = $('#citaArea');
  const actual = sel.value;
  sel.innerHTML = '<option value="">Selecciona un área</option>' +
    D.areas.map(a => `<option>${esc(a.titulo)}</option>`).join('') + '<option>Otro / No estoy seguro</option>';
  if (actual) sel.value = actual;
  $('#citaFecha').min = hoyISO();
  $('#citaHorario').textContent = '🕘 ' + (D.config.horario || '');
  actualizarHoras();
}

function horariosDelDia(fechaISO) {
  const c = D.config;
  const dow = new Date(fechaISO + 'T00:00').getDay();
  if (dow === 0) return { error: 'No atendemos domingos' };
  if (dow === 6 && c.atiendeSabados === false) return { error: 'No atendemos sábados' };
  const ini = +c.horaInicio || 9;
  const fin = dow === 6 ? (+c.horaFinSabado || 13) : (+c.horaFin || 18);
  const hs = [];
  for (let h = ini; h < fin; h++) hs.push(String(h).padStart(2, '0') + ':00');
  return { horas: hs };
}

function actualizarHoras() {
  const f = $('#citaFecha').value, sel = $('#citaHora');
  const previo = sel.value;
  if (!f) { sel.innerHTML = '<option value="">Primero elige una fecha</option>'; sel.disabled = true; return; }
  if (f < hoyISO()) { sel.innerHTML = '<option value="">Fecha no válida</option>'; sel.disabled = true; return; }
  const r = horariosDelDia(f);
  if (r.error) { sel.innerHTML = `<option value="">${r.error}</option>`; sel.disabled = true; return; }
  let hs = r.horas;
  if (f === hoyISO()) { const h = new Date().getHours(); hs = hs.filter(x => +x.slice(0, 2) > h); }
  const ocupadas = D.citas.filter(c => c.fecha === f && c.estado !== 'cancelada').map(c => c.hora);
  const libres = hs.filter(h => !ocupadas.includes(h));
  sel.disabled = !libres.length;
  sel.innerHTML = libres.length
    ? '<option value="">Elige un horario</option>' + libres.map(h => `<option value="${h}">${fmtHora(h)}</option>`).join('')
    : '<option value="">Sin horarios disponibles</option>';
  if (libres.includes(previo)) sel.value = previo;
}

function enviarCita(e) {
  e.preventDefault();
  const form = e.target;
  const fd = Object.fromEntries(new FormData(form));
  D = Store.load();
  if (!fd.hora) { toast('Elige un horario disponible.', true); return; }
  if (D.citas.some(c => c.fecha === fd.fecha && c.hora === fd.hora && c.estado !== 'cancelada')) {
    toast('Ese horario acaba de ocuparse. Elige otro, por favor.', true); actualizarHoras(); return;
  }
  const cita = { id: uid(), ...fd, estado: 'pendiente', creado: new Date().toISOString() };
  D.citas.push(cita);
  if (!Store.save(D)) { toast('No se pudo registrar la cita. Inténtalo de nuevo.', true); return; }
  form.reset();
  actualizarHoras();
  const msg = `Hola, acabo de solicitar una cita desde la web:\n• Nombre: ${cita.nombre}\n• Área: ${cita.area}\n• Fecha: ${fmtFecha(cita.fecha)} a las ${fmtHora(cita.hora)}\n• Modalidad: ${cita.modalidad}`;
  abrirModal(`
    <div class="confirm">
      <div class="confirm-icon">✓</div>
      <h3>¡Solicitud enviada!</h3>
      <p>Tu cita para el <strong>${fmtFecha(cita.fecha)}</strong> a las <strong>${fmtHora(cita.hora)}</strong> (${esc(cita.modalidad)}) quedó registrada.<br>Te contactaremos pronto para confirmarla.</p>
      <a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(D.config.whatsapp, msg)}">Avisar también por WhatsApp</a>
    </div>`);
}

/* ---------------- Contacto ---------------- */
function renderContacto() {
  const c = D.config;
  const items = [
    c.telefono && { i: '📞', l: 'Teléfono', v: c.telefono, href: `tel:${String(c.telefono).replace(/\s/g, '')}` },
    c.whatsapp && { i: '💬', l: 'WhatsApp', v: 'Escríbeme ahora', href: waLink(c.whatsapp, c.mensajeWhatsapp), blank: true },
    c.email && { i: '✉️', l: 'Correo', v: c.email, href: `mailto:${c.email}` },
    c.direccion && { i: '📍', l: 'Oficina', v: c.direccion, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.direccion)}`, blank: true },
    c.horario && { i: '🕘', l: 'Horario de atención', v: c.horario }
  ].filter(Boolean);
  $('#contactoInfo').innerHTML = items.map(x => {
    const tag = x.href ? 'a' : 'div';
    const attrs = x.href ? ` href="${esc(x.href)}"${x.blank ? ' target="_blank" rel="noopener"' : ''}` : '';
    return `<${tag} class="info-item"${attrs}><span class="info-icon">${x.i}</span><div><small>${x.l}</small><strong>${esc(x.v)}</strong></div></${tag}>`;
  }).join('');
  const mapa = $('#mapa');
  const q = c.direccion ? encodeURIComponent(c.direccion) : '';
  if (q && mapa.dataset.q !== q) {
    mapa.dataset.q = q;
    mapa.innerHTML = `<iframe loading="lazy" title="Ubicación de la oficina" src="https://maps.google.com/maps?q=${q}&z=16&output=embed"></iframe>`;
  }
  mapa.style.display = q ? '' : 'none';
  $('#waFloat').href = waLink(c.whatsapp, c.mensajeWhatsapp);
  $('#waFloat').style.display = c.whatsapp ? '' : 'none';
}

function enviarMensaje(e) {
  e.preventDefault();
  const form = e.target;
  const fd = Object.fromEntries(new FormData(form));
  D = Store.load();
  D.mensajes.unshift({ id: uid(), nombre: fd.nombre, email: fd.email, telefono: fd.telefono, asunto: fd.asunto, mensaje: fd.mensaje, fecha: new Date().toISOString(), leido: false });
  if (!Store.save(D)) { toast('No se pudo enviar. Inténtalo de nuevo.', true); return; }
  form.reset();
  toast('¡Mensaje enviado! Te responderemos a la brevedad.');
}

/* ---------------- Footer ---------------- */
function renderFooter() {
  const c = D.config;
  $('#footMark').textContent = c.iniciales || inicialesDe(c.nombre);
  $('#footName').textContent = c.nombre;
  $('#footSub').textContent = c.titulo;
  $('#footSlogan').textContent = c.slogan;
  $('#footCopy').textContent = c.nombre;
  $('#year').textContent = new Date().getFullYear();
  $('#social').innerHTML = ['facebook', 'instagram', 'linkedin', 'tiktok'].filter(k => c[k])
    .map(k => `<a href="${esc(c[k])}" target="_blank" rel="noopener" aria-label="${k}">${ICONOS_RED[k]}</a>`).join('');
  $('#footAreas').innerHTML = D.areas.slice(0, 6).map(a => `<li><a href="#areas">${esc(a.titulo)}</a></li>`).join('');
  $('#footContacto').innerHTML = [
    c.telefono && `<li><a href="tel:${esc(String(c.telefono).replace(/\s/g, ''))}">${esc(c.telefono)}</a></li>`,
    c.email && `<li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`,
    c.direccion && `<li>${esc(c.direccion)}</li>`
  ].filter(Boolean).join('');
}

/* ---------------- Modal / Toast ---------------- */
function abrirModal(html) {
  $('#modalBody').innerHTML = html;
  $('#modal').classList.add('open');
  $('#modal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('#modal .modal-box').scrollTop = 0;
}
function cerrarModal() {
  $('#modal').classList.remove('open');
  $('#modal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
let toastT;
function toast(msg, error) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('error', !!error);
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 3800);
}

/* ---------------- Reveal on scroll ---------------- */
let revealIO;
function observarReveal() {
  if (!('IntersectionObserver' in window)) { $$('.reveal').forEach(el => el.classList.add('visible')); return; }
  if (!revealIO) revealIO = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('visible'); revealIO.unobserve(en.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal:not(.visible)').forEach(el => revealIO.observe(el));
}

/* ---------------- Eventos ---------------- */
function preseleccionarArea(area) {
  const sel = $('#citaArea');
  if ([...sel.options].some(o => o.value === area)) sel.value = area;
}

document.addEventListener('click', e => {
  const t = e.target;
  const area = t.closest('[data-area]');
  if (area) preseleccionarArea(area.dataset.area);
  if (t.closest('[data-close]')) cerrarModal();

  const fc = t.closest('[data-filtro-caso]');
  if (fc) { casoFiltro = fc.dataset.filtroCaso; renderCasos(); return; }
  const fb = t.closest('[data-filtro-blog]');
  if (fb) { blogFiltro = fb.dataset.filtroBlog; renderBlog(); return; }

  const caso = t.closest('[data-caso]');
  if (caso) { abrirCaso(caso.dataset.caso); return; }
  const post = t.closest('[data-post]');
  if (post) { abrirPost(post.dataset.post); return; }
  const zoom = t.closest('[data-zoom]');
  if (zoom) {
    const z = D.certificaciones.find(x => x.id === zoom.dataset.zoom);
    if (z) abrirModal(`<div class="modal-img"><img src="${esc(z.imagen)}" alt=""></div><h3 style="margin-top:20px">${esc(z.nombre)}</h3><p style="color:var(--muted)">${esc(z.entidad)} · ${esc(z.anio)}</p>`);
    return;
  }
  const dot = t.closest('[data-dot]');
  if (dot) irTesti(+dot.dataset.dot);

  const tab = t.closest('.tab');
  if (tab) {
    $$('.tab').forEach(b => b.classList.toggle('active', b === tab));
    $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab.dataset.tab));
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
  if (e.key === 'Enter' && document.activeElement?.matches('[data-caso],[data-post]')) document.activeElement.click();
});

$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') cerrarModal(); });
$('#modalClose').addEventListener('click', cerrarModal);
$('#testiPrev').addEventListener('click', () => irTesti(testiIndex - 1));
$('#testiNext').addEventListener('click', () => irTesti(testiIndex + 1));
$('#citaFecha').addEventListener('change', actualizarHoras);
$('#citaForm').addEventListener('submit', enviarCita);
$('#contactoForm').addEventListener('submit', enviarMensaje);

// Menú móvil
const nav = $('#nav'), links = $('#navLinks'), toggle = $('#navToggle');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.classList.toggle('open', open);
  nav.classList.toggle('menu-open', open);
  onScroll();
});
links.addEventListener('click', e => { if (e.target.closest('a')) { links.classList.remove('open'); toggle.classList.remove('open'); nav.classList.remove('menu-open'); onScroll(); } });

// Scroll: navbar, botón subir y sección activa
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40 || nav.classList.contains('menu-open'));
  $('#toTop').classList.toggle('show', y > 700);
  let actual = '';
  $$('section[id]').forEach(s => { if (s.offsetParent !== null && s.offsetTop - 120 <= y) actual = s.id; });
  $$('.nav-links a:not(.btn)').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + actual));
}
window.addEventListener('scroll', onScroll, { passive: true });
$('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Si el admin guarda cambios en otra pestaña, el sitio se actualiza solo
window.addEventListener('storage', e => { if (e.key === STORAGE_KEY) render(); });

render();
onScroll();
