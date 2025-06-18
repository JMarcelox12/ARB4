import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import '../../styles/AntRaceChart.css'; // Importamos o nosso novo arquivo de estilo

// Array de cores para dar vida às barras
const coresFormigas = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", 
  "#46f0f0", "#f032e6", "#aaffc3", "#800000", "#e6beff", "#aa6e28"
];

export default function AntRaceChart({ ants, antPositions, winnerId }) {
  const [mensagemVencedoraDisplay, setMensagemVencedoraDisplay] = useState(null);
  const [mostrarConfete, setMostrarConfete] = useState(false);
  const [tamanhoTela, setTamanhoTela] = useState({ width: 0, height: 0 });

  // Efeito para o tamanho da tela (para o confete)
  useEffect(() => {
    const handleResize = () => setTamanhoTela({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Efeito para o vencedor
  useEffect(() => {
    if (winnerId && ants.length > 0) {
      const formigaGanhadora = ants.find(f => f.id === winnerId);
      if (formigaGanhadora) {
        setMensagemVencedoraDisplay(formigaGanhadora.name);
        setMostrarConfete(true);
        const timer = setTimeout(() => setMostrarConfete(false), 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setMostrarConfete(false);
      setMensagemVencedoraDisplay(null);
    }
  }, [winnerId, ants]);

  return (
    <div className="chart-wrapper">
      {mostrarConfete && (
        <Confetti width={tamanhoTela.width} height={tamanhoTela.height} numberOfPieces={200} recycle={false} />
      )}
      <div className="race-container">
        {ants.length === 0 ? (
          <p className="loading-text">Carregando formigas para a corrida...</p>
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
      {mensagemVencedoraDisplay && (
        <div className="winner-message-container">
          🎉 A vencedora foi <strong>{mensagemVencedoraDisplay}</strong>! 🏁
        </div>
      )}
    </div>
  );
}