const ContactModel=require('../models/contact.model')
const postContact = async (req, res) => {
    try {
        const data = {
            ...req.body
        };

    
        const saved = new ContactModel(data);

        await saved.save();

        res.status(201).json({
            message: "feeback submited",
            data: saved
        });

    } catch (err) {
        console.error("Error in contact form:", err);

        res.status(500).json({
            message: err.message
        });
    }
};
module.exports={postContact}