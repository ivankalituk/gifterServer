const mysql = require('mysql2/promise')

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('913924371455-887ehm4755o1rnmdnfur3cc2abm5ub3a.apps.googleusercontent.com');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// получение данных по токену
const getUserData = async(req, res) => {
    try{        
        const {access_token} = req.body

        // получение данных от гугл по токену
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const userInfo = await userInfoResponse.json();
        
        // если почта была зарегестрированна, то получаем данные, если нет - то создаём и получаем их

        
        

        res.status(200).json({email: userInfo.email})
    } catch(error){
        res.status(500).json('ERROR WHILE GETING DATA ' + error)
    }

}

module.exports = {
    getUserData,
}