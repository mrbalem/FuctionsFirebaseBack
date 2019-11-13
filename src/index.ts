//se importan las librerias necesarias para el funcionamineto de cloud functions de firebase
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { response } from 'express';
import { request } from 'https';


//se inicializa la libreria
admin.initializeApp();



export const getjemploApifunction2 = functions.https.onRequest((request, response) => {
        admin.firestore().doc('mobile-trash/dispositivos').get()
                .then(snapshot => {
                        const data = snapshot.data()
                        response.send(data)
                })

                .catch(error => {
                        console.log(error)
                        response.status(500).send(error)
                });

});



// se exporta la funcion para obtener el token y el alias del usuario
export const addUser = functions.https.onRequest((request, response) => {

        // se capturan los datos de entrada de request para posteriormente procesarlo.
        let alias = request.body.alias
        let token = request.body.token

        //si existe alias y token continua con la expresión, de lo contrario se enviara un mensaje de error especificando
        //que hacen falta los campos para poder continuar
        if(alias && token){
          
        // se guarda en un objeto el alias y el token para posteriormente guardarlo en la base de datos        
        const user = {  
             "alias": alias,
             "token": token
        }

        
        /**  se accede a la referencia de la base de datos con ref. ejempl: /App/logic/User en esta referencia es 
         *   donde se agregaran los datos, cabe destacar que esta referencia es dinamico, cambiara segun  convenga.
         *   existe dos metodos para acceder a la base de datos set() y push() la diferencia es que push ingresa los
         *   datos con un identificador unico y no sobrescribe los datos, por otro lado set ingresa los datos sin un identificador
         *   si no existe lo crea y sobreescribe los datos.
         *   con la funcion then() se verifica si los datos fueron ingresados correctamente
         *   la funcion catch() detecta el error del por que no ingresa dicho dato.           
        **/

        admin.database().ref('/App/Logic/Users/' + alias + '1').set(user)
        .then(() => {
                const data = {
                        "status": "ok",
                        "message": "ingreso con exito el usuario"
                }
                response.send(data)
        })
        .catch(error => {
                console.log(error)
                response.status(500).send("error");
        })

        } else {
            const camposNulos = {
                    "status" : "error",
                    "message": "faltan campos necesarios"
            }    

            response.send(camposNulos)
        }
       
});


export const addDispositivos = functions.https.onRequest((request, response) => {

        //datos necesarios para poder ingresar un nuevo dispositivo
        let avatar = request.body.avatar
        let modelo = request.body.modelo
        let name = request.body.name
        let time = request.body.time

        //verficcamos si los parametros existen

        if(avatar && modelo && name && name && time){
        
        //agreamos los datos en un objeto para posteriormente ingresar a la base de datos
        const datosDispositivos = {
                "avatar": avatar,
                "modelo": modelo,
                "name": name,
                "time": time
        }

        //referencia para agragar a la base de datos
        admin.database().ref('/App/Logic/dispositivos').push(datosDispositivos)
        .then(() => {
                //enviamos una respuesta al cliente que de se ingrsaron los datos correctamente
                const messagecliente = {
                        "status": "ok",
                        "message": "se ingreso correctamente"
                }
                response.send(messagecliente);
        })

        //capturamos todos los errores posibles si no se ingresan los datos
        .catch(error => {
                console.log(error);
                response.status(500).send("error fatal");
        })

        }else{
                const responseNull = {
                        "status": "error",
                        "message": "se requieren parametros necesarios"
                }
                response.send(responseNull);
        }

})

