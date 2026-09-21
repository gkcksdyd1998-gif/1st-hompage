import { notFound } from "next/navigation";
import { trips } from "@/data/trips";
import { TripExplorer } from "@/components/trip-explorer";
type Props = { params: Promise<{ id: string }> };
export function generateStaticParams() {
  return trips.map((trip) => ({ id: trip.id }));
}
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const trip = trips.find((item) => item.id === id);
  return { title: trip ? `${trip.title} | 일본여행기` : "여행을 찾을 수 없음" };
}
export default async function TripPage({ params }: Props) {
  const { id } = await params;
  const trip = trips.find((item) => item.id === id);
  if (!trip) notFound();
  return (
    <TripExplorer
      key={trip.id}
      trip={trip}
      journeys={trips.map(({ id, title }) => ({ id, title }))}
    />
  );
}
