import "../../styles/room.css";
import { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";

const coresFormigas = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6",
  "#aaffc3", "#800000", "#e6beff", "#aa6e28", "#fffac8", "#808000", "#ffd8b1", "#000075"
];

export default function AntRaceChart({ roomId, ants, antPositions, winnerId }) {
  const SalaId = parseInt(roomId);

  const [mensagemVencedoraDisplay, setMensagemVencedoraDisplay] = useState(null);
  const [mostrarConfete, setMostrarConfete] = useState(false);
  const [tamanhoTela, setTamanhoTela] = useState({ width: 0, height: 0 });

  const intervaloRef = useRef(null); 

  useEffect(() => {
    setTamanhoTela({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setTamanhoTela({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (winnerId && ants.length > 0) {
      const formigaGanhadora = ants.find(f => f.id === winnerId);
      if (formigaGanhadora) {
        setMensagemVencedoraDisplay(formigaGanhadora.name);
        setMostrarConfete(true);
        setTimeout(() => setMostrarConfete(false), 5000);
      }
    } else {
      setMostrarConfete(false);
      setMensagemVencedoraDisplay(null);
    }
  }, [winnerId, ants]);

  return (
    <div style={{ padding: "20px" }}>
      {mostrarConfete && (
        <Confetti width={tamanhoTela.width} height={tamanhoTela.height} numberOfPieces={200} />
      )}
      <div className="race-container">
        {ants.length === 0 ? (
          <p style={{ color: "#fff" }}>Carregando formigas para a corrida...</p>
        ) : (
          ants.map((formiga, i) => {
            const porcentagem = antPositions[formiga.id] || 0; 
            const cor = coresFormigas[i % coresFormigas.length]; 
            return (
              <div key={formiga.id} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "90px", color: "#fff", textAlign: "right" }}>{formiga.name}</span>
                  <div style={{
                    position: "relative",
                    background: "#444",
                    height: "20px",
                    flex: 1,
                    borderRadius: "10px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      background: cor,
                      width: `${porcentagem}%`,
                      height: "100%",
                      borderRadius: "10px",
                      transition: "width 0.1s ease-in-out" 
                    }} />
                  </div>
                  <span style={{
                    color: "#fff",
                    fontWeight: "bold",
                    width: "50px",
                    textAlign: "left"
                  }}>{Math.floor(porcentagem)}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>
      {mensagemVencedoraDisplay && (
        <div className="race-container" style={{ marginTop: "20px", textAlign: "center", color: "#fff" }}>
          🎉 A vencedora foi <strong>{mensagemVencedoraDisplay}</strong>! 🏁
        </div>
      )}
    </div>
  );
} 