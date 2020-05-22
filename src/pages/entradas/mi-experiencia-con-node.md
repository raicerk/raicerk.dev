---
path: '/mi-experiencia-con-node'
title: 'Mi experiencia con Nodejs'
description: 'This is a description of this posts'
date: 2018-03-04
published: false
---

Una de las ultimas tecnologías que se ha introducido a nuestra cartera de posibilidades es la metodología serverless, en mi opinión una de las mas convenientes, con un muy buen balance de costo y beneficio. Utilizando este se reduce mucho el tiempo de despliegue de una aplicación y dedicarle más tiempo a la programación de funciones que aporten valor.

En este articulo, te mostrarte como implementar un `CRUD` con el Framework de Serverless.

## ¿Que es Serverless?

¿Serverless? Si mi aplicación no corre sobre un servidor entonces ¿Donde corre? Es lo primero que podemos preguntarnos, pero en realidad la palabra se refiere a que esta metodología abstrae el proceso de configuración y mantenimiento de un servidor, sí adiós a configurar un servidor nginx para poder exponer tu aplicación.

También nos facilita la configuraciones de escaladas automáticas o balanceo de carga, por lo que nos deja mucho más tiempo disponible para dedicarnos al código.

Otra gran victoria, no menor, es el costo. Cuando ejecutas tu código en una maquina virtual o servidor local, este servicio tiene que tener alta disponibilidad y estar constantemente consumiendo recursos, en cambió, con serverless solo genera costos al momento de realizar una solicitud y la cantidad de tiempo que se ejecuta tu código. Esto implica una reducción de los costos significativa.

#### Pros

Los beneficios son:

- **Costo** - solo pagas por lo que usas.
- **Sencillez** - evita la necesidad de configurar infraestructura
- **Soportado en múltiples lenguajes de programación**
- **Utilizado por cualquier proveedor de cloud**
- **Varias alternativas para utilizar tus funciones (Endpoint de una api, colas de mensajes, ejecuciones programadas...)**

#### Cons

Los contras que debes tener en cuenta:

- **Manejar u Organizar el código puede ser complejo, efecto de caja negra en AWS**
- **El proceso de debug en local es un desafió**
- **La aplicación no tendrá acceso al sistema de archivos**
- **Cambiar tu proveedor de cloud puede significar cambiar el código**
- **Cold starts (segundos extra que demora en ejecutarse una función por primera vez)**
- **Tiempo de ejecución de una función (máximo 15 minutos)**

Puedes ver algunas otras limitaciones de AWS Lambda [aquí](https://docs.aws.amazon.com/lambda/latest/dg/limits.html).

Para manejar los archivos de la aplicación debes utilizar otro servicio de tu proveedor de cloud, en nuestro caso AWS, puedes ocupar un S3.

En mi ultima implementación de esta métodología pude comprobar que el _Cold Start_ para funciones escribas en JavaScript no llega a ser un problema, por otro lado si tu aplicación corre sobré JAVA la historia cambia, pero no queda todo allí como seguramente ya lo pensaste existen formas de mantener las funciones "tibias" y esperando a que llegue una petición esta ténica se llama [Lambda Warm Start](https://blog.octo.com/en/cold-start-warm-start-with-aws-lambda/).

## Serverless el Framework

Si, el Framework comparte su nombré con la métodología de desarrollo, este es una herramienta que nos permite desplegar una aplicación en Node.js fácilmente. Serverless es la navaja suiza Open Source en forma de CLI que nos facilita la integración con múltiples proveedores de cloud.

También cuenta con plugins que nos pueden facilitar la vía del desarrollo local, más adelante en este articulo utilizaras el plugin de _DynamoDB Local_.

Como si esto fuera poco también cuenta con una comunidad activa y buena documentación que te pueden ayudar a la hora de cualquier duda [Serverless.com](https://serverless.com/).

## Manos a la masa

Algunos de los problemas que puedes tener durante el desarrollo de este articulo:

- La version del Serverless Framework o algún plugin.
- Tener las credenciales de Amazon AWS correctamente configuradas. [_¿Como lo haces?_](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

Habiendo dejado en claro eso podemos comenzar, instalando el CLI de Serverless:

```bash
npm i -g serverless
serverless login
```

Ahora prepararemos el directorio donde construiremos la aplicación:

```bash
mkdir serverless-api && cd $_
npm init -y
npm i --save aws-sdk body-parser express node-uuid serverless-http
```

Ahora dentro del este directorio que acabamos de crear debemos agregar el archivo `serverless.yml` y llenarlo con lo siguiente:

```yml
service: lambda-rest-api

custom:
  tableName: 'todos-${self:provider.stage}'

provider:
  name: aws
  runtime: nodejs8.10
  stage: dev
  region: us-east-1
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:UpdateItem
        - dynamodb:DeleteItem
      Resource:
        - { 'Fn::GetAtt': ['TodosDynamoDBTable', 'Arn'] }
  environment:
    TODOS_TABLE: ${self:custom.tableName}

functions:
  todo-app:
    handler: index.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'

resources:
  Resources:
    TodosDynamoDBTable:
      Type: 'AWS::DynamoDB::Table'
      Properties:
        AttributeDefinitions:
          - AttributeName: todoId
            AttributeType: S
        KeySchema:
          - AttributeName: todoId
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
        TableName: ${self:custom.tableName}
```

Hay algunas cosas que resaltar en este archivo: el campo `service` será el nombre de nuestra aplicación, dentro de `custom` vamos a recibir un parámetro que será el nombre de la tabla en DynamoDB, que luego se guarda en una variable llamada `TODOS_TABLE`. Luego podremos acceder al valor de esta variable por el `process.env` en el código.

El resto de este archivo configura los permisos, campos, esquemas... con los que vamos a trabajar en DynamoDB, ahora vamos a agregar algunos plugins que son necesarios para el desarrollo local o también llamado `offline`.

```bash
npm i --save serverless-dynamodb-local@0.2.30 serverless-offline
```

Ahora debes incluir en el archivo `serverless.yml` las siguientes lineas, justo debajo del campo `service`:

```yml
plugins:
  - serverless-dynamodb-local
  - serverless-offline
```

El orden es importante, primero debe de estar el `serverless-dynamodb-local` y luego el `serverless-offline`.

Hasta aquí ya tenemos configurado todo el entorno que necesita nuestra aplicación para ejecutarse, ahora podemos comenzar a trabajar en el código.

Creas el archivo `index.js` y lo llenas con lo siguiente:

```javascript
const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const AWS = require('aws-sdk')
const uuid = require('node-uuid')

const { TODOS_TABLE, IS_OFFLINE } = process.env

const dynamoDb =
  IS_OFFLINE === 'true'
    ? new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000',
      })
    : new AWS.DynamoDB.DocumentClient()

app.use(bodyParser.json({ strict: false }))

app.get('/todos', (req, res) => {
  const params = {
    TableName: TODOS_TABLE,
  }

  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Error retrieving Todos' })
    }

    const { Items: todos } = result

    res.json({ todos })
  })
})

module.exports.handler = serverless(app)
```

Si has tenido experiencia con alguna otra aplicación construida con `Express` el contenido de este archivo te será bastante familiar, así le estamos dando a nuestra aplicación un único endpoint para leer todas las notas guardados.

Ahora a ejecutar nuestra api:

```bash
sls offline start --migrate
```

Luego de que termine de iniciar la aplicación podrás acceder a la ruta http://localhost:3000/todos y deberías de tener como respuesta un objeto con un array de "notas" vació: `{"todos":[]}`.

---

En caso de ver un error similar a este:

```bash
Error: spawn java ENOENT
at exports._errnoException (util.js:1022:11)
at Process.ChildProcess._handle.onexit (internal/child_process.js:193:32)
at onErrorNT (internal/child_process.js:359:16)
at _combinedTickCallback (internal/process/next_tick.js:74:11)
at process._tickDomainCallback (internal/process/next_tick.js:122:9)
```

Debes ejecutar el siguiente comando:

```bash
sls dynamodb install
```

---

Para agregar algunas notas necesitamos agregar un endpoint que lo permita, agrega este bloque de código a tu archivo `index.js` justo encima del `module.exports`:

```javascript
app.post('/todos', (req, res) => {
  const { title, done = false } = req.body

  const todoId = uuid.v4()

  const params = {
    TableName: TODOS_TABLE,
    Item: {
      todoId,
      title,
      done,
    },
  }

  dynamoDb.put(params, error => {
    if (error) {
      console.log('Error creating Todo: ', error)
      res.status(400).json({ error: 'Could not create Todo' })
    }

    res.json({ todoId, title, done })
  })
})
```

Luego de detener y volver a ejecutar la api podremos probarla con `CURL`:

```bash
curl -H "Content-Type: application/json" -X POST http://localhost:3000/todos -d '{"title": "Finish bug tickets"}'
```

Esto debe de devolvernos el objeto creado en la base de datos, por ejemplo:

```bash
{"todoId":"5c30e169-26e3-44de-9564-d23a403ddf1b","title":"Finish bug tickets","done":false}
```

Si la respuesta es como esta y no tienes ningún error, acabas de crear una nota en tu aplicación, si vas al endpoint podrás ver las notas creadas http://localhost:3000/todos.

Continuando con la API, agregamos un endpoint que nos permita ver solo una nota especificada por el ID.

```javascript
app.get('/todos/:todoId', (req, res) => {
  const { todoId } = req.params

  const params = {
    TableName: TODOS_TABLE,
    Key: {
      todoId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Error retrieving Todo' })
    }

    if (result.Item) {
      const { todoId, title, done } = result.Item
      res.json({ todoId, title, done })
    } else {
      res.status(404).json({ error: `Todo with id: ${todoId} not found` })
    }
  })
})
```

Una ves agregado este endpoint puedes probarlo con el id de alguna nota creado con anterioridad (`http://localhost:3000/todos/5c30e169-26e3-44de-9564-d23a403ddf1b`), la respuesta debe de ser solo la nota a la que corresponde el ID

```bash
{"todoId":"5c30e169-26e3-44de-9564-d23a403ddf1b","title":"Finish bug tickets","done":false}
```

Agregamos el método `PUT` de nuestra API:

```javascript
app.put('/todos', (req, res) => {
  const { todoId, title, done } = req.body

  var params = {
    TableName: TODOS_TABLE,
    Key: { todoId },
    UpdateExpression: 'set #a = :title, #b = :done',
    ExpressionAttributeNames: { '#a': 'title', '#b': 'done' },
    ExpressionAttributeValues: { ':title': title, ':done': done },
  }

  dynamoDb.update(params, error => {
    if (error) {
      console.log(`Error updating Todo with id ${todoId}: `, error)
      res.status(400).json({ error: 'Could not update Todo' })
    }

    res.json({ todoId, title, done })
  })
})
```

Lo puedes probar cambiando el campo `done` de una nota de `false` a `true` para indicar que esta lista

```bash
curl -H "Content-Type: application/json" -X PUT http://localhost:3000/todos -d '{"todoId": "5c30e169-26e3-44de-9564-d23a403ddf1b", "title": "Finish bug tickets", "done": done}'
```

Y por ultimo el método `DELETE` para nuestra api de notas

```javascript
app.delete('/todos/:todoId', (req, res) => {
  const { todoId } = req.params

  const params = {
    TableName: TODOS_TABLE,
    Key: {
      todoId,
    },
  }

  dynamoDb.delete(params, error => {
    if (error) {
      console.log(`Error updating Todo with id ${todoId}`, error)
      res.status(400).json({ error: 'Could not delete Todo' })
    }

    res.json({ success: true })
  })
})
```

Para probarlo

```bash
curl -H "Content-Type: application/json" -X DELETE http://localhost:3000/todos/5c30e169-26e3-44de-9564-d23a403ddf1b
```

Debe de eliminar la nota a la cual corresponde el ID seleccionado.

Con esto tendremos la API REST lista y funcionando en local, ahora es donde el Framework Serverless hace su magia.

Solo ejecuta `sls deploy` se tomará unos minutos y al final tendrás desplegada tu API en AWS y en caso de que todo sea un éxito podrás ver un mensaje como el siguiente:

```bash
Serverless: WARNING: Missing "tenant" and "app" properties in serverless.yml. Without these properties, you can not publish the service to the Serverless Platform.
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (26.16 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
....................................
Serverless: Stack update finished...
Service Information
service: lambda-rest-api
stage: dev
region: us-east-1
stack: lambda-rest-api-dev
api keys:
  None
endpoints:
  ANY - https://gqrbje0go5.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://gqrbje0go5.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  todo-app: lambda-rest-api-dev-todo-app
layers:
  None
```

Ahora puedes probar los mismos comandos `CURD` con este nuevo endpoint que generá AWS y validar que tu API este funcionando correctamente.

### Extras

- Puedes usar este comando para ver algunos logs `serverless logs -f todo-app -t`
- Para borrar todos los servicios que levanto esta aplicación al desplegarse en AWS `serverless remove`. _**Cuidado** no solicita confirmación_.
- Agregar a la sección de `scripts` en el archivo `package.json` la linea `"develop": "sls offline start --migrate"`.

Pueden ver el código relacionado a este articulo como guía en [GitHub](https://github.com/enBonnet/api-express-serverless).

### Creditos

Este articulo fue publicado originalmente por [Matthew Brown](https://keyholesoftware.com/author/mbrown/) en [keyholesoftware.com](https://keyholesoftware.com/2018/11/05/building-a-node-js-service-with-aws-lambda-dynamodb-and-serverless-framework/).

Me tomé la libertad de traducirlo y compartirlo, agregando algunos comentarios según mi experiencia con la finalidad de compartir conocimientos.
