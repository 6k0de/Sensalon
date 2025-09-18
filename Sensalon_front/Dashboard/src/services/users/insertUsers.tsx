import axios from "axios";

export const InsertUsers = async (formData: FormData) => {
  console.log(formData);
  const resultado = await axios.post(
    "http://localhost:3000/api/createuser",
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
