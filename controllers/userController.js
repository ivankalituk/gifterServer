const mysql = require('mysql2/promise')

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('913924371455-887ehm4755o1rnmdnfur3cc2abm5ub3a.apps.googleusercontent.com');
const fs = require('fs')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// функция для получения данных по гугл аксес токену (ПРОМЕЖУТОЧНАЯ ФУНКЦИЯ)
const getGoogleData = async (access_token) => {
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });

    const userInfo = await userInfoResponse.json()
    if (userInfo.error){
        return ({nickname: null, imgPath: null, role: null, email: null})
    } else {
        return(userInfo)
    }
}

// получение данных по токену
// (ЗАМЕНИТЬ, ДОБАВИТЬ БЛОКИРОВКУ И РОЛЬ ПОЛЬЗОВАТЕЛЯ, ДОБАВЛЯТЬ ЕЁ ИМЕННО ЧЕРЕЗ ОБЪЕДИНЕНИЕ)
const getUserData = async(req, res) => {
    try{        
        const {access_token} = req.body

        const userInfo = await getGoogleData(access_token)

        // если почта была зарегестрированна, то получаем данные, если нет - то создаём и получаем их
        if(userInfo.nickname !== null){

            // добавить роль и статус блеклист
            // let rows = await db.execute(' SELECT users.*, CASE WHEN blacklist.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS blocked FROM users LEFT JOIN blacklist ON users.id = blacklist.user_id WHERE users.email = ?', [userInfo.email])
            // let rows = await db.execute('SELECT * FROM users WHERE email = ?', [userInfo.email])
            let rows = await db.execute(
            `SELECT 
                u.*,
                CASE 
                    WHEN bl.user_id IS NOT NULL THEN TRUE 
                    ELSE FALSE 
                END AS blocked,
                COALESCE(adm.admin_level, 0) AS role
            FROM 
                users u
            LEFT JOIN 
                blacklist bl ON u.id = bl.user_id
            LEFT JOIN
                admins adm ON u.id = adm.user_id
            WHERE 
                u.email = ?`, [userInfo.email])

            if(rows[0].length === 0){
                await db.execute('INSERT INTO users (nickname, imgPath, email) VALUES (?, ?, ?, ?)', [userInfo.name, userInfo.picture, userInfo.email])

                // тут добавить блеклист и уровень роли, как и в прошлом
                rows = await db.execute(
                    `SELECT 
                        u.*,
                        CASE 
                            WHEN bl.user_id IS NOT NULL THEN TRUE 
                            ELSE FALSE 
                        END AS blocked,
                        COALESCE(adm.admin_level, 0) AS role
                    FROM 
                        users u
                    LEFT JOIN 
                        blacklist bl ON u.id = bl.user_id
                    LEFT JOIN
                        admins adm ON u.id = adm.user_id
                    WHERE 
                        u.email = ?`, [userInfo.email])
            }

            res.status(200).json(rows[0])
        } else {
            res.status(200).json([{id: null, nickname: null, imgPath: null, role: null, blacklist: null, email: null}])
        }

    } catch(error){
        res.status(500).json({massege: "ERROR WHILE GETING DATA " + error})
    }
}

// получение пользователя по его айди
const getUserById = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        // добавить блеклист и уровень роли
        const rows = await db.execute(`SELECT 
                        u.*,
                        CASE 
                            WHEN bl.user_id IS NOT NULL THEN TRUE 
                            ELSE FALSE 
                        END AS blocked,
                        COALESCE(adm.admin_level, 0) AS role
                    FROM 
                        users u
                    LEFT JOIN 
                        blacklist bl ON u.id = bl.user_id
                    LEFT JOIN
                        admins adm ON u.id = adm.user_id
                    WHERE 
                        u.id = ?`, [user_id]);

        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "ERROR WHILE GETTING DATA " + error });
    }
}

// смена ника
const userNicknameChange = async (req, res) => {
    try{
        let {user_id, nickname} = req.body

        await db.execute('UPDATE users SET nickname = (?) WHERE id = ?', [nickname, user_id])
        res.status(200).json({massage: 'DATA UPDATED'})
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE POSTING DATA " + error})
    }
}

// смена тегов пользователя
const userTagsChange = async (req, res) => {
    try{
        let {user_id, tags} = req.body

        await db.execute('UPDATE users SET tags = (?) WHERE id = ?', [tags.join(', '), user_id])
        res.status(200).json({massage: 'DATA UPDATED'})
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE POSTING DATA " + error})
    }
}

// смена био пользователя
const userBioChange = async (req, res) => {
    try{
        let {user_id, bio} = req.body

        await db.execute('UPDATE users SET bio = (?) WHERE id = ?', [bio, user_id])
        res.status(200).json({massage: 'DATA UPDATED'})
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE POSTING DATA " + error})
    }
}

// смена фото пользователя
const userPhotoChange = async (req, res) => {
    try{
        const {user_id} = req.body

        let filename;

        if (req.file) {
            ({ filename: filename } = req.file);
            filename = 'uploads/' + filename
        } else{
            filename = null
        }

        // получаем прошлое фото пользователя
        const [[{imgPath}]] = await db.execute("SELECT imgPath FROM users WHERE id = ?", [user_id])
        
        // удаляем фото пользователя если оно существует
        if (imgPath !== null && fs.existsSync(imgPath)){
            fs.unlink(imgPath, (err) => {
                if (err){
                    console.error(err)
                    res.status(500).json({massage: "Ошибка удаления файла"})
                }
            })
        }

        // добавляем название нового фото пользователя
        await db.execute('UPDATE users SET imgPath = (?) WHERE id = ?', [filename, user_id])

        // возможно тут отправлять обратно новый имг паз
        res.status(200).json({massage: 'DATA UPDATED'})
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE POSTING DATA " + error})
    }
}

// получение тегов пользователя
const getUserTags = async (req, res) => {
    try {
        const user_id = req.params.user_id;

        // Выполнение запроса к базе данных
        const [rows] = await db.execute('SELECT tags FROM users WHERE id = ?', [user_id]);

        let mas = [];
        if (rows.length > 0 && rows[0].tags !== null) {
            mas = rows[0].tags.split(', ');
        }

        res.status(200).json(mas);
    } catch (error) {
        res.status(500).json({ message: "ERROR WHILE GETTING DATA " + error });
    }
}

// получение био пользователя
const getUserBio = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        
        const rows = await db.execute('SELECT bio FROM users WHERE id = ?', [user_id]);

        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "ERROR WHILE GETTING DATA " + error });
    }
}

module.exports = {
    getUserData,
    userNicknameChange,
    userBioChange,
    getUserTags,
    userTagsChange,
    userPhotoChange,
    getUserBio,
    getUserById
}