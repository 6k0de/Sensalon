import axios from "axios";

export const deleteUserDistributor = async (id: string) => {
  return (
    await axios.delete(`http://localhost:3000/api/deleteuserdistributor/${id}`)
  ).data;
};
