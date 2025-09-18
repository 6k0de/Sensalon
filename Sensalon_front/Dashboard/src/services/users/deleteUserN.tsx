import axios from "axios";

export const deleteUserNormal = async (id: string) => {
  return (await axios.delete(`http://localhost:3000/api/deleteuser/${id}`))
    .data;
};
