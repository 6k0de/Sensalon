import { Router } from "express";
import { CreateUser, deleteUsers, deleteUsersDistributor, deleteUsersSalon, getAllDistributors, getAllSalons, getAllUsersN, getOrdersByUserdId, getProductsByUserId, UpdateUser } from "../controllers/Users/Users";
import { uploadFiles } from "../middlewares/upload";

export const usersRouter = Router()

//GET Users
usersRouter.get("/distributors", getAllDistributors);
usersRouter.get("/salons", getAllSalons);
usersRouter.get("/usersn", getAllUsersN);
usersRouter.get("/products/:id", getProductsByUserId);
//router.get('/usuarios', getAllUsers)

//POST Users
usersRouter.post("/createuser", uploadFiles, CreateUser);
//PUT Users
usersRouter.put("/updateuser", uploadFiles, UpdateUser);
//Delete Users
usersRouter.delete("/deleteuser/:id", deleteUsers);
usersRouter.delete("/deleteusersalon/:id", deleteUsersSalon);
usersRouter.delete("/deleteuserdistributor/:id", deleteUsersDistributor);

//GET Users Orders
usersRouter.get('/orders/:id', getOrdersByUserdId)