import { MobileShell, operarioNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileSection } from "@/modules/mobileShared/MobilePieces";
import { Button } from "@/shared/components/Button";
export default function Page(){return <MobileShell roleLabel="Operario" nav={operarioNav}><MobileHero title="Subir evidencia" subtitle="Fotos de preparación, remitos o comprobantes."/><MobileSection><Button>Seleccionar archivo</Button></MobileSection></MobileShell>}
