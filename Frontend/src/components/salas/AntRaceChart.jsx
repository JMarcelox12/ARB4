import "../../styles/room.css";
import { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";
import api from "../../services/api";

const coresFormigas = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6",
  "#aaffc3", "#800000", "#e6beff", "#aa6e28", "#fffac8", "#808000", "#ffd8b1", "#000075"
];

export default function AntRaceChart({roomId}) {
  const SalaId = parseInt(roomId);

  const [formigas, setFormigas] = useState([]);
  const [posicoes, setPosicoes] = useState([]);
  const [correndo, setCorrendo] = useState(false);
  const [resultadosClassificacaoBackend, setResultadosClassificacaoBackend] = useState({});
  const [mensagemVencedoraDisplay, setMensagemVencedoraDisplay] = useState(null);

  const [mostrarConfete, setMostrarConfete] = useState(false);
  const [tamanhoTela, setTamanhoTela] = useState({ width: 0, height: 0 });

  const intervaloRef = useRef(null);

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const responseFormigas = await api.get(`/app/room/ants/${SalaId}`);
        const loadedFormigas = responseFormigas.data;
        setFormigas(loadedFormigas);
        setPosicoes(Array(loadedFormigas.length).fill(0));


        const responseSala = await api.get(`/app/room/sala/${SalaId}`);
        const sala = responseSala.data[0];

        if (sala && sala.winnerId) {
            setResultadosClassificacaoBackend({
                primeiro: sala.winnerId,
                segundo: sala.vice,
                terceiro: sala.terceiro,
                quarto: sala.quarto,
                quinto: sala.quinto,
                sexto: sala.sexto,
                setimo: sala.penultimo,
                oitavo: sala.ultimo
            });
            setCorrendo(true);
        } else {
            console.warn("Nenhum resultado de corrida (winnerId) encontrado na sala. A corrida não será animada.");
        }
      } catch (erro) {
        console.error("Erro ao carregar dados iniciais:", erro);
        setCorrendo(false);
      }
    }
    carregarDadosIniciais();
  }, [SalaId]);

  useEffect(() => {
    setTamanhoTela({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setTamanhoTela({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!correndo || formigas.length === 0 || !resultadosClassificacaoBackend.primeiro) {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
      return;
    }

    const posicoesAlvo = Array(formigas.length).fill(0);

    const rankPorcentagens = {
      primeiro: 100,
      segundo: 90, // Mudei um pouco para ser mais linear
      terceiro: 65,
      quarto: 50,
      quinto: 45,
      sexto: 30,
      setimo: 20,
      oitavo: 10, // Diminuí ainda mais para que o último fique bem para trás
    };

    Object.keys(resultadosClassificacaoBackend).forEach(rankKey => {
      const formigaId = resultadosClassificacaoBackend[rankKey];
      if (formigaId !== null) {
        const formigaIndex = formigas.findIndex(f => f.id === formigaId); 
        if (formigaIndex !== -1 && rankPorcentagens[rankKey] !== undefined) {
          posicoesAlvo[formigaIndex] = rankPorcentagens[rankKey];
        }
      }
    });

    formigas.forEach((formiga, index) => {
        const isClassified = Object.values(resultadosClassificacaoBackend).some(id => id === formiga.id);
        if (!isClassified) {
            posicoesAlvo[index] = Math.floor(Math.random() * 8); 
        }
    });


    intervaloRef.current = setInterval(() => {
      setPosicoes((posicoesAtuais) => {
        let todasChegaram = true;
        const novasPosicoes = posicoesAtuais.map((pos, index) => {
          const alvo = posicoesAlvo[index];
          const passo = Math.max(0.5, (alvo - pos) / 10 + Math.random() * 2);
          const novaPos = Math.min(pos + passo, alvo);

          if (novaPos < alvo - 0.1) {
            todasChegaram = false;
          }
          return novaPos;
        });

        if (todasChegaram) {
          clearInterval(intervaloRef.current);
          setCorrendo(false);
          const formigaGanhadora = formigas.find(f => f.id === resultadosClassificacaoBackend.primeiro);
          if (formigaGanhadora) {
            setMensagemVencedoraDisplay(formigaGanhadora.name);
            setMostrarConfete(true);
            setTimeout(() => setMostrarConfete(false), 5000);
          }
        }
        return novasPosicoes;
      });
    }, 100);

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, [correndo, formigas, resultadosClassificacaoBackend]);

  return (
    <div style={{ padding: "20px" }}>
      {mostrarConfete && (
        <Confetti width={tamanhoTela.width} height={tamanhoTela.height} numberOfPieces={200} />
      )}
      <div className="race-container">
        {formigas.length === 0 ? (
          <p style={{ color: "#fff" }}>Carregando formigas e resultados da corrida...</p>
        ) : (
          formigas.map((formiga, i) => {
            const porcentagem = Math.floor(posicoes[i]);
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
                  }}>{porcentagem}%</span>
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
      {formigas.length > 0 && resultadosClassificacaoBackend.primeiro && (
        <div className="race-container" style={{ marginTop: "20px", textAlign: "center", color: "#fff" }}>
          <h3>Classificação Final:</h3>
          <ul>
            {[
              { id: resultadosClassificacaoBackend.primeiro, rankText: '1º', alias: 'Primeiro' },
              { id: resultadosClassificacaoBackend.segundo, rankText: '2º', alias: 'Segundo' },
              { id: resultadosClassificacaoBackend.terceiro, rankText: '3º', alias: 'Terceiro' },
              { id: resultadosClassificacaoBackend.quarto, rankText: '4º', alias: 'Quarto' },
              { id: resultadosClassificacaoBackend.quinto, rankText: '5º', alias: 'Quinto' },
              { id: resultadosClassificacaoBackend.sexto, rankText: '6º', alias: 'Sexto' },
              { id: resultadosClassificacaoBackend.setimo, rankText: '7º', alias: 'Sétimo' },
              { id: resultadosClassificacaoBackend.oitavo, rankText: '8º', alias: 'Oitavo' },
            ].map((item) => {
              if (!item.id) return null;
              const formigaClassificada = formigas.find(f => f.id === item.id);
              if (!formigaClassificada) return null;

              return (
                <li key={item.id}>
                  <strong>{item.alias ? `${item.alias}:` : `${item.rankText}:`}</strong> {formigaClassificada.name}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
} 