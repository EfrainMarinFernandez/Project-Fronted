import { useAppSelector } from '@/app/hooks';
import {
  fetchBranchById,
  updateSelectedBranch,
} from '@/app/slices/branchSlice';
import { getDiscountsByBranch } from '@/app/slices/salesSlice';
import { store } from '@/app/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Branch, ITablaBranch } from '@/interfaces/branchInterfaces';
import { IProductSale } from '@/interfaces/salesInterfaces';
import { getSelectedBranchFromLocalStorage } from '@/shared/helpers/branchHelpers';
import { GetBranches } from '@/shared/helpers/Branchs';
import { useEffect, useState } from 'react';
import { Cashier } from './Inventory';
import { Sale } from './Sale';
import { SaleHistory } from './SaleHistory';
import { useRoleAccess } from '../../../shared/hooks/useRoleAccess';
import { PAGES_MODULES } from '../../../shared/helpers/roleHelper';

export default function SalesInventorySystem() {
  const access = useRoleAccess(PAGES_MODULES.VENTAS);
  const cashierId = useAppSelector((state) => state.auth.signIn.cajaId);
  const user = useAppSelector((state) => state.auth.signIn.user);
  const branchStoraged = getSelectedBranchFromLocalStorage();
  const [products, setProducts] = useState<ITablaBranch[]>([]);
  const [productSale, setProductSale] = useState<IProductSale[]>([]);

  const loadProductsByBranch = async (branch: Branch) => {
    const response = await GetBranches(branch._id ?? '');

    store.dispatch(
      updateSelectedBranch({
        ...branch,
        products: response,
      })
    );
    setProducts(response);
    await store.dispatch(getDiscountsByBranch(branch._id ?? ''));
  };

  const handleLoadBranch = (branch: Branch | undefined) => {
    if (branch) {
      loadProductsByBranch(branch);
    } else {
      store.dispatch(updateSelectedBranch(null));
      setProducts([]);
    }
  };

  useEffect(() => {
    const branchId = !user?.sucursalId
      ? (branchStoraged ?? '')
      : (user?.sucursalId._id ?? '');

    store.dispatch(fetchBranchById(branchId)).then((response) => {
      handleLoadBranch(response.payload as Branch);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.sucursalId, cashierId]);

  return (
    <div className="container mx-auto">
      <Tabs defaultValue={access.create ? 'sale' : 'sale-history'}>
        <div className="flex flex-col items-center justify-between gap-4 mb-9 sm:flex-row sm:items-center">
          <h1 className="text-4xl font-bold text-gray-800 font-onest w-[38%] dark:text-white">
            Ventas
          </h1>
          <TabsList className="gap-4 font-bold text-white bg-black">
            {access.create && (
              <TabsTrigger
                className="text-[#ffffff] font-bold border-b-2 border-bg-gray-200 border-opacity-0 bg-black font-onest"
                value="sale"
              >
                Nueva venta
              </TabsTrigger>
            )}
            <TabsTrigger
              className="bg-black text-[#ffffff] font-bold font-onest"
              value="sale-history"
            >
              Historial de ventas
            </TabsTrigger>
          </TabsList>
        </div>
        {access.create && (
          <TabsContent value="sale">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 h-[36rem] max-h-[36rem]">
              <Sale
                products={products}
                productSale={productSale}
                setProducts={setProducts}
                setProductSale={setProductSale}
              />
              <Cashier
                productSale={productSale}
                setProductSale={setProductSale}
              />
            </div>
          </TabsContent>
        )}
        <TabsContent value="sale-history">
          <SaleHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
