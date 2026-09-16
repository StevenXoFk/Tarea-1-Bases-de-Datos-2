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

module.exports = router;