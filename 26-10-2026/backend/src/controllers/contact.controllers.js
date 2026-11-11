
const ContactModel = require('../models/contact.model');

// POST CONTACT
const postContact = async (req, res) => {
    try {

        const saved = new ContactModel(req.body);

        await saved.save();

        res.status(201).json({
            message: "Feedback submitted successfully",
            data: saved
        });

    } catch (err) {

        console.error("Error in contact form:", err);

        res.status(500).json({
            message: err.message
        });
    }
};


// GET CONTACT
const getContact = async (req, res) => {
    try {

        const display = await ContactModel.find().sort({ _id: -1 });

        res.status(200).json({
            data: display
        });

    } catch (err) {

        console.error("Error in get feedback:", err);

        res.status(500).json({
            message: "Error retrieving feedback"
        });
    }
};


// DELETE CONTACT
const deleteContact = async (req, res) => {
    try {

        const deleted = await ContactModel.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        res.status(200).json({
            message: "Feedback deleted successfully"
        });

    } catch (err) {

        console.error("Error deleting feedback:", err);

        res.status(500).json({
            message: err.message
        });
    }
};


module.exports = {
    postContact,
    getContact,
    deleteContact
};
