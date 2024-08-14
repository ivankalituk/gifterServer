const express = require('express')
const multer = require('multer')
const mysql = require('mysql2/promise')
const cors = require('cors')
const {slugify} = require('transliteration')

const port = 1000
const app = express()
app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

// Контроллеры
const {createGift, getAllGifts, getTagedGifts, getGiftsById, getGiftsByCreatorId, putGift, deleteGift} = require('./controllers/giftController')
const {createReport, getAllReports, getReportById, deleteReport} = require('./controllers/reportController')
const {createSuggest, getAllSuggests, getSuggestById, deleteSuggest} = require('./controllers/suggestController')
const {getUserData} = require('./controllers/userController')
const {craeteTag, getAllTags, getTagByInput} = require('./controllers/tagsController')

// генератор уникальных названий файлов мультера
const storage = multer.diskStorage({
    destination: (_,__, cb) => {
        cb(null, 'uploads');
    },
    filename: (_,file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix+ slugify(file.originalname));
    },
})

const upload = multer({storage})

// подключение базы данных
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gifter'
})

// проверка подключения базы данных
db.getConnection().then((connection) => {
        console.log("DATABASE IS OK")
        connection.release()
    }).catch((error) => {
        console.log("DATABASE ERROR: ", error.massage)
})

// CRUD для подарка
app.post('/gift', upload.single('image'), createGift)                                   //создание подарка
app.get('/gift', getAllGifts)                                   //получение всех подарков
app.post('/gift/tags', getTagedGifts)                            //получение подарков по тегам
app.get('/gift/:gift_id', getGiftsById)                         //получение подарка по его айди
app.get('/gift/creator/:creator_id', getGiftsByCreatorId)       //получепние подарка по айди его создателя
app.put('/gift', putGift)                                       //обновление подарка НЕГОТОВОы
app.delete('/gift/:gift_id', deleteGift)                        //удаление подарка по айди

// CRUD для репорта
app.post('/report', createReport)                               //создание репорта
app.get('/report', getAllReports)                               //получение всех репортов
app.get('/report/:report_id', getReportById)                    //получение репорта по его айди
app.delete('/report/:report_id', deleteReport)                  //удаление репорта

// CRUD для саггеста
app.post('/suggest', createSuggest)                               //создание саггеста
app.get('/suggest', getAllSuggests)                               //получение всех саггестов
app.get('/suggest/:suggest_id', getSuggestById)                   //получение саггеста по его айди
app.delete('/suggest/:suggest_id', deleteSuggest)                 //удаление саггеста

// CRUD для пользователя
app.post('/user', getUserData)                        //получение пользователя по его токену


// CRUD для тегов
app.post('/tag', craeteTag)   
app.get('/tag', getAllTags)  
app.post('/tagName', getTagByInput)  

app.listen(port, (error) => {
    if (error){
        return(console.log(error))
    }
    console.log("SERVER OK")
})