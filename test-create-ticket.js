const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCreateTicket() {
  try {
    console.log('🧪 Probando creación de ticket...');
    
    const ticketData = {
      solicitante: 'Pamela Test',
      solicitud: 'Prueba de creación de ticket',
      categoria: 'Soporte Técnico',
      agente: 'JESUS MURRUGARRA',
      area: 'TI',
      sede: 'Surquillo'
    };

    const response = await fetch('http://localhost:3001/api/tickets/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });

    const result = await response.json();
    
    console.log('📋 Respuesta de la API:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Ticket creado exitosamente!');
    } else {
      console.log('❌ Error al crear ticket:', result.error);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testCreateTicket();

