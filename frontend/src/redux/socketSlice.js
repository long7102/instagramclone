import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
    name: 'socketio',
    initialState: {
        socket: null
    },
    reducers: {
        setSocket:(state, action) => {
            state.action = action.payload
        }
    }
})

export const {setSocket} = socketSlice.actions
export default socketSlice.reducer