'use client';

import { useAppSelector } from '@/app/hooks';
import {
  fetchBranchById,
  updateSelectedBranch,
} from '@/app/slices/branchSlice';
import { getDiscountsByBranch } from '@/app/slices/salesSlice';
import { store } from '@/app/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Branch, ITablaBranch } from '@/interfaces/branchInterfaces';
import { IProductSale, ITypeTransaction } from '@/interfaces/salesInterfaces';
import { getSelectedBranchFromLocalStorage } from '@/shared/helpers/branchHelpers';
import { GetBranches } from '@/shared/helpers/Branchs';
import { useEffect, useState } from 'react';

import { Purchase } from '../Purchase/Purchase';
import { PurchaseCashier } from '../Purchase/Inventory';
import { PurchaseHistory } from '../Purchase/PurchaseHistory';
import { PAGES_MODULES } from '../../../shared/helpers/roleHelper';
import { useRoleAccess } from '../../../shared/hooks/useRoleAccess';
import { ReturnHistory } from './ReturnHistory';

export const PurchaseSale = () => {
  const access = useRoleAccess(PAGES_MODULES.COMPRAS);
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
      <Tabs defaultValue={access.create ? 'purchase' : 'purchase-history'}>
        <div className="flex flex-col items-center justify-between gap-4 mb-9 sm:flex-row sm:items-center">
          <h1 className="text-4xl font-bold text-gray-800 font-onest w-[38%] dark:text-white">
            Compras
          </h1>
          <TabsList className="gap-4 font-bold text-white bg-black">
            {access.create && (
              <TabsTrigger
                className="text-[#ffffff] font-bold border-b-2 border-bg-gray-200 border-opacity-0 bg-black font-onest"
                value="purchase"
              >
                Nueva compra
              </TabsTrigger>
            )}

            <TabsTrigger
              className="bg-black text-[#ffffff] font-bold font-onest"
              value="purchase-history"
            >
              Historial
            </TabsTrigger>
            <TabsTrigger
              className="bg-black text-[#ffffff] font-bold font-onest"
              value="return-history"
            >
              Devoluciones
            </TabsTrigger>
          </TabsList>
        </div>
        {access.create && (
          <TabsContent value="purchase">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 h-[36rem] max-h-[36rem]">
              <Purchase
                products={products}
                productSale={productSale}
                setProducts={setProducts}
                setProductSale={setProductSale}
              />
              <PurchaseCashier
                productSale={productSale}
                setProductSale={setProductSale}
              />
            </div>
          </TabsContent>
        )}
        <TabsContent value="purchase-history">
          <PurchaseHistory />
        </TabsContent>
        <TabsContent value="return-history">
          <ReturnHistory type={ITypeTransaction.COMPRA} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
