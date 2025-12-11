import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import conn from "../../bd/config/config";
import { TransactionModel } from "../../bd/models/Transaction.model";
import { normalizeProducts } from "../../helpers/normalizeProducts";
import { toNumberSafe } from "../../helpers/numberSafe";

export const salesByMonth = async (req: Request, res: Response) => {
    const debugBrandCategory: Record<string, { total: number; items: number }> = {};

    try {
        const year = req.query.year ? Number(req.query.year) : undefined;
        const filterBrand = (req.query as any)?.brandId || null;
        const filterCategory = (req.query as any)?.categoryId || null;
        const filterDistributor = (req.query as any)?.distributor === "1";

        console.log("[salesByMonth] query:", {
            year,
            filterBrand,
            filterCategory,
            filterDistributor,
        });

        const txs = await TransactionModel.findAll({
            where: { status: "approved" },
            attributes: [
                "createdAt",
                "products",
                "iuserId",
                "amount",
                [conn.fn("DATE_FORMAT", conn.col("createdAt"), "%Y-%m"), "monthKeySql"],
            ],
        });

        console.log("[salesByMonth] transacciones encontradas:", txs.length);

        // roles / distribuidores (igual que antes)
        const roles = await conn.query(
            `SELECT iIdRole, vctyperole FROM roles`,
            { type: QueryTypes.SELECT }
        );

        const distributorRoleId =
            (roles as any[]).find((r) =>
                (r.vctyperole || "").toLowerCase().includes("distribuidor")
            )?.iIdRole || null;

        const usersRoles = await conn.query(
            `SELECT iIdUser, iFIdRole FROM users`,
            { type: QueryTypes.SELECT }
        );

        const mapUserRole: Record<string, string> = {};
        (usersRoles as any[]).forEach((u) => {
            mapUserRole[u.iIdUser] = u.iFIdRole;
        });

        const rows: {
            monthKey: string;
            monthNum: number;
            monthLabel: string;
            total: number;
        }[] = [];

        const useLegacyOnly =
            !filterBrand && !filterCategory && !filterDistributor;

        txs.forEach((t: any, idx: number) => {
            const createdAtRaw = t.getDataValue("createdAt");
            const createdAt = new Date(createdAtRaw);
            const txYear = createdAt.getFullYear();
            const txMonth = createdAt.getMonth() + 1;

            if (!Number.isFinite(txYear)) {
                console.warn("[salesByMonth] createdAt inválido", {
                    idx,
                    createdAtRaw,
                });
                return;
            }

            console.log("[salesByMonth] TX", { idx, createdAtRaw, txYear, txMonth });

            if (year && txYear !== year) return;

            // filtro solo distribuidores
            if (filterDistributor && distributorRoleId) {
                const userId = t.getDataValue("iuserId");
                const role = mapUserRole[userId];
                if (role !== distributorRoleId) return;
            }

            const monthKey = t.getDataValue("monthKeySql") as string;
            const [yearStr, monthStr] = monthKey.split("-");
            const monthNum = Number(monthStr);
            const monthLabel = new Date(
                Number(yearStr),
                monthNum - 1,
                1
            ).toLocaleDateString("es-MX", {
                month: "short",
                year: "numeric",
            });

            // 🔹 MODO 1: sin filtros → usar SIEMPRE amount
            if (useLegacyOnly) {
                const txAmount = toNumberSafe(t.getDataValue("amount"));

                console.log("[salesByMonth] TX LEGACY", { idx, monthKey, txAmount });

                if (txAmount != null && Number.isFinite(txAmount) && txAmount > 0) {
                    let existing = rows.find((r) => r.monthKey === monthKey);
                    if (existing) {
                        existing.total += txAmount;
                    } else {
                        rows.push({ monthKey, monthNum, monthLabel, total: txAmount });
                    }
                } else {
                    console.warn("[salesByMonth] TX LEGACY sin amount válido", {
                        idx,
                        monthKey,
                        rawAmount: t.getDataValue("amount"),
                    });
                }

                // 👈 muy importante: no vemos productos en este modo
                return;
            }

            // 🔹 MODO 2: con filtros (marca / categoría / distribuidor) → usar items
            const rawProducts = t.getDataValue("products");
            const items = normalizeProducts(rawProducts, idx);
            if (!items.length) return;

            items.forEach((it: any) => {
                const companyId =
                    it.companyId ??
                    it.iFIdCompany ??
                    it.product?.iFIdCompany ??
                    null;

                const categoriesList = (() => {
                    try {
                        const cats =
                            it.categoryIds ??
                            it.Categorias ??
                            it.vccategories ??
                            it.product?.vccategories;

                        const parsed =
                            typeof cats === "string" ? JSON.parse(cats) : cats;

                        return parsed?.Categorias?.map((c: any) => c.idCategoria) || [];
                    } catch {
                        return [];
                    }
                })();

                if (filterBrand && companyId !== filterBrand) return;
                if (filterCategory && !categoriesList.includes(filterCategory)) return;

                const quantityRaw = it.iquantity ?? it.quantity ?? 1;
                const quantity = toNumberSafe(quantityRaw) ?? 1;

                const totalField = toNumberSafe(it.total);
                const priceField = toNumberSafe(it.price);
                const priceUnitField = toNumberSafe(it.priceUnit);

                let amount: number | null = totalField;
                if (amount == null) {
                    if (priceField != null) {
                        amount = priceField * (Number.isFinite(quantity) ? quantity : 1);
                    } else if (priceUnitField != null) {
                        amount = priceUnitField * (Number.isFinite(quantity) ? quantity : 1);
                    }
                }

                console.log("[salesByMonth] ITEM", {
                    monthKey,
                    companyId,
                    categoriesList,
                    name: it.name,
                    totalField,
                    priceField,
                    priceUnitField,
                    quantityRaw,
                    quantity,
                    amount,
                });

                if (amount == null || !Number.isFinite(amount) || amount <= 0) {
                    console.warn("[salesByMonth] item con monto inválido, se ignora", {
                        monthKey,
                        it,
                        totalField,
                        priceField,
                        priceUnitField,
                        quantity,
                    });
                    return;
                }

                const debugKey = `${monthKey}|${companyId}|${categoriesList.join(",")}`;
                if (!debugBrandCategory[debugKey]) {
                    debugBrandCategory[debugKey] = { total: 0, items: 0 };
                }
                debugBrandCategory[debugKey].total += amount;
                debugBrandCategory[debugKey].items += 1;

                let existing = rows.find((r) => r.monthKey === monthKey);
                if (existing) {
                    existing.total += amount;
                } else {
                    rows.push({ monthKey, monthNum, monthLabel, total: amount });
                }
            });
        });

        console.log("[salesByMonth] rows calculadas:", rows.length);
        console.log(rows);
        console.log("[salesByMonth] DEBUG BRAND/CATEGORY:", {
            filterBrand,
            filterCategory,
            debugBrandCategory,
        });

        rows.sort((a, b) => (a.monthKey < b.monthKey ? -1 : 1));

        res.json({ ok: true, data: rows });
    } catch (error) {
        console.error("Error en salesByMonth:", error);
        res
            .status(500)
            .json({ ok: false, message: "Error obteniendo ventas por mes" });
    }
};

export const topCustomer = async (_: Request, res: Response) => {
    try {
        const rows = await conn.query(
            `
            SELECT t.iuserId AS userId, u.vcfirstname, u.vclastname, u.vcemail,
                   SUM(t.amount) AS totalSpent, COUNT(*) AS orders
            FROM transactions t
            JOIN users u ON u.iIdUser = t.iuserId
            WHERE t.status = 'approved'
            GROUP BY t.iuserId
            ORDER BY totalSpent DESC
            LIMIT 10;
            `,
            { type: QueryTypes.SELECT }
        );
        res.json({ ok: true, data: rows || null });
    } catch (error) {
        console.error("Error en topCustomer:", error);
        res.status(500).json({ ok: false, message: "Error obteniendo top cliente" });
    }
};

export const inventoryByBrand = async (req: Request, res: Response) => {
    try {
        const rows = await conn.query(
            `
            SELECT 
                p.iFIdCompany AS companyId,
                COALESCE(c.vcname, 'Sin marca') AS companyName,
                p.iIdProduct      AS productId,
                p.vcname          AS productName,
                COALESCE(p.istock, 0)   AS stock,
                COALESCE(p.decprice3, 0)   AS unitPrice,
                COALESCE(p.istock, 0) * COALESCE(p.decprice3, 0) AS totalValue
            FROM products p
            LEFT JOIN companies c ON c.iIdCompany = p.iFIdCompany
            ORDER BY companyName, productName;
            `,
            { type: QueryTypes.SELECT }
        );

        type Row = {
            companyId: string | null;
            companyName: string;
            productId: string;
            productName: string;
            stock: any;
            unitPrice: any;
            totalValue: any;
        };

        const map = new Map<
            string,
            {
                companyId: string | null;
                companyName: string;
                stockTotal: number;
                productsCount: number;
                inventoryValue: number;
                products: {
                    productId: string;
                    productName: string;
                    stock: number;
                    unitPrice: number;
                    totalValue: number;
                }[];
            }
        >();

        (rows as Row[]).forEach((r, idx) => {
            const key = r.companyId || "no-brand";

            if (!map.has(key)) {
                map.set(key, {
                    companyId: r.companyId,
                    companyName: r.companyName,
                    stockTotal: 0,
                    productsCount: 0,
                    inventoryValue: 0,
                    products: [],
                });
            }

            const brand = map.get(key)!;

            const stockNum = Number(r.stock ?? 0);
            const unitPriceNum = Number(r.unitPrice ?? 0);
            const totalValueNum = Number(r.totalValue ?? 0);

            if (!Number.isFinite(totalValueNum)) {
                console.warn("[inventoryByBrand] totalValue inválido", {
                    idx,
                    companyId: r.companyId,
                    productId: r.productId,
                    rawTotalValue: r.totalValue,
                });
            }

            brand.products.push({
                productId: r.productId,
                productName: r.productName,
                stock: Number.isFinite(stockNum) ? stockNum : 0,
                unitPrice: Number.isFinite(unitPriceNum) ? unitPriceNum : 0,
                totalValue: Number.isFinite(totalValueNum) ? totalValueNum : 0,
            });

            brand.stockTotal += Number.isFinite(stockNum) ? stockNum : 0;
            brand.productsCount += 1;
            brand.inventoryValue += Number.isFinite(totalValueNum) ? totalValueNum : 0;
        });

        const result = Array.from(map.values()).sort(
            (a, b) => b.inventoryValue - a.inventoryValue
        );

        res.json({ ok: true, data: result });
    } catch (error) {
        console.error("Error en inventoryByBrand:", error);
        res.status(500).json({
            ok: false,
            message: "Error obteniendo inventario por marca",
        });
    }
};

