import { Router } from "express";
import { methods as productoController } from "./../controllers/producto.controller";
import upload from "../multerConfig";

const router = Router();

router.post("/", upload.single('imagen'), productoController.createProducto);

router.get("/", productoController.getProductos);
router.get("/:id", productoController.getProducto);
router.get("/ordenar/:criterio", productoController.getProductosOrdenados);
router.get("/marcas/:marca?", productoController.getProductosPorMarca);
router.get("/imagen/:id", productoController.getImagen);

router.delete("/:id", productoController.deleteProducto);
router.put("/:id", productoController.updateProducto);

export default router;