import { DataTypes, Model, Optional } from "sequelize";
import { SliderImage } from "../../interfaces/SliderImage";
import conn from "../config/config";

interface SliderImageCreation extends Optional<SliderImage, "iIdSliderImage"> {}

export const SliderImageModel = conn.define<
  Model<SliderImage, SliderImageCreation>
>(
  "sliderimage",
  {
    iIdSliderImage: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: true,
      primaryKey: true,
    },
    vcurl_img: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    vcorden: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    dtCreated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sliderimage",
    timestamps: false,
  },
);
