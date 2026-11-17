# Brota — web (Limly LLC)

Landing de Brota en **español, inglés, portugués y francés**, con formulario de contacto, checkout de Polar y vista privada de leads.

La web **funciona desde el primer día sin configurar nada**. Cada servicio se activa solo cuando agregas su variable de entorno en Vercel. Nunca hace falta un ZIP nuevo para activarlos.

| Servicio | Sin configurar | Cuando agregas las variables |
| --- | --- | --- |
| Contacto | Abre el correo del visitante con el mensaje listo para **manyosa@limly.io** | Se guarda en Neon y/o te llega un aviso por Resend |
| Botones de planes | Abren el formulario de contacto con el plan elegido | Llevan al checkout de Polar y luego a `/gracias` |
| Iniciar sesión / Crear cuenta | Abren Contacto con "Acceso a la plataforma" | Llevan a la plataforma (`APP_URL`, segunda entrega) |

No hay ningún aviso de "modo de prueba" en la web.

---

## 1 · Subir a GitHub

1. En GitHub crea un repositorio nuevo, por ejemplo `brota-web` (privado está bien). No marques "Add README".
2. Abre el repositorio vacío y elige **"uploading an existing file"**.
3. Descomprime el ZIP en tu computadora y **arrastra el contenido de la carpeta `brota-web`** (no la carpeta en sí): `api`, `lib`, `public`, `package.json`, `vercel.json`, `README.md`, `.env.example`, `.gitignore`.
   - Si no ves `.gitignore` y `.env.example`, activa "mostrar archivos ocultos". No son imprescindibles.
4. Pulsa **Commit changes**.

## 2 · Publicar en Vercel

1. En Vercel: **Add New → Project → Import** el repositorio `brota-web`.
2. Framework Preset: **Other**. No cambies nada más.
3. Pulsa **Deploy**. En un minuto tienes la web en `https://brota-web.vercel.app` (o similar).
4. Dominio propio (opcional): **Settings → Domains → Add** `brota.limly.io` y crea en tu proveedor de DNS el registro **CNAME** que Vercel te indique.

> Vercel Hobby (gratis) es para uso no comercial. Úsalo para lanzar y probar. Cuando empieces a cobrar, pasa el proyecto a Vercel Pro (≈ US$ 20/mes).

Cada vez que cambies un archivo en GitHub, Vercel publica la nueva versión sola.

---

## 3 · Activar Polar (pagos)

**No necesitas crear "checkout links".** La web crea el checkout en el momento con el ID del producto y Polar devuelve al cliente a `/gracias`.

1. En Polar (sandbox primero), en cada producto copia su **ID**.
2. En Polar → **Settings → Developers → New token** (Organization Access Token). Copia el token.
3. En Vercel → **Settings → Environment Variables**, agrega:

| Variable | Valor |
| --- | --- |
| `POLAR_SERVER` | `sandbox` (luego `production`) |
| `POLAR_ACCESS_TOKEN` | el token de Polar |
| `POLAR_PRODUCT_REPORTE` | ID de "Reporte de sitio" |
| `POLAR_PRODUCT_MONITOREO` | ID de "Monitoreo" |
| `POLAR_PRODUCT_PORTAFOLIO` | ID de "Portafolio" |

4. Vercel → **Deployments → … → Redeploy** para aplicar las variables.
5. Prueba: pulsa "Comprar reporte" en la web, paga con la tarjeta de prueba de Polar y verifica que vuelvas a `/gracias`.
6. Cuando funcione, crea los productos en Polar producción, cambia los IDs, el token y `POLAR_SERVER=production`, y vuelve a hacer Redeploy.

Si algún producto no está configurado, su botón sigue llevando a Contacto: nada se rompe.

---

## 4 · Guardar los contactos (Neon, gratis)

Alternativa a Supabase: Neon Free permite muchos proyectos y no se pausa por inactividad.

1. Crea una cuenta en **neon.tech** (puedes entrar con GitHub) y un proyecto llamado `brota`.
2. En el proyecto, pulsa **Connect** y copia la cadena que empieza con `postgresql://`.
3. En Vercel agrega:
   - `DATABASE_URL` = esa cadena.
   - `ADMIN_KEY` = una clave larga inventada por ti (ej. 30 letras y números).
4. Redeploy. La tabla `leads` se crea sola con el primer contacto.
5. Para ver los contactos: `https://TU-WEB/api/leads?key=TU_ADMIN_KEY` (también puedes descargarlos en CSV desde ahí).

No pegues la cadena de Neon ni el `ADMIN_KEY` en ningún chat.

## 5 · Aviso por correo de cada contacto (Resend, opcional)

1. Crea una cuenta en **resend.com** con **manyosa@limly.io** y crea una API key.
2. En Vercel agrega `RESEND_API_KEY`. Redeploy.
3. Sin dominio verificado, Resend solo envía al correo dueño de la cuenta (por eso usa manyosa@limly.io). Para enviar desde `hola@limly.io`, verifica el dominio `limly.io` en Resend y agrega `RESEND_FROM=Brota <hola@limly.io>`.

---

## Estructura

```
public/index.html   Landing (4 idiomas, legales, regulación de IA)
public/app.js       Interacciones de la landing
public/gracias.html Página después del pago
api/config.js       Qué servicios están activos (sin secretos)
api/contact.js      Guarda y avisa cada contacto
api/checkout.js     Crea el checkout de Polar
api/leads.js        Vista privada de contactos
lib/util.js         Utilidades compartidas
.env.example        Todas las variables, explicadas
```

## Siguiente entrega

La plataforma de clientes (registro con correo verificado y Google, sitios, alertas y reportes). Cuando esté lista se conecta con `APP_URL` y los botones "Iniciar sesión" y "Crear cuenta" llevan a ella.

---

Brota es un producto de **Limly LLC** · 8 The Green, Suite B, Dover, DE 19901, EE. UU. · manyosa@limly.io
