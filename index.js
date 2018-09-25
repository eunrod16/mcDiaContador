const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const crypto = require('crypto');
const request = require('request')
const base64 = require('base-64');
const urlencode = require('urlencode');
const parser = require('xml2json');
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
  consumeService();
}, 2000);



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
      var responseJson = JSON.parse(parser.toJson(response))
      var bigMacsNuevo = responseJson["mensajeSalida"]["resp"]!="error"?responseJson.mensajeSalida.resp.BIGMACS:"";
      var hora = responseJson["mensajeSalida"]["resp"]!="error"?responseJson.mensajeSalida.resp.HORA:"";
      if( bigMacsNuevo!=bigMacs){
        bigMacs = bigMacsNuevo;
        var contador = '{'+
        '"bigMacs":'+bigMacs+','+
        '"hora":"'+hora+'"'+
        '}';
        enviarContador(contador);
        console.log(bigMacs,hora);
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
