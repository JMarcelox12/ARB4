import "../../styles/room.css";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import api from "../../services/api";

// Nome das formmigas
const nomeFormigas = [
  "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"
]

// Cores únicas para cada formiga
const coresFormigas = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6"
];

const respostaVencedora = (vencedora, formigas) =>{
  const cont = 0
  while (vencedora !== formigas[cont].id) {
    cont++;
  }
  console.log(formigas[cont.name])
  return formigas[cont].name
}

export default function AntRaceChart({roomId}) {
  const [posicoes, setPosicoes] = useState(Array(nomeFormigas.length).fill(0));
  const [correndo, setCorrendo] = useState(true);
  const [vencedora, setVencedora] = useState(null);
  const [mensagemVencedora, setMensagemVencedora] = useState(null);
  const [mostrarConfete, setMostrarConfete] = useState(false);
  const [tamanhoTela, setTamanhoTela] = useState({ width: 0, height: 0 });
  const [formigas, setFormigas] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [status, setStatus] = useState();

  const SalaId = parseInt(roomId)

  useEffect(() => {
    //carrega as formigas
    async function carregarFormigas() {
      try {
        const response = await api.get(`/app/room/ants/${SalaId}`);
        setFormigas(response.data);
      } catch (erro) {
        console.error("Erro ao carregar formigas:", erro);
      }
    }
    carregarFormigas();

    //carrega os dados da sala (vencedores e etc)
    async function carregarDados() {
      try {
        const response = await api.get(`/app/room/sala/${SalaId}`);
        const sala = response.data[0];

        if (sala && sala.vice && sala.winnerId && sala.ultimo && sala.penultimo !== undefined) {
          setResultado([sala.vice, sala.penultimo, sala.ultimo]);
          setVencedora(sala.winnerId);
          //console.log(vencedora) 
        } else {
          console.warn("Propriedade 'vice' não encontrada");
        }
       } catch (erro) {
        console.error("Erro ao puxar resultado: ", erro);
      }
    }
    carregarDados();

    //carrega o status da sala (pause, correndo e etc)
    async function carregarStatus() {
      try {
        const response = await api.get(`/app/room/status/${SalaId}`);
        setStatus(response.data.status);
      }catch(erro){
        console.error("Erro ao puxa status: ", erro);
      }
    }
    carregarStatus();

  }, [formigas]);
  
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
          setMensagemVencedora(formigas[indexVencedora]);
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
      {formigas.map((formiga, i) => {
        const porcentagem = Math.floor(posicoes[i]);
        const cor = coresFormigas[i];
        return (
          <div key={i} style={{ marginBottom: "12px" }}>
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
      })}
      </div>
      {mensagemVencedora && (
        <div className="race-container">
          🎉 A vencedora foi <strong>{mensagemVencedora}</strong>! 🏁
        </div>
      )}
    </div>
  );
}