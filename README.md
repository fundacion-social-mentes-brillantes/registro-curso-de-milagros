# Registro Curso de Milagros

Aplicación web minimalista para registrar el avance diario de un grupo que hace Un Curso de Milagros. No usa login: cualquier persona con el enlace puede buscar un nombre y marcar o quitar el chulo de la lección del día.

La fecha base del curso es:

- 26 de mayo de 2026 = Lección 1
- 27 de mayo de 2026 = Lección 2
- 28 de mayo de 2026 = Lección 3

## Tecnologías

- React
- Vite
- Tailwind CSS
- Supabase con `@supabase/supabase-js`
- Preparada para GitHub y Vercel

## Instalar dependencias

```bash
npm install
```

## Ejecutar localmente

```bash
npm run dev
```

Luego abre la URL que muestre Vite, normalmente:

```text
http://localhost:5173
```

Si todavía no configuraste Supabase, la app funciona en modo local usando el navegador. Los cambios no se comparten con el grupo hasta conectar Supabase.

## Configurar Supabase

Proyecto:

```text
registro-curso-de-milagros
https://twgeeiqtrtytvjnmhfks.supabase.co
```

La app solo necesita una key pública para frontend. No uses la `service_role` key en esta app.

Para encontrar la key:

1. Entra a [Supabase Dashboard](https://supabase.com/dashboard).
2. Abre el proyecto `registro-curso-de-milagros`.
3. Ve a **Settings > API Keys**.
4. Copia una **Publishable key** que empiece por `sb_publishable_`.
5. Si no ves publishable keys, puedes usar la legacy **anon public key**.
6. No copies ni pegues la `service_role` key.

## Variables de entorno locales

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
VITE_SUPABASE_URL=https://twgeeiqtrtytvjnmhfks.supabase.co
VITE_SUPABASE_ANON_KEY=pega_aqui_la_publishable_o_anon_key
```

`.env.local` está ignorado por Git y no debe subirse a GitHub.

## Crear las tablas en Supabase

1. En Supabase Dashboard, abre tu proyecto.
2. Ve a **SQL Editor**.
3. Crea una consulta nueva.
4. Copia todo el contenido de `supabase/schema.sql`.
5. Pégalo en el editor.
6. Haz clic en **Run**.

El SQL crea:

- `participants`
- `lesson_checks`
- Participantes iniciales
- Restricción única por participante y lección
- RLS activo
- Políticas públicas simples para leer, insertar y actualizar
- Permisos `GRANT` para que `supabase-js` pueda acceder desde el frontend

## Subir a GitHub

```bash
git init
git add .
git commit -m "Crear app Registro Curso de Milagros con Supabase"
git branch -M main
git remote add origin https://github.com/tu-usuario/registro-curso-de-milagros.git
git push -u origin main
```

## Desplegar en Vercel

1. Entra a [Vercel](https://vercel.com/).
2. Importa el repositorio desde GitHub.
3. Vercel detectará Vite automáticamente.
4. Usa estos valores:

```text
Build Command: npm run build
Output Directory: dist
```

## Variables de entorno en Vercel

En el proyecto de Vercel, entra a **Settings > Environment Variables** y agrega:

```bash
VITE_SUPABASE_URL=https://twgeeiqtrtytvjnmhfks.supabase.co
VITE_SUPABASE_ANON_KEY=pega_aqui_la_publishable_o_anon_key
```

Después de agregarlas, vuelve a desplegar el proyecto.

## Estructura de datos

`participants`

- `id`
- `name`
- `display_order`
- `active`
- `created_at`

`lesson_checks`

- `id`
- `participant_id`
- `lesson_number`
- `lesson_date`
- `completed`
- `updated_at`

La app no borra registros. Cuando alguien marca o desmarca, hace un `upsert` sobre `participant_id` + `lesson_number` y cambia `completed` a `true` o `false`.
