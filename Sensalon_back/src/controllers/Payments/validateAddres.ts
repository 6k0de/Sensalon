import { ShippingAddresModel } from "../../bd/models/ShippingAdd.model";


export const validateOrCreateShipping = async (shipping: any, idUser: string) => {
  let finalShippingAddressId;
  console.log({shipping, idUser}, typeof shipping)
  // Caso: shipping es un ID de dirección
  if (typeof shipping === 'string') {
    const existingAddress = await ShippingAddresModel.findOne({
      where: { iIdAddressId: shipping, iIFIdUser: idUser },
    });
    console.log()
    if (!existingAddress) {
      throw new Error('La dirección seleccionada no existe o no pertenece al usuario');
    }
    finalShippingAddressId = existingAddress.getDataValue('iIdAddressId');
  }

  // Caso: shipping es un objeto con idShippingAddress
  else if (typeof shipping === 'object' && 'idShippingAddress' in shipping) {
    const existingAddress = await ShippingAddresModel.findOne({
      where: { iIdAddressId: shipping.idShippingAddress, iIFIdUser: idUser },
    });
    if (!existingAddress) {
      throw new Error('La dirección seleccionada no existe o no pertenece al usuario');
    }
    finalShippingAddressId = existingAddress.getDataValue('iIdAddressId');
  }

  // Caso: shipping es un objeto de dirección completo
  else if (typeof shipping === 'object' && shipping !== null) {
    const mappedShipping = {
      vccountry: shipping.country,
      vcfirstname: shipping.name,
      vclastname: shipping.lastname,
      vcaddress: shipping.address,
      vcsuburb: shipping.suburb,
      vcinterior: shipping.interior,
      vczipcode: shipping.zipcode,
      vccity: shipping.city,
      vcstate: shipping.state,
      vcphone: shipping.phone,
      vcadditonalindication: shipping.additonal,
      iIFIdUser: idUser,
    };

    // Validar campos mínimos
    if (!mappedShipping.vccountry || !mappedShipping.vcfirstname || !mappedShipping.vczipcode) {
      throw new Error('La dirección proporcionada no está completa');
    }

    // Buscar si ya existe una dirección igual
    const existingAddress = await ShippingAddresModel.findOne({ where: mappedShipping });
    if (existingAddress) {
      finalShippingAddressId = existingAddress.getDataValue('iIdAddressId');
    } else {
      const createdAddress = await ShippingAddresModel.create(mappedShipping);
      finalShippingAddressId = createdAddress.getDataValue('iIdAddressId');
    }
  }

  // Caso inválido
  else {
    throw new Error('Debe proporcionar un ID de dirección válido o una dirección completa');
  }

  return finalShippingAddressId;
};
