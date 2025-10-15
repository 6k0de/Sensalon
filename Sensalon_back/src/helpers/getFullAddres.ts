import { ShippingAddresModel } from "../bd/models/ShippingAdd.model";

export const getFullAddress = async (direccion: any): Promise<string> => {
  try {
    // 🧩 1) Si es string: podría ser un ID o texto libre
    if (typeof direccion === "string") {
      // UUID v4 tiene formato con guiones y 36 caracteres
      const isUUID = /^[0-9a-fA-F-]{36}$/.test(direccion);

      if (isUUID) {
        const dir = await ShippingAddresModel.findOne({
          where: { iIdAddressId: direccion },
        });

        if (!dir) return "Dirección no encontrada";

        const d = dir.dataValues;
        return [
          d.vcaddress,
          d.vcinterior,
          d.vcsuburb,
          d.vczipcode,
          d.vccity,
          d.vcstate,
          d.vccountry,
          d.vcadditonalindication,
        ]
          .filter(Boolean)
          .join(", ");
      } else {
        // Si es texto libre, se devuelve como está
        return direccion;
      }
    }

    // 🧩 2) Si es un objeto (por ejemplo, obtenido desde el frontend)
    if (typeof direccion === "object" && direccion !== null) {
      return [
        direccion.vcaddress || direccion.address,
        direccion.vcinterior || direccion.interior,
        direccion.vcsuburb || direccion.suburb,
        direccion.vczipcode || direccion.zipcode,
        direccion.vccity || direccion.city,
        direccion.vcstate || direccion.state,
        direccion.vccountry || direccion.country,
        direccion.vcadditonalindication || direccion.additonal,
      ]
        .filter(Boolean)
        .join(", ");
    }

    // 🧩 3) Si no cumple ninguna condición
    return "Sin dirección registrada";
  } catch (error) {
    console.error("❌ Error en getDireccionCompleta:", error);
    return "Error al obtener la dirección";
  }
};