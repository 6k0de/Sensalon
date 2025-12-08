export const groupVariantProducts = (list: any[]) => {
  // Clonamos y normalizamos
  const byId = new Map<string, any>();

  list.forEach((p) => {
    const clone = {
      ...p,
      childrenVariants: Array.isArray(p.childrenVariants)
        ? [...p.childrenVariants]
        : [],
    };
    byId.set(p.iIdProduct, clone);
  });

  const result: any[] = [];

  list.forEach((p) => {
    const current = byId.get(p.iIdProduct);

    if (p.producttype === "VARIANT" && p.relatedproductId) {
      const parent = byId.get(p.relatedproductId);

      if (parent) {
        parent.childrenVariants = parent.childrenVariants || [];

        // 🔹 Aquí evitamos duplicar la misma variante
        const alreadyExists = parent.childrenVariants.some(
          (child: any) => child.iIdProduct === current.iIdProduct
        );

        if (!alreadyExists) {
          parent.childrenVariants.push(current);
        }

        // No lo metemos al result → solo vive como hijo
      } else {
        // Si el padre no existe en la lista, lo mostramos normal
        result.push(current);
      }
    } else {
      // Producto raíz (SIMPLE, PACK, etc.)
      result.push(current);
    }
  });

  return result;
};
