# Tarea 1 - Bases de Datos 2

### Nombre y carné de los integrantes:
- Angelo Piedra Castro 2024101262

## 1. Introducción

Este proyecto es la Tarea 1 del curso de Bases de Datos 2. La idea era hacer una pequeña API para poder ver, agregar, editar y borrar productos de **AdventureWorks** (que es una base de datos de ejemplo que da Microsoft), pero sin escribir SQL directamente dentro del código de Node.

En vez de eso, todo lo que hace la API (consultar, insertar, actualizar o eliminar) se hace llamando a **Stored Procedures** que ya están creados dentro de SQL Server. Es decir, Node solo le dice a SQL Server "ejecuta este procedimiento con estos datos", pero quien realmente sabe cómo manejar la tabla es la base de datos, no la API. A esto se le llama tener la aplicación y la base de datos "desacopladas".

Para hacerlo usé Node.js con Express para el servidor, conectado a SQL Server instalado directamente en mi Linux Mint (nada de Docker). El endpoint principal trabaja sobre la tabla `Production.Product`, y hay otro que además trae la subcategoría de cada producto haciendo un JOIN con `Production.ProductSubcategory`.

## 2. Estructura del proyecto


```
Tarea-1-Bases-de-Datos-2/
├── README.md                        
├── Script sql/                      
│   ├── getAllProducts.sql           
│   ├── getProductWithCategory.sql   
│   ├── insertProduct.sql            
│   ├── updateProduct.sql            
│   └── deleteProducts.sql           
└── codigo/                          
    ├── server.js                    
    ├── package.json                 
    ├── .env.example                 
    ├── .env                         
    ├── config/
    │   └── database.js              
    └── routes/
        └── products.js              
```

## 2.1 Video
Video Demostrando la API
https://www.youtube.com/watch?v=O38pK4J03lw

## 3. Requisitos previos

- Linux Mint o alguna distribución basada en Ubuntu 24.04 (es la que usé yo, por eso los comandos están pensados para esa versión).
- Tener acceso a `sudo` en la terminal.
- Tener internet, porque hay que descargar paquetes de Microsoft y de Node.
- Tener el archivo de respaldo (`.bak`) de la base de datos AdventureWorks (en mi caso usé `AdventureWorks2025.bak`).
- [SQL Server para Linux](https://learn.microsoft.com/sql/linux/sql-server-linux-overview) (se instala en el paso 4).
- [Node.js](https://nodejs.org/) (se instala en el paso 6, con `nvm`).
- (Opcional) La extensión [SQL Server (mssql)](https://marketplace.visualstudio.com/items?itemName=ms-mssql.mssql) para VS Code, que sirve para ver la base de datos desde el mismo editor sin usar la terminal todo el tiempo.

## 4. Instalación de SQL Server en Linux paso a paso

Estos son los pasos que seguí en la práctica para instalar **SQL Server 2025** directamente en Linux Mint (sin Docker). Son básicamente los mismos pasos que trae la documentación oficial de Microsoft, adaptados a lo que fui haciendo en mi terminal.

### 4.1. Importar la clave GPG del repositorio de Microsoft

Esto es necesario para que el sistema confíe en los paquetes que vienen de Microsoft:

```bash
curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg
```

### 4.2. Agregar el repositorio de SQL Server

Con esto le decimos a `apt` de dónde puede descargar el paquete de SQL Server:

```bash
curl -fsSL https://packages.microsoft.com/config/ubuntu/24.04/mssql-server-2025.list | sudo tee /etc/apt/sources.list.d/mssql-server-2025.list
```

### 4.3. Actualizar el índice de paquetes e instalar SQL Server

```bash
sudo apt-get update
sudo apt-get install -y mssql-server
```

### 4.4. Ejecutar la configuración inicial

```bash
sudo /opt/mssql/bin/mssql-conf setup
```

Este comando es interactivo, o sea que te va preguntando cosas en la terminal:
- Qué edición quieres usar (yo elegí **Developer**, que es gratis y sirve perfecto para estudiar).
- Aceptar la licencia de uso.
- Poner una contraseña para el usuario `sa`, que viene siendo como el "administrador" de SQL Server. Ojo que pide que la contraseña sea algo robusta (mayúsculas, números, etc.), si no la rechaza.

### 4.5. Verificar que el servicio esté corriendo

Con esto se puede revisar que SQL Server haya arrancado bien (debería decir `active (running)`):

```bash
systemctl status mssql-server --no-pager
```

### 4.6. Instalar las herramientas de línea de comandos (`sqlcmd`)

`sqlcmd` es como un "cliente" para poder escribir consultas SQL desde la terminal, sin necesidad de una interfaz gráfica:

```bash
sudo apt-get install -y mssql-tools18 unixodbc-dev
```

Después hay que agregar `sqlcmd` al `PATH` para poder usarlo desde cualquier carpeta (en mi caso uso `zsh`, si usas `bash` sería `~/.bashrc`):

```bash
echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> ~/.zshrc
source ~/.zshrc
```

### 4.7. Probar la conexión

Ahora sí, se prueba que todo haya quedado bien conectándonos y pidiendo la versión de SQL Server:

```bash
sqlcmd -S localhost -U sa -P '<TU_PASSWORD_SA>' -C -Q "SELECT @@VERSION"
```

> La bandera `-C` es para que `sqlcmd` confíe en el certificado del servidor. Como es una instalación local para la tarea, el certificado no viene firmado por una entidad "oficial", entonces sin esa bandera daría error de conexión.

## 5. Restauración de la base de datos AdventureWorks

Con SQL Server ya instalado, todavía no hay ninguna base de datos con productos: hay que "restaurar" el backup de AdventureWorks para que aparezcan las tablas.

1. Descarga el archivo de respaldo `.bak` de AdventureWorks (en mi caso usé `AdventureWorks2025.bak`) y déjalo en tu carpeta de Descargas.

2. SQL Server solo puede leer archivos que estén dentro de su propia carpeta de datos, así que hay que copiarlo ahí y darle el permiso al usuario `mssql` (que es el usuario con el que corre el servicio):

```bash
sudo cp /home/steven/Descargas/AdventureWorks2025.bak /var/opt/mssql/data/
sudo chown mssql:mssql /var/opt/mssql/data/AdventureWorks2025.bak
```

3. Antes de restaurar hay que saber cómo se llaman internamente los archivos de datos (`.mdf`) y de log (`.ldf`) dentro del backup, porque el siguiente comando los necesita:

```bash
sqlcmd -S localhost -U sa -P '<TU_PASSWORD_SA>' -C -Q "RESTORE FILELISTONLY FROM DISK = '/var/opt/mssql/data/AdventureWorks2025.bak'"
```

4. Con esos nombres, ya se puede restaurar la base de datos de verdad:

```bash
sqlcmd -S localhost -U sa -P '<TU_PASSWORD_SA>' -C -Q "RESTORE DATABASE AdventureWorks2025 FROM DISK = '/var/opt/mssql/data/AdventureWorks2025.bak' WITH MOVE 'AdventureWorks' TO '/var/opt/mssql/data/AdventureWorks2025.mdf', MOVE 'AdventureWorks_log' TO '/var/opt/mssql/data/AdventureWorks2025_log.ldf'"
```

5. Para comprobar que sí funcionó, se puede pedir la lista de tablas que quedaron:

```bash
sqlcmd -S localhost -U sa -P '<TU_PASSWORD_SA>' -C -Q "SELECT name FROM AdventureWorks2025.sys.tables ORDER BY name"
```

6. Por último falta crear los Stored Procedures que usa la API. Los scripts están en la carpeta [`Script sql/`](Script%20sql/) de este repo y hay que ejecutarlos, en este orden, contra la base `AdventureWorks2025`:

- [`getAllProducts.sql`](Script%20sql/getAllProducts.sql) → crea `sp_GetAllProducts`
- [`getProductWithCategory.sql`](Script%20sql/getProductWithCategory.sql) → crea `sp_GetProductWithCategory`
- [`insertProduct.sql`](Script%20sql/insertProduct.sql) → crea `sp_InsertProduct`
- [`updateProduct.sql`](Script%20sql/updateProduct.sql) → crea `sp_UpdateProduct`
- [`deleteProducts.sql`](Script%20sql/deleteProducts.sql) → crea `sp_DeleteProduct`

Esto se puede hacer desde `sqlcmd`, o de forma más cómoda abriendo cada archivo con la extensión de SQL Server en VS Code y dándole "Run" contra la conexión de `AdventureWorks2025`.

> **Ojo:** si después editas alguno de estos scripts (por ejemplo, para agregarle un parámetro nuevo), correr el archivo tal cual con `CREATE PROCEDURE` va a fallar porque el procedure ya existe. En ese caso hay que ejecutar el mismo cuerpo con `ALTER PROCEDURE` en vez de `CREATE PROCEDURE` contra la base de datos, para que el procedure ya creado quede sincronizado con el archivo del repo. Si no se hace esto, la API sigue llamando al procedure con la firma vieja y tira errores como `Procedure or function sp_UpdateProduct has too many arguments specified.`

## 6. Instalación de Node.js y las dependencias del proyecto

Para instalar Node.js usé **nvm** (Node Version Manager), que es una herramienta que permite tener varias versiones de Node instaladas y cambiar entre ellas fácilmente:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 24
node -v   # v24.13.1
npm -v    # 11.8.0
```

Ya con Node.js instalado, hay que meterse a la carpeta [`codigo/`](codigo/) del proyecto (ahí está el `package.json`) e instalar las dependencias:

```bash
cd codigo
npm install
```

Esto va a descargar estos paquetes (están listados en [`package.json`](codigo/package.json)):

| Paquete   | Versión   | Uso |
|-----------|-----------|-----|
| `express` | `^5.2.1`  | Framework HTTP para exponer la API REST |
| `mssql`   | `^12.7.2` | Driver para conectarse a SQL Server y ejecutar los Stored Procedures |
| `dotenv`  | `^17.4.2` | Carga de variables de entorno desde el archivo `.env` |
| `cors`    | `^2.8.6`  | Habilita CORS para que la API pueda ser consumida desde otros orígenes |

## 7. Configuración del archivo `.env`

Para que la API sepa cómo conectarse a SQL Server, esos datos no van escritos directamente en el código: se leen desde un archivo `.env` usando el paquete `dotenv` (esto se ve en [`codigo/config/database.js`](codigo/config/database.js)). Por eso hay que crear un archivo `.env` dentro de la carpeta `codigo/` con estas variables (este archivo no se sube a Git, está en el [`.gitignore`](codigo/.gitignore), justamente para no exponer la contraseña):

```env
DB_USER=<usuario de SQL Server, por ejemplo "sa">
DB_PASSWORD=<contraseña del usuario>
DB_SERVER=<host del servidor, por ejemplo "localhost">
DB_DATABASE=<nombre de la base de datos, por ejemplo "AdventureWorks2025">
DB_PORT=<puerto de SQL Server, por defecto 1433>
```

También se puede agregar esta variable, que es opcional y define en qué puerto corre el servidor de Express (si no la pones, usa el 3000 por defecto), esto se ve en [`server.js`](codigo/server.js):

```env
PORT=<puerto en el que corre la API, por defecto 3000 si no se define>
```

## 8. Cómo levantar el servidor

Con las dependencias instaladas y el `.env` ya configurado, dentro de la carpeta `codigo/` corre:

```bash
node server.js
```

Si todo salió bien y logró conectarse a SQL Server, en la consola debería aparecer:

```
Se conecto con el SQL Server
Servidor escuchando en el puerto 3000
```

Y con eso ya la API queda funcionando en `http://localhost:3000/api/products`, lista para probarla con Postman o con `curl`.

## 9. Documentación de los endpoints

Estos son los endpoints que tiene la API, todos definidos en [`codigo/routes/products.js`](codigo/routes/products.js) y montados bajo `/api/products` (esto se define en [`codigo/server.js`](codigo/server.js)). Como se explicó antes, ninguno tiene SQL escrito adentro: cada uno simplemente llama a su Stored Procedure correspondiente.

### 9.1. Obtener todos los productos

| | |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/products` |
| **Stored Procedure** | `sp_GetAllProducts` |
| **Body** | No aplica |

**Ejemplo de respuesta (200):**

```json
[
  {
    "ProductID": 1,
    "Name": "Adjustable Race",
    "ProductNumber": "AR-5381",
    "Color": null,
    "StandardCost": 0,
    "ListPrice": 0,
    "ProductSubcategoryID": null,
    "SellStartDate": "2019-04-30T00:00:00.000Z"
  }
]
```

### 9.2. Obtener productos con su subcategoría (JOIN)

| | |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/products/with-category` |
| **Stored Procedure** | `sp_GetProductWithCategory` (JOIN entre `Production.Product` y `Production.ProductSubcategory`) |
| **Body** | No aplica |

**Ejemplo de respuesta (200):**

```json
[
  {
    "ProductID": 680,
    "Name": "HL Road Frame - Black, 58",
    "ProductNumber": "FR-R92B-58",
    "Color": "Black",
    "StandardCost": 1059.31,
    "ListPrice": 1431.5,
    "Subcategory": "Road Frames"
  }
]
```

### 9.3. Insertar un producto

| | |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/products` |
| **Stored Procedure** | `sp_InsertProduct` |

**Body esperado (JSON):**

```json
{
  "name": "Bicicleta de prueba",
  "productNumber": "TEST-001",
  "color": "Rojo",
  "standardCost": 100.50,
  "listPrice": 199.99,
  "subcategoryID": 1
}
```

> `color` y `subcategoryID` son opcionales (se envían como `NULL` si no se proveen). El campo de subcategoría acepta tanto `subcategoryID` como `ProductSubcategoryID`; si se manda con cualquier otro nombre, se guarda como `NULL` sin dar error.

**Ejemplo de respuesta (200):**

```json
{
  "message": "Producto insertado correctamente",
  "productId": 1001
}
```

### 9.4. Actualizar un producto

| | |
|---|---|
| **Método** | `PUT` |
| **Ruta** | `/api/products/:id` (`:id` = `ProductID` a actualizar) |
| **Stored Procedure** | `sp_UpdateProduct` |

**Body esperado (JSON):**

```json
{
  "name": "Bicicleta de prueba (editada)",
  "color": "Azul",
  "standardCost": 110.00,
  "listPrice": 210.00,
  "subcategoryID": 2
}
```

> Igual que en el insert, el campo de subcategoría acepta `subcategoryID` o `ProductSubcategoryID`.

**Ejemplo de respuesta (200):**

```json
{
  "message": "Producto actualizado correctamente"
}
```

### 9.5. Eliminar un producto

| | |
|---|---|
| **Método** | `DELETE` |
| **Ruta** | `/api/products/:id` (`:id` = `ProductID` a eliminar) |
| **Stored Procedure** | `sp_DeleteProduct` |
| **Body** | No aplica |

**Ejemplo de respuesta (200):**

```json
{
  "message": "Producto eliminado correctamente"
}
```

### Manejo de errores

Si algo sale mal (por ejemplo, un dato inválido o que se caiga la conexión con SQL Server), todos los endpoints responden con un estado `500` y este formato:

```json
{
  "error": "<mensaje de error>"
}
```

## 10. Datos de prueba

Para comprobar que todo funcionara de verdad, levanté el servidor localmente y probé los 5 endpoints uno por uno contra mi base `AdventureWorks2025` ya restaurada. Abajo dejo las peticiones y respuestas reales que obtuve. Si quieres, puedes reemplazar cada bloque por tu propia captura de Postman.

### GET /api/products

**Request:** `GET http://localhost:3000/api/products`

**Response (200)** — 504 registros en total, primeros 3:

```json
[
  {
    "ProductID": 1,
    "Name": "Adjustable Race",
    "ProductNumber": "AR-5381",
    "Color": null,
    "StandardCost": 0,
    "ListPrice": 0,
    "ProductSubcategoryID": null,
    "SellStartDate": "2019-04-30T00:00:00.000Z"
  },
  {
    "ProductID": 2,
    "Name": "Bearing Ball",
    "ProductNumber": "BA-8327",
    "Color": null,
    "StandardCost": 0,
    "ListPrice": 0,
    "ProductSubcategoryID": null,
    "SellStartDate": "2019-04-30T00:00:00.000Z"
  },
  {
    "ProductID": 3,
    "Name": "BB Ball Bearing",
    "ProductNumber": "BE-2349",
    "Color": null,
    "StandardCost": 0,
    "ListPrice": 0,
    "ProductSubcategoryID": null,
    "SellStartDate": "2019-04-30T00:00:00.000Z"
  }
]
```

### GET /api/products/with-category

**Request:** `GET http://localhost:3000/api/products/with-category`

**Response (200)** — 295 registros en total, primeros 3:

```json
[
  {
    "ProductID": 680,
    "Name": "HL Road Frame - Black, 58",
    "ProductNumber": "FR-R92B-58",
    "Color": "Black",
    "StandardCost": 1059.31,
    "ListPrice": 1431.5,
    "Subcategory": "Road Frames"
  },
  {
    "ProductID": 706,
    "Name": "HL Road Frame - Red, 58",
    "ProductNumber": "FR-R92R-58",
    "Color": "Red",
    "StandardCost": 1059.31,
    "ListPrice": 1431.5,
    "Subcategory": "Road Frames"
  },
  {
    "ProductID": 707,
    "Name": "Sport-100 Helmet, Red",
    "ProductNumber": "HL-U509-R",
    "Color": "Red",
    "StandardCost": 13.0863,
    "ListPrice": 34.99,
    "Subcategory": "Helmets"
  }
]
```

### POST /api/products

**Request:** `POST http://localhost:3000/api/products`

```json
{
  "name": "Bicicleta de Prueba README",
  "productNumber": "README-TEST-001",
  "color": "Verde",
  "standardCost": 150.75,
  "listPrice": 249.99,
  "subcategoryID": 1
}
```

**Response (200):**

```json
{
  "message": "Producto insertado correctamente",
  "productId": 1004
}
```

Verificación posterior con `GET /api/products` (el producto quedó registrado con el `ProductID` devuelto):

```json
{
  "ProductID": 1004,
  "Name": "Bicicleta de Prueba README",
  "ProductNumber": "README-TEST-001",
  "Color": "Verde",
  "StandardCost": 150.75,
  "ListPrice": 249.99,
  "ProductSubcategoryID": 1,
  "SellStartDate": "2026-09-15T22:50:09.630Z"
}
```

### PUT /api/products/:id

**Request:** `PUT http://localhost:3000/api/products/1004`

```json
{
  "name": "Bicicleta de Prueba README (editada)",
  "color": "Azul",
  "standardCost": 160.00,
  "listPrice": 259.99,
  "subcategoryID": 2
}
```

**Response (200):**

```json
{
  "message": "Producto actualizado correctamente"
}
```

Verificación posterior con `GET /api/products` (los campos quedaron actualizados):

```json
{
  "ProductID": 1004,
  "Name": "Bicicleta de Prueba README (editada)",
  "ProductNumber": "README-TEST-001",
  "Color": "Azul",
  "StandardCost": 160,
  "ListPrice": 259.99,
  "ProductSubcategoryID": 2,
  "SellStartDate": "2026-09-15T22:50:09.630Z"
}
```

### DELETE /api/products/:id

**Request:** `DELETE http://localhost:3000/api/products/1004`

**Response (200):**

```json
{
  "message": "Producto eliminado correctamente"
}
```

Verificación posterior con `GET /api/products`: el `ProductID` 1004 ya no aparece en el listado, confirmando el borrado.

## 11. Referencias

Estas son las páginas que use de guía mientras hacía la tarea:

- [Instalar SQL Server en Ubuntu (Microsoft Learn)](https://learn.microsoft.com/sql/linux/quickstart-install-connect-ubuntu) — guía oficial para instalar SQL Server nativo en Linux.
- [SQL Server en Linux - Overview (Microsoft Learn)](https://learn.microsoft.com/sql/linux/sql-server-linux-overview)
- [sqlcmd (Microsoft Learn)](https://learn.microsoft.com/sql/tools/sqlcmd/sqlcmd-utility) — utilidad de línea de comandos para conectarse y correr scripts SQL.
- [Bases de datos de ejemplo AdventureWorks (repositorio oficial de Microsoft)](https://github.com/Microsoft/sql-server-samples) — de aquí se descarga el `.bak`.
- [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm)
- [Documentación de Node.js](https://nodejs.org/en/docs)
- [Express](https://expressjs.com/)
- [Paquete `mssql` (npm)](https://www.npmjs.com/package/mssql) — driver para conectar Node con SQL Server.
- [Paquete `dotenv` (npm)](https://www.npmjs.com/package/dotenv)
- [Paquete `cors` (npm)](https://www.npmjs.com/package/cors)
- [Extensión SQL Server (mssql) para VS Code](https://marketplace.visualstudio.com/items?itemName=ms-mssql.mssql)