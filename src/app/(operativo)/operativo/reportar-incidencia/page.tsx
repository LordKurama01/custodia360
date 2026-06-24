import { MobileShell, operarioNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileSection } from "@/modules/mobileShared/MobilePieces";
import { Button } from "@/shared/components/Button";
import { Field, Textarea } from "@/shared/components/Fields";
export default function Page(){return <MobileShell roleLabel="Operario" nav={operarioNav}><MobileHero title="Reportar problema" subtitle="Registrar diferencia, daño o demora interna."/><MobileSection><Field label="Detalle"><Textarea/></Field><br/><Button>Enviar reporte</Button></MobileSection></MobileShell>}
