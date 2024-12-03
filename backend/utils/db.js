import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Kết nối thành công")
    } catch (error) {
        console.log(error)
    }
}
export default connectDB