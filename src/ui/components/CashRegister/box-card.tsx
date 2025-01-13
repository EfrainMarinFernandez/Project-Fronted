import { LockKeyhole, LockKeyholeOpen, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ICajaBrach } from '../../../app/slices/cashRegisterSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';

interface BoxCardProps {
  box: ICajaBrach;
  onOpen: () => void;
  onClose: () => void;
}

export function BoxCard({ box, onOpen, onClose }: BoxCardProps) {
  const isOpen = box.estado === 'ABIERTA';
  const isClosed = box.estado === 'CERRADA';

  return (
    <Card
      key={box._id}
      className="group relative overflow-hidden bg-white transition-all hover:shadow-lg dark:bg-neutral-950"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <span className="text-xl font-bold text-primary">
            {box.consecutivo}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="flex flex-col gap-1">
            <DropdownMenuLabel className="font-onest">
              Acciones
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isOpen && (
              <DropdownMenuItem
                onClick={onOpen}
                className="font-onest flex items-center"
              >
                <LockKeyholeOpen className="w-4 h-4 mr-2" />
                Abrir
              </DropdownMenuItem>
            )}
            {!isClosed && (
              <DropdownMenuItem
                onClick={onClose}
                className="font-onest flex items-center"
              >
                <LockKeyhole className="w-4 h-4 mr-2" />
                Cerrar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold">{box.diferencia}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Estado {box.estado}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Caja #{box.consecutivo}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
