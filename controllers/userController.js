const mysql = require('mysql2/promise')

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('913924371455-887ehm4755o1rnmdnfur3cc2abm5ub3a.apps.googleusercontent.com');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// функция для получения данных по гугл аксес токену
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
const getUserData = async(req, res) => {
    try{        
        const {access_token} = req.body

        const userInfo = await getGoogleData(access_token)
        console.log(userInfo)

        // если почта была зарегестрированна, то получаем данные, если нет - то создаём и получаем их
        if(userInfo.nickname !== null){

            let rows = await db.execute('SELECT * FROM users WHERE email = ?', [userInfo.email])

            if(rows[0].length === 0){
                await db.execute('INSERT INTO users (nickname, imgPath, role, email) VALUES (?, ?, ?, ?)', [userInfo.name, userInfo.picture, 0, userInfo.email])
                rows = await db.execute('SELECT * FROM users WHERE email = ?', [userInfo.email])
            }

            res.status(200).json(rows[0][0])
        } else {
            res.status(200).json({id: null, nickname: null, imgPath: null, role: null, email: null})
        }

    } catch(error){
        res.status(500).json({massege: "ERROR WHILE GETING DATA " + error})
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

        const prevImgName = await db.execute('SELECT imgPath FROM users WHERE id = ?', [user_id])
        
        if(prevImgName){
            // удаление старого фото
        }

        await db.execute('UPDATE users SET imgPath = (?) WHERE id = ?', [filename, user_id])

        // возможно тут отправлять обратно новый имг паз
        res.status(200).json({massage: 'DATA UPDATED'})
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE POSTING DATA " + error})
    }
}


module.exports = {
    getUserData,
}