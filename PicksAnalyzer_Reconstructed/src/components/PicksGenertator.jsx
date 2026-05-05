import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Radio,
  RefreshCw,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  fetchLiveMatches,
  fetchFinishedMatches,
  fetchScheduledMatches,
  sortByLeaguePriority,
} from "@/lib/footballApi";

import LiveMatchCard from "@/components/matches/LiveMatchCard";
import FinishedMatchCard from "@/components/matches/FinishedMatchCard";
import ScheduledMatchCard from "@/components/matches/ScheduledMatchCard";
import LiveAnalysisModal from "@/components/matches/LiveAnalysisModal";
import MatchAnalysisModal from "@/components/matches/MatchAnalysisModal";
import MatchFilters from "@/components/matches/MatchFilters";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

const TABS = [
  { key: "live", label: "En Vivo", icon: Radio },
  { key: "scheduled", label: "Programados", icon: Calendar },
  { key: "finished", label: "Terminados", icon: CheckCircle },
];

export default function LiveMatches() {
  const [tab, setTab] = useState("live");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedLiveMatch, setSelectedLiveMatch] = useState(null);
  const [selectedScheduledMatch, setSelectedScheduledMatch] = useState(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const liveQuery = useQuery({
    queryKey: ["live-matches-real"],
    queryFn: fetchLiveMatches,
    staleTime: 2 * 60 * 1000,
    enabled: tab === "live",
    retry: false,
  });

  const scheduledQuery = useQuery({
    queryKey: ["scheduled-matches-real", dateStr],
    queryFn: () => fetchScheduledMatches(dateStr),
    staleTime: 10 * 60 * 1000,
    enabled: tab === "scheduled",
    retry: false,
  });

  const finishedQuery = useQuery({
    queryKey: ["finished-matches-real", dateStr],
    queryFn: () => fetchFinishedMatches(dateStr),
    staleTime: 5 * 60 * 1000,
    enabled: tab === "finished",
    retry: false,
  });

  const tabConfig = {
    live: liveQuery,
}
