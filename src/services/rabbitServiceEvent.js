import amqp from 'amqplib';
import dotenv from 'dotenv';
import transporter from "../config/emailConfig.js";

dotenv.config();


export async function userEvents() {
  try {
    const connection = await amqp.connect({
          protocol: 'amqps',
          hostname: process.env.RABBITMQ_URL,
          port: 5671,
          username: process.env.RABBITMQ_USER,
          password: process.env.RABBIT_PASS,
          vhost: process.env.RABBITMQ_VHOST
        })
    const channel = await connection.createChannel();

    const exchange = 'user_event';
    const queue = 'user_created_queue';
    const routingKey = 'user.created';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    console.log(`Waiting for messages in ${queue}`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const user = JSON.parse(msg.content.toString());
        console.log("Mensaje recibido:", user);

        try {
          await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.username, // Asegúrate de que este campo contenga el correo
            subject: "¡Bienvenido a la plataforma!",
            template: "email", // Nombre de la plantilla Handlebars (por ejemplo, email.hbs)
            context: {
              nombre: user.username, // Puedes ajustar este campo si cuentas con el nombre real
              password: user.password,
              mensaje: "Gracias por registrarte en nuestra plataforma. ¡Te damos la bienvenida!",
            },
          });
          console.log(`Correo enviado a ${user.username} con éxito`);
        } catch (error) {
          console.error("Error al enviar correo:", error);
        }
        channel.ack(msg);
      }
    }, { noAck: false });

    connection.on('close', () => {
      console.error('Conexión cerrada, intentando reconectar en 5s...');
      setTimeout(userEvents, 5000);
    });
  } catch (error) {
    console.error('Error al conectar a RabbitMQ:', error.message);
    console.log('Reintentando en 5s...');
    setTimeout(userEvents, 5000);
  }
}
