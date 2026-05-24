const axios = require('axios');

const proxyImage = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).send('URL is required');
        }

        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
        
        res.set('Content-Type', contentType);
        res.set('Access-Control-Allow-Origin', '*');
        res.send(response.data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Error fetching image');
    }
};

module.exports = { proxyImage };
