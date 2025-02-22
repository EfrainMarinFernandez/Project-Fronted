import { ArrowDown, Eye, FolderSync, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAppSelector } from '@/app/hooks';
import { getPendingTransfers } from '@/app/slices/transferSlice';
import { store } from '@/app/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import { IStatus } from '@/interfaces/branchInterfaces';
import { IPendingTransfer } from '@/interfaces/transferInterfaces';
import DetallesEnvio from '@/shared/components/ui/Details';
import {
  getFormatedDate,
  incomingShipmentTableHeaders,
} from '@/shared/helpers/transferHelper';
import { Link } from 'react-router-dom';
import './styles.scss';
import Pagination from '../../../shared/components/ui/Pagination/Pagination';

export default function PendingTools() {
  const user = useAppSelector((state) => state.auth.signIn.user);
  const { pending: pendingTransfer, status } = useAppSelector(
    (state) => state.transfer
  );
  const [searchTerm, setSearchTerm] = useState('');
  console.log(pendingTransfer, 'pendingTransfer');

  const filteredShipments = pendingTransfer?.filter(
    (shipment) =>
      (shipment.consecutivo &&
        shipment.consecutivo?.toString().includes(searchTerm)) ||
      shipment.sucursalDestinoId.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.usuarioIdEnvia.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!user?.sucursalId) return;
    if (user?.sucursalId?._id) {
      store.dispatch(getPendingTransfers(user?.sucursalId?._id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto space-y-6 font-onest">
      <Tabs defaultValue="receive">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FolderSync size={20} />
              <CardTitle>Products</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Consecutivo, bodega, enviado por..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <IncomingShipmentTable
              shipments={filteredShipments}
              status={status}
            />
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}

const IncomingShipmentTable = ({
  shipments,
  status,
}: {
  shipments: IPendingTransfer[];
  status: IStatus;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = shipments.slice(indexOfFirstItem, indexOfLastItem);
  const paginatedData = Math.ceil(shipments.length / itemsPerPage);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {incomingShipmentTableHeaders.map((header) => (
              <TableHead
                key={header.key}
                className={`${['acciones'].includes(header.key) ? 'flex items-center justify-center' : ''}`}
              >
                {header.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {status === 'loading' &&
            [1, 2, 3, 4, 5].map((item) => <ShipmentSkeleton key={item} />)}

          {status === 'succeeded' &&
            currentItems?.map((shipment) => (
              <TableRow key={shipment._id}>
                <TableCell>
                  <Badge
                    variant={
                      shipment.estatusTraslado === 'En Proceso'
                        ? 'secondary'
                        : shipment.estatusTraslado === 'Terminado'
                          ? 'default'
                          : 'outline'
                    }
                  >
                    {shipment.estatusTraslado === 'En Proceso'
                      ? 'Pendiente'
                      : shipment.estatusTraslado === 'Terminado'
                        ? 'Recibido'
                        : shipment.estatusTraslado === 'Terminado incompleto'
                          ? 'Incompleto'
                          : 'Solicitado'}
                  </Badge>
                </TableCell>
                <TableCell>{shipment.consecutivo}</TableCell>
                <TableCell>{shipment.sucursalOrigenId.nombre}</TableCell>
                <TableCell>{getFormatedDate(shipment.fechaEnvio)}</TableCell>
                <TableCell>{shipment.usuarioIdEnvia?.username}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Dialog>
                      <DialogTrigger>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver detalles
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="p-3">
                        <DetallesEnvio
                          pedidoId={shipment.consecutivo?.toString() ?? ''}
                          fechaCreacion={shipment.fechaRegistro}
                          origen={shipment.sucursalOrigenId.nombre}
                          destino={shipment.sucursalDestinoId.nombre}
                          fechaEnvio={shipment.fechaEnvio}
                          fechaRecepcion={null}
                          productos={[
                            shipment.firmaEnvio ?? '',
                            ...(shipment.archivosAdjuntos ?? []),
                          ]}
                          firmaRecepcion={null}
                          comentarioEnvio={shipment.comentarioEnvio ?? ''}
                        />
                      </DialogContent>
                    </Dialog>
                    <Link
                      to={`/transfer/pending/${shipment._id}/itemdepedido`}
                      state={{ id: shipment._id }}
                    >
                      <Button size="sm" className="text-white dark:bg-black">
                        Recibir
                        <ArrowDown />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <CardFooter className="flex items-center justify-between">
        <Pagination
          currentPage={currentPage}
          totalPages={paginatedData}
          onPageChange={setCurrentPage}
        />
      </CardFooter>
    </>
  );
};

const ShipmentSkeleton = () => {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="skeleton" />
      </TableCell>
      <TableCell>
        <Skeleton className="skeleton" />
      </TableCell>
      <TableCell>
        <Skeleton className="skeleton" />
      </TableCell>
      <TableCell>
        <Skeleton className="skeleton" />
      </TableCell>
      <TableCell>
        <Skeleton className="skeleton" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="skeleton" />
      </TableCell>
    </TableRow>
  );
};
