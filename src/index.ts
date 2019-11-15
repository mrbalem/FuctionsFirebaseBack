//se importan las librerias necesarias para el funcionamineto de cloud functions de firebase
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

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

        } else {
                //enviamos una respuesta si los parametros no existen
                const responseNull = {
                        "status": "error",
                        "message": "se requieren parametros necesarios"
                }
                response.send(responseNull);
        }

})


//funcion para poder obtener los dispositivos
export const getDispositivos = functions.https.onRequest((request, response) => {

        //se requiere el token para poder verificar los dispositivos
        const token = request.body.token;

        //verificamos si el parametro token existe
        if (token) {
                //obtenes la direccion del token
                const verificandotoken = admin.database().ref('/App/Logic/Users/' + token + '/token')
                verificandotoken.on('value', (snapshot) => {
                        //verficamos si la referencia existe y no esta nula
                        if (snapshot) {

                                //obtenemos el token  de la basse de datos
                                const tokenDatabase = snapshot.val();

                                //comparamos el token del cliente con la base de datos
                                if (token === tokenDatabase) {
                                        //obtenemos los dispositvos
                                        const changeDispositivos = admin.database().ref('/App/Logic/dispositivos')
                                        changeDispositivos.on('value', (snap) => {
                                                if (snap) {
                                                        //parseamos la data de los dispositovos
                                                        const dispositivos = Object.keys(snap.val() || {}).map(key => snap.val()[key])

                                                        //enviamos un objeto con los dispositivos requeridos
                                                        const data = {
                                                                "status": "ok",
                                                                "message": "se obtuve con exito los dispositivos",
                                                                "data": dispositivos
                                                        }

                                                        response.send(data)
                                                }
                                        })

                                } else {
                                        //enviamos un objetos si los tokens no son iguales
                                        const data = {
                                                "status": "error",
                                                "message": "token invalido"
                                        }
                                        response.send(data)
                                }

                        }

                })



        } else {
                // si el parametro token no existe mandamos una respuesta en un objeto
                const tokenNull = {
                        "status": "error",
                        "message": "el token es necesario"
                }

                // enviamos la respuesta
                response.send(tokenNull)
        }
})

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
                                const getMessage = {
                                        "status": "ok",
                                        "message": "se registro con éxito"
                                }
                                response.send(getMessage)
                        })

                        .catch(error => {
                                console.log("error", error)
                                response.status(500).send("error fatal");
                        })
        } else {
                //enviamos un objeto si los parametros necesarios no existen  
                const respuesta = {
                        "status": "error",
                        "message": "faltan campos necesarios"
                }

                response.send(respuesta)
        }


});

export const loginAdmin = functions.https.onRequest((request, response) => {
        //capturamos los datos del request
        const adminUsers = request.body.usuario
        const adminClave = request.body.clave
        const adminToken = request.body.token

        if (adminClave && adminUsers && adminToken) {

                //obtenemos los datos del admin
                const getUser = admin.database().ref('/App/Logic/Admin/' + adminToken + '/usuario')
                getUser.on('value', snapshop => {

                        //obtenemos el usario del admin
                        
                                const getadminusuario = snapshop!.val();
                                //consultamos la contraseña del admin
                                const getClave = admin.database().ref('/App/Logic/Admin/' + adminToken + '/clave')
                                getClave.on('value', snap => {
                                        //capturamos la clave de admin
                                       
                                                const getadminclave = snap!.val()
                                                if (getadminusuario === adminUsers && adminClave === getadminclave) {
                                                        //si la clave y usario son correctos enviaremos una respuesta

                                                        const getAdmin = {
                                                                "status": "ok",
                                                                "message": "ingreso correctamente"
                                                        }

                                                        response.send(getAdmin)
                                                } else {
                                                        //enviamos una respuesta si los datos son incorrectos
                                                        const geterror = {
                                                                "status": "error",
                                                                "message": "datos incorrectos"
                                                        }
                                                        response.send(geterror)
                                                }
                                        

                                })
                        

                })


        } else {
                //enciamos una respuesta si admin user no existe
                const messagereponse = {
                        "status": "error",
                        "message": "faltan campos"
                }

                response.send(messagereponse)

        }
})

