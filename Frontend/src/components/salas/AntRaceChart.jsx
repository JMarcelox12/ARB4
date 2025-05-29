import "../../styles/room.css";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

const nomesFormigas = [
  "Formiga 1", "Formiga 2", "Formiga 3", "Formiga 4",
  "Formiga 5", "Formiga 6", "Formiga 7", "Formiga 8"
];

// Cores únicas para cada formiga
const coresFormigas = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8",
  "#f58231", "#911eb4", "#46f0f0", "#f032e6"
];

export default function CorridaAnts() {
  const [posicoes, setPosicoes] = useState(Array(nomesFormigas.length).fill(0));
  const [correndo, setCorrendo] = useState(true);
  const [vencedora, setVencedora] = useState(null);
  const [mostrarConfete, setMostrarConfete] = useState(false);
  const [tamanhoTela, setTamanhoTela] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setTamanhoTela({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (!correndo) return;

    const intervalo = setInterval(() => {
      setPosicoes((posicoesAtuais) => {
        const novasPosicoes = posicoesAtuais.map((pos) => {
          if (pos >= 100) return pos;
          return Math.min(pos + Math.random() * 5, 100);
        });

        const indexVencedora = novasPosicoes.findIndex((pos) => pos >= 100);
        if (indexVencedora !== -1) {
          clearInterval(intervalo);
          setCorrendo(false);
          setVencedora(nomesFormigas[indexVencedora]);
          setMostrarConfete(true);

          // Oculta o confete após 5 segundos
          setTimeout(() => setMostrarConfete(false), 5000);
        }

        return novasPosicoes;
      });
    }, 100);

    return () => clearInterval(intervalo);
  }, [correndo]);

  return (
    <div style={{ padding: "20px" }}>
      {mostrarConfete && (
        <Confetti width={tamanhoTela.width} height={tamanhoTela.height} numberOfPieces={200} />
      )}
      
      <div className="race-container">
      {nomesFormigas.map((nome, i) => {
        const porcentagem = Math.floor(posicoes[i]);
        const cor = coresFormigas[i];

        return (
          <div key={i} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "90px", color: "#fff", textAlign: "right" }}>{nome}</span>

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
              }}>{porcentagem}%</span>
            </div>
          </div>
        );
      })}
      </div>

      {vencedora && (
        <div className="race-container">
          🎉 A vencedora foi <strong>{vencedora}</strong>! 🏁
        </div>
      )}
    </div>
  );
}
