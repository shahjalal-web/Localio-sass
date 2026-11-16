import { toast } from "sonner";

export function notInDemo(what: string) {
  toast(`${what} ingår inte i demon`, { description: "Det här är ett designkoncept för sök- och resultatsidorna." });
}
