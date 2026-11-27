# ezyron-web

Web pública de **Ezyron**, publicada en https://ezyron.com (Hostinger, despliegue desde Git).

- El código de trabajo vive en el repo privado `infoezyron/ezyron` (carpeta `web/ezyron-punto`), que se mantiene idéntico a este.
- Hostinger despliega la rama `main` en `public_html`. Cualquier cambio entra por pull request; al fusionar en `main`, la web se actualiza sola.

## Qué hay

| Ruta | Para qué |
| --- | --- |
| `index.html` | La web |
| `js/` | `boot.js` (pantalla de carga), `main.js` (escenas y formulario), `consent.js` (aviso de cookies) |
| `css/consent.css` | Estilos del aviso de cookies |
| `fonts/` | Tipografías servidas desde ezyron.com (sin Google Fonts) |
| `politica-de-cookies.html` | Política de cookies |
| `404.html` | Página de error |
| `robots.txt`, `sitemap.xml`, `llms.txt` | SEO y buscadores con IA |
| `.htaccess` | Cabeceras de seguridad, caché y bloqueo de ficheros internos |
| `.well-known/security.txt` | Contacto para avisar de fallos de seguridad |

## Reglas para no romper nada

1. **Este repo es público.** Nunca subas claves secretas, contraseñas, `.env`, contratos ni datos de clientes. La clave de Web3Forms es pública por diseño (solo permite enviar al correo de Ezyron); cualquier otra clave, no.
2. **Nada de JavaScript en línea.** La política de seguridad (`Content-Security-Policy` en `.htaccess`) solo deja ejecutar ficheros de `js/`. Un `<script>…</script>` o un `onclick="…"` dentro del HTML no funcionará: pon el código en `js/`.
3. **Servicios de fuera:** si añades uno (analítica, vídeo, mapa, otro formulario), hay que añadir su dominio a la CSP de `.htaccess`.
4. **Cookies:** si añades algo que instale cookies que no sean técnicas (Google Analytics, píxel de Meta…), cárgalo así para que solo se active con permiso, y añádelo a la tabla de `politica-de-cookies.html`:
   ```html
   <script type="text/plain" data-cookie-category="analytics" data-src="https://…"></script>
   ```
5. **SEO:** al cambiar textos importantes, actualiza `<lastmod>` en `sitemap.xml`.
