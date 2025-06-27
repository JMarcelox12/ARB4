import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import '../../styles/rooms/AntRaceChart.css';

const coresFormigas = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4",
  "#46f0f0", "#f032e6", "#aaffc3", "#800000", "#e6beff", "#aa6e28"
];

// 1. Adicionamos a prop 'socket' para receber a instância do Socket.IO
export default function AntRaceChart({ socket, ants, antPositions, winnerId }) {
  const [mensagemVencedoraDisplay, setMensagemVencedoraDisplay] = useState(null);
  const [mostrarConfete, setMostrarConfete] = useState(false);
  const [tamanhoTela, setTamanhoTela] = useState({ width: 0, height: 0 });

  // Efeito para o tamanho da tela (para o confete) - Sem alterações
  useEffect(() => {
    const handleResize = () => setTamanhoTela({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. NOVO useEffect: Escuta o evento de confetes diretamente do socket
  useEffect(() => {
    // Garante que temos uma instância do socket antes de registrar o listener
    if (!socket) return;

    const handleConfettiBurst = () => {
      console.log("Recebido evento 'confetti_burst'. Ativando confetes!");
      setMostrarConfete(true);
      // Opcional: Desliga os confetes após um tempo para não sobrecarregar
      // A prop recycle={false} já ajuda, mas isso garante que o componente seja removido.
      const timer = setTimeout(() => setMostrarConfete(false), 8000); // 8 segundos de festa
      return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
    };

    socket.on('confetti_burst', handleConfettiBurst);

    // Função de limpeza para remover o listener quando o componente for desmontado
    return () => {
      socket.off('confetti_burst', handleConfettiBurst);
    };
  }, [socket]); // Roda este efeito sempre que a instância do socket mudar

  // 3. useEffect do VENCEDOR (Simplificado): Agora só se preocupa com a mensagem final
  useEffect(() => {
    if (winnerId && ants.length > 0) {
      const formigaGanhadora = ants.find(f => f.id === winnerId);
      if (formigaGanhadora) {
        setMensagemVencedoraDisplay(`Vencedor: ${formigaGanhadora.name}!`);
      }
    } else {
      // Limpa a mensagem do vencedor quando uma nova corrida começar (winnerId se torna null)
      setMensagemVencedoraDisplay(null);
    }
  }, [winnerId, ants]); // Depende apenas do winnerId para mostrar o pódio

  return (
    <div className="chart-wrapper">
      {/* A lógica de renderização dos confetes continua a mesma */}
      {mostrarConfete && (
        <Confetti
          width={tamanhoTela.width}
          height={tamanhoTela.height}
          numberOfPieces={300}
          recycle={false} // Importante: faz os confetes caírem e sumirem
          gravity={0.15}
        />
      )}

      {/* NOVO: Exibe a mensagem do vencedor de forma proeminente */}
      {mensagemVencedoraDisplay && (
        <div className="winner-announcement">
          <h2>{mensagemVencedoraDisplay}</h2>
        </div>
      )}

      <div className="race-container">
        {ants.length === 0 ? (
          <p className="loading-text">Aguardando início da próxima corrida...</p>
        ) : (
          ants.map((formiga, i) => {
            const porcentagem = antPositions[formiga.id] || 0;
            const cor = coresFormigas[i % coresFormigas.length];

            return (
              <div key={formiga.id} className="ant-row">
                <div className="ant-row-flex">
                  <span className="ant-name">{formiga.name}</span>
                  <div className="progress-track">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${porcentagem}%`,
                        backgroundColor: cor,
                        // Adiciona uma transição suave para o movimento
                        transition: 'width 0.1s linear',
                      }}
                    />
                  </div>
                  <span className="ant-percentage">{Math.floor(porcentagem)}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}