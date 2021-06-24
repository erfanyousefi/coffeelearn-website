const autoBind = require("auto-bind");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const fs = require("fs")
const xss = require("xss")
const path = require("path")
const mongoose = require("mongoose")
module.exports = class controllers {
    constructor() {
        autoBind(this);
    }
    verifyRecaptcha(req) {}
    back(req, res) {
        res.redirect(req.headers.referer)
    }
    hashString(string) {
        const randomNumber = 15;
        const salt = bcrypt.genSaltSync(randomNumber);
        const hashString = bcrypt.hashSync(string, salt);
        return hashString;
    }
    compareHashString(string, hashedString) {
        const result = bcrypt.compareSync(string, hashedString);
        return result
    }
    errorHandlerValidator(errors, errorList) {
        Object.values(errors).forEach(err => {
            errorList[err.param] = err.msg;
        })
    }
    fetchDataFromBody(body, data) {
        Object.keys(body).forEach((key) => {
            if (body[key]) {
                data[key] = this.xssAttak(body[key]);
            }
            if (!data[key]) {
                delete data[key]
            }
        })
        if (data.tags) {
            data.tags = data.tags.split(",")
        }
    }
    async jwtGenerator(user, dayExpire) {
        let jwtToken = await jwt.sign({
            user
        }, process.env.jwtSecret, {
            expiresIn: 60 * 60 * 24 * dayExpire
        });
        return jwtToken;
    }
    async jwtVerify(jwtToken) {
        let decode = await jwt.verify(jwtToken, process.env.jwtSecret);
        let expire = decode.exp - decode.iat
        if (expire <= 0) {
            return false;
        } else {
            return true
        }
    }
    fetchBearer(req) {
        const bearer = req.headers.authorization || req.headers['authorization'];
        if (bearer) {
            let token = bearer.split(" ")[1]
            return token
        } else {
            return null
        }

    }
    setCookie(res, jwtValue, expireDay) {
        const expires = (new Date(Date.now() + (1000 * 60 * 60 * 24 * expireDay)));
        res.cookie("userRemember", jwtValue, {
            expires,
            httpOnly: true,
            signed: true
        });
    }
    xssAttak(data) {
            return xss(data, {
                css: false,
                whiteList: [],
                stripIgnoreTag: true,
                stripIgnoreTagBody: ['script']
            }).trim(); //delete every (html, css, script) tags and code on input data and trim all
        }
        /**
         * 
         * @param {*} url you enter directory address for remove the file in ./public/upload/... <=Add Dir 
         */
    async removeFile(url) {
        let dir = path.resolve(`./public/${url}`);
        if (fs.existsSync(dir)) {
            await fs.unlinkSync(dir);
        }
    }
    async systemLogError(errorMsg, req, sectionOfApp) {
            const pathFile = path.resolve("./public/logs/error.log");
            const user = req.user.name || req.user.username
            const userID = req.user._id
            const now = new Date().toLocaleString("fa")
            if (fs.existsSync(pathFile)) {
                const datafile = fs.readFileSync(pathFile)
                let datafileString = datafile.toString();
                // let oldData = str.split("<EndLine>");
                datafileString += `${errorMsg} - ${now} - user : ${user} - userID : ${userID} - section : ${sectionOfApp} - <EndLine>\n`
                fs.writeFileSync(pathFile, datafileString)
            } else {
                fs.writeFileSync(pathFile, `${errorMsg} - ${now} - user : ${user} - userID : ${userID} - section : ${sectionOfApp} - <EndLine>\n`)
            }
        }
        /**
         * 
         * @param {*} id enter object id in this method for check this
         */
    isObjectID(id) {
        return mongoose.isValidObjectId(id);
    }

    gotoErrorPage(errorCode, next) {
        let error = new Error("")
        error.status = errorCode;
        next(error);
    }
    lengthRepeatedItemArray(modelArray, out_item, itemName) {
        const filterArray = modelArray.filter(item => item[itemName] == out_item)
        return filterArray.length
    }
    findRepeatedItemArray(modelArray, out_item) {
        const filterArray = modelArray.filter(item => item[itemName] == out_item)
        return filterArray
    }
    persianNumberToEnglishNumber(str) {
        return str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    }
    englishNumberToPersianNumber(str) {
        return str.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹' [d]);
    }
}