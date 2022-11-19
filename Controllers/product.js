const pool = require('../DB_Config/Config');
const {cloudinary} = require('../Cloudinary/cloudinary');
const fs = require('fs');

module.exports.uploadPictureToCloudinary = async (req, res, next) => {
    console.log(req.file);
    try {
        var  product_url;
        if (req.file) {
            if(req.file.size > 10485760){
                return res.status(400).send({msg:"size too large"});
            }
            if(!req.file.mimetype === 'image/jpeg' || !req.file.mimetype === '	image/ief' ){
                return res.status(400).send({msg:"wrong file format, expected jpeg/jpg"});
            }

             product_url = req.file.path ? req.file.path : "";
    
        }
        const uploadResponse = await cloudinary.uploader.upload(product_url, {
            folder: 'products',
            resource_type: 'auto',
            use_filename: true
        });

        const path = product_url;
        fs.unlinkSync(path);
        //take cloudinary response and get url set cert_url to cloudinary url

        let object = {
            picture_url : uploadResponse.url,
            name: req.file.originalname
        }

        return res.status(201).json(object);


    } catch (error) {
        console.log("This error:",error);
       next(error);
    }
}

module.exports.createProduct = (req, res) => {
    //Save upload response to the db
    query = {
        text: 'INSERT INTO product (name, description, price, quantity, category_id, shop_id, picture_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        value: [req.body.name, req.body.description, req.body.price, req.body.quantity, req.body.category_id, req.body.shop_id, req.body.picture_url]
    }
    
    // DB query
    pool.query(query.text, query.value)
        .then(data => {
            if (data.rowCount > 0) 
            {
                //response
                return res.status(201).json(`Successfully added ${req.body.name}!`);

            } else { res.status(400).json('Product upload failed') }
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({error: 'Server error! Failed to upload product'});
        });

}

module.exports.getProducts = (req, res) => {

    let query = {
        text: 'select * from product where category_id = $1',
        value: [req.params.category_id]
    }

    if (req.params.category_id === undefined) {
        return res.status(400).json({message: 'Category cannot be empty! Please enter a category'});
    } else {
        pool.query(query.text, query.value).then((response => {
            if (response.rowCount > 0) {
                return res.status(200).json(response.rows)
            } else {
                return res.status(404).json({ message: 'No products found' });
            }
        })).catch((err) => {
            console.log(err);
            return res.status(400).json({ message: 'Server error' });
        });
    }
}

module.exports.getAllProducts = (req, res) => {

    let query = {
        text: 'select * from product'
    }

    pool.query(query.text).then((response => {
        if (response.rowCount > 0) {
            return res.status(200).json(response.rows)
        } else {
            return res.status(401).json({ message: 'No products found' });
        }
    })).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Server error' });
    });
}

module.exports.getAllProductsOfAShop = (req, res) => {

    let query = {
        text: 'select * from product where category_id IN (select unnest(category_id) from shop where id = $1)',
        value: [req.params.shop_id]
    }

    pool.query(query.text, query.value).then((response => {
        console.log(response);
        if (response.rowCount > 0) {
            return res.status(200).json(response.rows)
        } else {
            return res.status(400).json({ message: 'No products found' });
        }
    })).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Server error' });
    });
}

module.exports.getOneProduct = (req, res) => {

    let query = {
        text: `select product.id, 
        product.name AS product, 
        product.description, 
        product.price, 
        product.quantity, 
        product.category_id,
        product.shop_id,
        product.picture_url,
        shop.name AS shop
        from product, shop 
        WHERE product.shop_id = shop.id 
        AND product.id = $1 `,
        value: [req.body.product_id]
    }

    let cheaperQuery = {
        text: `select product.id, 
        product.name AS product_name, 
        product.description, 
        product.price, 
        product.quantity, 
        product.category_id,
        product.shop_id,
        product.picture_url,
        shop.name AS shop_name
        from product, shop 
        WHERE product.shop_id = shop.id 
        AND product.shop_id != $1 
        AND product.category_id = $2`,
        value: [req.body.shop_id, req.body.category_id]
    }

    pool.query(query.text, query.value).then((response) => {
        console.log("response", response.rows);

        if (response.rowCount > 0) {
            pool.query(cheaperQuery.text, cheaperQuery.value).then((result) => {
                console.log("result", result.rows);
                let object = {
                    id: response.rows[0].id,
                    name: response.rows[0].product,
                    description: response.rows[0].description,
                    price: response.rows[0].price,
                    picture_url: response.rows[0].picture_url,
                    quantity_left: response.rows[0].quantity,
                    category_id: response.rows[0].category_id,
                    shop: response.rows[0].shop,
                    cheaperProduct: {
                        id: result.rows[0].id,
                        name: result.rows[0].product_name, 
                        description: result.rows[0].description, 
                        price: result.rows[0].price,
                        quantity_left: result.rows[0].quantity,
                        picture_url: result.rows[0].picture_url,
                        category_id: result.rows[0].category_id,
                        shop_name: result.rows[0].shop_name
                    }
                }

                return res.status(201).json(object);
                
            }).catch((err) => {
                console.log(err);
                return res.status(400).json({ message: 'Cheaper -Server error' });
            });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ message: 'Server error' });
    });

}