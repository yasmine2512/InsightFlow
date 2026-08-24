import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        organization:{
            type:mongoose.Schema.Types.ObjectId ,
            ref : "User",
            required: true},
        name: {type:String , required: true},
        url: {type:String , required: true},
        publicId: {type: String,required: true},
        size: {type: Number,required: true},
        ragStatus: {type: String,
        enum: ["pending", "processing", "ready", "failed"],default: "pending",},
        ragError: {type: String}
    },
    {
        timestamps: true,
    }
);
const File = mongoose.model("File",fileSchema);
export default File