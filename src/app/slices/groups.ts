import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { handleThunkError } from '../../shared/utils/errorHandlers';
import {
  createGroup,
  deleteGroup,
  getAllGroups,
  getProductsByGroup,
  updateGroup,
} from '@/api/services/groups';
import { statusProgressLogin } from './login';
import { IProductoGroups } from '@/interfaces/branchInterfaces';

export const createGroupSlice = createAsyncThunk(
  'groups/create',
  async (group: IProductoGroups, { rejectWithValue }) => {
    try {
      const response = await createGroup(group);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleThunkError(error));
    }
  }
);

interface IUpdatedGroup {
  group: IProductoGroups;
  id: string;
}

export const updateGroupSlice = createAsyncThunk(
  'groups/update',
  async ({ group, id }: IUpdatedGroup, { rejectWithValue }) => {
    try {
      const response = await updateGroup(group, id);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleThunkError(error));
    }
  }
);

export const getAllGroupsSlice = createAsyncThunk(
  'groups/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllGroups();
      return response as unknown as IProductoGroups[];
    } catch (error) {
      return rejectWithValue(handleThunkError(error));
    }
  }
);

export const deleteGroupSlice = createAsyncThunk(
  'groups/delete',
  async (_id: string): Promise<IProductoGroups> => {
    const response = await deleteGroup(_id);
    return response.data as IProductoGroups;
  }
);

interface IAPIGroups {
  id: string;
  idBranch: string;
}

export const productsCatetories = createAsyncThunk(
  'groups/products',
  async (transfer: IAPIGroups, { rejectWithValue }) => {
    const { id, idBranch } = transfer;
    try {
      const response = await getProductsByGroup(id, idBranch);
      console.log(response, 'ResponseSlicwe');
      return response as unknown as IProductoGroups;
    } catch (error) {
      return rejectWithValue(handleThunkError(error));
    }
  }
);

interface GroupState {
  groups: IProductoGroups[];
  selectedGroup: IProductoGroups | null;
  productsbyGroup: IProductoGroups | null;
  error: string | null;
  status: statusProgressLogin;
}

const initialState: GroupState = {
  groups: [] as IProductoGroups[],
  selectedGroup: null,
  productsbyGroup: null,
  error: null,
  status: 'idle',
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    AddingGroups: (state, action: PayloadAction<IProductoGroups>) => {
      state.groups.push(action.payload);
    },
    setSelectCategory: (state, action: PayloadAction<IProductoGroups>) => {
      state.selectedGroup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllGroupsSlice.pending, (state) => {
        state.groups = [];
        state.status = 'loading';
      })
      .addCase(
        getAllGroupsSlice.fulfilled,
        (state, { payload }: PayloadAction<Array<IProductoGroups>>) => {
          state.status = 'succeeded';
          state.groups = payload;
        }
      )
      .addCase(getAllGroupsSlice.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'unknown error';
      })
      .addCase(deleteGroupSlice.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        deleteGroupSlice.fulfilled,
        (state, { payload }: PayloadAction<IProductoGroups>) => {
          state.status = 'succeeded';
          state.groups = state.groups.filter(
            (group) => group._id !== payload._id
          );
        }
      )
      .addCase(deleteGroupSlice.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'unknown error';
      })
      .addCase(productsCatetories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(productsCatetories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.productsbyGroup = action.payload as IProductoGroups;
      })

      .addCase(updateGroupSlice.fulfilled, (state, action) => {
        state.status = 'succeeded';

        const updatedGroups = state.groups.map((product) => {
          if (product._id && product._id === action.payload._id) {
            return { ...product, ...action.payload };
          }
          return product;
        });
        state.groups = [...updatedGroups];
      });
  },
});

export const { AddingGroups, setSelectCategory } = groupsSlice.actions;

export const groupsReducer = groupsSlice.reducer;
