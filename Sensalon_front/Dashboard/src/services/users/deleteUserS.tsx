import { api } from "../../utils/axiosClients";

export const deleteUserSalon = async (id: string) => {
  return (await api.delete(`/deleteusersalon/${id}`))
    .data;
};
