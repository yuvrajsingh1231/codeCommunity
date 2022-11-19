const TG = require('telegram-bot-api')
module.exports = {
    sendNotification: function(msg) {
    
    const api = new TG({token: '5877149488:AAHI9insI66O6St8AUlPUWwblIrMbpHDfhE'})

    const mp = new TG.GetUpdateMessageProvider()

    api.setMessageProvider(mp)
    api.start()
    .then(() => {
        console.log('API is started')
    })
    .catch(console.err)

    // for my debugging purpose
    // api.on('update', update => {
    //     console.log(update)
    // })

    api.sendMessage({
        chat_id: -1001834137304,
        text: msg,
        parse_mode: 'HTML'
    })

    api.stop()
}
}