import { createSlice } from '@reduxjs/toolkit'


interface AppState {
  isLoading: boolean
  message: string | null
}

const initialState: AppState = {
  isLoading: false,
  message: null,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setMessage: (state, action) => {
      state.message = action.payload
    },
  },
})

export const { setLoading, setMessage } = appSlice.actions
export default appSlice.reducer