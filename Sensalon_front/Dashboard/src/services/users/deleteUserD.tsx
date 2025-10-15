import { api } from "../../utils/axiosClients";

export const deleteUserDistributor = async (id: string) => {
  return (
    await api.delete(`/deleteuserdistributor/${id}`)
  ).data;
};
