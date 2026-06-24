import { MobileShell, choferNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileSection } from "@/modules/mobileShared/MobilePieces";
import { Button } from "@/shared/components/Button";
import { Field, Textarea } from "@/shared/components/Fields";
export default function Page(){return <MobileShell roleLabel="Chofer" nav={choferNav}><MobileHero title="Incidencia" subtitle="Reportá demora, daño o imposibilidad de retiro."/><MobileSection><Field label="Detalle"><Textarea/></Field><br/><Button>Enviar incidencia</Button></MobileSection></MobileShell>}
