const express = require('express');

const User = require('../Controllers/schema/UserSchema');
const router = express.Router();

router.post('/update/user/balance', async (req, res) => {
    try {
        const { admin_pass, account_id, points } = req.body;
        if (admin_pass === process.env.admin_password) {
            const person = await User.findOne({ AccountId: account_id });
            if (person) {
                const curr_credits = person.Credits;
                let updated_credits = curr_credits + parseInt(points);
                person.Credits = updated_credits;
                await person.save();
                res.json({ status: 200, message: "Balance Updated Succefully" });
            } else {
                res.json({ status: 304, message: "AccountID doesn't Exist" });
            }
        } else {
            res.json({ status: 400, message: "Admin Password Incorrect" });
        }
    } catch (err) {
        console.log("Error in updating balace", err);
        res.json({ status: 500, message: "Internal Error" });
    }
})

module.exports = router;