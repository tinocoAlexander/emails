# Usar imagen base de NodeJs
FROM node:18

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos al directorio de trabajo
COPY . .

# Exponer el puerto 3000
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]