const crypto = require('crypto')
import connectionDB from "../configs/database/connectDB"
import { hasPassword } from "../services/authService"

const jwtHelper = require("../helpers/jwt.helper");
const debug = console.log.bind(console);
// Biến cục bộ trên server này sẽ lưu trữ tạm danh sách token
// Trong dự án thực tế, nên lưu chỗ khác, có thể lưu vào Redis hoặc DB
let tokenList = {};
// Thời gian sống của token
const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "1h";
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-secret-example-trungquandev.com-green-cat-a@";
// Thời gian sống của refreshToken
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "3650d";
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh-token-secret-example-trungquandev.com-green-cat-a@";


let login = async (req, res) => {

    let { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            message: 'missing required params'
        })
    }

    const now = new Date();
    try {
        const [rows, fields] = await connectionDB.execute('SELECT * FROM user WHERE username = ? AND password = ? LIMIT 1',
            [username, hasPassword(password)]);


        if (Array.isArray(rows) && rows.length) {
            const dataItem = rows[0]
            debug(`Thực hiện tạo mã Token, [thời gian sống 1 giờ.]`);
            const accessToken = await jwtHelper.generateToken(dataItem, accessTokenSecret, accessTokenLife);

            debug(`Thực hiện tạo mã Refresh Token, [thời gian sống 10 năm] =))`);
            const refreshToken = await jwtHelper.generateToken(dataItem, refreshTokenSecret, refreshTokenLife);
            // Lưu lại 2 mã access & Refresh token, với key chính là cái refreshToken để đảm bảo unique và không sợ hacker sửa đổi dữ liệu truyền lên.
            // lưu ý trong dự án thực tế, nên lưu chỗ khác, có thể lưu vào Redis hoặc DB
            tokenList[refreshToken] = { accessToken, refreshToken };

            debug(`Gửi Token và Refresh Token về cho client...`);
            return res.status(200).json({
                message: 'ok',
                item: rows[0],
                accessToken: accessToken,
                refreshToken: refreshToken
            })
        } else {
            return res.status(400).json({
                message: 'Incorrect Username and/or Password!'
            })
        }
    } catch (error) {
        return res.status(500).json(error);
    }
}

/**
 * controller refreshToken
 * @param {*} req 
 * @param {*} res 
 */
let refreshToken = async (req, res) => {
    // User gửi mã refresh token kèm theo trong body
    const refreshTokenFromClient = req.body.refreshToken;
    // debug("tokenList: ", tokenList);

    // Nếu như tồn tại refreshToken truyền lên và nó cũng nằm trong tokenList của chúng ta
    if (refreshTokenFromClient && (tokenList[refreshTokenFromClient])) {
        try {
            // Verify kiểm tra tính hợp lệ của cái refreshToken và lấy dữ liệu giải mã decoded 
            const decoded = await jwtHelper.verifyToken(refreshTokenFromClient, refreshTokenSecret);
            // Thông tin user lúc này các bạn có thể lấy thông qua biến decoded.data
            // có thể mở comment dòng debug bên dưới để xem là rõ nhé.
            // debug("decoded: ", decoded);
            const userFakeData = decoded.data;
            debug(`Thực hiện tạo mã Token trong bước gọi refresh Token, [thời gian sống vẫn là 1 giờ.]`);
            const accessToken = await jwtHelper.generateToken(userFakeData, accessTokenSecret, accessTokenLife);
            // gửi token mới về cho người dùng
            return res.status(200).json({ accessToken });
        } catch (error) {
            // Lưu ý trong dự án thực tế hãy bỏ dòng debug bên dưới, mình để đây để debug lỗi cho các bạn xem thôi
            debug(error);
            res.status(403).json({
                message: 'Invalid refresh token.',
            });
        }
    } else {
        // Không tìm thấy token trong request
        return res.status(403).send({
            message: 'No token provided.',
        });
    }
};



let register = async (req, res) => {
    let { firstName, lastName, email, username, password, dateOfBirth } = req.body;
    console.log(req.body)

    if (!firstName || !lastName || !email || !username || !password || !dateOfBirth) {
        return res.status(400).json({
            message: 'missing required params'
        })
    }
    const [rows, fields] = await connectionDB.execute('SELECT * FROM user WHERE username = ? LIMIT 1',
        [username]);

    if (Array.isArray(rows) && rows.length < 1) {
        const objectDate = new Date();
        const [dataInsert, fields] = await connectionDB.execute('insert into user(first_name, last_name, email, username, password, date_of_birth,created_at, updated_at, group_id) values (?, ?, ?, ?, ?, ?, ?, ?, (SELECT id FROM app_group WHERE code = "user"))',
            [firstName, lastName, email, username, hasPassword(password), dateOfBirth, objectDate, objectDate]);
        if (dataInsert.insertId) {
            const [rowsShow, fieldsShow] = await connectionDB.execute('SELECT * FROM user WHERE id =?', [dataInsert.insertId]);
            return res.status(200).json({
                message: 'ok',
                data: rowsShow.length ? rowsShow[0] : null
            })
        } else {
            return res.status(200).json({
                message: 'ok',
                item: dataInsert,
                fields: fields
            })
        }
    } else {
        return res.status(400).json({
            message: 'User is exist!'
        })
    }
}

module.exports = {
    login, register, refreshToken
}