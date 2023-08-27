const cloudnairy = require('cloudinary');


cloudnairy.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});



const cloudnairyUploadImg = async (fileToUploads) => {
    return new Promise((resolve) => {
        cloudnairy.uploader.upload(fileToUploads, (result) => {
            resolve({
                url: result.secure_url,
            }, {
                resource_type: "auto",
            })
        })
    })
}

module.exports = cloudnairyUploadImg;