const mysql = require('mysql2/promise')

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('913924371455-887ehm4755o1rnmdnfur3cc2abm5ub3a.apps.googleusercontent.com');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})


// получить похожие почты админов по фрагменту почты
const getAdminsByEmailFragment = async(req, res) => {
    try{
        const { email } = req.body;

        // если текст пустой то возвращаем пустой массив 
        if (email === ''){
            return res.status(200).json([])
        }

        const rows = await db.execute('SELECT email FROM users WHERE role = ? AND email LIKE ? LIMIT 5', [1, `%${email}%`])

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
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE GETING DATA " + error})
    }
}

// отображение инфорации админов по почте либо фрагменту почты
const getAdminsFullDataByEmail = async(req, res) => {
    try{
        const {email} = req.body

        const rows = await db.execute('SELECT * FROM users u JOIN admins a ON a.user_id = u.id WHERE role = ? AND email LIKE ?', [1, `%${email}%`]);

        res.status(200).json(rows[0])
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE GETING DATA " + error})
    }
}

// уменьшение уровня админа (либо забрать его админку, если уровень понижается до 0)
const adminLevelChange = async(req, res) => {
    try{
        const {operation, user_id} = req.body

        // если уровень админа = 1, то мы снимаем с него админку, если больше 1, то понижаем на 1
        if (operation === '-'){
            await db.execute(`UPDATE users SET role = 0 WHERE id = ? AND EXISTS (SELECT 1 FROM admins WHERE user_id = ? AND admin_level = 1);`, [user_id, user_id]);
        
            // Удаляем запись в admins, если admin_level равен 1
            await db.execute(`DELETE FROM admins WHERE admin_level = 1 AND user_id = ?;`, [user_id]);
        
            // Уменьшаем admin_level на 1, если он больше 1
            await db.execute(`UPDATE admins SET admin_level = admin_level - 1 WHERE admin_level > 1 AND user_id = ?;`, [user_id]);
        } else {
            // если операция +, то повысить уровень админа на 1 уровень, если урвень максимальный то ничего не делать
            await db.execute(`UPDATE admins SET admin_level = CASE WHEN admin_level < 3 THEN admin_level + 1 ELSE admin_level END WHERE user_id = ?`, [user_id])
        }

        res.status(200).json({massege: "SUCCESS"})
    } catch(error){
        res.status(500).json({massege: "ERROR WHILE UPDATING DATA " + error})
    }
}

module.exports = {
    getAdminsByEmailFragment,
    getAdminsFullDataByEmail,
    adminLevelChange
}