const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 3000
const crypto = require('crypto');
const request = require('request')
const base64 = require('base-64');
const urlencode = require('urlencode');
const parser = require('xml2json');
const fs = require('fs');
server = express()
.use(express.static(path.join(__dirname, 'public')))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', (req, res) => res.render('pages/index'))
.listen(PORT, () => console.log(`Listening on ${ PORT }`))

const producto = 'BigMacAcumulado';
const appId = '17ba0791499db908433b80f37c5fbc89b870084b&version=1';
const noCia = '40';
const jsonParam = '{"webservice":"'+ producto +'", "no_cia":"'+noCia+'"}';
const key = 'f4beb6875f1a57333b0a';
const hmac = crypto.createHmac('sha256', key);
var data64,url;
var bigMacs;

setInterval(() => {
    wss.clients.forEach((client) => {
    client.send("test conection");
  });
}, 2000);

setInterval(() => {
  consumeService();
}, 60000);



hmac.on('readable', () => {
  var data = hmac.read();
  if (data) {
    data = data.toString('base64')
    data64 = urlencode(data)
    url = 'https://www.mcd.com.gt/usmcdgt03/rest/gw/exec?hash='+data64+'&jSonParam='+jsonParam+'&appId='+appId+'&noCia='+noCia
  }
});
hmac.write(jsonParam);
hmac.end();



function consumeService(){
  request.post({
    headers: {'content-type' : 'application/json'},
    url: url
  },
  function (error, body, response) {
    if (response){
      console.log(response);
      var responseJson = JSON.parse(parser.toJson(response))
      var bigMacsNuevo="", hora ="";
      if(responseJson["mensajeSalida"]){
        if(responseJson["mensajeSalida"]["resp"]){
          if(responseJson["mensajeSalida"]["resp"]!="error"){
            bigMacsNuevo = responseJson.mensajeSalida.resp.BIGMACS;
            hora = responseJson.mensajeSalida.resp.HORA;
          }
        }
      }

      if(bigMacsNuevo==""){
        var today = new Date();
        fs.appendFile("errorLog.txt", "["+today+"]"+response+"\n", function(err) {
            if(err) {
                return console.log(err);
            }
        });
        return;
      }
      if( 1){
        bigMacs = bigMacsNuevo;
        var contador = '{'+
        '"bigMacs":'+bigMacs+','+
        '"hora":"'+hora+'"'+
        '}';
        enviarContador(contador);
      }

    }

  });
}
function enviarContador(contador){
  wss.clients.forEach((client) => {
    client.send(contador);
  });
}


/*SOCKET*/
var SocketServer = require('ws').Server;
wss = new SocketServer({
  server
});
wss.on('connection', (ws) => {

  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));

});
