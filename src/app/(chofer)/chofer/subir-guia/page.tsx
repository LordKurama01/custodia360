import { MobileShell, choferNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileSection } from "@/modules/mobileShared/MobilePieces";
import { Button } from "@/shared/components/Button";
export default function Page(){return <MobileShell roleLabel="Chofer" nav={choferNav}><MobileHero title="Subir guía" subtitle="Carga rápida de guía o foto de despacho."/><MobileSection><p>Área preparada para evidencia real.</p><Button>Seleccionar archivo</Button></MobileSection></MobileShell>}
