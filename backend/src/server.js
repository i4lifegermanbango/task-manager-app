    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');

    const app = express();
    const PORT = process.env.PORT || 5000;
    const connectDB = require('./config/db');
    const tasksRoutes = require('./routes/tasks.routes');

    app.use(cors());
    app.use(express.json());

    connectDB();    

    app.use('/api', tasksRoutes);

    app.get('/', (req, res ) =>{
        res.send('¡Servidor ha fucnionado!');   
    });

    app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`); 
    });