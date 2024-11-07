import { useAppSelector } from '@/app/hooks';
import { logout } from '@/app/slices/login';
import { store } from '@/app/store';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DoorClosed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfileUser = () => {
  const user = useAppSelector((state) => state.auth.signIn.user);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      store.dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Error trying to logout: ', error);
    }
  };
  return (
    <div className="flex items-center justify-center gap-2 p-2">
      <div className="flex flex-col items-center justify-center ">
        <h1 className="text-xl font-bold capitalize">{user?.username}</h1>
        <p className="text-sm text-muted-foreground">{user?.role} - {user?.sucursalId?.nombre}</p>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full cursor-pointer">
            <span className="text-lg font-semibold text-white">
              {user?.username.charAt(0).toUpperCase() ?? 'A'}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-22">
          <Button onClick={handleLogout} variant="secondary">
            <DoorClosed className="h-4 w-4" />
            Salir
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};
