const express = require('express');
const cors = require('cors');
const charmRoutes = require('./routes/charmRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const braceletRoutes = require('./routes/braceletRoutes');
const orderRoutes = require('./routes/orderRoutes');
const proxyRoutes = require('./routes/proxyRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/charms', charmRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bracelets', braceletRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/proxy', proxyRoutes);

app.get('/', (req, res) => {
    res.send('Charm Bracelet API is running...');
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
