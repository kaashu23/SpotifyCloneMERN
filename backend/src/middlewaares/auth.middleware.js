const jwt = require('jsonwebtoken');

async function authArtist(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized - No token provided"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "artist") {
            return res.status(403).json({
                message: "You Dont Have Access"
            })
        }

        req.user = decoded;
        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Unauthorized - Invalid token"
        })
    }
}

async function authUser(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized - No token provided"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Unauthorized - Invalid token"
        })
    }
}

module.exports = { authArtist, authUser }