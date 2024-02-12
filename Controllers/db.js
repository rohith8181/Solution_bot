const mongoose = require('mongoose');

mongoose.set("strictQuery", false);

(async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to the database');
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
    }
})();