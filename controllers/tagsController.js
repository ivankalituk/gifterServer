const mysql = require('mysql2/promise')

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('913924371455-887ehm4755o1rnmdnfur3cc2abm5ub3a.apps.googleusercontent.com');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// создание тега (сделать особым образом)
const craeteTag = async(req, res) => {
    try{
        const {tag} = req.body

        await db.execute("INSERT INTO tags (text) VALUE (?)", [tag])
        res.status(200).json({massage: "DATA ADDED"})
    }catch(error){
        res.status(500).json({massage: "ERROR WHILE CREATING DATA " + error})
    }
}

// получение всех тегов
const getAllTags = async(req, res) => {
    try{
        const rows = await db.execute("SELECT * FROM tags")

        res.status(200).json(rows[0])
    }catch(error){
        res.status(500).json({massage: "ERROR WHILE GETING DATA " + error})
    }
}

// поиск тегов по их фрагменту
const getTagByInput = async (req, res) => {
    try {
        const { text } = req.body;

        // Проверяем, что текст не пустой
        if (typeof text !== 'string') {
            return res.status(400).json({ message: "Invalid input text" });
        }

        if (text === ''){
            return res.status(200).json([])
        }

        // Выполняем запрос к базе данных с использованием LIKE для поиска тегов
        const [rows] = await db.execute('SELECT * FROM tags WHERE text LIKE ? LIMIT 5', [`%${text}%`]);

        // Отправляем найденные теги в ответе
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "ERROR WHILE GETTING DATA: " + error.message });
    }
};


module.exports = {
    craeteTag,
    getAllTags,
    getTagByInput
}