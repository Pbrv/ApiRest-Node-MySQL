import express from "express";
import morgan from "morgan";
// import fileUpload from "express-fileupload";
import ejs from "ejs";
import path from "path";

// Routes
import productoRoutes from "./routes/producto.routes";

const app = express();

// Settings
app.set("port", 4000);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/productos", productoRoutes);
// app.use(fileUpload());

export default app;