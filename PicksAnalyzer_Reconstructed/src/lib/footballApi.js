import { base44 } from "@/api/base44Client";

// League priority order
export const TOP_LEAGUES = [
  "Premier League", "Serie A", "La Liga", "Ligue 1", "Bundesliga",
  "Liga 1 BetPlay", "Liga Colombiana", "Liga BetPlay", "Dimayor",
  "Champions League", "Europa League", "Conference League",
  "Copa Libertadores", "Copa Sudamericana",
  "Liga MX", "MLS", "Eredivisie", "Primeira Liga"
];

export function sortByLeaguePriority(matches) {
  return [...matches].sort((a, b) => {
    const ai = TOP_LEAGUES.findIndex(l => a.league?.includes(l) || l.includes(a.league));
    const bi = TOP_LEAGUES.findIndex(l => b.league?.includes(l) || l.includes(b.league));
    const aIdx = ai === -1 ? 999 : ai;
    const bIdx = bi === -1 ? 999 : bi;
    return aIdx - bIdx;
  });
}

export async function fetchLiveMatches() {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Busca en internet los partidos de fútbol que se están jugando AHORA MISMO (${new Date().toISOString()}).
    IMPORTANTE: Solo incluye partidos con status "live" o "in_progress", con minuto de juego activo.
    NO incluyas partidos terminados ni programados.
    Prioriza: Premier League, Serie A, La Liga, Ligue 1, Bundesliga, Liga BetPlay Colombia, Liga 1 Perú, Champions League, Europa League, Copa Libertadores.
    Para cada partido incluye: equipos, marcador actual, minuto, liga, país, estadísticas de posesión, tiros a puerta, corners, tarjetas si disponibles.
    Retorna SOLO datos REALES de partidos en curso.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        matches: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              home_team: { type: "string" },
              away_team: { type: "string" },
              home_score: { type: "number" },
              away_score: { type: "number" },
              minute: { type: "string" },
              league: { type: "string" },
              country: { type: "string" },
              status: { type: "string" },
              home_possession: { type: "number" },
              away_possession: { type: "number" },
              home_shots: { type: "number" },
              away_shots: { type: "number" },
              home_shots_on_target: { type: "number" },
              away_shots_on_target: { type: "number" },
              home_corners: { type: "number" },
              away_corners: { type: "number" },
              home_yellow_cards: { type: "number" },
              away_yellow_cards: { type: "number" },
              home_red_cards: { type: "number" },
              away_red_cards: { type: "number" },
              home_saves: { type: "number" },
              away_saves: { type: "number" },
            }
          }
        },
        last_updated: { type: "string" }
      }
    }
  });
  return result;
}

export async function fetchFinishedMatches(dateStr) {
  const dateLabel = dateStr || new Date().toLocaleDateString('es-ES');
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Busca en internet los partidos de fútbol que TERMINARON el día ${dateLabel}.
    Solo partidos con resultado final confirmado.
    Prioriza: Premier League, Serie A, La Liga, Ligue 1, Bundesliga, Liga BetPlay Colombia, Liga 1 Perú, Champions League, Europa League, Copa Libertadores y otras ligas importantes.
    Para cada partido incluye: equipos, resultado final, liga, país, goleadores si disponibles.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        matches: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              home_team: { type: "string" },
              away_team: { type: "string" },
              home_score: { type: "number" },
              away_score: { type: "number" },
              league: { type: "string" },
              country: { type: "string" },
              scorers: { type: "array", items: { type: "string" } },
              match_time: { type: "string" }
            }
          }
        }
      }
    }
  });
  return result;
}

export async function fetchScheduledMatches(dateStr) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Busca en internet los partidos de fútbol y deportes programados ÚNICAMENTE para el día ${dateStr}.
    NO incluyas partidos en vivo ni terminados, SOLO partidos que aún no han comenzado y están programados para esa fecha.
    Prioriza en este orden: Premier League, Serie A, La Liga, Ligue 1, Bundesliga, Liga BetPlay Colombia, Liga 1 Perú, Champions League, Europa League, Copa Libertadores, Liga MX, MLS.
    Para cada partido incluye: equipos, hora exacta, liga, país, cuotas si disponibles.
    Retorna datos REALES. No inventes partidos.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        matches: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              sport: { type: "string" },
              home_team: { type: "string" },
              away_team: { type: "string" },
              match_date: { type: "string" },
              league: { type: "string" },
              country: { type: "string" },
              venue: { type: "string" },
              home_odds: { type: "number" },
              draw_odds: { type: "number" },
              away_odds: { type: "number" },
            }
          }
        }
      }
    }
  });
  return result;
}

export async function fetchMatchAnalysis(homeTeam, awayTeam, league) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Eres un analista deportivo experto. Analiza profundamente el partido: ${homeTeam} vs ${awayTeam} de ${league}.
    
    Busca en internet y analiza:
    1. Forma reciente de ambos equipos (últimos 5-10 partidos) con resultados reales
    2. Historial H2H (cara a cara) entre estos equipos - últimos 5 enfrentamientos con resultados
    3. Estadísticas clave: goles promedio, xG estimado, posesión típica, corners promedio, paradas del portero, tiros a puerta
    4. Jugadores lesionados o suspendidos actualmente
    5. Contexto del partido: ¿es decisivo? ¿hay presión de clasificación?
    6. Cuotas actuales de las principales casas de apuestas
    7. Condiciones (local/visitante, racha en casa, etc.)
    
    Basándote en TODO eso genera:
    - Probabilidades reales para 1X2
    - Probabilidad Over/Under 2.5 y 3.5 goles
    - Probabilidad de BTTS (ambos marcan)
    - Corners esperados (Over/Under 9.5)
    - Tarjetas esperadas
    - Paradas del portero esperadas
    - Pick recomendado con su nivel de confianza
    - Detección de value bet si la hay
    - Análisis narrativo detallado en español
    
    USA SOLO DATOS REALES que puedas verificar en internet.`,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        home_team: { type: "string" },
        away_team: { type: "string" },
        league: { type: "string" },
        recent_form: {
          type: "object",
          properties: {
            home: { type: "string" },
            away: { type: "string" },
            home_detail: { type: "string" },
            away_detail: { type: "string" }
          }
        },
        h2h: {
          type: "object",
          properties: {
            summary: { type: "string" },
            home_wins: { type: "number" },
            draws: { type: "number" },
            away_wins: { type: "number" },
            last_matches: { type: "array", items: { type: "string" } }
          }
        },
        injuries: {
          type: "object",
          properties: {
            home: { type: "array", items: { type: "string" } },
            away: { type: "array", items: { type: "string" } }
          }
        },
        stats: {
          type: "object",
          properties: {
            home_avg_goals_scored: { type: "number" },
            home_avg_goals_conceded: { type: "number" },
            away_avg_goals_scored: { type: "number" },
            away_avg_goals_conceded: { type: "number" },
            expected_xg_home: { type: "number" },
            expected_xg_away: { type: "number" },
            avg_corners: { type: "number" },
            avg_cards: { type: "number" },
            home_avg_saves: { type: "number" },
            away_avg_saves: { type: "number" }
          }
        },
        probabilities: {
          type: "object",
          properties: {
            home_win: { type: "number" },
            draw: { type: "number" },
            away_win: { type: "number" },
            over_25: { type: "number" },
            under_25: { type: "number" },
            btts_yes: { type: "number" },
            btts_no: { type: "number" },
            over_35: { type: "number" },
            corners_over_95: { type: "number" }
          }
        },
        current_odds: {
          type: "object",
          properties: {
            home: { type: "number" },
            draw: { type: "number" },
            away: { type: "number" },
            over_25: { type: "number" },
            under_25: { type: "number" },
            btts_yes: { type: "number" }
          }
        },
        value_bets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              market: { type: "string" },
              selection: { type: "string" },
              our_probability: { type: "number" },
              implied_probability: { type: "number" },
              value_percentage: { type: "number" },
              recommended_odds: { type: "number" }
            }
          }
        },
        main_pick: {
          type: "object",
          properties: {
            selection: { type: "string" },
            market: { type: "string" },
            confidence: { type: "number" },
            odds: { type: "number" },
            reasoning: { type: "string" }
          }
        },
        narrative: { type: "string" },
        risk_level: { type: "string", enum: ["low", "medium", "high"] }
      }
    }
  });
  return result;
}

export async function fetchLiveAnalysis(homeTeam, awayTeam, homeScore, awayScore, minute, league, stats) {
  const statsText = stats ? `
    Estadísticas actuales:
    - Posesión: ${stats.home_possession}% vs ${stats.away_possession}%
    - Tiros totales: ${stats.home_shots} vs ${stats.away_shots}
    - Tiros a puerta: ${stats.home_shots_on_target} vs ${stats.away_shots_on_target}
    - Corners: ${stats.home_corners} vs ${stats.away_corners}
    - Paradas del portero: ${stats.home_saves} vs ${stats.away_saves}
    - Tarjetas amarillas: ${stats.home_yellow_cards} vs ${stats.away_yellow_cards}
  ` : '';

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Eres un experto en apuestas deportivas en vivo. Analiza este partido en curso:
    
    ${homeTeam} ${homeScore}-${awayScore} ${awayTeam} | Minuto: ${minute}' | Liga: ${league}
    ${statsText}
    
    Busca información adicional en internet sobre este partido si está disponible.
    
    Analiza el desarrollo y genera:
    1. ¿Qué equipo domina según estadísticas y desarrollo del juego?
    2. Probabilidades de que ocurra el próximo gol (cada equipo) y de no más goles
    3. Opciones de apuesta EN VIVO recomendadas para ESTE MOMENTO del partido, incluyendo:
       - Resultado final
       - Próximo gol (quién marca)
       - Total goles (over/under dinámico al minuto actual)
       - Corners totales (over/under según corners ya ocurridos)
       - Tarjetas (si hay presión o juego intenso)
       - BTTS (si ningún equipo ha marcado aún)
    4. Predicción del resultado final más probable
    5. Recomendación concreta de qué apostar AHORA
    
    Considera el contexto del minuto: no es lo mismo minuto 10 que minuto 75.`,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        momentum: { type: "string", enum: ["home_dominant", "away_dominant", "balanced"] },
        momentum_description: { type: "string" },
        live_stats_available: { type: "boolean" },
        predicted_final_home: { type: "number" },
        predicted_final_away: { type: "number" },
        prob_next_goal_home: { type: "number" },
        prob_next_goal_away: { type: "number" },
        prob_no_more_goals: { type: "number" },
        live_opportunities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              market: { type: "string" },
              selection: { type: "string" },
              confidence: { type: "number" },
              estimated_odds: { type: "number" },
              reasoning: { type: "string" },
              urgency: { type: "string", enum: ["now", "wait", "avoid"] }
            }
          }
        },
        key_events: { type: "array", items: { type: "string" } },
        recommendation: { type: "string" }
      }
    }
  });
  return result;
}

export async function fetchBettingTip({ minOdds, matchCount, risk, leagues }) {
  const leaguesList = leagues.join(", ");
  const riskLabel = { low: "BAJO (alta probabilidad, cuotas 1.20-1.60)", medium: "MEDIO (buena probabilidad, cuotas 1.60-2.20)", high: "ALTO (value bet, cuotas 2.20+)" }[risk];

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Eres un analista experto en apuestas deportivas. Hoy es ${new Date().toLocaleDateString('es-ES')}.
    
    El usuario quiere:
    - Cuota mínima por selección: ${minOdds}
    - Número de partidos/selecciones: ${matchCount}
    - Nivel de riesgo: ${riskLabel}
    - Ligas a incluir: ${leaguesList}
    
    Busca en internet los partidos programados para HOY en esas ligas.
    Analiza con datos reales (forma, H2H, estadísticas, bajas) y recomienda ${matchCount} apuesta(s) que:
    1. Cumplan la cuota mínima de ${minOdds}
    2. Tengan la mayor probabilidad según el riesgo elegido
    3. Si el riesgo es BAJO y hay más de 1 selección, genera también una apuesta combinada del mismo equipo o partido (mercados diferentes)
    
    Para cada selección considera mercados como:
    - Resultado 1X2
    - Over/Under goles
    - BTTS (ambos marcan)
    - Corners Over/Under
    - Tarjetas Over/Under
    - Tiros a puerta
    - Paradas del portero
    
    Sé específico con equipos y partidos reales de hoy.`,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        picks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              home_team: { type: "string" },
              away_team: { type: "string" },
              league: { type: "string" },
              market: { type: "string" },
              selection: { type: "string" },
              odds: { type: "number" },
              confidence: { type: "number" },
              probability: { type: "number" },
              reasoning: { type: "string" },
              risk: { type: "string" },
              match_time: { type: "string" }
            }
          }
        },
        combined_bet: {
          type: "object",
          properties: {
            available: { type: "boolean" },
            selections: { type: "array", items: { type: "string" } },
            total_odds: { type: "number" },
            combined_confidence: { type: "number" },
            description: { type: "string" }
          }
        },
        best_pick: {
          type: "object",
          properties: {
            home_team: { type: "string" },
            away_team: { type: "string" },
            league: { type: "string" },
            market: { type: "string" },
            selection: { type: "string" },
            odds: { type: "number" },
            confidence: { type: "number" },
            reasoning: { type: "string" }
          }
        },
        analysis_date: { type: "string" },
        summary: { type: "string" }
      }
    }
  });
  return result;
}

export async function fetchDailyBestPick() {
  const today = new Date().toLocaleDateString('es-ES');
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Eres el mejor analista de apuestas deportivas. Hoy es ${today}.
    
    Busca en internet todos los partidos de hoy en las principales ligas (Premier League, Serie A, La Liga, Bundesliga, Ligue 1, Liga BetPlay Colombia, Liga 1 Perú, Champions/Europa League, Copa Libertadores).
    
    Analiza TODOS los partidos disponibles hoy considerando forma, H2H, estadísticas, bajas, cuotas de mercado.
    
    Encuentra LA MEJOR apuesta del día: aquella con la mayor probabilidad real de acertar Y con cuota MÍNIMA de 1.55.
    Puede ser resultado, over/under, BTTS, corners, tarjetas, tiros a puerta, etc.
    
    Justifica detalladamente por qué esta es LA MEJOR apuesta del día con datos reales.`,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        home_team: { type: "string" },
        away_team: { type: "string" },
        league: { type: "string" },
        match_time: { type: "string" },
        market: { type: "string" },
        selection: { type: "string" },
        odds: { type: "number" },
        confidence: { type: "number" },
        probability: { type: "number" },
        reasoning: { type: "string" },
        key_stats: { type: "array", items: { type: "string" } },
        risk: { type: "string", enum: ["low", "medium", "high"] }
      }
    }
  });
  return result;
}
