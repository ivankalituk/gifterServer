const mysql = require('mysql2/promise')
const { objectStringIntoObjectMas } = require('../utils/functions')
const fs = require('fs')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// создание подарка (ПЕРЕДЕЛАТЬ)
const createGift = async(req, res) => {
    try{
        const {name, creator_id, admin_id, tags, imagePath, suggest_id} = req.body
        console.log(name, creator_id, admin_id, tags, imagePath, suggest_id)

        // если в запросе был передан файл, то мы его добавляем в нашу запись
        // если файла нет, то фото из саггеста было оставлено для добавления в запись
        if (req.file){
            const {filename} = req.file
            await db.execute("INSERT INTO gift (name, photoPath, creatorId, adminId, tags) VALUES (?, ?, ?, ?, ?)", [name, 'uploads/' + filename, creator_id, admin_id, tags.join(', ')])

            // находим фото саггеста для удаления
            const [[{photoPath}]] = await db.execute("SELECT photoPath FROM suggest WHERE id = ?", [suggest_id])

            console.log(photoPath)

            // удаляем фото саггеста если оно существует
            if (photoPath !== null && fs.existsSync(photoPath)){
                fs.unlink(photoPath, (err) => {
                    if (err){
                        console.error(err)
                        res.status(500).json({massage: "Ошибка удаления файла"})
                    }
                })
            }

            console.log('IMG DELETED')

            // удаляем саму запись саггеста
            await db.execute("DELETE FROM suggest WHERE id = ?", [suggest_id])
        } else {
            await db.execute("INSERT INTO gift (name, photoPath, creatorId, adminId, tags) VALUES (?, ?, ?, ?, ?)", [name, imagePath, creator_id, admin_id, tags.join(', ')])

            // удаляем запись саггеста не удаляя его фото
            await db.execute("DELETE FROM suggest WHERE id = ?", [suggest_id])
        }

        // если в массиве подарков существуют новые теги, то добавляем их в общий список
        for (const tag of tags) {
            // проверка есть ли тег
            const [[existingTag]] = await db.execute("SELECT id FROM tags WHERE text = ?", [tag]);

            // если нет, то добавляем
            if (!existingTag) {
                await db.execute("INSERT INTO tags (text) VALUES (?)", [tag]);
            }
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

        // увеличиваем просмотры подарка на 1
        await db.execute("UPDATE gift SET userViews = userViews + 1 WHERE id = ?", [id]);

        // получении подарка объединяем его с рейтингом который выдал пользователь
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
        const {id, name, tags, report_id} = req.body
        console.log(id, name, tags)

        if(req.file){
            console.log("FILE EXIST")
            const {filename} = req.file
            const [[{photoPath}]] = await db.execute('SELECT photoPath FROM gift WHERE id = ?', [id])
            await db.execute('UPDATE gift SET name = ?, tags = ?, photoPath = ? WHERE id = ?', [name, tags.join(', '), 'uploads/' + filename, id]);

            if (photoPath !== null && fs.existsSync(photoPath)){
                fs.unlink(photoPath, (err) => {
                    if (err){
                        console.error(err)
                        res.status(500).json({massage: "Ошибка удаления файла"})
                    }
                })
            }
        } else{
            console.log("FILE NOT EXIST")
            await db.execute('UPDATE gift SET name = ?, tags = ? WHERE id = ?', [name, tags.join(', '), id]);
        }

        await db.execute('DELETE FROM report WHERE id = ?', [report_id])

        console.log("UPDATED")
        res.status(200).json({massage: "SUCCESS"})
    } catch(error){
        res.status(500).json({massage: "ERROR WHITE UPDATING DATA " + error})
    }
}

// апдейт рейтинга подарка
const putGiftReating = async(req, res) => {
    try{

        const {old_reating, new_Reating, gift_id, user_id, suggest_id} = req.body
        
        console.log(old_reating, new_Reating, gift_id, user_id, suggest_id)

        // // получаем колличество оценивших и оценку 
        const [[{appreciators, reating}]] = await db.execute('SELECT appreciators, reating FROM gift WHERE id = ?', [gift_id])
        
        console.log(appreciators, reating)

        let finalNewReating

        // // если пользователь впервые оценивает подарок
        if (old_reating === 0){
            console.log("OLD = NULL")
            finalNewReating = ((appreciators * reating) + new_Reating) / (appreciators + 1)

            // обновляем оценку
            await db.execute('UPDATE gift SET appreciators = ?, reating = ? WHERE id = ?', [appreciators + 1, finalNewReating, gift_id]);

            // добавляем новую запись в оценки пользователя
            await db.execute('INSERT INTO reating (gift_id, user_id, mark) VALUES (?, ?, ?)', [gift_id, user_id, new_Reating])
        } else {
            // если пользователь меняет рейтинг
            console.log("OLD = NUMBER")
            finalNewReating = ((appreciators * reating) - old_reating + new_Reating) / (appreciators)

            // обновлять рейтинг подарка
            await db.execute('UPDATE gift SET reating = ? WHERE id = ?', [finalNewReating, gift_id]);

            // обновлять запись оценки
            await db.execute('UPDATE reating SET mark = ? WHERE user_id = ?', [new_Reating, user_id])
        }

        console.log(finalNewReating)

        res.status(200).json({massage: "SUCCESS"})

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

// получить айди рандомного подарка
const getRandomGift = async (req, res) => {
    try{
        const rows = await db.execute('SELECT id FROM gift ORDER BY RAND() LIMIT 1')

        res.status(200).json(rows[0])
    } catch (error){
        res.status(500).json({massage: "ERROR WHITE GETING DATA " + error})
    }
}

const getUserGiftReating = async (req, res) =>{
    try{
        const {user_id, gift_id} = req.body

        const [rows] = await db.execute('SELECT mark FROM reating WHERE user_id = ? AND gift_id = ?', [user_id, gift_id]);
        const mark = rows.length > 0 ? rows[0].mark : 0;

        res.status(200).json({mark: mark})

    } catch(error){
        res.status(500).json({massage: "ERROR"})
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
    getGiftName,
    getRandomGift,
    putGiftReating,
    getUserGiftReating
}