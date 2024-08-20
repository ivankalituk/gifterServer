const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// создать саггестов
const createSuggest = async (req, res) => {
    try {
        const {name, user_id, content} = req.body

        let filename;

        if (req.file) {
            ({ filename: filename } = req.file);
            filename = 'uploads/' + filename
        } else{
            filename = null
        }

        console.log(user_id, content, name, filename)

        await db.execute("INSERT INTO suggest (user_id, content, name, photoPath) VALUES (?, ?, ?, ?)", [Number(user_id), content, name, filename])

        res.status(200).json({ message: "DATA ADDED" });
    } catch (error) {
      res.status(500).json({ message: "ERROR WHILE CREATING " + error });
    }
  };
  

// получение всех саггестов
const getAllSuggests = async (req, res) => {
    try{
        const rows = await db.execute('SELECT * FROM suggest')
        res.status(200).json(rows[0])
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

// получение одного саггеста по его айди
const getSuggestById = async (req, res) => {
    try{
        const suggest_id = req.params.suggest_id
        const rows = await db.execute('SELECT * FROM suggest WHERE id = ?', [suggest_id])
        res.status(200).json(rows[0])
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

// удаление саггеста
const deleteSuggest = async (req, res) => {
    try{
        const suggest_id = req.params.suggest_id
        await db.execute('DELETE FROM suggest WHERE id = ?', [suggest_id])
        res.status(200).json({massage: "DATA DELETED"})
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

module.exports = {
    createSuggest,
    getAllSuggests,
    getSuggestById,
    deleteSuggest
}

// создание саггеста
// получение одного саггеста
// удаление саггеста