/** 
const config = {
    user: "teste2",
    password: "password",
    server:'127.0.0.1',
    database:'tese',
    options:{
        trustedconnection: true,
        enableArithAbort : true, 
        instancename :'DESKTOP-NLBOFGQ'
    },
    port : 1433
}
*/
const config = {
    user: "admin",
    password: "password",
    server:'tese.cvyuck6yms74.eu-north-1.rds.amazonaws.com',
    database:'tese',
    options:{
        encrypt: true, // Se você estiver usando SSL/TLS, ative a criptografia
        trustServerCertificate: true 
    },
    port : 1433
}

module.exports = config; 