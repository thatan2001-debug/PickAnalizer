
import { useState } from "react";

const liveMatches = [
  {
    league:"Premier League",
    home:"Liverpool",
    away:"Chelsea",
    minute:"63'",
    score:"2-1",
    analysis:"Liverpool domina posesión y tiros al arco. Alta probabilidad de Over 3.5."
  },
  {
    league:"La Liga",
    home:"Barcelona",
    away:"Sevilla",
    minute:"51'",
    score:"1-0",
    analysis:"Barcelona genera muchas ocasiones. Próximo gol probable."
  }
];

const upcomingMatches = [
  {
    date:"25 Abril",
    league:"Serie A",
    home:"Inter",
    away:"Milan",
    odds:"1.72"
  },
  {
    date:"26 Abril",
    league:"Liga Colombiana",
    home:"Nacional",
    away:"Junior",
    odds:"1.88"
  }
];

export default function App(){
  const [tab,setTab]=useState("live");

  return(
    <div className="container">
      <h1>⚽ PickAnalizer IA</h1>
      <p>Analista deportivo inteligente con IA y apuestas de valor.</p>

      <div className="tabs">
        <button className="tab" onClick={()=>setTab("live")}>🔴 En Vivo</button>
        <button className="tab" onClick={()=>setTab("scheduled")}>📅 Programados</button>
        <button className="tab" onClick={()=>setTab("tips")}>💎 Consejos IA</button>
        <button className="tab" onClick={()=>setTab("finished")}>✅ Finalizados</button>
      </div>

      {tab==="live" && (
        <div className="grid">
          {liveMatches.map((match,index)=>(
            <div className="card" key={index}>
              <h3>{match.league}</h3>
              <h2>{match.home} vs {match.away}</h2>
              <p>⏱️ {match.minute}</p>
              <p>⚽ {match.score}</p>
              <button className="tab primary">Analizar Partido</button>
              <p style={{marginTop:"15px"}}>{match.analysis}</p>
            </div>
          ))}
        </div>
      )}

      {tab==="scheduled" && (
        <>
          <div className="calendar">
            <button className="date-btn">25 Abril</button>
            <button className="date-btn">26 Abril</button>
            <button className="date-btn">27 Abril</button>
            <button className="date-btn">28 Abril</button>
          </div>

          <div className="grid">
            {upcomingMatches.map((match,index)=>(
              <div className="card" key={index}>
                <h3>{match.league}</h3>
                <h2>{match.home} vs {match.away}</h2>
                <p>📅 {match.date}</p>
                <p>💰 Cuota destacada: {match.odds}</p>
                <button className="tab primary">Analizar IA</button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab==="tips" && (
        <div className="card">
          <h2>🔥 Apuesta del Día</h2>
          <h3>Liverpool gana + Over 1.5</h3>
          <p>Cuota: 1.72</p>
          <p>Confianza: 87%</p>
          <p>La IA detecta alto valor por forma reciente, xG y dominio ofensivo.</p>
        </div>
      )}

      {tab==="finished" && (
        <div className="card">
          <h2>✅ Partidos Terminados</h2>
          <p>Aquí podrás mostrar resultados finales y picks acertados.</p>
        </div>
      )}
    </div>
  )
}
