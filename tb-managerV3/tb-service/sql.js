var mysql = require('mysql')
var connection = mysql.createConnection({
    host: 'rm-bp18qxp7mp5yxl5lvgo.mysql.rds.aliyuncs.com',
    user: 'next_follow',
    password: 'Yunbei888',
    database: 'next_follow',
    port: 3306,
});

// 插入数据
function insert(addsql, paras) {
    //connection.connect();
    return new Promise(function (resolve, reject) {
        connection.query(addsql, paras, function (err, result) {
            if (err) {
                resolve(false)
                return;
            } else {
                resolve(true)
            }


        });
    })
    // connection.end();
}

function query(sql) {
    // connection.connect();
    return new Promise(function (resolve, reject) {

        connection.query(sql, function (err, result) {
            let data = {}
            if (err) {
                data = err.message
            } else {
                data = result
            }
            resolve(data)
        });
    })
    connection.end();
}
function queryLst(sqlite, sqlength) {
    let vm = {}
    return new Promise(function (resolve, rejcet) {
        query(sqlite).then(data => {
            query(sqlength).then(num => {
                if (data.length) {

                    vm.isok = true
                    vm.lst = data
                    vm.msg = '查询成功'
                    vm.num = num[0]["COUNT(*)"]
                } else {
                    vm.isok = false
                    vm.lst = []
                    vm.msg = '暂无数据'
                    vm.num = 1
                }
                resolve(vm)
            })
        })
    })

}

module.exports = {
    insert,
    query,
    queryLst,

}