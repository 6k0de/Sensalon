export const formatProducts = (productsArr: any[]) => {
  const toNumber = (v: any) => Number(v) || 0;

  return productsArr.map((p: any) => {
    const quantity = toNumber(p.quantity) || 1;
    const total = toNumber(p.total);
    const priceUnit = total > 0 ? total / quantity : 0;

    let categories = [];
    try {
      const parsed = JSON.parse(p.product?.vccategories || "{}");
      categories = parsed.Categorias?.map((c: any) => c.idCategoria) || [];
    } catch {}

    return {
      iIdProduct: p.product?.iIdProduct,
      name: p.product?.vcname,
      priceUnit,
      quantity,
      total: total || priceUnit * quantity,
      companyId: p.product?.iFIdCompany,
      categoryIds: categories,
      image: p.product?.vcphoto || null,
    };
  });
};
