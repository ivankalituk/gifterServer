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

module.exports = {
    getUserData,
}