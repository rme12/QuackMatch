
//import abcRoutes from './abc.js';
//import xyzRoutes from './xyz.js';

const constructorMethod = (app) => {
  //app.use('/abc', abcRoutes);
  //app.use('/xyz', xyzRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({error: 'Route Not found'});
  });
};

export default constructorMethod;