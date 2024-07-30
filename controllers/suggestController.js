const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// создать саггестов
const createSuggest = async (req, res) => {
    try{
        const {user_id, content, photoPath, tags, name} = req.body

        await db.execute('INSERT INTO suggest (user_id, content, photoPath, tags, name) VALUES (?, ?, ?, ?, ?)', [user_id, content, photoPath, tags, name])
        res.status(200).json({massage: "DATA ADDED"})
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

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