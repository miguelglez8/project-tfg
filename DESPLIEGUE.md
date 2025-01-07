# Despliegue

## Para subir al servidor remoto:

1. Corregir los archivos `.env` en el front-end y `application.properties` en el back-end.
2. Recordar eliminar imágenes y contenedores existentes.
3. Comandos necesarios para local:
   - Construir la imagen Docker: `docker build`, crea la imagen.
   - Ejecutar Docker: `docker run`, crea el contenedor. Para ver todos los contenedores: `docker ps -a`.
4. Instalar dependencias con NPM en el front-end antes y empaquetar todo el código:
   - Desde la raíz del proyecto front-end: `npm install`.
   - Desde la raíz del proyecto front-end: `npm run build`.
5. Compilar con Maven el back-end antes para tener el archivo `.jar`:
   - Desde la raíz del proyecto back-end: `./mvnw install -DskipTests`.
6. Para construir en local:
   - `docker build --no-cache -t frontend .` (esto para el front-end).
   - `docker build --no-cache --build-arg JAR_FILE=target/*.jar -t backend .` (esto para el back-end).
7. Importante: no tener ninguna instancia ejecutándose en local, ya que si no, los puertos están ocupados.
8. Para ejecutar en local el front-end: `docker run -p 3000:3000 myapp:v1.0`.
9. Para ejecutar en local el back-end: `docker run -p 8080:8080 myapp:v1.0`.

## Para conectarse al servidor remoto (deben de pasarse las dos imágenes):

**DATOS:**
- Ruta al archivo `.pem` (Este será necesario descargarlo en AWS)  
- Usuario: `ubuntu` (por lo general)  
- Dirección IP

1. Primer paso, conectarse por SSH:
   ```bash
   ssh -i ruta_al_archivo.pem usuario@dirección_ip
   ```
2. Tener las imágenes creadas y guardadas en un archivo `.tar`:
   ```bash
   docker image save -o nombre_del_archivo.tar imagen_docker
   ```
   (hacer esto para ambas imágenes).
3. Transferir los archivos `.tar` al servidor remoto usando `scp`:
   ```bash
   scp -i ruta_al_archivo.pem ruta_del_archivo.tar usuario@dirección_ip:/home/ubuntu
   ```
4. Requisitos en el servidor: Docker debe estar instalado.

## En el servidor remoto:

1. Cargar las imágenes desde el archivo `.tar`:
   ```bash
   sudo docker load --input nombre_del_archivo.tar
   ```
2. Ver las imágenes:
   ```bash
   sudo docker image ls
   ```
3. Ejecutar los contenedores:
   - Front-end:
     ```bash
     sudo docker run -d --restart always -p 443:443 imagen_docker_1
     ```
   - Back-end:
     ```bash
     sudo docker run -d --restart always -p 8443:8443 imagen_docker_2
     ```
4. Ver los logs del contenedor:
   ```bash
   sudo docker logs nombre_del_contenedor
   ```
5. Abrir la web en el navegador:
   ```
   https://dirección_ip
   ```
6. Ver todos los contenedores:
   ```bash
   sudo docker ps -a
   ```
7. Para detener un contenedor:
   ```bash
   sudo docker stop nombre_del_contenedor
   ```
8. Para eliminar un contenedor:
   ```bash
   sudo docker rm nombre_del_contenedor
   ```
9. Ver todas las imágenes:
   ```bash
   sudo docker images
   ```
10. Para eliminar una imagen:
    ```bash
    sudo docker image rm nombre_de_la_imagen
    ```
11. Para salir del usuario root:
    ```bash
    exit
    ```
12. Cerrar la conexión SSH para cerrar la terminal.
