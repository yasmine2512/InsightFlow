import mongoose from "mongoose";
import dns from "dns";
const connectDB = async () => {
  dns.setServers(process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(",")
    : ["8.8.8.8", "1.1.1.1"]
);
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;