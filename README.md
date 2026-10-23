# Sitio web para Abogado + Panel de Administración

Sitio web profesional para un abogado o estudio jurídico, con portafolio y panel de administración. Hecho con **HTML, CSS y JavaScript puro**: sin instalaciones, sin servidor, listo para GitHub Pages.

## 🚀 Probarlo

- **Sitio:** `index.html`
- **Panel admin:** `admin.html` (también hay un enlace "Acceso administrador" en el pie de página)
- **Acceso demo:** usuario `admin` · contraseña `admin123`

> Tip para la demo al cliente: abre el sitio en una pestaña y el panel en otra. Lo que cambies en el panel aparece al instante en el sitio, y las citas/mensajes que envíes desde el sitio llegan al panel con una notificación.

## 📦 Subir a GitHub Pages

1. Crea un repositorio nuevo en GitHub y sube **todo el contenido de esta carpeta** (que `index.html` quede en la raíz).
2. Ve a **Settings → Pages**.
3. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guarda.
4. En 1–2 minutos estará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## ✨ Funcionalidades

### Sitio público
- Portada con foto, cifras animadas y botones de cita / WhatsApp
- Sobre mí: biografía, misión, valores, idiomas y colegiatura
- Áreas de práctica (al hacer clic en "Consultar" se preselecciona el área en la agenda)
- **Portafolio** con pestañas:
  - Casos de éxito con filtro por área y detalle en ventana emergente
  - Experiencia profesional (línea de tiempo)
  - Formación académica
  - Certificaciones con imagen ampliable
  - Botón "Descargar CV" (PDF)
- Testimonios en carrusel automático
- Blog jurídico con categorías y lectura completa
- Preguntas frecuentes (acordeón)
- **Agenda de citas en línea**: solo muestra horarios libres, bloquea domingos, respeta horario de sábado y avisa por WhatsApp
- Formulario de contacto + mapa de Google con la dirección
- Botón flotante de WhatsApp, botón "volver arriba", menú móvil y diseño 100% responsive

### Panel de administración
- Inicio con resumen: citas pendientes, citas de hoy, mensajes sin leer, próximas citas
- **Citas**: filtrar por estado, buscar, cambiar estado (pendiente / confirmada / atendida / cancelada), registrar citas manuales, editar y confirmar por WhatsApp con mensaje automático
- **Mensajes**: bandeja con leídos/no leídos, responder por correo o WhatsApp
- Datos generales: nombre, foto, portada, imagen de fondo, contacto, horario de la agenda, redes sociales, **colores de la marca**, mostrar/ocultar secciones y CV
- Perfil: biografía y cifras de la portada
- Agregar, editar, eliminar y **ordenar**: áreas, casos, experiencia, formación, certificaciones, blog, testimonios y FAQ
- Subida de imágenes con **compresión automática** (o pegar un enlace)
- Ajustes: cambiar usuario/contraseña, **exportar/importar respaldo**, limpiar datos de prueba, restablecer demo

## 🗂️ Estructura

```
├── index.html      → Sitio público
├── admin.html      → Panel de administración
├── css/
│   ├── style.css   → Estilos del sitio
│   └── admin.css   → Estilos del panel
└── js/
    ├── data.js     → Datos de ejemplo y funciones compartidas
    ├── main.js     → Lógica del sitio
    └── admin.js    → Lógica del panel
```

## ⚠️ Importante (es una demo)

Los datos se guardan en el **navegador** (`localStorage`). Esto significa:

- Los cambios hechos en el panel solo se ven **en ese navegador/computadora**. Para pasarlos a otro equipo: *Ajustes → Exportar datos* y luego *Importar datos*.
- Las citas y mensajes que envíe un visitante se guardan en **su** navegador, no le llegan al abogado. En la demo funciona porque todo se prueba en el mismo equipo.
- El acceso al panel es de demostración (no es un login seguro).
- Capacidad aproximada: 5 MB (el panel muestra el espacio usado).

**Para pasarlo a producción** basta con reemplazar el objeto `Store` de `js/data.js` (funciones `load` y `save`) por una base de datos real, por ejemplo **Firebase** (Firestore + Authentication + Storage) o Supabase. El resto del código no necesita cambios grandes.

## 🎨 Personalización rápida

- Contenido de ejemplo: `DEFAULT_DATA` en `js/data.js`
- Colores: desde el panel (*Datos generales → Apariencia*) o variables `--primary` y `--accent` en `css/style.css`
- Tipografías: Cormorant Garamond (títulos) e Inter (texto), desde Google Fonts
