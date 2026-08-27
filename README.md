# Barberia R Cartagena

Web estatica para Barberia R en Cartagena. El proyecto esta preparado para desplegarse como sitio estatico en Vercel o cualquier hosting similar.

## Estructura

- `index.html`: estructura principal de la pagina y puntos de montaje de la interfaz.
- `css/styles.css`: estilos globales, responsive, formulario de reserva, barberos y calendario.
- `assets/logo.jpg`: imagen usada en la navegacion.
- `assets/hero.jpg`: imagen principal del bloque de bienvenida.
- `js/config.js`: configuracion publica del sitio, como Supabase, WhatsApp e Instagram.
- `js/data.js`: datos locales de referencia, como barberos fallback y horarios disponibles.
- `js/dom.js`: utilidades pequenas para seleccionar elementos y escapar HTML.
- `js/supabase-client.js`: inicializacion del cliente de Supabase.
- `js/calendar.js`: calendario personalizado para seleccionar dia de reserva.
- `js/booking.js`: carga de horarios, seleccion de hora, guardado de reservas y fallback por WhatsApp.
- `js/barbers.js`: renderizado de barberos y seleccion desde la seccion de barberos.
- `js/app.js`: inicializacion general de la web.

## Funcionamiento actual

La pagina muestra barberos locales aunque Supabase no este disponible. Tambien muestra horarios de referencia si falla la consulta de disponibilidad, para que el usuario pueda continuar y confirmar la cita por WhatsApp.

El calendario no depende de Supabase: al seleccionar un dia, `booking.js` intenta consultar horas ocupadas. Si Supabase falla, se muestran las horas definidas en `js/data.js`.

## Supabase

La configuracion publica esta en `js/config.js`. Para activar reservas reales, el proyecto Supabase debe exponer las tablas, funciones y politicas RLS esperadas por el frontend:

- Tabla `barberos`, para cargar barberos activos.
- Tabla `citas_disponibilidad`, para bloquear horas concretas.
- Funcion RPC `horas_ocupadas`, para consultar citas ya reservadas por fecha y barbero.
- Tabla `citas`, para insertar reservas.

Mientras Supabase no este alineado, la web funciona en modo degradado: muestra barberos y horarios locales y deriva la confirmacion a WhatsApp.

## Desarrollo local

Al ser una web estatica, se puede abrir `index.html` directamente en el navegador. Para una prueba mas parecida a produccion, se puede servir la carpeta con un servidor estatico local.

Antes de subir cambios conviene validar la sintaxis de los scripts:

```bash
node --check js/config.js
node --check js/data.js
node --check js/dom.js
node --check js/supabase-client.js
node --check js/calendar.js
node --check js/booking.js
node --check js/barbers.js
node --check js/app.js
```
