import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema({
  fileId: {type: mongoose.Schema.Types.ObjectId,ref: "File",required: true},
  filename: String,
  organization: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
  content: String,
  embedding: [Number],
  chunkIndex: Number,
});

const DocumentChunk = mongoose.model("Document_Chunk", documentChunkSchema);
export default DocumentChunk;