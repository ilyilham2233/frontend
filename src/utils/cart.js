const firstArray = (...values) => values.find(Array.isArray) || [];

export const normalizeCartItems = (payload) => {
  const data = payload?.data ?? payload;
  const items = Array.isArray(data)
    ? data
    : firstArray(
        data?.articles,
        data?.items,
        data?.cart_items,
        data?.panier?.articles,
        data?.panier?.items,
        data?.cart?.articles,
        data?.cart?.items,
        data?.data?.articles,
        data?.data?.items,
        data?.data
      );

  return items.map((item) => {
    const produit = item.produit || item.product || item.article?.produit || {};
    const prix = Number(produit.prix ?? produit.price ?? item.prix ?? item.price ?? 0);
    const quantite = Number(item.quantite ?? item.quantity ?? item.qty ?? 1);

    return {
      ...item,
      id: item.id ?? item.article_id ?? item.cart_item_id ?? item.panier_item_id ?? produit.pivot?.id,
      quantite: Number.isFinite(quantite) && quantite > 0 ? quantite : 1,
      produit: {
        ...produit,
        prix: Number.isFinite(prix) ? prix : 0,
      },
    };
  });
};
