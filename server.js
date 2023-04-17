// **************************************************************************************************
const {Telegraf} = require('telegraf');
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT_BOT || 8050
const bot = new Telegraf('6101299118:AAG9TZ43uIO9z9nBn_ZjlspEK7VUjuy9l70');
const app = express();
const fs = require('fs');

// ********************************************************************
const writeDataUser = (username) => {
    fs.writeFileSync('username.json', `[${username}]`, (err) => {
        if(err) throw err;
        console.log('Data has been replaced! create empty array');
        fileHandler(username);
    });
}
const writeFileDataUser = (data) => {
    fs.writeFileSync('error-front-bot-log.json', data, (err) => {
        if(err) throw err;
        console.log('Data has been replaced log file!');
    });
}
const deleteDataUser = (username) => {
    fs.writeFileSync('username.json', `[${username}]`, (err) => {
        if(err) throw err;
        console.log('Data has been replaced! create empty array');
        fileHandler(username);
    });
}
const fileHandler = (username) => {
    try{
        const readFile = fs.readFileSync(__dirname + '/username.json');
        console.log(readFile)
        const data = JSON.parse(readFile);
        if(data.includes(username)) {
            console.log('user in database')
            return data;
        }
        console.log({data});
        if(!username) return data;
        const arrUsers = [...data, username];
        writeDataUser(arrUsers);
        return arrUsers;
    }catch(err){
        if(err.code === 'ENOENT' ){
            fs.open(__dirname + '/username.json', 'a+', (err, data)=>{
                if(err) throw err;
                console.log('file create', {username})
                writeDataUser(username);                
            })
        }
        console.log(err)
    }

}
const fileHandlerLog = (newData) => {
    try{
        const readFile = fs.readFileSync(__dirname + '/error-front-bot-log.json');
        let data = JSON.parse(readFile ?? []);
        console.log({data})
        const replaceData = JSON.parse(newData);
        console.log({newData})
        data =[ ...data, replaceData];
        writeFileDataUser(JSON.stringify(data));    
        return true;
    }catch(err){
        if(err.code === 'ENOENT' ){
            fs.open(__dirname + '/error-front-bot-log.json', 'a+', (err)=>{
                if(err) throw err;
                console.log('file create', {newData});
                writeFileDataUser(JSON.stringify([newData]));                
            })
        }
        console.log(err)
    }

}
// ********************************************************************

bot.command('start', ctx => {
    const users = fileHandler(ctx.from.id);
    for(let key in users){
       return bot.telegram.sendMessage(ctx.chat.id, `Бот создан для отслеживания ошибок в приложении, Вы ${ctx.chat.username} добавлены в группу отладки`, {
        reply_markup: {
            inline_keyboard: [
                [{
                        text: "отписаться от бота",
                        callback_data: 'unsubscribe'
                    }
                ],

            ]
        }
        })
    }
})

bot.action('unsubscribe', ctx => {
    bot.telegram.sendMessage(ctx.chat.id,'Вы уверены что хотите покинуть группу отладчиков приложения', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Да, это обдуманное решение",
                        callback_data: 'closeBot'
                    },
                    {
                        text: "я передумал, от меня сдесь будет больше пользы",
                        callback_data: 'continueRecieveNotice'
                    }
                ]
            ]
        }
    });
})

bot.action('continueRecieveNotice', ctx => {
    bot.telegram.sendMessage(ctx.chat.id, 'Вы продолжите получать уведомления об ошибках');
})

bot.action('closeBot', ctx => {
    try{
        const readFile = fs.readFileSync('username.json');
        const data = JSON.parse(readFile);
        if(data.includes(ctx.chat.id)) deleteDataUser(data.filter(el=>el !== ctx.chat.id));
        bot.telegram.sendMessage(ctx.chat.id, 'Вы можете закрыть чат, Ваш аккаунт был удалён из системы. Если Вы пожелаете вернутся в нашу команду нажмите /start')
    }catch(err){ throw err };
})

app.use(cors());
app.get('/api/bot/error/',(req,res) => {
    const { query } = req;
    console.log({query})
    if(Object.keys(query).length){
    const users = fileHandler();
    for(let key in users){
       bot.telegram.sendMessage(users[key],JSON.stringify(query,null,4));
    }
    fileHandlerLog(JSON.stringify(query))
    }
});

app.get('/', (req,res)=>{
    res.status(200).send('start server')
})

bot.launch();
app.listen(PORT, ()=> console.log('SERVER start on port and bot work', PORT));
// ************************************************************************************************** 1241800430