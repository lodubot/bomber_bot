import { Schema, model } from "mongoose";
const historySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    msgCount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const historyModel = model("History", historySchema);
export default historyModel;