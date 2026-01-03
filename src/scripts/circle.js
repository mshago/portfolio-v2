import gsap from 'https://esm.sh/gsap';

document.addEventListener('DOMContentLoaded', () => {
  // document.addEventListener('astro:page-load', () => {
  const cursor = document.querySelector('.cursor');
  const stringSVG = document.getElementById('svg');
  const stringPath = document.getElementById('cuerdaPath');

  const centerX = stringSVG.clientWidth / 2;
  const centerY = stringSVG.clientHeight / 2;
  const radioCuerda = 200;
  const numPuntos = 5000;
  const puntosCuerda = [];

  let mouseX = centerX;
  let mouseY = centerY;
  const sensivilidadDistancia = 100;
  const fuerzaEstiramiento = 0.4; // Qué tan fuerte se estira la cuerda (0 a 1)
  const rigidezCuerda = 0.1; // Qué tan rápido la cuerda vuelve a su posición original

  // 1. Inicializar los puntos de la cuerda en una forma circular
  function inicializarCuerda() {
    for (let i = 0; i < numPuntos; i++) {
      const angulo = (i / numPuntos) * Math.PI * 2;
      const xOriginal = centerX + radioCuerda * Math.cos(angulo);
      const yOriginal = centerY + radioCuerda * Math.sin(angulo);
      puntosCuerda.push({
        x: xOriginal,
        y: yOriginal,
        originalX: xOriginal,
        originalY: yOriginal,
        velocidadX: 0,
        velocidadY: 0,
      });
    }
    actualizarPathSVG(); // Dibujar la cuerda por primera vez
  }

  // 2. Capturar la posición del ratón
  stringSVG.addEventListener('mousemove', (e) => {
    const rect = stringSVG.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  stringSVG.addEventListener('mouseleave', () => {
    // Cuando el ratón sale, que la cuerda regrese a su forma original
    mouseX = centerX;
    mouseY = centerY;
  });

  // 3. Función para actualizar la forma de la cuerda
  function actualizarCuerda() {
    puntosCuerda.forEach((punto, index) => {
      const dx = mouseX - punto.x;
      const dy = mouseY - punto.y;
      const distancia = Math.sqrt(dx * dx + dy * dy);

      // Calcular la fuerza de atracción/repulsión
      if (distancia < sensivilidadDistancia) {
        // Cuanto más cerca el ratón, mayor el estiramiento
        const fuerza =
          (1 - distancia / sensivilidadDistancia) * fuerzaEstiramiento;

        const targetX = punto.originalX + (mouseX - punto.originalX) * fuerza;
        const targetY = punto.originalY + (mouseY - punto.originalY) * fuerza;

        // Aplicar una fuerza hacia el target y una fuerza de "rigidez"
        punto.velocidadX += (targetX - punto.x) * rigidezCuerda;
        punto.velocidadY += (targetY - punto.y) * rigidezCuerda;
      } else {
        // Si el ratón está lejos, la cuerda tiende a su posición original
        punto.velocidadX += (punto.originalX - punto.x) * rigidezCuerda;
        punto.velocidadY += (punto.originalY - punto.y) * rigidezCuerda;
      }

      // Aplicar fricción para evitar que los puntos se muevan indefinidamente
      punto.velocidadX *= 0.9;
      punto.velocidadY *= 0.9;

      // Actualizar la posición del punto
      punto.x += punto.velocidadX;
      punto.y += punto.velocidadY;

      // También puedes suavizar el movimiento con GSAP aquí, pero el sistema de velocidad ya hace un buen trabajo.
      // Si quisieras GSAP para un suavizado más explícito:
      gsap.to(punto, {
        x: punto.x,
        y: punto.y,
        duration: 0.3,
        ease: 'power2.out',
      });
      // gsap.to(punto, {x: punto.x, y: punto.y, duration: 0.1, ease: "power2.out"});
    });

    actualizarPathSVG();
  }

  // 4. Dibujar la cuerda en el SVG
  function actualizarPathSVG() {
    let pathData = `M ${puntosCuerda[0].x},${puntosCuerda[0].y}`;
    for (let i = 1; i < numPuntos; i++) {
      pathData += ` L ${puntosCuerda[i].x},${puntosCuerda[i].y}`;
    }
    // Cerrar la forma para que sea un círculo
    pathData += ` Z`;
    cuerdaPath.setAttribute('d', pathData);
  }

  // 5. Bucle de animación con GSAP Ticker
  gsap.ticker.add(actualizarCuerda);

  // Iniciar la animación
  inicializarCuerda();
});
