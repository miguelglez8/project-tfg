# Plataforma Web para la Coordinación de Trabajos Académicos

## Introducción

Este documento detalla los pasos necesarios para la instalación, configuración y ejecución de la plataforma web diseñada para la coordinación de trabajos académicos. Incluye información técnica relevante sobre los requisitos del sistema, configuración de archivos y otros aspectos clave del despliegue.

---

## Instalación

### Requisitos previos

1. **Node.js**: Versión recomendada 20.11.0. Puede descargarse desde [Node.js](https://nodejs.org/).
2. **Git**: Versión recomendada 2.39.1. Puede descargarse desde [Git](https://git-scm.com/).
3. **Maven**: Versión recomendada 3.9.7. Puede descargarse desde [Apache Maven](https://maven.apache.org/).
4. **MySQL Community Server**: Versión recomendada 8.4.0. Puede descargarse desde [MySQL](https://dev.mysql.com/downloads/).
5. Configurar la base de datos MySQL e introducir la contraseña para el usuario "root".

### Pasos de instalación

1. Actualizar NPM:
   ```bash
   npm install npm -g
   ```
2. Instalar dependencias del front-end:
   ```bash
   cd TFG-CoordinacionTrabajosAcademicos/trabajos-academicos/frontend
   npm install
   ```
3. Compilar el back-end:
   ```bash
   cd TFG-CoordinacionTrabajosAcademicos/trabajos-academicos/back-end
   ./mvnw install -DskipTests
   ```

---

## Ejecución

### Iniciar la aplicación

1. **Base de datos**: Asegurarse de que la base de datos MySQL está preparada y en ejecución.

2. **Front-end**:
   ```bash
   cd TFG-CoordinacionTrabajosAcademicos/trabajos-academicos/frontend
   npm start
   ```
   Cuando aparezca el mensaje `VITE v4.5.3 ready`, abrir la URL proporcionada en el navegador.

3. **Back-end**:
   ```bash
   cd TFG-CoordinacionTrabajosAcademicos/trabajos-academicos/backend/target
   java -jar trabajos-academicos-0.0.1-SNAPSHOT.jar
   ```
   La aplicación estará disponible cuando aparezca el mensaje: `Tomcat initialized with port 8080 (http)`.
4. **Navegador**:
   Dirigirse con un navegador con soporte para WebRTC, como Mozilla Firefox o Google Chrome, a la dirección:
   ```
   localhost:3000
   ```

### Detener la aplicación

Para detener el sistema, interrumpir los procesos en las terminales correspondientes.

---

## Configuración

### Archivos de configuración

#### Front-end
Debe de crearse un archivo `.env` en `TFG-CoordinacionTrabajosAcademicos/trabajos-academicos/frontend`, y debe de contener las siguientes configuraciones:

- **VITE_PATH**: Punto de acceso de la aplicación cliente.
- **VITE_API**: URL de la API.
- **VITE_FIREBASE_***: Configuraciones para Firebase.
- **VITE_ZEGOCLOUD_***: Configuraciones para ZEGOCLOUD.

#### Back-end
El archivo `application.properties` en `TFG-CoordinacionTrabajosAcademicos/trabajos-academicos/backend/src/main/resources` incluye configuraciones como:

- **Base de datos MySQL**: Detalles de conexión.
- **Hibernate**: Configuraciones para ORM.
- **Gmail SMTP**: Credenciales para el servidor de correo.
- **JWT**: Clave para tokens de autenticación.
- **CORS**: Configuraciones para compartir recursos entre orígenes cruzados.
- **HTTPS**: Configuración para producción.

---

## Notas adicionales

Para detener la ejecución del sistema, únicamente se deberá parar el proceso que se está ejecutando en las terminales de Visual Studio Code e IntelliJ (o símbolo del sistema).
Es importante tener en cuenta que, aunque la aplicación se ejecuta en local, es necesario disponer de conexión a internet, ya que se utiliza un servidor remoto para almacenar y recuperar fotografías.
