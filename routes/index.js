// routes/index.js
import { Router } from 'express';
import characterRoutes from './characters.js';

const constructorMethod = (app) => {
    app.use('/', characterRoutes);

    // Handle 404
    app.use('*', (req, res) => {
        res.status(404).render('error', { error: 'Page not found' });
    });
};

export default constructorMethod;
