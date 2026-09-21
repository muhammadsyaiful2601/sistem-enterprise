const productModel = require('../models/productModel');

//get ambil product
async function index(req, res) {
    try {

    }catch (error){
        res.status(500).json({ message: error.message });
    }
}