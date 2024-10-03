const mysql = require('mysql2/promise')
const { objectStringIntoObjectMas } = require('../utils/functions')
const fs = require('fs')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// ДОБАВИТЬ +1 К ПРОСМОТРУ ПРИ ГЕТ ЗАПРОСЕ ПОДАРКА

// создание подарка (ПЕРЕДЕЛАТЬ)
const createGift = async(req, res) => {
    try{
        const {name, creator_id, admin_id, tags, imagePath} = req.body
        console.log(name, creator_id, admin_id, tags, imagePath)

        if (req.file){
            console.log('FILE EXIST')
            const {filename} = req.file
            await db.execute("INSERT INTO gift (name, photoPath, creatorId, adminId, tags) VALUES (?, ?, ?, ?, ?)", [name, 'uploads/' + filename, creator_id, admin_id, tags.join(', ')])
        } else {
            console.log('NO FILE')
            await db.execute("INSERT INTO gift (name, photoPath, creatorId, adminId, tags) VALUES (?, ?, ?, ?, ?)", [name, imagePath, creator_id, admin_id, tags.join(', ')])
        }

        // если подарок был создан через саггест, то при передаче саггест айди, удалять сам саггест

        res.status(200).json({massage: "DATA ADDED"})
    } catch(error){
        res.status(500).json({massage: "ERROR WHILE ADDING DATA " + error})
    }
}

// получение всех подарков
const getAllGifts = async(req, res) => {
    try{
        const rows = await db.execute("SELECT * FROM gift")

        // переводим строку тегов в массив тегов для каждого элемента-объекта массива ответов
        const newRows = objectStringIntoObjectMas(rows[0])

        res.status(200).json(newRows)
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

                    // Проверяем, что rows[0] существует и является массивом
                if (Array.isArray(rows[0])) {
                    // Обрабатываем каждый объект в массиве rows[0]
                    rows[0] = rows[0].map(item => {
                        // Если в объекте есть поле tags и это строка
                        if (item.tags && typeof item.tags === 'string') {
                            // Разделяем строку по запятой и пробелу на массив
                            item.tags = item.tags.split(',').map(tag => tag.trim());
                        }
                        return item;
                    });
                }

            res.status(200).json(rows[0])

        } else {
            const rows = await db.execute(`SELECT * FROM gift WHERE name LIKE ? ORDER BY ${sorting} DESC`, [`%${byName}%`])

                    // Проверяем, что rows[0] существует и является массивом
                if (Array.isArray(rows[0])) {
                    // Обрабатываем каждый объект в массиве rows[0]
                    rows[0] = rows[0].map(item => {
                        // Если в объекте есть поле tags и это строка
                        if (item.tags && typeof item.tags === 'string') {
                            // Разделяем строку по запятой и пробелу на массив
                            item.tags = item.tags.split(',').map(tag => tag.trim());
                        }
                        return item;
                    });
                }
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

        // переводим строку тегов в массив тегов для каждого элемента-объекта массива ответов
        const newRows = objectStringIntoObjectMas(rows[0])

        res.status(200).json(newRows)
    } catch(error){
        res.status(500).json({massage: "ERROR WHILE GETING DATA " + error})
    }
}

// получение подарка по айди создателя
const getGiftsByCreatorId = async(req, res) => {
    try{
        const creator_id = req.params.creator_id
        const rows = await db.execute('SELECT * FROM gift WHERE creatorId = (?)', [creator_id])

        // переводим строку тегов в массив тегов для каждого элемента-объекта массива ответов
        const newRows = objectStringIntoObjectMas(rows[0])

        res.status(200).json(newRows)
    } catch(error){
        res.status(500).json({massage: "ERROR WHILE GETING DATA " + error})
    }
}

// апдейт полей подарка (НЕ СДЕЛАНО)
const putGift = async(req, res) => {
    try{

    } catch(error){
        res.status(500).json({massage: "ERROR WHITE UPDATING DATA " + error})
    }
}

// апдейт рейтинга подарка (НЕ СДЕЛАНО)
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


        // находим фото подарка
        const [[{photoPath}]] = await db.execute("SELECT photoPath FROM gift WHERE  id = ?", [gift_id])

        // удаляем фото подарка если оно существует
        if (photoPath !== null && fs.existsSync(photoPath)){
            fs.unlink(photoPath, (err) => {
                if (err){
                    console.error(err)
                    res.status(500).json({massage: "Ошибка удаления файла"})
                }
            })
        }


        // удаление записи
        await db.execute("DELETE FROM gift WHERE id = ?", [gift_id])

        res.status(200).json({massage: "DELETED"})
    } catch(error){
        res.status(500).json({massage: "ERROR WHITE DELITING DATA " + error})
    }
}

// поиск имени подарков по фрагменту имени
const getGiftName = async (req, res) => {
    try{
        const {name} = req.body

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