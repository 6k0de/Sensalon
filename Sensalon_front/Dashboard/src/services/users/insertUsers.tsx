import { api } from "../../utils/axiosClients";

export const InsertUsers = async (formData: FormData) => {
  console.log(formData);
  const resultado = await api.post(
    "/createuser",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  console.log("hol");
  return resultado.data;
};
