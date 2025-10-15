import { api } from "../../utils/axiosClients";

export const deleteUserNormal = async (id: string) => {
  return (await api.delete(`/deleteuser/${id}`))
    .data;
};
