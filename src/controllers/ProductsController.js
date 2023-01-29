import connectionDB from "../configs/database/connectDB"

let getAllProducts = async (req, res) => {
    //http
    // 404 501
    // json/xml => object
    const [rows, fields] = await connectionDB.execute('SELECT * FROM product');

    return res.status(200).json({
        message: 'ok',
        data: rows
    })
}

let createNewProduct = async (req, res) => {
    let { name, quantity, unit, price, description } = req.body;

    if (!name || !quantity || !unit || !price) {
        return res.status(400).json({
            message: 'missing required params'
        })
    }

    const now = new Date();
    await connectionDB.execute('INSERT INTO product(name, quantity, unit, price, description, created_at,update_at,	created_by,	updated_by) values (?, ?, ?, ?, ?, ?,?,?,?)',
        [name, quantity, unit, price, description ?? "", now, now]);

    return res.status(200).json({
        message: 'ok'
    })
}

let updateProduct = async (req, res) => {
    let { firstName, lastName, email, address, id } = req.body;
    if (!firstName || !lastName || !email || !address || !id) {
        return res.status(200).json({
            message: 'missing required params'
        })
    }

    await connectionDB.execute('update product set firstName= ?, lastName = ? , email = ? , address= ? where id = ?',
        [firstName, lastName, email, address, id]);

    return res.status(200).json({
        message: 'ok'
    })
}

let deleteProduct = async (req, res) => {
    let userId = req.params.id;
    if (!userId) {
        return res.status(200).json({
            message: 'missing required params'
        })
    }
    await connectionDB.execute('delete from product where id = ?', [userId])
    return res.status(200).json({
        message: 'ok'
    })
}

module.exports = {
    getAllProducts, createNewProduct, updateProduct, deleteProduct
}