import { getConnection } from "./../database/database";
import fs from "fs";

const getProductos = async(req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query(
            "SELECT producto.id, producto.nombre, producto.precio, producto.imagen, " +
            "marca.marca AS marca, producto.fecha_creacion, producto.fecha_modificacion " +
            "FROM producto " +
            "JOIN marca ON producto.id_marca = marca.id"
        ); // dejo sin mostrar imagen_blob
        //res.json(result);
        res.render('productos', { productos: result }); // renderiza la vista
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
}

const createProducto = async (req, resp) => { // INSERTAR PRODUCTO
    try {
        console.log("se mete")
        const { nombre, precio, id_marca } = req.body;
        const { file } = req;

        // comprueba que se introducen todos los datos
        if (nombre == undefined || precio == undefined || id_marca == undefined || file == undefined) {
            return resp.status(400).json({ message: "Falta por insertar algún dato" });
        }

        const fechaActual = new Date();
        const fecha_creacion = fechaActual;
        const fecha_modificacion = fechaActual;

        const imagen = file.originalname; // nombre de la imagen
        const imagen_blob = fs.readFileSync(file.path);

        console.log(imagen_blob)

        const producto = { nombre, precio, id_marca, imagen, imagen_blob, fecha_creacion, fecha_modificacion };
        const connection = await getConnection();

        await connection.query("INSERT INTO producto SET ?", producto);
        resp.json({ message: "Producto añadido correctamente" });
    } catch (error) {
        resp.status(500);
        resp.send(error.message);
    }
};

const getProducto = async(req, res) => { //obtiene un producto por ID
    try {
        const { id } = req.params;
        const connection = await getConnection();
        const result = await connection.query(
            "SELECT producto.id, producto.nombre, producto.precio, producto.imagen, " +
            "marca.marca AS marca, producto.fecha_creacion, producto.fecha_modificacion " +
            "FROM producto " +
            "JOIN marca ON producto.id_marca = marca.id " + 
            "WHERE producto.id = ?", id
            );
        //res.json(result);
        res.render('productos', { productos: result , id: id });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const deleteProducto = async (req, res) => { // ELIMINAR PRODUCTO POR ID
    try {
        const { id } = req.params;
        const connection = await getConnection();
        await connection.query("DELETE FROM producto WHERE id = ?", id);
        res.json({ message: "Producto con id " + id + " eliminado correctamente" });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const updateProducto = async (req, res) => { // EDITAR PRODUCTO POR ID
    try {
        const { id } = req.params;
        const { nombre, precio, id_marca } = req.body;
        if (id_marca == undefined || nombre == undefined || precio == undefined) {
            res.status(400).json({ message: "Falta por insertar algún dato" });
            return;
        }
        const fecha_modificacion = new Date();
        const producto = { id, nombre, precio, id_marca, fecha_modificacion };
        const connection = await getConnection();
        await connection.query("UPDATE producto SET ? WHERE id = ?", [producto, id]);
        res.json(producto);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const getProductosOrdenados = async (req, res) => { // ORDENA POR CRITERIO
    try {
        const { criterio } = req.params; // Parámetro que indica el criterio de orden
        const connection = await getConnection();
        if (criterio != "nombre" && criterio != "precio") { 
            return res.status(400).json({ message: "El criterio insertado no es válido. Se puede ordenar por nombre ó precio" });
        }
        
        const result = await connection.query(            
        "SELECT producto.id, producto.nombre, producto.precio, producto.imagen, " +
        "marca.marca AS marca, producto.fecha_creacion, producto.fecha_modificacion " +
        "FROM producto " +
        "JOIN marca ON producto.id_marca = marca.id " + 
        "ORDER BY " + criterio);
    
        //res.json(result);
        res.render('productos', { productos: result });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const getProductosPorMarca = async (req, resp) => {
    try {
        const { marca } = req.params;
        const connection = await getConnection();
        const result = await connection.query("SELECT id, nombre, precio, fecha_creacion, fecha_modificacion, imagen FROM producto WHERE id_marca = (SELECT id FROM marca WHERE marca = ?)", [marca]);

        //resp.json(result);
        resp.render('productos', { productos: result, marca: marca });
    } catch (error) {
        resp.status(500);
        resp.send(error.message);
    }
};

const getImagen = async (req, resp) => { // OBTENER LA IMAGEN DEL PRODUCTO
    try {
        const { id } = req.params;

        const connection = await getConnection();
        const result = await connection.query("SELECT imagen_blob FROM producto WHERE id = ?", id);
        console.dir(result, { depth: null });
        if (result == null) {
            resp.status(404).json({ message: 'Imagen no encontrada' });
            return;
        }
        const binario = result[0].imagen_blob;
        const img_binario = Buffer.from(binario).toString('base64');
        resp.writeHead(200, { 'Content-Type': 'image/jpeg' });
        resp.end(img_binario, 'base64');
    } catch (error) {
        resp.status(500);
        resp.send(error.message);
    }
};

export const methods = {
    createProducto,
    getProductos,
    getProducto,
    getProductosOrdenados,
    deleteProducto,
    updateProducto,
    getProductosPorMarca,
    getImagen
};