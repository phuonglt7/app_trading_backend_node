import connectionDB from "../configs/database/connectDB"
import { hasPassword } from "../services/authService"
const getAll = async (req, res) => {
    //http
    // 404 501
    try {
        const result = await connectionDB.query('SELECT * FROM user', [])
        connectionDB.end();
        return res.status(200).json({
            message: 'ok',
            data: result.rows
        })
    } catch (err) {
        console.log(err.stack)
        return res.status(400).json({
            message: 'error',
            data: err.stack
        })
    }
}


const show = async (req, res) => {
    const userId = req?.params?.id;
    if (!userId && parseInt(userId)) {
        return res.status(400).json({
            message: 'missing required params'
        })
    }
    const result= await connectionDB.query('SELECT * FROM user WHERE id =$1', [userId]);
    connectionDB.end();
    return res.status(200).json({
        message: 'ok',
        data: result.rows.length ? result.rows[0] : null
    })
}

const create = async (req, res) => {
    let { firstName, lastName, email, username, password, dateOfBirth } = req.body;

    if (!firstName || !lastName || !email || !username || !password || !dateOfBirth) {
        return res.status(400).json({
            message: 'missing required params'
        })
    }
    const resultExist = await connectionDB.query('SELECT * FROM user WHERE username = $1 LIMIT 1',
        [username]);

    if (Array.isArray(resultExist.rows) && resultExist.rows.length < 1) {
    const objectDate = new Date();
    try {
        const resultInsert = await connectionDB.query('insert into user(first_name, last_name, email, username, password, date_of_birth,created_at, updated_at, group_id) values ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT id FROM app_group WHERE code = "user")) RETURNING *',
            [firstName, lastName, email, username, hasPassword(password), dateOfBirth, objectDate, objectDate]);
        connectionDB.end();
        return res.status(200).json({
                message: 'ok',
                data: resultInsert.rows.length ? resultInsert.rows[0] : null
            })
    } catch (error) {
        console.log(error)
    }

    } else {
        return res.status(400).json({
            message: 'User is exist!'
        })
    }
}

const update = async (req, res) => {
    const bodyData = req.body ?? {}
    const userId = req?.params?.id;
    if (!userId && parseInt(userId)) {
        return res.status(400).json({
            message: 'missing required params'
        })
    }

    const objectDate = new Date();

    let sqlUpdateQuery = "UPDATE user SET ";
    let parameterQuery = [];
    let valueIndex= 1;
    bodyData.keys().map(keyItem => {
        switch (keyItem) {
            case "firstName":
                sqlUpdateQuery += ` first_name= $${valueIndex}, `;
                parameterQuery.push(bodyData[keyItem])
                valueIndex += 1;
                break;
            case "lastName":
                sqlUpdateQuery += ` last_name= $${valueIndex}, `;
                parameterQuery.push(bodyData[keyItem])
                valueIndex += 1;
                break;
            case "email":
                sqlUpdateQuery += `email= $${valueIndex},`;
                parameterQuery.push(bodyData[keyItem])
                valueIndex += 1;
                break;
            case "password":
                sqlUpdateQuery += `password= $${valueIndex},`;
                parameterQuery.push(hasPassword(bodyData[keyItem]))
                valueIndex += 1;
                break;
            case "dateOfBirth":
                sqlUpdateQuery += `date_of_birth= $${valueIndex},`;
                parameterQuery.push(bodyData[keyItem])
                valueIndex += 1;
                break;
            default:
                break;
        }
    })


    if (parameterQuery.length) {
        parameterQuery.push(objectDate)
        parameterQuery.push(req.params.id)
        const resultUpdate = await connectionDB.query(sqlUpdateQuery + ` updated_at=$${valueIndex+1}  where id = $${valueIndex+2} RETURNING *`,
            parameterQuery);
        connectionDB.end();
        return res.status(200).json({
            message: 'ok',
            item: resultUpdate.rows[0],
        })

    }

    return res.status(200).json({
        message: 'no update',

    })
}

const deleteItem = async (req, res) => {
    const userId = req?.params?.id;
    if (!userId && parseInt(userId)) {
        return res.status(400).json({
            message: 'missing required params'
        })
    }
    await connectionDB.query('delete from user where id = $1', [userId]);
    connectionDB.end();
    return res.status(200).json({
        message: 'ok'
    })

}

module.exports = {
    getAll, create, update, deleteItem, show
}