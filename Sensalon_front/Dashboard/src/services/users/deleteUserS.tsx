import axios from "axios";

export const deleteUserSalon = async (id: string) => {
  return (await axios.delete(`http://localhost:3000/api/deleteusersalon/${id}`))
    .data;
};
