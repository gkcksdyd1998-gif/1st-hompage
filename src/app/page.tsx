import { ArchiveHome } from "@/components/archive-home";
import { trips } from "@/data/trips";
export default function Home() {
  return <ArchiveHome trips={trips} />;
}
