import { returnProducts } from '@/app/slices/transferSlice';
import { store } from '@/app/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IPendingTransfer,
  ListItemDePedido,
} from '@/interfaces/transferInterfaces';
import DetallesEnvio from '@/shared/components/ui/Details';
import { CornerDownLeft, Eye } from 'lucide-react';
import { useState } from 'react';

interface IOrder {
  dataTable: ListItemDePedido;
  dataAuxiliar: IPendingTransfer | undefined;
}

export const AuxiliarMap = ({ dataTable, dataAuxiliar }: IOrder) => {
  const originBranch = dataAuxiliar?.sucursalOrigenId.nombre;
  const destinationBranch = dataAuxiliar?.sucursalDestinoId.nombre;
  const [isReturned, setIsReturned] = useState(dataTable.regresado);

  const handleReturnProducts = async (id: string) => {
    await store.dispatch(returnProducts(id));
    setIsReturned(true);
  };

  const getBadgeVariant = () => {
    if (dataTable.regresado) return 'secondary';
    if (dataTable.recibido) return 'secondary';
    return 'default';
  };

  const getStatusLabel = () => {
    if (dataTable.regresado) return 'Regresado';
    if (dataTable.recibido !== true) return 'Sin recibir';
    if (dataTable.recibido) return 'Recibido';
    return 'Pendiente';
  };

  return (
    <TableRow key={dataTable._id}>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{dataTable._id.slice(0, 8)}...</TooltipTrigger>
            <TooltipContent>
              <TableCell>{dataTable._id}</TableCell>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>{dataTable.inventarioSucursalId.productoId.nombre}</TableCell>
      <TableCell>
        {dataTable.inventarioSucursalId.precio.$numberDecimal}
      </TableCell>
      <TableCell>{dataTable.cantidad}</TableCell>
      <TableCell>
        <Badge
          className="text-white dark:bg-black h-8"
          variant={getBadgeVariant()}
        >
          {getStatusLabel()}
        </Badge>
      </TableCell>
      {
        <TableCell>
          <div className="flex items-center justify-center gap-2">
            {!isReturned ? (
              <div className="flex items-center justify-center gap-2">
                {!dataTable.recibido && (
                  <Button
                    size="sm"
                    className="text-white bg-black dark:bg-white dark:text-black"
                    onClick={() => handleReturnProducts(dataTable._id)}
                  >
                    Regresar Producto
                    <CornerDownLeft />
                  </Button>
                )}
              </div>
            ) : (
              <span className="text-green-500">Regresado</span>
            )}
          </div>
        </TableCell>
      }
      <TableCell>
        <Dialog>
          <DialogTrigger>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Ver detalles
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DetallesEnvio
              pedidoId={dataAuxiliar?.nombre ?? ''}
              fechaCreacion={dataAuxiliar?.fechaRegistro ?? new Date()}
              origen={originBranch ?? ''}
              destino={destinationBranch ?? ''}
              fechaEnvio={dataAuxiliar?.fechaEnvio ?? new Date()}
              fechaRecepcion={dataAuxiliar?.fechaRecepcion ?? new Date()}
              productos={dataTable.archivosAdjuntos ?? []}
              firmaRecepcion={dataAuxiliar?.firmaEnvio ?? ''}
              comentarioEnvio={dataTable?.comentarioEnvio ?? ''}
            />
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
};
