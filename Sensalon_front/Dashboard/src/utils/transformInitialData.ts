import { formData } from "../interfaces/formData";

export const transformToFormData = (raw: any): formData => {
  console.log(raw)
  const base: formData = {
    role: raw.role || raw.vctyperole || "",
    iIdRole: raw.iIdRole || "",
    nombres: raw.nombres || "",
    apellidos: raw.apellidos || "",
    username: raw.username || "",
    email: raw.email || "",
    password: raw.password || "",
    confirmPassword: raw.confirmPassword || raw.password || "",
  };

  if (raw.role === "Salón") {
    base.salonData = {
      nombreSalon: raw.nombreSalon || "",
      telefono: raw.telefono || "",
      correo: raw.correo || "",
      direccion: raw.direccion || "",
      horaApertura: raw.horaApertura || "",
      horaCierre: raw.horaCierre || "",
      serviciosOfrecidos: raw.serviciosOfrecidos || "",
      logoSalon: raw.logoSalon || "",
    };
  }

  if (raw.role === "Distribuidor") {
    base.distributorData = {
      nombres: raw.nombres || "",
      apellidos: raw.apellidos || "",
      telefono: raw.telefono || "",
      correo: raw.correo || "",
      pais: raw.pais || "",
      estado: raw.estado || "",
      ciudad: raw.ciudad || "",
      codigoPostal: raw.codigoPostal || "",
      direccion: raw.direccion || "",
      rfc: raw.rfc || "",
      constanciaFiscal: raw.constanciaFiscal || undefined,
      empresasRelacionadas:
        raw.empresasRelacionadas ??
        (raw.companies_ids_array
          ? JSON.stringify({
              Empresas: raw.companies_ids_array.map((id: string) => ({
                idEmpresa: id,
              })),
            })
          : JSON.stringify({ Empresas: [] })),
    };
  }

  return base;
};
