const Router = require('express').Router();

function storeBackURL(req, res, next) {
    req.session.backURL = req.originalUrl;
    next();
}

Router.get('/', storeBackURL, (req, res) => {
    res.render('landing');
});

module.exports = Router;