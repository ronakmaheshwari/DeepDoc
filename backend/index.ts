import express from "express"
import morgan from "morgan"
import dotenv from "dotenv"
import cors from "cors"
import router from "./routes"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(morgan("dev"))
app.use(cors())
app.use("/api/v1",router);

app.listen(port,()=>{
    console.log(`DeepDoc is running on http://localhost:${port}/api/v1/`)
})