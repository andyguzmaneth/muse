/** Sugerencias rápidas cuando el chat está vacío */
export const QUICK_PROMPTS = [
  "Ideas para publicar esta semana",
  "Revisar este documento",
  "Redactar descripción de producto",
  "Resumen en español",
] as const;

/** Plantillas de mensaje para enviar directamente */
export const TEMPLATES: { label: string; text: string }[] = [
  {
    label: "Publicación para redes",
    text: "Necesito un texto para una publicación en Instagram/Facebook sobre [tema]. Tono: delicado, católico, inspirador. Incluir 3-5 hashtags adecuados para Luz de Luz.",
  },
  {
    label: "Email a proveedor",
    text: "Redacta un email profesional para contactar a un proveedor de [producto/material]. Presentar Luz de Luz como negocio de productos devocionales y solicitar catálogo y condiciones.",
  },
  {
    label: "Descripción de producto",
    text: "Escribe una descripción de producto para [nombre del producto] para nuestra tienda/web. Incluir beneficios, uso y un tono cálido y católico. Máximo 100 palabras.",
  },
  {
    label: "Oración o reflexión",
    text: "Sugiere una oración o reflexión corta para [ocasión o tema]. Que sea cercana y fácil de compartir en redes o en un producto.",
  },
];
