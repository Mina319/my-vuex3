/**
 * 遍历对象的每个键值对，并对每个值执行回调函数。
 * 
 * @param {Object} obj - 需要遍历的对象，默认值为空对象。
 * @param {Function} callback - 回调函数，接收两个参数：对象的值和键。
 */
const forEachValue = (obj = {}, callback) => {
    Object.keys(obj).forEach(key => {
        // 第一个参数是值，第二个参数是键
        callback(obj[key], key)
    })
}

export default forEachValue