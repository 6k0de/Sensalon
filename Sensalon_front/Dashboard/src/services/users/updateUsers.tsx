import axios from "axios";

export const UpdateUsers = async (formData: FormData) => {
  const resultado = await axios.put(
    "http://localhost:3000/api/updateuser",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return resultado.data;
};
