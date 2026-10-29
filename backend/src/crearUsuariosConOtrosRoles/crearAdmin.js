const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const preguntar = (texto) => {
  return new Promise((resolve) => rl.question(texto, resolve));
};

async function crearAdmin() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const username = await preguntar("Usuario: ");
  const name = await preguntar("Nombre: ");
  do {
    email = await preguntar("Email: ");

    if (!email || !emailRegex.test(email)) {
      console.log("Email inválido o vacío");
    }
  } while (!email || !emailRegex.test(email));
  const password = await preguntar("Contraseña: ");

  try {
    const res = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        name,
        email,
        rol: "administrador",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("Error:", data.error);
    } else {
      console.log("Admin creado correctamente");
    }

    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit();
  }
}

crearAdmin();
