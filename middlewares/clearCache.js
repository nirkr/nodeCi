const {removeCache} = require('../services/cache.service');

const clearCache = async (req, res, next) => {
    await next();

    return removeCache(req.user.id);
}

module.exports = clearCache;