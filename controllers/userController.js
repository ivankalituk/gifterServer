const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// получение данных по токену
const checkUserTocken = async (access_token) => {
    try{
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`);
        return response
    } catch {
        return {data: {expires_in: -1}}
    }
}

const getUserData = async(req, res) => {
    try{
        const {access_token} = req.params.access_token
        const tocken_data = await checkUserTocken(access_token)
        const tocken_time = tocken_data.data.expires_in

        // if (tocken_time > 0){
        //     const rows = await db.execute('SELECT * FROM users WHERE user_email = ?', [tocken_data.data.email])
        //     res.stats(200).json({active: true, userData: rows[0]})
        // } else {
        //     res.status(200).json({active: false})
        // }

        res.status(200).json({access_token: access_token, data: tocken_data})
    } catch(error){
        res.status(500).json('ERROR WHILE GETING DATA ' + error)
    }

}

module.exports = {
    getUserData,
}