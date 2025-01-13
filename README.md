# Plataforma Web para la Coordinación de Trabajos Académicos · Web App

<img src="https://github.com/miguelglez8/project-tfg/blob/main/frontend/public/logo.png" width="150">

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

1. **Base de datos**: Asegurarse de que la base de datos MySQL está preparada y en ejecución (ya sea en local o en remoto) y los ficheros de configuración tengan los datos necesarios.

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
   http://localhost:3000
   ```

### Detener la aplicación

Para detener el sistema, interrumpir los procesos en las terminales correspondientes.

---

## Configuración

### Archivos de configuración

#### Front-end
Debe de crearse un archivo `.env` en `TFG-CoordinacionTrabajosAcademicos/trabajos-academicos/frontend`, y debe de contener las siguientes configuraciones:

```env
VITE_PATH=http://localhost:3000
VITE_API=http://localhost:8080/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_ZEGOCLOUD_APP_ID=your_zegocloud_app_id
VITE_ZEGOCLOUD_SECRET_KEY=your_zegocloud_secret_key
```

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

Es importante tener en cuenta que, aunque la aplicación se ejecuta en local, es necesario disponer de conexión a internet, ya que se utiliza un servidor remoto para almacenar y recuperar ficheros y/o datos, además de otro para poder comunicarnos mediante llamadas.
