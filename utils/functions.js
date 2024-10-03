// дан массив объектов, в объекте заменить tags с стринга в массив
const objectStringIntoObjectMas = (rows) => {
    if (Array.isArray(rows)) {
        return rows.map(item => {
            // Если в объекте есть поле tags и это строка
            if (item.tags && typeof item.tags === 'string') {
                // Разделяем строку по запятой и пробелу на массив
                item.tags = item.tags.split(',').map(tag => tag.trim());
            }
            return item;
        });
    }
    return rows;
}

// массив переделать в строку
const arrayIntoString = (array) => {
    return array.join(', ')
}

module.exports = {
    objectStringIntoObjectMas,
    arrayIntoString
}