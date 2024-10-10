const mysql = require('mysql2/promise');
const { arrayIntoString, objectStringIntoObjectMas } = require('../utils/functions');
const fs = require('fs')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// создать саггестов
const createSuggest = async (req, res) => {
    try {
        const {name, user_id, content, tagArray} = req.body

        // если тагЭррей это массив тегов, то делаем из него строку
        // если тагЭррей это строка, то в нём всего один тег
        // если тагЭррей пустой, то будем класть в бд налл
        let tagString
        if(tagArray && typeof(tagArray) !== 'string'){
            tagString = arrayIntoString(tagArray)
        } else {
            if(typeof(tagArray) === 'string'){
                tagString = tagArray
            } else {
                tagString = null
            }
        }

        // если добавлено фото, то сохраняем файлнейм, если нет, то даём названию NULL
        let filename;
        if (req.file) {
            ({ filename: filename } = req.file);
            filename = 'uploads/' + filename
        } else{
            filename = null
        }

        await db.execute("INSERT INTO suggest (user_id, content, name, photoPath, tags) VALUES (?, ?, ?, ?, ?)", [Number(user_id), content, name, filename, tagString])

        console.log("READY")
        res.status(200).json({ message: "DATA ADDED" });
    } catch (error) {
      res.status(500).json({ message: "ERROR WHILE CREATING " + error });
    }
  };
  
// получение всех саггестов (функция стринг в аррей)
const getAllSuggests = async (req, res) => {
    try {
        const rows = await db.execute('SELECT * FROM suggest');

        // теги из строки в массив
        const newRows = objectStringIntoObjectMas(rows[0])

        res.status(200).json(newRows);
    } catch (error) {
        res.status(500).json({message: "ERROR WHILE CREATING " + error});
    }
}

// получение одного саггеста по его айди
const getSuggestById = async (req, res) => {
    try{
        const suggest_id = req.params.suggest_id
        const rows = await db.execute('SELECT * FROM suggest WHERE id = ?', [suggest_id])

        // теги из строки в массив
        const newRows = objectStringIntoObjectMas(rows[0])

        res.status(200).json(newRows);
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

// удаление саггеста (сделать удаление фото, если оно не налл)
const deleteSuggest = async (req, res) => {
    try{
        const suggest_id = req.params.suggest_id


        // находим саггеста подарка
        const [[{photoPath}]] = await db.execute("SELECT photoPath FROM suggest WHERE id = ?", [suggest_id])

        // удаляем фото саггеста если оно существует
        if (photoPath !== null && fs.existsSync(photoPath)){
            fs.unlink(photoPath, (err) => {
                if (err){
                    console.error(err)
                    res.status(500).json({massage: "Ошибка удаления файла"})
                }
            })
        }
        
        // удаление записи в бд
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