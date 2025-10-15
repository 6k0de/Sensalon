import { api } from "../../utils/axiosClients";

export const UpdateUsers = async (formData: FormData) => {
  const resultado = await api.put(
    "/updateuser",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return resultado.data;
};
