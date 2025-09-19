// Configuración de URLs del sistema
export const getServerConfig = () => {
  const serverIP = process.env.NEXT_PUBLIC_SERVER_IP || 'localhost';
  const serverPort = process.env.NEXT_PUBLIC_SERVER_PORT || '3001';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://${serverIP}:${serverPort}`;
  
  return {
    serverIP,
    serverPort,
    apiUrl,
    baseUrl: `http://${serverIP}:${serverPort}`,
    dashboardUrl: `http://${serverIP}:${serverPort}/dashboard`,
    ticketsUrl: `http://${serverIP}:${serverPort}/tickets`,
    agentesUrl: `http://${serverIP}:${serverPort}/agentes`,
    areasUrl: `http://${serverIP}:${serverPort}/areas`,
  };
};

export const config = getServerConfig();
