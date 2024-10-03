const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// создать саггестов (функция аррей в стринг)
const createSuggest = async (req, res) => {
    try {
        const {name, user_id, content, tagArray} = req.body

        // массив из тегов переделать в строку тегов для занесения в бд
        let tagString
        if(tagArray){
            tagString = tagArray.join(', ')
        } else {
            tagString = null
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

        res.status(200).json({ message: "DATA ADDED" });
    } catch (error) {
      res.status(500).json({ message: "ERROR WHILE CREATING " + error });
    }
  };
  

// получение всех саггестов (функция стринг в аррей)
const getAllSuggests = async (req, res) => {
    try {
        const rows = await db.execute('SELECT * FROM suggest');

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

        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({message: "ERROR WHILE CREATING " + error});
    }
}

// получение одного саггеста по его айди (функция стринг в аррей)
const getSuggestById = async (req, res) => {
    try{
        const suggest_id = req.params.suggest_id
        const rows = await db.execute('SELECT * FROM suggest WHERE id = ?', [suggest_id])

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
    } catch (error){
        res.status(500).json({massage: "ERROR WHILE CREATING " + error})
    }
}

// удаление саггеста (сделать удаление фото, если оно не налл)
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