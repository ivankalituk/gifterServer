const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// получить весь чёрный список пользователей
const getAllBlackUsers = async(req, res) => {
    try{
        const rows = await db.execute('SELECT * FROM blacklist')
        res.status(200).json(rows[0])
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE GETING DATA " + error})
    }
}

// получить пользователей из чёрного списка, если их почта похожа на переданное слово
const getBlackUsers = async(req, res) => {
    try{
        const {email} = req.body

        const rows = await db.execute('SELECT * FROM users u JOIN blacklist b ON b.user_id = u.id WHERE u.email LIKE ? LIMIT 5', [`%${email}%`]);

        res.status(200).json(rows[0])
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE GETING DATA " + error})
    }
}


// поиск по емейлу
const getBlackUsersEmail = async(req, res) => {
    try {
        const { email } = req.body;

        // Проверяем, что текст не пустой
        if (email === ''){
            return res.status(200).json([])
        }

        const rows = await db.execute('SELECT u.email FROM users u JOIN blacklist b ON b.user_id = u.id WHERE u.email LIKE ? LIMIT 5', [`%${email}%`]);

        // меняем ключи email на text
        const updatedRows = rows[0].map(row => {

            let updatedRow = { ...row };
            
            if (updatedRow.email) {
                updatedRow.text = updatedRow.email;
                delete updatedRow.email;
            }
            
            return updatedRow;
        });

        // Отправляем найденные email в ответе
        res.status(200).json(updatedRows);
    } catch (error) {
        res.status(500).json({ message: "ERROR WHILE GETTING DATA: " + error.message });
    }
}

const removeUserFromBlacklist = async(req, res) => {
    try{
        const user_id = req.params.user_id

        console.log(user_id)

        await db.execute('DELETE FROM blacklist WHERE user_id = ?', [user_id])
        res.status(200).json({message: "DELETED"})
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE GETING DATA " + error})
    }
}

module.exports = {
    getAllBlackUsers,
    getBlackUsersEmail,
    getBlackUsers,
    removeUserFromBlacklist
}