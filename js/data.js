/* =========================================================
   DATOS Y UTILIDADES COMPARTIDAS (sitio público + admin)
   Todo se guarda en localStorage del navegador.
   ========================================================= */
const STORAGE_KEY = 'estudio_juridico_data_v1';
const SESSION_KEY = 'estudio_juridico_admin';

const DEFAULT_DATA = {
  admin: { usuario: 'admin', clave: 'admin123' },

  config: {
    nombre: 'Dr. Carlos Mendoza Ríos',
    iniciales: 'CM',
    titulo: 'Abogado · Estudio Jurídico',
    colegiatura: 'CAA N.° 5487',
    foto: '',
    cv: '',
    eyebrow: 'Estudio Jurídico Mendoza & Asociados',
    heroTitulo: 'Defensa legal sólida, cercana y con resultados',
    slogan: 'Más de 15 años protegiendo los derechos de personas, familias y empresas en Arequipa y todo el Perú.',
    fondoHero: '',
    telefono: '+51 954 123 456',
    whatsapp: '51954123456',
    mensajeWhatsapp: 'Hola doctor, quisiera hacer una consulta legal.',
    email: 'contacto@mendozaabogados.pe',
    direccion: 'Calle Mercaderes 212, Of. 305, Cercado de Arequipa',
    horario: 'Lun a Vie: 9:00 a. m. – 6:00 p. m. · Sáb: 9:00 a. m. – 1:00 p. m.',
    horaInicio: 9,
    horaFin: 18,
    atiendeSabados: true,
    horaFinSabado: 13,
    facebook: 'https://facebook.com',
    instagram: '',
    linkedin: 'https://linkedin.com',
    tiktok: '',
    colorPrimario: '#0f1d32',
    colorAcento: '#c5a253',
    secTestimonios: true,
    secBlog: true,
    secFaq: true,
    secCitas: true
  },

  perfil: {
    bio: 'Soy abogado egresado de la Universidad Nacional de San Agustín de Arequipa, con más de 15 años de ejercicio profesional en derecho civil, de familia, laboral y penal. Inicié mi carrera en el Poder Judicial y desde 2012 dirijo mi propio estudio, donde acompaño a personas, familias y empresas en los momentos en que más necesitan una defensa seria y honesta.\n\nMi forma de trabajar es simple: escucho, explico cada paso en lenguaje claro y no prometo lo que no puedo cumplir. Cada caso recibe una estrategia propia y seguimiento directo, sin intermediarios.',
    mision: 'Que cada cliente entienda su situación legal y tenga a su lado a alguien que defienda sus derechos como si fueran propios.',
    enfoque: 'Atención personalizada · Honorarios transparentes · Comunicación constante · Ética profesional',
    idiomas: 'Español, Inglés',
    anios: 15,
    casos: 850,
    clientes: 1200,
    exito: 94
  },

  areas: [
    { id: 'a1', icono: '📜', titulo: 'Derecho Civil', descripcion: 'Contratos, obligaciones, indemnizaciones por daños, sucesiones, testamentos y procesos de división y partición.' },
    { id: 'a2', icono: '👨‍👩‍👧', titulo: 'Derecho de Familia', descripcion: 'Divorcios, pensión de alimentos, tenencia y régimen de visitas, filiación y violencia familiar.' },
    { id: 'a3', icono: '💼', titulo: 'Derecho Laboral', descripcion: 'Despidos arbitrarios, beneficios sociales, reposición, hostigamiento laboral y asesoría a empleadores.' },
    { id: 'a4', icono: '⚖️', titulo: 'Derecho Penal', descripcion: 'Defensa técnica en investigaciones fiscales y procesos penales, querellas y delitos patrimoniales.' },
    { id: 'a5', icono: '🏢', titulo: 'Derecho Empresarial', descripcion: 'Constitución de empresas, contratos comerciales, cobranzas, compliance y asesoría corporativa permanente.' },
    { id: 'a6', icono: '🏠', titulo: 'Derecho Inmobiliario', descripcion: 'Compraventas, saneamiento de títulos, prescripción adquisitiva, desalojos e inscripciones en SUNARP.' }
  ],

  casos: [
    { id: 'c1', titulo: 'Recuperación de inmueble ocupado por precario', area: 'Derecho Inmobiliario', anio: '2025', resultado: 'Sentencia favorable', resumen: 'Familia recuperó la posesión de su vivienda tras 4 años de ocupación ilegítima.', descripcion: 'Los propietarios de una vivienda en Cayma no podían ingresar a su inmueble, ocupado sin título por un tercero desde hacía cuatro años.\n\nSe planteó una demanda de desalojo por ocupación precaria, acreditando el derecho de propiedad inscrito y la ausencia de título del ocupante. El juzgado declaró fundada la demanda y se ejecutó el lanzamiento en menos de 10 meses desde la presentación.\n\nLos datos de las partes se mantienen en reserva por secreto profesional.', imagen: '' },
    { id: 'c2', titulo: 'Pensión de alimentos y régimen de visitas', area: 'Derecho de Familia', anio: '2025', resultado: 'Acuerdo conciliatorio', resumen: 'Acuerdo integral que priorizó el bienestar de dos menores de edad.', descripcion: 'Madre de dos menores requería fijar una pensión de alimentos acorde a los ingresos reales del padre y un régimen de visitas ordenado.\n\nMediante conciliación extrajudicial se alcanzó un acuerdo con mérito ejecutivo que fijó la pensión, el régimen de visitas y la distribución de gastos escolares, evitando un proceso judicial de larga duración.', imagen: '' },
    { id: 'c3', titulo: 'Despido arbitrario tras 12 años de servicio', area: 'Derecho Laboral', anio: '2024', resultado: 'Indemnización obtenida', resumen: 'Trabajador obtuvo indemnización y el pago íntegro de beneficios sociales adeudados.', descripcion: 'Un trabajador fue despedido verbalmente luego de 12 años en la empresa, sin carta de preaviso ni causa justa.\n\nSe acreditó el despido mediante constatación policial e inspección de SUNAFIL, y se demandó la indemnización por despido arbitrario junto con CTS y gratificaciones impagas. El proceso concluyó con sentencia favorable.', imagen: '' },
    { id: 'c4', titulo: 'Reorganización societaria de empresa agroexportadora', area: 'Derecho Empresarial', anio: '2024', resultado: 'Proceso concluido', resumen: 'Reestructuración del capital y del gobierno corporativo de una empresa familiar.', descripcion: 'Empresa familiar con conflictos entre accionistas requería ordenar su estructura para ingresar a nuevos mercados.\n\nSe elaboró un pacto de accionistas, se modificó el estatuto y se implementó un protocolo familiar. La empresa logró continuar operando sin litigios entre socios.', imagen: '' },
    { id: 'c5', titulo: 'Defensa en proceso por apropiación ilícita', area: 'Derecho Penal', anio: '2023', resultado: 'Absolución', resumen: 'Cliente absuelto tras demostrarse la inexistencia del delito imputado.', descripcion: 'Comerciante acusado de apropiarse de mercadería entregada en consignación.\n\nLa defensa demostró, con documentos contables y testimoniales, que se trataba de una controversia contractual y no de un delito. El juzgado emitió sentencia absolutoria.', imagen: '' }
  ],

  experiencia: [
    { id: 'e1', cargo: 'Socio fundador', lugar: 'Estudio Jurídico Mendoza & Asociados', periodo: '2012 – Actualidad', descripcion: 'Dirección del estudio y litigio en materias civil, familia, laboral y penal.' },
    { id: 'e2', cargo: 'Docente de Derecho Procesal Civil', lugar: 'Facultad de Derecho – Universidad privada de Arequipa', periodo: '2018 – Actualidad', descripcion: 'Dictado de cursos de pregrado y talleres de litigación.' },
    { id: 'e3', cargo: 'Asesor legal externo', lugar: 'Asociación de Exportadores del Sur', periodo: '2015 – 2021', descripcion: 'Asesoría contractual y corporativa a empresas asociadas.' },
    { id: 'e4', cargo: 'Secretario judicial', lugar: 'Corte Superior de Justicia de Arequipa', periodo: '2008 – 2012', descripcion: 'Tramitación de expedientes en juzgados civiles y de familia.' }
  ],

  formacion: [
    { id: 'f1', titulo: 'Maestría en Derecho Civil y Comercial', institucion: 'Universidad Católica de Santa María', anio: '2014', descripcion: '' },
    { id: 'f2', titulo: 'Diplomado en Litigación Oral', institucion: 'Escuela de posgrado en Derecho', anio: '2016', descripcion: '' },
    { id: 'f3', titulo: 'Título profesional de Abogado', institucion: 'Universidad Nacional de San Agustín de Arequipa', anio: '2008', descripcion: '' }
  ],

  certificaciones: [
    { id: 'z1', nombre: 'Conciliador Extrajudicial acreditado', entidad: 'Ministerio de Justicia y Derechos Humanos', anio: '2010', imagen: '' },
    { id: 'z2', nombre: 'Especialización en Derecho Laboral y Seguridad Social', entidad: 'Centro de Estudios Jurídicos', anio: '2019', imagen: '' },
    { id: 'z3', nombre: 'Reconocimiento a la trayectoria profesional', entidad: 'Colegio de Abogados de Arequipa', anio: '2023', imagen: '' }
  ],

  blog: [
    { id: 'b1', titulo: '¿Qué hacer si te despiden sin causa justa?', categoria: 'Laboral', fecha: '2026-09-18', resumen: 'Los primeros días después de un despido son clave. Te explicamos qué pasos dar para no perder tus derechos.', contenido: 'Si fuiste despedido sin una causa justa, lo primero es dejar constancia del hecho: puedes acudir a la comisaría o solicitar una inspección de SUNAFIL para que el despido quede registrado.\n\nEs importante actuar rápido. El plazo para impugnar un despido es de 30 días hábiles; pasado ese tiempo, el derecho a reclamar caduca.\n\nDependiendo del caso, puedes solicitar la reposición en tu puesto o una indemnización por despido arbitrario, además del pago de tus beneficios sociales pendientes (CTS, vacaciones y gratificaciones truncas).\n\nCada situación es distinta. Si tienes dudas, agenda una consulta y revisaremos tus documentos.', imagen: '' },
    { id: 'b2', titulo: 'Pensión de alimentos: 5 preguntas frecuentes', categoria: 'Familia', fecha: '2026-08-30', resumen: '¿Cuánto corresponde? ¿Se puede pedir aumento? Resolvemos las dudas más comunes.', contenido: 'La pensión de alimentos se fija según las necesidades de quien la recibe y las posibilidades económicas de quien debe pagarla.\n\nPuede solicitarse mediante conciliación extrajudicial o mediante una demanda ante el juzgado de paz letrado.\n\nSi las circunstancias cambian (por ejemplo, aumentan los gastos del menor o los ingresos del obligado), es posible pedir un aumento o, en su caso, una reducción.\n\nEl incumplimiento reiterado puede tener consecuencias como la inscripción en el registro de deudores alimentarios.', imagen: '' },
    { id: 'b3', titulo: 'Antes de comprar un inmueble, revisa estos documentos', categoria: 'Inmobiliario', fecha: '2026-07-12', resumen: 'Una revisión a tiempo puede evitarte años de problemas legales.', contenido: 'Antes de firmar, solicita la copia literal de la partida registral en SUNARP para confirmar quién es el propietario y si existen cargas o gravámenes.\n\nVerifica también que el inmueble no tenga deudas de impuesto predial ni arbitrios en la municipalidad.\n\nLa compraventa debe formalizarse por escritura pública ante notario e inscribirse en registros públicos para que tu derecho sea oponible a terceros.\n\nUna asesoría legal previa cuesta mucho menos que un proceso judicial posterior.', imagen: '' }
  ],

  testimonios: [
    { id: 't1', nombre: 'María Q.', cargo: 'Caso de familia', texto: 'El doctor me explicó todo con paciencia y siempre respondió mis mensajes. Logramos un acuerdo justo para mis hijos sin pasar años en juicio.', estrellas: '5', foto: '' },
    { id: 't2', nombre: 'Jorge P.', cargo: 'Gerente – empresa agroexportadora', texto: 'Nos ayudó a ordenar la empresa familiar cuando parecía imposible. Profesional, claro y muy estratégico.', estrellas: '5', foto: '' },
    { id: 't3', nombre: 'Luis A.', cargo: 'Caso laboral', texto: 'Después de 12 años me despidieron sin explicación. Gracias a su trabajo recibí lo que me correspondía. Totalmente recomendado.', estrellas: '5', foto: '' }
  ],

  faq: [
    { id: 'q1', pregunta: '¿La primera consulta tiene costo?', respuesta: 'La primera evaluación del caso (30 minutos) es gratuita. En ella revisamos tu situación y te explicamos las opciones y los honorarios antes de cualquier compromiso.' },
    { id: 'q2', pregunta: '¿Atienden casos fuera de Arequipa?', respuesta: 'Sí. Brindamos asesoría virtual a todo el Perú y coordinamos con abogados corresponsales cuando el proceso lo requiere.' },
    { id: 'q3', pregunta: '¿Cómo se fijan los honorarios?', respuesta: 'Depende del tipo de caso. Trabajamos con tarifa fija por etapa, por hora o con un porcentaje del resultado. Siempre se acuerda por escrito y por adelantado.' },
    { id: 'q4', pregunta: '¿Qué documentos debo llevar a la consulta?', respuesta: 'Tu DNI y todo documento relacionado con el caso: contratos, notificaciones, boletas, partidas registrales, mensajes o fotografías. Si no los tienes todos, igual podemos empezar.' },
    { id: 'q5', pregunta: '¿Cómo sabré cómo avanza mi caso?', respuesta: 'Te informamos de cada actuación importante por WhatsApp o correo, y puedes solicitar una reunión de seguimiento cuando lo necesites.' }
  ],

  mensajes: [
    { id: 'm1', nombre: 'Rosa Huamaní', email: 'rosa.h@correo.com', telefono: '987654321', asunto: 'Consulta sobre herencia', mensaje: 'Buenas tardes, mi padre falleció sin testamento y quisiera saber cómo iniciar la sucesión intestada.', fecha: '2026-10-20T15:22:00', leido: false },
    { id: 'm2', nombre: 'Empresa Andina SAC', email: 'gerencia@andina.pe', telefono: '', asunto: 'Asesoría mensual', mensaje: 'Estamos interesados en una asesoría legal permanente para nuestra empresa. ¿Podrían enviarnos una propuesta?', fecha: '2026-10-18T10:05:00', leido: true }
  ],

  citas: [
    { id: 'ct1', nombre: 'Pedro Cáceres', telefono: '958741236', email: 'pedro.c@correo.com', area: 'Derecho Laboral', modalidad: 'Presencial', fecha: '2026-10-27', hora: '10:00', mensaje: 'Me despidieron la semana pasada.', estado: 'pendiente', creado: '2026-10-21T18:40:00' },
    { id: 'ct2', nombre: 'Lucía Flores', telefono: '941258763', email: '', area: 'Derecho de Familia', modalidad: 'Virtual', fecha: '2026-10-28', hora: '16:00', mensaje: 'Consulta sobre divorcio.', estado: 'confirmada', creado: '2026-10-20T09:12:00' }
  ]
};

/* ---------- Almacenamiento ---------- */
const Store = {
  load() {
    const base = JSON.parse(JSON.stringify(DEFAULT_DATA));
    let d = null;
    try { d = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { d = null; }
    if (!d || typeof d !== 'object') return base;
    for (const k in base) {
      if (d[k] === undefined) continue;
      if (Array.isArray(base[k])) base[k] = Array.isArray(d[k]) ? d[k] : base[k];
      else if (typeof base[k] === 'object') base[k] = { ...base[k], ...d[k] };
      else base[k] = d[k];
    }
    return base;
  },
  save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
    catch (e) { console.error(e); return false; }
  },
  reset() { localStorage.removeItem(STORAGE_KEY); },
  sizeKB(data) { return Math.round(new Blob([JSON.stringify(data)]).size / 1024); }
};

/* ---------- Utilidades ---------- */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function nl2p(t) {
  return String(t || '').split(/\n\s*\n/).filter(Boolean)
    .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
}

function recortar(t, n) { t = String(t || ''); return t.length > n ? t.slice(0, n).trim() + '…' : t; }

function hoyISO() {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function fmtFecha(iso, corto) {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!y) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('es-PE',
    corto ? { day: '2-digit', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtHora(h) {
  if (!h) return '';
  let [hh, mm] = h.split(':').map(Number);
  const suf = hh >= 12 ? 'p. m.' : 'a. m.';
  hh = hh % 12 || 12;
  return `${hh}:${String(mm || 0).padStart(2, '0')} ${suf}`;
}

function soloDigitos(t) {
  let d = String(t || '').replace(/\D/g, '');
  if (d.length === 9 && d.startsWith('9')) d = '51' + d; // celular peruano
  return d;
}

function waLink(numero, texto) {
  return `https://wa.me/${soloDigitos(numero)}${texto ? '?text=' + encodeURIComponent(texto) : ''}`;
}

function inicialesDe(nombre) {
  return String(nombre || '').replace(/^(Dr\.|Dra\.|Abog\.)\s*/i, '').split(/\s+/)
    .filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function aplicarTema(c) {
  const r = document.documentElement.style;
  if (c.colorPrimario) r.setProperty('--primary', c.colorPrimario);
  if (c.colorAcento) r.setProperty('--accent', c.colorAcento);
}
