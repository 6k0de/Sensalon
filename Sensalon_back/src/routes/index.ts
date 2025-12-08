import { Router } from "express";

// Subrouters (tus archivos existentes)
import { archivosRouter } from "./archivos";
import { authRoute } from "./auth";
import { cartRouter } from "./carts";
import { cashbackRouter } from "./cashback";
import { categoriesRoute } from "./categories";
import { companiesRouter } from "./companies";
import { creditsRouter } from "./credits";
import { productsRoute } from "./products";
import { roleRouter } from "./roles";
import { servicesRouter } from "./services";
import { shippingRouter } from "./shipping";
import { sliderRouter } from "./slider";
import { suppliersRouter } from "./suppliers";
import { transactionsRouter } from "./transactions";
import { usersRouter } from "./users";
import { warehouseRouter } from "./warehouse";
import { discountCodeRouter } from "./discountcode";

export const mainRouter = Router();

// Middleware de headers (global para todas las rutas /api)
mainRouter.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// Monta todos los subrouters (mantienes los mismos paths internos)
mainRouter.use(archivosRouter);
mainRouter.use(authRoute);
mainRouter.use(cartRouter);
mainRouter.use(cashbackRouter);
mainRouter.use(categoriesRoute);
mainRouter.use(companiesRouter);
mainRouter.use(creditsRouter);
mainRouter.use(productsRoute);
mainRouter.use(roleRouter);
mainRouter.use(servicesRouter);
mainRouter.use(shippingRouter);
mainRouter.use(sliderRouter);
mainRouter.use(suppliersRouter);
mainRouter.use(transactionsRouter);
mainRouter.use(usersRouter);
mainRouter.use(warehouseRouter)
mainRouter.use(discountCodeRouter)
