import { Router } from "express";
import { deleteSliderImage, getSliderImages, uploadSlider } from "../controllers/Slider/slider";
import { uploadSliderImages } from "../middlewares/upload";

export const sliderRouter = Router()

//POST Slider
sliderRouter.post("/slider", uploadSliderImages, uploadSlider);
//GET Slider
sliderRouter.get("/sliderImage", getSliderImages);
//Delete Slider
sliderRouter.delete("/sliderImage/:id", deleteSliderImage);