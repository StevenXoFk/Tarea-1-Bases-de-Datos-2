const express = require("express");
const router = express.Router();
const { poolPromise, sql } = require("../config/database.js");

router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute("sp_GetAllProducts");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
})

router.get("/with-category", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute("sp_GetProductWithCategory");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
})

router.post("/", async (req, res) => {
    try {
        const { name, productNumber, color, standardCost, listPrice, subcategoryID } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input("Name", sql.NVarChar, name)
            .input("ProductNumber", sql.NVarChar, productNumber)
            .input("Color", sql.NVarChar, color || null)
            .input("StandardCost", sql.Decimal(18, 2), standardCost)
            .input("ListPrice", sql.Decimal(18, 2), listPrice)
            .input("ProductSubcategoryID", sql.Int, subcategoryID || null)
            .execute("sp_InsertProduct");
        res.json({ message: "Producto insertado correctamente", productId: result.recordset[0].NewProductID });
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
})

router.put("/:id", async (req, res) => {
    try {
        const { productId, name, color, standardCost, listPrice, subcategoryID } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input("ProductID", sql.Int, req.params.id)
            .input("Name", sql.NVarChar(50), name)
            .input("Color", sql.NVarChar(15), color || null)
            .input("StandardCost", sql.Decimal(18, 2), standardCost)
            .input("ListPrice", sql.Decimal(18, 2), listPrice)
            .input("ProductSubcategoryID", sql.Int, subcategoryID || null)
            .execute("sp_UpdateProduct");
        res.json({ message: "Producto actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input("ProductID", sql.Int, req.params.id)
            .execute("sp_DeleteProduct");
        res.json({ message: "Producto eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
})

module.exports = router;