import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ProductForm from './ProductForm';
import { IProductoGroups, ITablaBranch } from '@/interfaces/branchInterfaces';
import { SearchComponent } from '@/shared/components/ui/Search';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string[];
  setFilterStatus: (statuses: string[]) => void;
  onAddProduct: (newProduct: ITablaBranch) => void;
  sucursalId: string | undefined;
  handleSelectChange: (value: string) => void;
  selectedGroup: {
    nombre: string;
    _id: string;
  } | null;
  groups: IProductoGroups[];
}

const SearchAndFilter = ({
  searchTerm,
  setSearchTerm,
  onAddProduct,
  sucursalId,
  handleSelectChange,
  selectedGroup,
  groups,
}: SearchAndFilterProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <SearchComponent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Agregar</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Producto</DialogTitle>
          </DialogHeader>
          <ProductForm
            handleSelectChange={handleSelectChange}
            selectedGroup={selectedGroup}
            groups={groups}
            onSubmit={onAddProduct}
            sucursalId={sucursalId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchAndFilter;
