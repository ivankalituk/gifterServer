const mysql = require('mysql2/promise')

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('913924371455-887ehm4755o1rnmdnfur3cc2abm5ub3a.apps.googleusercontent.com');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// получение всех закладок пользователя по его айди
// ДОБАВИТЬ САМИ БУКМАРКИ
const getAllBookmarksByUserId = async(req, res) => {
    try{
        const user_id = req.params.user_id;

        let rows = await db.execute(`
        SELECT g.*, bm.addDate AS bookmarkDate,
            CASE WHEN bm.gift_id IS NOT NULL AND bm.user_id = ?
            THEN TRUE
            ELSE FALSE
            END AS marked
        FROM bookmarks bm 
        INNER JOIN gift g ON bm.gift_id = g.id
        WHERE bm.user_id = ?
        ORDER BY bookmarkDate`
, [user_id, user_id])

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

    } catch (error){
        res.status(500).json({massege: "ERROR WHILE UPDATING DATA " + error})
    }
}

// добавление закладки
const addBookMark = async(req, res) => {
    try{
        const {user_id, gift_id} = req.body;

        await db.execute("INSERT INTO bookmarks (user_id, gift_id) VALUES (?, ?)", [user_id, gift_id])

        res.status(200).json(rows[0])

    } catch (error){
        res.status(500).json({massege: "ERROR WHILE UPDATING DATA " + error})
    }
}

// удаление закладки
const removeBookMark = async(req, res) => {
    try{
        const {user_id, gift_id} = req.body;

        await db.execute("DELETE FROM bookmarks WHERE user_id = ? AND gift_id = ?", [user_id, gift_id])

        res.status(200).json(rows[0])

    } catch (error){
        res.status(500).json({massege: "ERROR WHILE UPDATING DATA " + error})
    }
}

// тогл статуса закладки
const toggleBookMark = async(req, res) => {
    try{

        const {user_id, gift_id} = req.body

        // если он был отмечен, то удаляем его отметку, если не был отмечен, то добавляем
        const [exist] = await db.execute('SELECT 1 FROM bookmarks WHERE user_id = ? AND gift_id = ?', [user_id, gift_id])

        if (exist.length > 0){
            await db.execute('DELETE FROM bookmarks WHERE user_id = ? AND gift_id = ?', [user_id, gift_id])
        } else {
            await db.execute('INSERT INTO bookmarks (user_id, gift_id) VALUES (?, ?)', [user_id, gift_id])
        }
        res.status(200).json({message: "SUCCESS"})
    } catch (error){
        res.status(500).json({massege: "ERROR WHILE UPDATING DATA " + error})
    }
}

module.exports = {
    removeBookMark,
    addBookMark,
    getAllBookmarksByUserId,
    toggleBookMark
}