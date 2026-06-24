import { MobileShell, choferNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileSection } from "@/modules/mobileShared/MobilePieces";
import { Button } from "@/shared/components/Button";
export default function Page(){return <MobileShell roleLabel="Chofer" nav={choferNav}><MobileHero title="Ruta asignada" subtitle="Vista compacta para retiro y destino."/><MobileSection><h2>Junín → Buenos Aires</h2><p>Retiro en depósito central. Destino Barracas.</p><Button>Abrir ubicación</Button></MobileSection></MobileShell>}
