import '../../styles/rooms/RankingPodium.css';

const medalhas = ['🥇', '🥈', '🥉'];

export default function RankingPodium({ finalOrder, ants }){
  // Se não tivermos os dados, não mostramos nada
  if (!finalOrder || !ants || ants.length === 0) {
    return null;
  }

  // Vamos criar um mapa para encontrar os dados de uma formiga pelo seu ID rapidamente.
  // Isso é muito mais eficiente do que fazer um .find() dentro do loop.
  const antMap = new Map(ants.map(ant => [ant.id, ant]));

  // Agora, criamos a lista de resultados ordenada, combinando a ordem final com os dados das formigas.
  const sortedAnts = finalOrder.map(antId => antMap.get(antId)).filter(Boolean); // .filter(Boolean) remove qualquer resultado undefined

  return (
    <div className="ranking-container">
      <div className="row">
        <div className="col">
            <h2>🏁 Resultado Final da Corrida 🏁</h2>
        
            {/* O Pódio para os 3 primeiros */}
            <div className="podium">
                {/* Segundo Lugar */}
                {sortedAnts[1] && (
                <div className="podium-place second">
                    <div className="podium-icon">{medalhas[1]}</div>
                    <div className="podium-name">{sortedAnts[1].name}</div>
                    <div className="podium-bar">2º</div>
                </div>
                )}

                {/* Primeiro Lugar */}
                {sortedAnts[0] && (
                <div className="podium-place first">
                    <div className="podium-icon">{medalhas[0]}</div>
                    <div className="podium-name">{sortedAnts[0].name}</div>
                    <div className="podium-bar">1º</div>
                </div>
                )}

                {/* Terceiro Lugar */}
                {sortedAnts[2] && (
                <div className="podium-place third">
                    <div className="podium-icon">{medalhas[2]}</div>
                    <div className="podium-name">{sortedAnts[2].name}</div>
                    <div className="podium-bar">3º</div>
                </div>
                )}
            </div>
        </div>

        {/* A lista com o restante dos colocados */}
        <div className="col">
            <div className="results-list">
                <h4>Demais Colocações</h4>
                <ul>
                {sortedAnts.slice(3).map((ant, index) => (
                    <li key={ant.id}>
                    <span className="position">{index + 4}º</span>
                    <span className="name">{ant.name}</span>
                    </li>
                ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};