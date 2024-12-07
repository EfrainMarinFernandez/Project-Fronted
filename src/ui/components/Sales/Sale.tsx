import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { ITablaBranch } from '@/interfaces/branchInterfaces';
import { IProductSale } from '@/interfaces/salesInterfaces';
import { cn } from '@/lib/utils';
import {
  applyDiscounts,
  handleProductSaleAlerts,
} from '@/shared/helpers/salesHelper';
import { Check, ChevronsUpDown, Plus, ShoppingBag, Truck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ProductSale } from './ProductSale';
import './style.scss';

export interface ISaleProps {
  products: ITablaBranch[];
  productSale: IProductSale[];
  setProductSale: React.Dispatch<React.SetStateAction<IProductSale[]>>;
  setProducts: React.Dispatch<React.SetStateAction<ITablaBranch[]>>;
}

export const Sale = ({
  products,
  setProducts,
  productSale,
  setProductSale,
}: ISaleProps) => {
  const selectedBranch = useAppSelector(
    (state) => state.branches.selectedBranch
  );
  const discounts = useAppSelector((state) => state.sales.branchDiscounts);
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [supplierMode, setSupplierMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ITablaBranch | null>(
    null
  );

  const handleSelectProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);

    if (!product) return setSelectedProduct(null);

    setSelectedProduct(product);
    setPrice(Number(product.precio.$numberDecimal));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    product
      ? setQuantity(quantity > product.stock ? product.stock : quantity)
      : setQuantity(0);
  };

  const handlePriceChange = (productId: string, price: number) => {
    const product = products.find((p) => p.id === productId);
    product ? setPrice(price) : setPrice(0);
  };

  const handleAddProductSale = () => {
    const newProductSale: IProductSale = {
      productId: selectedProduct?.id ?? '',
      productName: selectedProduct?.nombre ?? '',
      quantity: quantity,
      price: price,
      discount: null,
      groupId: selectedProduct?.grupoId ?? '',
      clientType: supplierMode ? 'Proveedor' : 'Regular',
      inventarioSucursalId: selectedProduct?.inventarioSucursalId ?? '',
    };

    const isExistentProduct = productSale.find(
      (p) =>
        p.productId === newProductSale.productId &&
        p.price === newProductSale.price
    );

    if (isExistentProduct) {
      newProductSale.quantity =
        newProductSale.quantity + isExistentProduct.quantity;
    }

    const productWithDiscount = applyDiscounts(
      selectedProduct?.sucursalId ?? '',
      newProductSale,
      discounts
    );

    if (isExistentProduct) {
      const updatedProductSale = productSale.map((item) =>
        item.productId === productWithDiscount.productId &&
        item.price === productWithDiscount.price
          ? productWithDiscount
          : item
      );
      setProductSale(updatedProductSale);
    } else {
      setProductSale([...productSale, productWithDiscount]);
    }

    const updatedProducts = products.map((item) => {
      const newStock = item.stock - quantity;

      handleProductSaleAlerts(
        item.nombre,
        newStock,
        selectedProduct?.puntoReCompra ?? 0
      );

      return item.id === productWithDiscount.productId
        ? { ...item, stock: newStock }
        : item;
    });

    setSelectedProduct((prev) =>
      prev ? { ...prev, stock: prev.stock - quantity } : null
    );

    setProducts(updatedProducts);
    setQuantity(0);
  };

  const handleRemoveProductSale = (productId: string) => {
    let quantity = 0;
    const updatedProductSale = productSale.filter((item) => {
      if (item.productId === productId) {
        quantity = item.quantity;
        return false;
      }
      return true;
    });
    setProductSale(updatedProductSale);

    const updatedProducts = products.map((item) =>
      item.id === productId ? { ...item, stock: item.stock + quantity } : item
    );
    setProducts(updatedProducts);
    setSelectedProduct((prev) =>
      prev ? { ...prev, stock: prev.stock + quantity } : null
    );
  };

  const cleanFieldsByBranchChange = () => {
    setProductSale([]);
    setQuantity(0);
    setPrice(0);
    setSupplierMode(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    cleanFieldsByBranchChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch]);

  return (
    <Card className="font-onest">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag />
          Gestionar Productos
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[80%]">
        <div className="flex items-center mb-4 space-x-2">
          <Switch
            className="p-0"
            checked={supplierMode}
            onCheckedChange={setSupplierMode}
          />
          <Label className="flex items-center">
            <Truck className="w-4 h-4 mr-2" />
            Modo Proveedor
          </Label>
        </div>
        <div className="flex gap-4 mb-4">
          <div className="flex flex-col w-full gap-1">
            <Label className="text-xs">Producto</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  disabled={products.length === 0}
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between w-full"
                >
                  {selectedProduct
                    ? selectedProduct.nombre
                    : 'Selecciona producto'}
                  <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar producto"
                    className="font-onest"
                  />
                  <CommandList className="product__list">
                    <CommandEmpty className="p-4 text-sm text-gray-800 font-onest">
                      Producto no encontrado.
                    </CommandEmpty>
                    <CommandGroup>
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.nombre}
                          onSelect={() => {
                            handleSelectProduct(
                              product.id === selectedProduct?.id
                                ? ''
                                : product.id!
                            );
                            setOpen(false);
                          }}
                          className="font-onest"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedProduct?.id === product.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {product.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1 w-[20%]">
            <Label className="text-xs">Disponible</Label>
            <Input
              className="w-full text-center"
              value={selectedProduct ? selectedProduct.stock : 0}
              disabled
            />
          </div>
          <div className="flex flex-col gap-1 w-[20%]">
            <Label className="text-xs">Cantidad</Label>
            <Input
              type="number"
              id="branch-select"
              value={selectedProduct ? quantity : 0}
              disabled={!selectedProduct}
              onChange={(e) =>
                handleQuantityChange(
                  selectedProduct?.id!,
                  Number(e.target.value)
                )
              }
              min={0}
              max={selectedProduct?.stock ?? 0}
              className="w-full"
            />
          </div>
          {supplierMode && (
            <div className="flex flex-col gap-1 w-[25%]">
              <Label className="text-xs">Precio</Label>
              <Input
                type="number"
                id="branch-select"
                value={selectedProduct ? price : 0}
                disabled={!selectedProduct}
                onChange={(e) =>
                  handlePriceChange(
                    selectedProduct?.id!,
                    Number(e.target.value)
                  )
                }
                min={0}
                className="w-full"
              />
            </div>
          )}
          <div className="flex flex-col justify-end gap-1 w-[10%]">
            <Button
              className="w-full text-xs"
              disabled={!selectedProduct || quantity <= 0 || price <= 0}
              onClick={handleAddProductSale}
            >
              <Plus />
            </Button>
          </div>
        </div>
        <div className="product__sale__list">
          <ProductSale
            products={productSale}
            handleRemoveProductSale={handleRemoveProductSale}
          />
        </div>
      </CardContent>
    </Card>
  );
};
