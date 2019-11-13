//se importan las librerias necesarias para el funcionamineto de cloud functions de firebase
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';


//se inicializa el aplicativo
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

        // se capturan los datos de entra de rerquest. para posteriormente procesarlo
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
         *   existe dos metodos para acceder a la base de datos set() y push() la direncia es que push ingresa los
         *   datos con un identificador unico y no sobrescribe los datos, por otro lado set ingresa los datos sin un identificador
         *   si no existe lo crea y sobreescribe los datos.
         *   con la funcion then() se verifica si los datos fueron ingresados correctamente
         *   la funcion caht() detecta el error o la incidencia del por que no ingresa dicho dato.           
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

