const express = require('express');
const morgan = require('morgan');
const path =require('path');
const mysql =require('mysql');
const myConnection =require('express-myconnection');
const app = express ();

//importar rutas
const customerRoutes = require('./rutas/customer');

//configuracion del puerto
app.set('port', process.env.PORT ||3000);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views')); // diername es la direccion de donde se ejecuta el js y busca la carta llamada ---->

//antes del usuario middlewares
app.use(morgan('dev'));
app.use(myConnection(mysql,{
    host:'localhost',
    user:'root',
    password:'',
    port: 3306, 
    database:'bd_solicitud'
}, 'single'));

//rutas
app.use('/', customerRoutes);


//archivos estaticos imagenes, etc, etc

app.use(express.static(path.join(__dirname, 'public')));

//controladores


app.listen(app.get('port'), () => {
    console.log('Server on port 3000');
})

