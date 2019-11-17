//se importan las librerias necesarias para el funcionamineto de cloud functions de firebase
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

//se inicializa la libreria
admin.initializeApp();

const getStatus = (status: any, message: any, data: any) => {
        const object = {
                "status": status,
                "message": message,
                "data": data === null ? "no hay datos" : data
        }
        return object
}

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
        const alias = request.body.alias;
        const token = request.body.token;

        //si existe alias y token continua con la expresión, de lo contrario se enviara un mensaje de error especificando
        //que hacen falta los campos para poder continuar
        if (alias && token) {

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

                admin.database().ref('/App/Logic/Users/' + token).set(user)
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
                        "status": "error",
                        "message": "faltan campos necesarios"
                }

                response.send(camposNulos)
        }

});



//funcion para poder ingresar nuevos equipos con sus caracaterisca necesaris
export const addDispositivos = functions.https.onRequest((request, response) => {

        //datos necesarios para poder ingresar un nuevo dispositivo
        const avatar = request.body.avatar;
        const modelo = request.body.modelo;
        const name = request.body.name;
        const time = request.body.time;

        //verificamos si los parametros existen

        if (avatar && modelo && name && name && time) {
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
                                response.send(getStatus("ok","se ingreso correctamente", null));
                        })

                        //capturamos todos los errores posibles si no se ingresan los datos
                        .catch(error => {
                                console.log(error);
                                response.status(500).send("error fatal");
                        })

                return

        } 
                //enviamos una respuesta si los parametros no existen
                response.send(getStatus("error", "se requieren parametros necesarios", null));

})


//funcion para poder obtener los dispositivos
export const getDispositivos = functions.https.onRequest( async (request, response) => {

        //se requiere el token para poder verificar los dispositivos
        const token = request.body.token;
        //verificamos si el parametro token existe
        if (token) {
                //obtenes la direccion del token
                const verificandotoken =  await admin.database().ref('/App/Logic/Users/' + token + '/token').once('value')

                //verrificamos el estado del token
                if(verificandotoken.val() === null) {response.send(getStatus("error", "token no existe", null)); return }

                 //comparamos el token del cliente con la base de datos
                if(token === verificandotoken.val()){
                        //obtenemos los dispositivos
                        const getDispo = await admin.database().ref('/App/Logic/dispositivos').once('value')
                        //pareamos la data
                        const parseDispositivos = Object.keys(getDispo.val() || {}).map(key => getDispo.val()[key])
                        //enviamos la informacion
                        response.send(getStatus("ok", "se obtuve con exito los dispositivos", parseDispositivos))
                }

                return
        } 
                // si el parametro token no existe mandamos una respuesta en un objeto
                response.send(getStatus("error","el token es necesario",null))  
})

//registro del administrador
export const setAdmin = functions.https.onRequest((request, response) => {

        //capturamos los datos necesarios de la solicitud
        const adminUsers = request.body.users;
        const adminClave = request.body.clave;
        const token = request.body.token;

        if (adminUsers && adminClave && token) {

                //guardamos los datos en un objeto 
                const setDatos = {
                        "usuario": adminUsers,
                        "clave": adminClave,
                        "token": token
                }

                admin.database().ref('/App/Logic/Admin/' + token).set(setDatos)
                        .then(() => {
                                //enviamos un mensaje si los datos son almacenados correctamente
                                response.send(getStatus("ok","se registro con éxito",null))
                        })
                        .catch(error => {
                                console.log("error", error)
                                response.status(500).send("error fatal");
                        })
                
                return         
        } 
                //enviamos un objeto si los parametros necesarios no existen  
                response.send(getStatus("error","faltan campos necesarios", null))
});

export const loginAdmin = functions.https.onRequest(async (request, response) => {
        //capturamos los datos del request
        const adminUsers = request.body.usuario
        const adminClave = request.body.clave
        const adminToken = request.body.token

        if (adminClave && adminUsers && adminToken) {
                try {
                        //obtenemos el usuario del admin        
                        const getUser = await admin.database().ref('/App/Logic/Admin/' + adminToken + '/usuario').once('value');
                        //retornamos un mensage si el usuario no existe
                        if (getUser.val() === null) { response.send({ "status": "error", "message": "Usuario incorrecto!." }); return }
                        //obtenemos la contraseña del admin
                        const getClave = await admin.database().ref('/App/Logic/Admin/' + adminToken + '/clave').once('value');

                        if (getUser.val() === adminUsers && adminClave === getClave.val()) {
                                //si la clave y usario son correctos enviaremos una respuesta
                                response.send(getStatus("ok", "ingreso correctamente", null))
                        } else {
                                response.send(getStatus("error", "contraseña o clave incorrecto", null))
                        }

                } catch (error) {
                        console.log("error", error)
                        response.status(500).send("error fatal");
                }
                return
        }

        response.send(getStatus("error", "faltan campos", null));

})