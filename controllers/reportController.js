const mysql = require('mysql2/promise')
const { objectStringIntoObjectMas } = require('../utils/functions')
const fs = require('fs')

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

// удаление репорта и подарка 
const deleteReportGift = async (req, res) => {
    try{
        const {report_id, gift_id} = req.body

        const [[{photoPath}]] = await db.execute('SELECT photoPath FROM gift WHERE id = ?', [gift_id])

        console.log(photoPath)

        if (photoPath !== null && fs.existsSync(photoPath)){
            console.log('EXISTED')
            fs.unlink(photoPath, (err) => {
                if (err){
                    console.error(err)
                    res.status(500).json({massage: "Ошибка удаления файла"})
                }
            })
        }

        console.log("IMG DELETED")

        await db.execute('DELETE FROM report WHERE gift_id = ?', [gift_id])
        
        await db.execute('DELETE FROM gift WHERE id = ?', [gift_id])
        res.status(200).json({massage: "DATA DELETED"})
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

// получение подарка по айди репорта 
const getGiftByReport = async (req, res) => {
    try{
        const report_id = req.params.report_id
        const rows = await db.execute('SELECT * FROM gift g JOIN report r ON r.gift_id = g.id WHERE r.id = ?', [report_id])

        // сделать теги массивом
        const newRows = objectStringIntoObjectMas(rows[0])

        res.status(200).json(newRows)
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

module.exports = {
    createReport,
    getAllReports,
    getReportById,
    deleteReport,
    deleteReportGift,
    getGiftByReport
}