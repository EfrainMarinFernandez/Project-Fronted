import { useEffect } from 'react';
import { store } from '@/app/store';
import { fetchBranches, setSelectedBranch } from '@/app/slices/branchSlice';
import { useAppSelector } from '@/app/hooks';
import { Branch } from '@/interfaces/branchInterfaces';
import { Card, CardFooter, CardHeader } from '../../../components/ui/card';
import './styles.scss';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTrigger,
} from '../../../components/ui/drawer';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '../../../app/slices/login';

export const ModalBranchs = () => {
  const branches = useAppSelector((state) => state.branches.data);

  useEffect(() => {
    store.dispatch(fetchBranches()).unwrap();
  }, []);

  const handleSelectBranch = (branch: Branch) => {
    store.dispatch(setSelectedBranch(branch));
    localStorage.setItem('selectedBranch', JSON.stringify(branch._id));
  };

  return (
    <>
      <div className="container mx-auto ">
        <div>
          <div className="container-modalBranchs">
            {branches.map((branch) => (
              <Card
                onClick={() => {
                  handleSelectBranch(branch);
                }}
                key={branch._id}
                className="cursor-pointer"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 ">
                  <div className="flex items-center space-x-2 ">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                      {branch.nombre[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{branch.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {branch.ciudad}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="flex flex-wrap justify-between gap-2"></CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export const BranchDrawer = () => {
  const isDrawerOpen = useAppSelector((state) => state.auth.isOpen);
  const dispatch = useDispatch();

  return (
    <Drawer open={isDrawerOpen} onOpenChange={() => dispatch(closeDrawer())}>
      <DrawerTrigger asChild></DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <ModalBranchs />
            </div>
            <div className="mt-3 h-[120px]"></div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
