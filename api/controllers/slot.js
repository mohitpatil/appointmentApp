const { Appointment, Slot } = model;

const slotController = {
    all(req, res) {
        Slot.find({})
        .exec((err, slots) => res.json(slots))
    }
};

module.exports = slotController;