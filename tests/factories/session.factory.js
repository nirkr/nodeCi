const Keygrip = require('keygrip');
const keys = require('../../config/keys');

module.exports = (user) => {
    const sessionObject = {
        passport: { user: user._id.toString()} //cause user._id is OBJECT itself
    };
    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const keyGrip = new Keygrip([keys.cookieKey]);
    const signedKey = keyGrip.sign("session=" + sessionString);
    return {
        session: sessionString,
        signedKey
    }
}