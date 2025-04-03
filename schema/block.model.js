import { Schema, model } from "mongoose";

const blockSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const blockModel = model("Block", blockSchema);
export default blockModel;