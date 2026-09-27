// Imagem de um evento: prioriza a capa própria (coverPath, quando o upload do
// painel existir); sem capa, cai numa foto padrão pelo slug da categoria.
// Sem correspondência: null (o card mostra o placeholder cinza de sempre).

const CATEGORY_IMAGE: Record<string, string> = {
  // casais: sem foto ainda — adicionar /culto-images/casais.jpg e a linha abaixo.
  // casais: "/culto-images/casais.jpg",
  conferencia: "/culto-images/conferencia.png",
  jovens: "/culto-images/jovens.png",
  kids: "/culto-images/infantil.png",
  batismo: "/culto-images/batismo.png",
  ceia: "/culto-images/ceia.png",
};

export function getEventImage(event: {
  coverPath: string | null;
  category: { slug: string } | null;
}): string | null {
  if (event.coverPath) return event.coverPath;
  if (!event.category) return null;
  return CATEGORY_IMAGE[event.category.slug] ?? null;
}
