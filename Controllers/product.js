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
        console.log(error);
       next(error);
    }
}

module.exports.createProduct = (req, res) => {

    //Save upload response to the db
    query = {
        text: 'INSERT INTO product (name, description, price, quantity, category_id, picture_url) VALUES ($1,$2,$3,$4, $5, $6)',
        value: [req.body.name, req.body.description, req.body.price, req.body.quantity, req.body.category_id, req.body.picture_url]
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

    console.log("Shiba");
    console.log(req.params);

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