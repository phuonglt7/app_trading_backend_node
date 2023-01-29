const crypto = require('crypto')

const hasPassword = (password) => {
    return password ? crypto.createHash('md5').update(password).digest("hex") : ""
}

module.exports = {
    hasPassword
}