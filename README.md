# Red de Vida

Red de Vida es un prototipo web adaptable a móviles que ayuda a organizar la información de una emergencia antes de comunicarla a los servicios oficiales. El recorrido está diseñado para ser corto, claro y fácil de seguir.

> **Importante:** este prototipo es una simulación. No envía datos al NUSE/123 ni reemplaza la llamada a los servicios de emergencia. Si necesitas ayuda inmediata, llama al 123 cuando esté disponible.

## Ventajas y funciones

- Mantiene la llamada al 123 accesible durante el recorrido.
- Organiza el reporte en cinco pasos: identificación opcional, emergencia, ubicación, detalles y revisión.
- Permite elegir una sola emergencia principal y cambiarla antes de continuar.
- Intenta obtener la ubicación del dispositivo y permite escribir una dirección si no está disponible.
- Adapta las preguntas a la emergencia elegida y ofrece respuestas «Sí», «No» y «No sé».
- Explica bajo cada pregunta que «No sé» significa que el testigo no pudo observar o confirmar la respuesta; recomienda no adivinar.
- No solicita fotografías.
- Presenta las preguntas sobre salud como opcionales y solicita autorización expresa antes de responderlas en esta simulación.
- Conserva los datos mientras el formulario permanece abierto y permite volver a corregirlos.
- Muestra un resumen para que la persona pueda comunicar la situación por teléfono.
- Usa HTML, CSS y JavaScript sin dependencias de instalación ni proceso de compilación.

## Cómo abrirlo

### Abrir el archivo directamente

Abre `index.html` en un navegador moderno. Para previsualizar el diseño móvil en Chrome o Edge, abre las herramientas de desarrollador con `F12` y activa la vista adaptable con `Ctrl + Shift + M`.

### Abrirlo desde un servidor local

Desde una terminal ubicada en esta carpeta, ejecuta:

```powershell
py -m http.server 8000
```

Luego visita <http://localhost:8000>. Detén el servidor con `Ctrl + C`.

La ubicación del navegador puede requerir un contexto seguro. `localhost` se considera un contexto local; al publicar el sitio, usa HTTPS para probar la ubicación en móviles.

## Estructura

- `index.html`: contenido y pantallas del recorrido.
- `styles.css`: estilos y adaptación a distintos anchos de pantalla.
- `script.js`: navegación, estado del formulario, ubicación, preguntas adaptativas y resumen.

## Límites actuales

- No existe una conexión con NUSE/123 ni un servidor para recibir reportes.
- Los datos viven solo en la memoria de la página y se pierden al recargarla o cerrarla.
- No hay modo sin conexión configurado. Para abrir la app sin internet habría que añadir una caché local y cargarla al menos una vez con conexión.
- La ubicación depende de los permisos del dispositivo y puede ser aproximada; también se puede ingresar una ubicación manual.
- Las preguntas son contenido de prototipo, no un protocolo clínico. Deben ser validadas por personal médico o de emergencias antes de cualquier uso real.
- El número de identificación es opcional y solo se incluye en el resumen local de esta simulación. No se verifica, transmite ni guarda en un servidor.
- El aviso de autorización describe únicamente esta simulación. Antes de recolectar datos reales, el responsable debe identificarse, definir y comunicar finalidades, conservación, acceso y medidas de seguridad, y validar el tratamiento aplicable.
- El enlace de llamada depende de que el dispositivo y el navegador puedan abrir el marcador telefónico; realizar una llamada requiere conectividad de voz.

## Publicar en GitHub Pages

El sitio no necesita un proceso de compilación. Sube estos archivos a un repositorio de GitHub y configura Pages para publicar desde la rama principal y la carpeta raíz. GitHub Pages publica sitios estáticos; el sitio será público en internet si el repositorio usa el plan gratuito con un repositorio público.
