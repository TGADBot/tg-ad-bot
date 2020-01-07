
const Telegraf = require('telegraf');
const session = require('telegraf/session');
const Telegram = require('telegraf/telegram');
const telegram = new Telegram(process.env.TOKEN, {
  agent: null,        
  webhookReply: true  
});
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const fetch = require('node-fetch');
const markdown = Extra.markdown();

const mainKeyboard = Markup.keyboard([
  Markup.callbackButton('Изменить сообщение', 'edit'),
  Markup.callbackButton('Посмотреть сообщение', 'view')
])

const cancelButton = Markup.keyboard([
    Markup.callbackButton('Отмена', 'cancel')
  ])

const bot = new Telegraf(process.env.TOKEN);

const http = require('http');
const https = require('https');
http.createServer().listen(process.env.PORT || 5000).on('request', function(req, res){
    res.end('')
});
setInterval(function(){
    https.get(process.end.MAIN_URL)
},300000)

const url = process.env.JSON_HTTP;

const getAd = async() => {
    const settings = { method: "GET"};
    const data = await (await fetch(url,settings)).json();
    return data;
}

const updateAd = async (newData) =>{
    fetch(url, {
        method: 'PUT',
        body: JSON.stringify(newData),
        mode: 'cors',
        headers: {
        'Content-Type': 'application/json'
    }});
}

const groupId = process.env.GROUP_ID;

let id;


let isEditing = false;


bot.use(session());

bot.start(ctx=>{
    ctx.reply('Добро пожаловать в бота! ', Extra.markup(mainKeyboard));
})

bot.command('echo', async ctx=>{
    if (ctx.message.chat.id == groupId) {
        return true;
    }
})

const replaceMessage = async () =>{
    const ad = await getAd();
    if (ad.id) {
        telegram.deleteMessage(groupId,ad.id);
    }
    if (ad.image) {
        telegram.sendPhoto(groupId,ad.image,{caption: ad.text, parse_mode: 'Markdown'}).then((res)=>{  updateAd({text: ad.text, id: res.message_id, image: ad.image});});
    } else {
        telegram.sendMessage(groupId,ad.text,markdown).then((res)=>{  updateAd({text: ad.text, id: res.message_id});});
    }
}

bot.on('new_chat_members', (ctx) => {
    telegram.deleteMessage(groupId,ctx.message.message_id);
    console.log(ctx.message)
})
bot.on('left_chat_member', (ctx) => {
    telegram.deleteMessage(groupId,ctx.message.message_id);
    console.log(ctx.message)
})

replaceMessage();

setInterval(replaceMessage,300000);

bot.command('view', async ctx=>{
    if (ctx.message.chat.id == groupId) {
        return true;
    }
    if (ctx.message.chat.id == groupId) {
        return true;
    }
    const currentMessage = await getAd();
    ctx.reply(currentMessage.text);
})

bot.hears('Посмотреть сообщение', async ctx=>{
    if (ctx.message.chat.id == groupId) {
        return true;
    }
    if (ctx.message.chat.id == groupId) {
        return true;
    }
    const currentMessage = await getAd();
    ctx.reply(currentMessage.text);
})

bot.command('edit',async ctx=>{
    if (ctx.message.chat.id == groupId) {
        return true;
    }
    await ctx.reply('Введите новое сообщение или нажмите Отмена',Extra.markup(cancelButton));
    isEditing = true;
});

bot.hears('Изменить сообщение',async ctx=>{
    if (ctx.message.chat.id == groupId) {
        return true;
    }
    await ctx.reply('Введите новое сообщение или нажмите Отмена',Extra.markup(cancelButton));
    isEditing = true;
})

bot.hears('Отмена',ctx=>{
    if (ctx.message.chat.id == groupId) {
        return true;
    }
    isEditing = false;
    ctx.reply('Отменено', Extra.markup(mainKeyboard))
})

bot.command('cancel',ctx=>{
    if (ctx.message.chat.id == groupId) {
        return true;
    }
    isEditing = false;
    ctx.reply('Отменено', Extra.markup(mainKeyboard))
})

bot.on( 'text', async (ctx)=>{
    if (ctx.message.chat.id == groupId) {
        return true;
    }
    if (isEditing) {
        const currentMessage = await getAd();
        await updateAd({text: ctx.message.text, id: currentMessage.id, image: ""});
        currentMessage.text = ctx.message.text;
        await ctx.reply('Сообщение изменено!', Extra.markup(mainKeyboard));
        isEditing = false;
    } else {
        ctx.reply('Вы можете редактировать и просматривать сообщение', Extra.markup(mainKeyboard))
    }
})
bot.on('photo', async(ctx)=>{
    if (ctx.message.chat.id == groupId) {
        return true;
    }
    if(isEditing) {
        const currentMessage = await getAd();
        await updateAd({text: ctx.message.caption, id: currentMessage.id, image: ctx.message.photo[0]['file_id']});
        await ctx.reply('Сообщение изменено!', Extra.markup(mainKeyboard));
        isEditing = false;
    }
})

bot.launch();
