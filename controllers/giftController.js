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
        const {name, creatorId, adminId, tags} = req.body
        

        if(req.file){
            const {filename} = req.file
            await db.execute("INSERT INTO gift (name, photoPath, creatorId, adminId, tags) VALUES (?, ?, ?, ?, ?)", [name, 'uploads/' + filename, creatorId, adminId, tags])
        } else {
            await db.execute("INSERT INTO gift (name, photoPath, creatorId, adminId, tags) VALUES (?, ?, ?, ?, ?)", [name, null, creatorId, adminId, tags])
        }

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
        const {tags, sort, byName} = req.body

        // сортировка
        let sorting
        switch(sort){
            case 'За датою' :
                sorting = 'addDate'
                break
            case 'За рейтингом' :
                sorting = 'reating'
                break
            case 'За переглядами' :
                sorting = 'userViews'
                break
        }

        // получение результатов
        if (tags.length > 0){
            const tagQuery = tags.map(tag => `tags LIKE '%${tag}%'`).join(' AND ');

            // если поиск по слову
            const rows = await db.execute(`SELECT * FROM gift WHERE ${tagQuery} AND name LIKE ? ORDER BY ${sorting} DESC`, [`%${byName}%`]);  
            res.status(200).json(rows[0])

        } else {
            const rows = await db.execute(`SELECT * FROM gift WHERE name LIKE ? ORDER BY ${sorting} DESC`, [`%${byName}%`])
            res.status(200).json(rows[0])
        }

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
const putGiftReating = async(req, res) => {
    try{
        const reating = 4.2
        const appretiatiors = 5

        // ДОБАВЛЕНИЕ НОВОЙ ОЦЕНКИ
        // (4.2*5 + 5(новая оценка)) / 5+1(новый пользователь) = (новая оценка)

        // ПЕРЕОЦЕНИВАНИЕ
        // (4.2*5 - 1(старая оценка) + 4(новая оценка)) / 5 = (новая оценка)

    } catch(error){
        res.status(500).json({massage: "ERROR WHITE UPDATING DATA " + error})
    }
}

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

const getGiftName = async (req, res) => {
    try{
        const {name} = req.body
        console.log(name)

        if(name === ''){
            res.status(200).json([])
        } else{
            const rows = await db.execute(`SELECT name FROM gift WHERE name LIKE '%${name}%' LIMIT 5`);
            res.status(200).json(rows[0])
        }
    } catch (error){
        res.status(500).json({massage: "ERROR WHITE GETING DATA " + error})
    }
}

module.exports = {
    createGift,
    getAllGifts,
    getTagedGifts,
    getGiftsById,
    getGiftsByCreatorId,
    putGift,
    deleteGift,
    getGiftName
}