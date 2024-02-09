const mongoose = require('mongoose');

mongoose.set("strictQuery", false);

(async () => {
    try {
        await mongoose.connect('mongodb+srv://RohithAdmin:Pr301Cluster@cluster0.oqc9zcg.mongodb.net/BotUserData');
        console.log('Connected to the database');
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
    }
})();