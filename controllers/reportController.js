const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// создать репорт
const createReport = async (req, res) => {
    try{
        const {user_id, content, gift_id} = req.body

        await db.execute('INSERT INTO report (user_id, content, gift_id) VALUES (?, ?, ?)', [user_id, content, gift_id])
        res.status(200).json({massage: "DATA ADDED"})
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

// получение всех репортов
const getAllReports = async (req, res) => {
    try{
        const rows = await db.execute('SELECT * FROM report')
        res.status(200).json(rows[0])
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

// получение одного репорта по его айди
const getReportById = async (req, res) => {
    try{
        const report_id = req.params.report_id
        const rows = await db.execute('SELECT * FROM report WHERE id = ?', [report_id])
        res.status(200).json(rows[0])
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

// удаление репорта
const deleteReport = async (req, res) => {
    try{
        const report_id = req.params.report_id
        await db.execute('DELETE FROM report WHERE id = ?', [report_id])
        res.status(200).json({massage: "DATA DELETED"})
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

module.exports = {
    createReport,
    getAllReports,
    getReportById,
    deleteReport
}

// создание репорта
// получение всех репортов
// удаление репорта
// обновление репорта?