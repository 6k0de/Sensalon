import { DiscountCodeModel } from "../bd/models/DiscountCode.model";

export async function registerDiscountCodeUsageFromPreOrder(
  preOrder: any,
  status: string
) {
  // Solo nos interesa cuando el pago vino como approved o pending
  const normalizedStatus = String(status || "").toLowerCase();
  if (!["approved", "pending"].includes(normalizedStatus)) {
    return;
  }

  const discountCode: string | null = preOrder.getDataValue("discountCode") || null;
  const discountAmount: number = Number(preOrder.getDataValue("discount") || 0);

  // Si no hay código o el descuento es 0, no hacemos nada
  if (!discountCode || discountAmount <= 0) return;

  const code = await DiscountCodeModel.findOne({ where: { code: discountCode } });
  if (!code) {
    console.warn(`Código de descuento ${discountCode} no encontrado al registrar uso.`);
    return;
  }

  const usageLimitType = code.getDataValue("usageLimitType") as
    | "limited"
    | "unlimited"
    | string;
  const usageLimit = code.getDataValue("usageLimit") as number | null;
  const currentUsage = Number(code.getDataValue("usageCount") || 0);

  // LIMITED: respetar límite
  if (usageLimitType === "limited") {
    if (usageLimit != null && currentUsage >= usageLimit) {
      console.warn(
        `Código ${discountCode} ya alcanzó su límite de usos (${usageLimit}).`
      );
      return;
    }

    await code.update({ usageCount: currentUsage + 1 });
    return;
  }

  // UNLIMITED: solo acumular para estadísticas
  await code.update({ usageCount: currentUsage + 1 });
}