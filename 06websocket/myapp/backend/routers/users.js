//子路由
const express = require('express');
const query = require('../db/mysql');//自定义一个模块
// console.log(query);
const Router = express.Router();//路由设置  Router==app

const { create, verify } = require('./token');

/*
    用户管理：
        * 验证用户名是否存在 完成
        * 注册 完成
        * 登陆
        * 修改密码
        * 删除xx用户
        * 清空用户
        * 数据渲染 分页 完成
*/

//需求：查询所有的用户信息
Router.get('/all', async (req, res) => {
    // let str = 'SELECT * FROM userinf';
    //初级版
    // query(str, data => {
    //     //形参
    //     // console.log(data);
    //     res.send(data);//把查询到的数据响应给前端
    // });

    //中级版
    // let p = query(str);
    // p.then(data => {

    // });

    //高级版
    //前端传：第几页page 传数量 num
    let { page, num } = req.query;
    // console.log(page, num);
    page = page || 1;//设置默认值
    num = num || 5;//设置默认值
    let index = (page - 1) * num;
    let str = `SELECT * FROM userinf LIMIT ${index},${num}`;
    let data = await query(str);
    // console.log(data);

    let sql2 = 'SELECT * FROM userinf';
    let data2 = await query(sql2);
    /*
        result :{
            type : 1,
            msg : 'success',
            page : 1,
            num : 5,
            pages : 6,
            datalist : []
        }
    */

    let result = {};
    if (data.length) {
        //成功返回的数据
        let pages = Math.ceil(data2.length / num);
        result = {
            type: 1,
            msg: 'success',
            page,
            num,
            pages,
            datalist: data
        }
    } else {
        //失败返回的数据
        result = {
            type: 0,
            msg: 'fail',
            datalist: []
        }
    }

    res.send(result);
});

//需求：验证用户名是否存在
// let userlist = ['admin', 'lubao', 'xiaochong', 'xiaohu'];
//  /users/checkname
Router.get('/checkname', async (req, res) => {
    //接收前端数据
    // console.log(req);
    let { name } = req.query;
    // console.log(name);//做数据库的查询
    if (name) {
        let sql = `SELECT * FROM userinf WHERE name = '${name}'`;
        let data = await query(sql);
        let result = {};
        if (data.length) { // '0' 真  0 假
            //查找到了，不给注册
            result = {
                type: 0,
                msg: '不能注册'
            }
        } else {
            //可以注册
            result = {
                type: 1,
                msg: '可以注册'
            }
        }
        res.send(result);//无论失败与成功都需要响应给客户端
    }
    res.send('数据不能为空');
});

//需求：登陆功能
Router.get('/login', async (req, res) => {
    //接收前端数据
    // console.log(req);
    let { name, psw, keep } = req.query;
    // let token = '';
    // // console.log(keep);
    // if (keep == 'true') {// 'true' 'false'
    //     //需求：7天免登陆，生成token发给你
    //     //生成token
    //     token = create(psw);
    //     // console.log(token);
    // } else {
    //     token = '';
    // }
    //需求：不需要免登陆，每次输入账号密码
    // console.log(token);

    if (name && psw) {
        let sql = `SELECT * FROM userinf WHERE name = '${name}' and psw='${psw}'`;
        let data = await query(sql);
        let result = {};
        if (data.length) { // '0' 真  0 假
            //查找到了，可以登陆
            let token = '';
            if (keep == 'true') {// 'true' 'false'
                //需求：7天免登陆，生成token发给你
                //生成token
                token = create(psw);
                // console.log(token);
            }
            result = {
                type: 1,
                msg: '登陆成功',
                token
            }
        } else {
            //可以注册
            result = {
                type: 0,
                msg: '登陆失败',
                token: ''
            }
        }
        res.send(result);//无论失败与成功都需要响应给客户端
    } else {
        res.send('数据不能为空');
    }

});

//需要：校验token:1.是否被串改  2.是否在有效期
Router.get('/verify', (req, res) => {
    let { token } = req.query;
    let result = verify(token);
    let data = {};
    if (result) {
        data = {
            type: 1,
            msg: '校验通过'
        }
    } else {
        data = {
            type: 0,
            msg: '校验失败'
        }
    }
    res.send(data);
});

//需求：注册功能

Router.post('/reg', async (req, res) => {
    // let obj = req.body;
    console.log(req.body);
    let { name, password } = req.body;//解构

    if (name && password) {
        let sql = `INSERT INTO userinf(name,psw) VALUES('${name}','${password}')`;
        let data = await query(sql);
        // console.log(data);
        let result = {};
        if (data.affectedRows) {
            //插入成功
            result = {
                type: 1,
                msg: '注册成功'
            }
        } else {
            //插入失败
            result = {
                type: 0,
                msg: '注册失败'
            }
        }
        res.send(result);
    } else {
        res.send('请填写全部数据');
    }

});

//需求：删除xx用户
Router.delete('/del/:uid', async (req, res) => {
    let { uid } = req.params;
    let sql = `DELETE FROM userinf WHERE uid=${uid}`;
    let data = await query(sql);
    // console.log(data);
    let result = {};
    if (data.affectedRows) {
        //删除成功
        result = {
            type: 1,
            msg: '删除成功'
        }
    } else {
        result = {
            type: 0,
            msg: '删除失败'
        }
    }
    res.send(result);
});

//需求：删除多个记录
Router.delete('/delall', express.urlencoded(), async (req, res) => {
    let { uid } = req.body;
    // console.log(uid);
    let sql = `DELETE FROM userinf WHERE uid in(${uid})`;
    let data = await query(sql);
    console.log(data);
    let result = {};
    if (data.affectedRows) {
        //插入成功
        result = {
            type: 1,
            msg: '删除成功'
        }
    } else {
        //插入失败
        result = {
            type: 0,
            msg: '删除失败'
        }
    }
    res.send(result);
});

//需求：修改用户信息
Router.put('/update/:uid', express.urlencoded(), async (req, res) => {
    let obj = req.body; //{name : '杰克',psw:'666'}
    console.log(obj);
    //name='JJJJJ', psw='6666'
    let msg = '';
    for (let key in obj) {
        msg += key + '=' + `'${obj[key]}'` + ',';
    }
    msg = msg.slice(0, -1);
    console.log(msg);
    let sql = `UPDATE  userinf SET ${msg} WHERE uid=21`;
    let data = await query(sql);
    console.log(data);
});




module.exports = Router;


