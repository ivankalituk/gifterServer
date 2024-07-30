const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// ДОБАВИТЬ +1 К ПРОСМОТРУ ПРИ ГЕТ ЗАПРОСЕ ПОДАРКА


// создание подарка
const createGift = async(req, res) => {
    try{
        const {name, photoPath, creatorId, adminId, tags} = req.body

        const [rows] = await db.execute("INSERT INTO gift (name, photoPath, creatorId, adminId, tags) VALUES (?, ?, ?, ?, ?)", [name, photoPath, creatorId, adminId, tags])
        res.status(200).json({massage: "DATA ADDED"})
    } catch(error){
        res.status(500).json({massage: "ERROR WHILE ADDING DATA " + error})
    }
}

// получение всех подарков
const getAllGifts = async(req, res) => {
    try{
        const rows = await db.execute("SELECT * FROM gift")
        res.status(200).json(rows[0])
    } catch(error){
        res.status(500).json({massage: "ERROR WHILE GETING DATA " + error})
    }
}

// получение всех подарков по тегам
const getTagedGifts = async(req, res) => {
    try{
        const tags = req.query.tags
        const rows = await db.execute('SELECT * FROM gift WHERE tags LIKE (?)', ['%' + tags + '%'])
        res.status(200).json(rows[0])
    } catch(error){
        res.status(500).json({massage: "ERROR WHILE GETING DATA " + error})
    }
}

// получение подарка по айди
const getGiftsById = async(req, res) => {
    try{
        const id = req.params.gift_id
        const rows = await db.execute('SELECT * FROM gift WHERE id = (?)', [id])
        res.status(200).json(rows[0])
    } catch(error){
        res.status(500).json({massage: "ERROR WHILE GETING DATA " + error})
    }
}

// получение подарка по айди создателя
const getGiftsByCreatorId = async(req, res) => {
    try{
        const creator_id = req.params.creator_id
        const rows = await db.execute('SELECT * FROM gift WHERE creatorId = (?)', [creator_id])
        res.status(200).json(rows[0])
    } catch(error){
        res.status(500).json({massage: "ERROR WHILE GETING DATA " + error})
    }
}

// апдейт полей подарка (ДЕЛАТЬ ВМЕСТЕ С ФРОНТОМ)
const putGift = async(req, res) => {
    try{

    } catch(error){
        res.status(500).json({massage: "ERROR WHITE UPDATING DATA " + error})
    }
}

// апдейт рейтинга подарка
// const putGiftReating = async(req, res) => {
//     try{
//         const reating = 4.2
//         const appretiatiors = 5

//         // (4.2 + 5(новая оценка)) / 6 (5+новая оценка) = (новый рейтинг)
//     } catch(error){
//         res.status(500).json({massage: "ERROR WHITE UPDATING DATA " + error})
//     }
// }

// удаление подарка по айди
const deleteGift = async (req, res) => {
    try{
        const gift_id = req.params.gift_id
       await db.execute("DELETE FROM gift WHERE id = (?)", [gift_id])
        res.status(200).json({massage: "DELETED"})
    } catch(error){
        res.status(500).json({massage: "ERROR WHITE DELITING DATA " + error})
    }
}

module.exports = {
    createGift,
    getAllGifts,
    getTagedGifts,
    getGiftsById,
    getGiftsByCreatorId,
    putGift,
    deleteGift
}