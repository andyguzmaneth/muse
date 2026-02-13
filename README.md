# Muse

Aplicación de escritorio para trabajar con Claude en el contexto de un proyecto: chat, archivos y documentos en un solo lugar. Pensada para usar con un directorio de proyecto (por ejemplo un negocio o un repo) y mantener la conversación alineada con el contexto del proyecto.

## Requisitos

- **Node.js** 20+
- **pnpm** (o npm)
- **Rust** (para Tauri: [rustup](https://rustup.rs))
- **Clave de API de Anthropic** ([Consola Anthropic](https://console.anthropic.com))

## Instalación

```bash
# Clonar o entrar al proyecto
cd muse

# Dependencias del frontend
pnpm install

# Dependencias y compilado del sidecar (Node)
cd sidecar && pnpm install && pnpm run build && cd ..
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (no se sube a git):

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
# Opcional: carpeta del proyecto por defecto (p. ej. Luz de Luz). Si no está, la primera vez hay que elegir carpeta.
# VITE_DEFAULT_PROJECT=/ruta/completa/a/tu/proyecto
```

Para desarrollo, carga las variables antes de arrancar:

```bash
source .env && pnpm tauri dev
```

## Desarrollo

```bash
source .env && pnpm tauri dev
```

Se abre la ventana de Tauri y el frontend se sirve en `http://localhost:1420` con recarga en caliente. El sidecar de Node se inicia la primera vez que envías un mensaje en el chat.

## Build de producción

```bash
pnpm run build
pnpm tauri build
```

El instalador o binario quedan en `src-tauri/target/release/` según el sistema.

## Uso

1. **Abrir carpeta**: elige la carpeta del proyecto (p. ej. tu repo o carpeta de Luz de Luz). La app recuerda la última carpeta y el ancho de la barra lateral.
2. **Chat**: pestañas de conversación. El **primer mensaje** de cada chat puede incluir automáticamente el contexto del proyecto (README o `context.md`).
3. **Sugerencias**: con el chat vacío puedes usar los botones rápidos o **Plantillas** (publicación, email a proveedor, descripción de producto, etc.).
4. **Markdown**: doble clic en un `.md` en la barra lateral abre una pestaña con vista previa. Puedes pasar a **Editar**, **Guardar** y **Deshacer**.
5. **Exportar**: en cada chat, “Exportar chat” guarda la conversación en `chats/` del proyecto en Markdown.
6. **Costo**: se muestra el costo aproximado por conversación en la pestaña y en la barra del chat.
7. **Idioma**: en el pie de la barra lateral, “Responder en español” hace que Claude responda en español por defecto.

## Tecnología

- **Tauri 2** (ventana nativa)
- **React 19 + TypeScript + Vite**
- **Tailwind CSS**
- **Zustand** (estado)
- **Sidecar en Node.js**: proceso separado que usa `@anthropic-ai/claude-code` para hablar con la API de Claude (streaming, sesiones, uso de archivos del proyecto).

## Estructura del proyecto

```
muse/
├── src/                 # Frontend React
│   ├── components/      # ChatPanel, FileTree, MarkdownViewerPanel, etc.
│   ├── hooks/           # useClaude, useFileTree
│   ├── lib/             # sidecar, projectContext, prompts, layoutStorage
│   └── stores/          # Zustand (sesiones, rootDir, preferencias)
├── sidecar/             # Proceso Node que usa Claude Code API
│   └── src/index.ts
└── src-tauri/            # App Tauri (Rust)
```

## Licencia

Privado / uso personal.
