const express = require('express')
const multer = require('multer')
const mysql = require('mysql2/promise')
const cors = require('cors')
const {slugify} = require('transliteration')

const port = 1000
const app = express()
app.use(express.json())
app.use(cors({
    origin: '*',  // Разрешить доступ с любого домена
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use('/uploads', express.static('uploads'))

// Контроллеры
const {createGift, getAllGifts, getTagedGifts, getGiftsById, getGiftsByCreatorId, putGift, deleteGift, getGiftName, getRandomGift, putGiftReating, getUserGiftReating} = require('./controllers/giftController')
const {createReport, getAllReports, getReportById, deleteReport, deleteReportGift, getGiftByReport} = require('./controllers/reportController')
const {createSuggest, getAllSuggests, getSuggestById, deleteSuggest} = require('./controllers/suggestController')
const {getUserData, userNicknameChange, userBioChange, getUserTags, userTagsChange, getUserById, userPhotoChange, getUserBio} = require('./controllers/userController')
const {craeteTag, getAllTags, getTagByInput} = require('./controllers/tagsController')
const {getAllBlackUsers, getBlackUsersEmail, getBlackUsers, removeUserFromBlacklist, insertUserIntoBlacklist} = require('./controllers/blackListController')
const {getAdminsByEmailFragment, getAdminsFullDataByEmail, adminLevelChange, insertAdmin} = require('./controllers/adminController')
const {removeBookMark, addBookMark, getAllBookmarksByUserId, toggleBookMark} = require('./controllers/bookmarkController')

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
app.post('/gift', upload.single('image'), createGift)           //создание подарка
app.get('/gift', getAllGifts)                                   //получение всех подарков
app.post('/gift/tags', getTagedGifts)                           //получение подарков по тегам
app.get('/gift/:gift_id', getGiftsById)                         //получение подарка по его айди
app.get('/gift/creator/:creator_id/:user_id', getGiftsByCreatorId)       //получепние подарка по айди его создателя
app.put('/gift', upload.single('image'), putGift)               //обновление подарка (не готово)
app.delete('/gift/:gift_id', deleteGift)                        //удаление подарка по айди
app.post('/gift/name', getGiftName)                             //получение имён подарков по части имени
app.get('/gift-random', getRandomGift)                          //получение id рандомного подарка
app.put('/gift-reating', putGiftReating)
app.post('/gift-reating', getUserGiftReating)                   //получение рейтинга по айли подарка и айди пользователя

// CRUD для репорта
app.post('/report', createReport)                               //создание репорта
app.get('/report', getAllReports)                               //получение всех репортов
app.get('/report/:report_id', getReportById)                    //получение репорта по его айди
app.delete('/report/:report_id', deleteReport)                  //удаление репорта
app.delete('/report-gift', deleteReportGift)                    //удаление репорта и плдарка этого репорта
app.get('/report/gift/:report_id', getGiftByReport)                        //получить подарок и репорт по айди репорта

// CRUD для саггеста
app.post('/suggest',upload.single('image'), createSuggest)      //создание саггеста
app.get('/suggest', getAllSuggests)                             //получение всех саггестов
app.get('/suggest/:suggest_id', getSuggestById)                 //получение саггеста по его айди
app.delete('/suggest/:suggest_id', deleteSuggest)               //удаление саггеста

// CRUD для пользователя
app.post('/user', getUserData)                                  //получение пользователя по его токену
app.put('/user/nickname', userNicknameChange)                   //смена ника пользователя
app.put('/user/bio', userBioChange)                             //смена био пользователя
app.get('/user/tags/:user_id', getUserTags)                     //получение тегов по айди пользователя
app.put('/user/tags', userTagsChange)                           //смена тегов пользователя
app.put('/user/photo', upload.single('image'), userPhotoChange) //смена аватара пользователя
app.get('/user/bio/:user_id', getUserBio)                       //получение био
app.get('/user/:user_id', getUserById)                          //получение пользователя по айди

// CRUD для тегов (не полностью)
app.post('/tag', craeteTag)                                     //создать тег
app.get('/tag', getAllTags)                                     //получить все теги
app.post('/tagName', getTagByInput)                             //получить похожие теги по фрагменту слова

// CRUD для чёрного спика
app.get('/blacklist', getAllBlackUsers)                         //получение чёрного списка     
app.post('/blacklist/email', getBlackUsersEmail)                //поиск емейла по фрагменту емейла
app.post('/blacklist/users/email', getBlackUsers)               //отобразить пользователей по емейлу
app.delete('/blacklist/user/:user_id', removeUserFromBlacklist) //отобразить пользователей по емейлу
app.post('/blacklist-add', insertUserIntoBlacklist)    //добавить пользователя в блеклист

// CRUD для списков админов
app.post('/admins', getAdminsByEmailFragment)                   //получить админов по фрагменту почты
app.post('/admins/email', getAdminsFullDataByEmail)             //получить админов по фрагменту почты
app.put('/admins/leveling', adminLevelChange)                   //по операции - или + менять уровень админа (НЕ ПРОВЕРЯЛ)
app.post('/admin', insertAdmin)                                 //добавить нового админа

// CRUN для закладок
app.get('/bookmarks/:user_id', getAllBookmarksByUserId)                  //получение всех закладок пользователя
app.post('/bookmark/add', addBookMark)                          //добавление закладки
app.post('/bookmark/remove', removeBookMark)                    //удаление закладки
app.post('/bookmark/toggle', toggleBookMark)  

toggleBookMark

app.listen(port, '0.0.0.0', (error) => {
    if (error){
        return(console.log(error))
    }
    console.log("SERVER OK")
})