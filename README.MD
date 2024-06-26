# FBI System

sistema online que gestione misiones secretas...


## Instalación

1. Clona este repositorio.
2. Instala las dependencias con npm:

   npm install
   
Endpoints
Iniciar Sesión
Descripción: Endpoint para autenticar usuarios y generar un token JWT.
URL: /iniciarSesion
Método: GET
Parámetros:
email: Email del usuario.
password: Contraseña del usuario.
Respuesta Exitosa:
Código: 200
Contenido: HTML con mensaje de bienvenida y token JWT almacenado en sessionStorage.
Respuesta de Error:
Código: 401
Contenido: Mensaje de error en caso de credenciales incorrectas.
Ruta Restringida
Descripción: Endpoint para acceder a una ruta restringida utilizando JWT.
URL: /rutaRestringida
Método: GET
Headers:
Authorization: Bearer <token>
Respuesta Exitosa:
Código: 200
Contenido: Mensaje de bienvenida con el email del usuario autenticado.
Respuesta de Error:
Código: 401
Contenido: Mensaje de error si el token es inválido o ha expirado.
Tecnologías Utilizadas
Express.js
JWT (JSON Web Tokens)
HTML/CSS/JavaScript (para la interfaz de usuario