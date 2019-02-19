const { Appointment, Slot } = model;
const Nexmo = require("nexmo");
const Model = require('../models/index');

const appointmentController = {
    all(req, res) {
        Appointment.find({}).exec((err, appointments) => res.json(appointments));
    },
    create (req, res) {
        var requestBody = req.body;

        var newslot = new Slot ({
            slot_time = requestBody.slot_time,
            slot_date = requestBody.slot_date,
            created_at = Date.now()
        });
        newslot.save();

        var newappointment = new Appointment({
            name: requestBody.name,
            email: requestBody.email,
            phone: requestBody.phone,
            slots: newslot._id
        });

        const nexmo = new Nexmo({
            apiKey: "4c53b9b6",
            apiSecret: "cIIW3DxtbvArOhC1"
        });

        let message = "Hello" + requestBody.name + ", This is to confirm that your appointent is scheduled at "
         + requestBody.appointment;

        newappointment.save((err, saved) => {
            Appointment.find({ _id: saved._id })
            .populate("slots")
            .exec((err, appointment) => res.json(appointment));
        });
        
        const from = VIRTUAL_NUMBER;
        const to = RECIPIENT_NUMBER;

        nexmo.message.sendSms(from, to, message, (err, responseData) => {
            if(err) {
                console.log('Errors Occured while sending message');
            } else {
                console.dir(responseData);
            }
        });
    }
};

module.exports = appointmentController;
