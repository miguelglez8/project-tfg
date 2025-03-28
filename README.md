# Plataforma Web para la Coordinación de Trabajos Académicos · Web App

El proyecto tiene como objetivo abordar los problemas de comunicación y la pérdida de información que comúnmente se encuentran al coordinar trabajos académicos, como los Trabajos de Fin de Grado (TFG), a través del correo electrónico. Para resolver esto, se desarrolló una aplicación web que centraliza la gestión de proyectos académicos, ofreciendo funciones como asignación de roles, creación y gestión de TFG, asignación de estudiantes, subida de archivos, chat, videollamadas, gestión de tareas y generación de informes.

La plataforma está diseñada para optimizar la colaboración entre profesores y estudiantes, proporcionando una interfaz intuitiva y aprovechando tecnologías modernas para garantizar eficiencia, escalabilidad y adaptabilidad futura. Esencialmente, sirve como una solución integral para centralizar la información y simplificar la coordinación de proyectos académicos.

<img src="https://github.com/miguelglez8/project-tfg/blob/main/frontend/public/logo.png" width="200">

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

### Configuración de HTTPS
Para habilitar HTTPS en producción, es necesario contar con un archivo `keystore.p12`, que es un almacén de claves que contiene el certificado SSL y la clave privada.

**¿Qué es keytool?**
`keytool` es una utilidad de línea de comandos incluida en el JDK (Java Development Kit) que permite la creación y gestión de certificados digitales y almacenes de claves.

### Cómo generar un keystore.p12
Puedes generar un archivo `keystore.p12` usando el siguiente comando:

```bash
keytool -genkey -alias tomcat -keyalg RSA -keystore keystore.p12 -storetype PKCS12
```

**Descripción de los parámetros:**
- `-genkey`: Genera un nuevo par de claves.
- `-alias tomcat`: Nombre del alias para identificar la clave dentro del almacén.
- `-keyalg RSA`: Algoritmo RSA para la clave.
- `-keystore keystore.p12`: Nombre del archivo keystore.
- `-storetype PKCS12`: Formato del keystore, que es estándar para certificados SSL.

Durante la ejecución del comando, se te pedirá que ingreses información como:
- Contraseña del keystore.
- Nombre y apellido.
- Nombre de la organización.
- Nombre de la unidad organizativa.
- Nombre del dominio o dirección IP.
- País del solicitante.

Una vez creado el `keystore.p12`, actualiza la contraseña en la configuración correspondiente en el archivo `application.properties`.

---

## Notas adicionales

Es importante tener en cuenta que, aunque la aplicación se ejecuta en local, es necesario disponer de conexión a internet, ya que se utiliza un servidor remoto para almacenar y recuperar ficheros y/o datos, además de otro para poder comunicarnos mediante llamadas.
