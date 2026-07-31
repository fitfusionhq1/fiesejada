import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isDemo = !url || !key || url.includes("YOUR_PROJECT");
export const supabase = isDemo ? null : createClient(url, key);

const KEY = "fieseya-state";
const DEMO = "fieseya-demo-teams";
const HINTS = "fieseya-station-hints";
export const session = {
  get: () => JSON.parse(localStorage.getItem(KEY) || "null"),
  set: value => localStorage.setItem(KEY, JSON.stringify(value)),
  clear: () => localStorage.removeItem(KEY)
};

function demoTeams(){ return JSON.parse(localStorage.getItem(DEMO) || "[]"); }
function saveDemoTeams(v){ localStorage.setItem(DEMO, JSON.stringify(v)); }
function demoHints(){ return JSON.parse(localStorage.getItem(HINTS) || "{}"); }
function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export async function createTeam(payload) {
  if (isDemo) {
    const all = demoTeams();
    if (all.some(t => t.group_code === payload.group_code)) throw new Error("Ta barvna skupina je že registrirana.");
    const team = { id: createId(), ...payload, current_step: 0, status: "active", started_at: new Date().toISOString(), penalties: [], submissions: [] };
    saveDemoTeams([...all, team]); return team;
  }
  const { data, error } = await supabase.from("teams").insert(payload).select().single();
  if (error) throw error; return data;
}

export async function getTeam(id) {
  if (isDemo) return demoTeams().find(t => t.id === id);
  const { data, error } = await supabase.from("teams").select("*").eq("id", id).single();
  if (error) throw error; return data;
}

export async function scanStation(team, stationId, expected) {
  if (stationId !== expected) {
    if (isDemo) {
      const all = demoTeams(); const t = all.find(x => x.id === team.id);
      t.penalties.push({type:"wrong_qr_scan", points:-2, station_id:stationId, created_at:new Date().toISOString()}); saveDemoTeams(all);
    } else await supabase.from("penalties").insert({team_id:team.id,type:"wrong_qr_scan",points:-2,station_id:stationId});
    return false;
  }
  return true;
}

export async function addHint(team, stationId) {
  if (isDemo) {
    const all = demoTeams(); const t = all.find(x => x.id === team.id);
    if (!t.penalties.some(p => p.type === "extra_hint" && p.station_id === stationId)) t.penalties.push({type:"extra_hint",points:-1,station_id:stationId,created_at:new Date().toISOString()});
    saveDemoTeams(all); return;
  }
  await supabase.from("penalties").upsert({team_id:team.id,type:"extra_hint",points:-1,station_id:stationId},{onConflict:"team_id,type,station_id"});
}

export async function submitPhoto(team, stationId, file, finalStep=false) {
  let photo_path = "";
  if (isDemo) photo_path = URL.createObjectURL(file);
  else {
    photo_path = `${team.id}/${Date.now()}-${stationId}.jpg`;
    const { error } = await supabase.storage.from("fieseya-photos").upload(photo_path, file, {contentType:file.type,upsert:false});
    if (error) throw error;
    const { error: rowError } = await supabase.from("submissions").insert({team_id:team.id,station_id:stationId,photo_path,is_final:finalStep});
    if (rowError) throw rowError;
  }
  const nextStep = team.current_step + 1;
  const status = finalStep ? "finished" : "active";
  if (isDemo) {
    const all = demoTeams(); const t = all.find(x => x.id === team.id);
    t.submissions.push({station_id:stationId,photo_path,submitted_at:new Date().toISOString(),is_final:finalStep});
    t.current_step=nextStep; t.status=status; if(finalStep)t.finished_at=new Date().toISOString(); saveDemoTeams(all);
  } else await supabase.from("teams").update({current_step:nextStep,status,finished_at:finalStep?new Date().toISOString():null}).eq("id",team.id);
}

export async function listTeams() {
  if (isDemo) return demoTeams();
  const { data, error } = await supabase.from("team_overview").select("*").order("started_at");
  if (error) throw error; return data;
}

export async function listStationHints() {
  try {
    const response = await fetch("/api/hints", { cache: "no-store" });
    if (!response.ok) throw new Error("Namigov ni bilo mogoče naložiti.");
    const data = await response.json();
    return Object.fromEntries(data.map(row => [
      row.id,
      { hint: row.main_hint, extra: row.extra_hint },
    ]));
  } catch (error) {
    if (["localhost", "127.0.0.1"].includes(location.hostname)) return demoHints();
    throw error;
  }
}

export async function getFieldTestWithoutQrEnabled() {
  try {
    const response = await fetch("/api/settings", { cache: "no-store" });
    if (!response.ok) throw new Error("Nastavitve terenskega preizkusa ni bilo mogoče naložiti.");
    const data = await response.json();
    return data.field_test_without_qr_enabled !== false;
  } catch (error) {
    if (["localhost", "127.0.0.1"].includes(location.hostname)) {
      return localStorage.getItem("fieseya-field-test-without-qr") !== "off";
    }
    throw error;
  }
}

export async function saveFieldTestWithoutQrEnabled(enabled) {
  try {
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        pin: sessionStorage.getItem("fieseya-admin-pin"),
        field_test_without_qr_enabled: Boolean(enabled),
      }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Nastavitve terenskega preizkusa ni bilo mogoče shraniti.");
    }
  } catch (error) {
    if (!["localhost", "127.0.0.1"].includes(location.hostname)) throw error;
    localStorage.setItem("fieseya-field-test-without-qr", enabled ? "on" : "off");
  }
}

export async function saveStationHints(id, hint, extra) {
  try {
    const response = await fetch(`/api/hints/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        pin: sessionStorage.getItem("fieseya-admin-pin"),
        main_hint: hint,
        extra_hint: extra,
      }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Namigov ni bilo mogoče shraniti.");
    }
  } catch (error) {
    if (!["localhost", "127.0.0.1"].includes(location.hostname)) throw error;
    const all = demoHints();
    all[id] = { hint, extra };
    localStorage.setItem(HINTS, JSON.stringify(all));
  }
}

export async function resetStationHints(id) {
  if (["localhost", "127.0.0.1"].includes(location.hostname)) {
    const all = demoHints();
    delete all[id];
    localStorage.setItem(HINTS, JSON.stringify(all));
  }
}
