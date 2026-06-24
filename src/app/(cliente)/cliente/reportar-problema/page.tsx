import { MobileShell, clienteNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileSection } from "@/modules/mobileShared/MobilePieces";
import { Button } from "@/shared/components/Button";
import { Field, Textarea } from "@/shared/components/Fields";
export default function Page(){return <MobileShell roleLabel="Cliente" nav={clienteNav}><MobileHero title="Reportar problema" subtitle="Generá una incidencia vinculada a tu solicitud."/><MobileSection><Field label="Detalle"><Textarea placeholder="Contanos qué pasó"/></Field><br/><Button>Enviar reporte</Button></MobileSection></MobileShell>}
