const pool = require('../DB_Config/Config');
const {cloudinary} = require('../Cloudinary/cloudinary');
const fs = require('fs');
const { log } = require('console');

module.exports.uploadDocs = async (req, res, next) => {
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
            response_url : uploadResponse.url,
            name: req.file.name
        }

        return res.status(201).json({object});


    } catch (error) {
       next(error);
    }
}

module.exports.myDocs = (req, res) => {

    //Save upload response to the db
    query = {
        text: 'INSERT INTO product (name, description, category_id, picture_url, quantity) VALUES ($1,$2,$3,$4, $5)',
        value: [req.body.name, req.body.description, req.body.category_id, req.body.picture_url, req.body.quantity]
    }
 
    // DB query
    pool.query(query.text, query.value)
        .then(data => {
            if (data.rowCount > 0) 
            {
                //response
                return res.status(201).json('Successfully uploaded the product');

            } else { res.status(400).json('Product upload failed') }
        })
        .catch(err => {
            let error = queryErrorHandler(err);
            return res.status(400).json({error: 'Server error! Failed to upload product'});
        });

}