// Tableau GitHub Projects : colonnes = cycle de vie (À faire → En cours → Corrigée → Re-testée → Fermée),
// champ « Catégorie » (Exigence / Cas de test / Anomalie) ; ajoute toutes les issues avec leur statut.
// Usage : node qa/github/project.mjs <owner> <repo> <n° du projet>
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { STATUT } from "../referentiel.mjs";
import { verdict } from "./iteration2.mjs";

const [OWNER, REPO, NUM] = process.argv.slice(2);
const MAP = JSON.parse(readFileSync(new URL("./issues.json", import.meta.url), "utf8"));
const gql = (query, vars = {}) => {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [k, v] of Object.entries(vars)) args.push(typeof v === "number" ? "-F" : "-f", `${k}=${v}`);
  for (let attempt = 1; ; attempt++) {
    const r = spawnSync("gh", args, { encoding: "utf8" });
    if (r.status === 0) return JSON.parse(r.stdout).data;
    // erreurs transitoires de l'API GitHub : nouvel essai après une pause
    if (attempt >= 4 || !/Something went wrong|timeout|502|503/.test(r.stdout + r.stderr)) throw new Error(r.stdout + r.stderr);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3000 * attempt);
  }
};

const project = gql(`query($o:String!,$n:Int!){user(login:$o){projectV2(number:$n){id fields(first:30){nodes{... on ProjectV2SingleSelectField{id name}}}}}}`, { o: OWNER, n: Number(NUM) }).user.projectV2;
const statusField = project.fields.nodes.find((f) => f.name === "Status");

const COLONNES = [["À faire", "GRAY"], ["En cours", "YELLOW"], ["Corrigée", "BLUE"], ["Re-testée", "PURPLE"], ["Fermée", "GREEN"]];
const opts = (list) => list.map(([n, c]) => `{name:"${n}",color:${c},description:""}`).join(",");
const status = gql(`mutation{updateProjectV2Field(input:{fieldId:"${statusField.id}",singleSelectOptions:[${opts(COLONNES)}]}){projectV2Field{... on ProjectV2SingleSelectField{id options{id name}}}}}`).updateProjectV2Field.projectV2Field;

let typeField = project.fields.nodes.find((f) => f.name === "Catégorie");
if (!typeField)
  typeField = gql(`mutation{createProjectV2Field(input:{projectId:"${project.id}",dataType:SINGLE_SELECT,name:"Catégorie",singleSelectOptions:[${opts([["Exigence", "BLUE"], ["Cas de test", "PURPLE"], ["Anomalie", "RED"]])}]}){projectV2Field{... on ProjectV2SingleSelectField{id options{id name}}}}}`).createProjectV2Field.projectV2Field;
else typeField = gql(`query{node(id:"${typeField.id}"){... on ProjectV2SingleSelectField{id options{id name}}}}`).node;

const opt = (field, name) => field.options.find((o) => o.name === name).id;
const set = (item, field, option) =>
  gql(`mutation{updateProjectV2ItemFieldValue(input:{projectId:"${project.id}",itemId:"${item}",fieldId:"${field.id}",value:{singleSelectOptionId:"${option}"}}){projectV2Item{id}}}`);

function colonne(id) {
  if (id.startsWith("ANO")) return STATUT[id].startsWith("Corrigée") ? "Fermée" : "À faire";
  if (id.startsWith("EF") || id.startsWith("ENF")) return verdict(id) === "Satisfaite" ? "Fermée" : verdict(id).startsWith("Non") ? "À faire" : "En cours";
  return "Fermée"; // cas de test : exécutés lors des deux itérations
}

for (const [id, number] of Object.entries(MAP)) {
  const issueId = gql(`query{repository(owner:"${OWNER}",name:"${REPO}"){issue(number:${number}){id}}}`).repository.issue.id;
  const item = gql(`mutation{addProjectV2ItemById(input:{projectId:"${project.id}",contentId:"${issueId}"}){item{id}}}`).addProjectV2ItemById.item.id;
  const type = id.startsWith("ANO") ? "Anomalie" : /^E/.test(id) ? "Exigence" : "Cas de test";
  set(item, status, opt(status, colonne(id)));
  set(item, typeField, opt(typeField, type));
  process.stdout.write(".");
}
console.log("\nok");
