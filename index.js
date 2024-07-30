const express = require('express')
const multer = require('multer')
const mysql = require('mysql2/promise')
const cors = require('cors')

const port = 1000
const app = express()
app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

// Контроллеры
const {createGift, getAllGifts, getTagedGifts, getGiftsById, getGiftsByCreatorId, putGift, deleteGift} = require('./controllers/giftController')

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

// отображение всех подарков
// отображение одного подарка по айди 
// отображение всех подарков по пользователь айди
// отображение по фильтрам (то же самое что и всех подарков но там будет всё в условии)
// создание подарка
// апдейт полей подарка
// апдейт просмотров подарка (скорее всего будет при получении с базы данных)
// апдейт рейтинга подарка (пользователь будет вводить свою оценку рейтинга, она будет заноситься в бд)
// удалепние подарка

app.post('/gift', createGift)                                   //создание подарка
app.get('/gift', getAllGifts)                                   //получение всех подарков
app.get('/gift/tags', getTagedGifts)                            //получение подарков по тегам
app.get('/gift/:gift_id', getGiftsById)                         //получение подарка по его айди
app.get('/gift/creator/:creator_id', getGiftsByCreatorId)       //получепние подарка по айди его создателя
app.put('/gift', putGift)                                       //обновление подарка НЕГОТОВОы
app.delete('/gift/:gift_id', deleteGift)                        //удаление подарка по айди


app.listen(port, (error) => {
    if (error){
        return(console.log(error))
    }
    console.log("SERVER OK")
})